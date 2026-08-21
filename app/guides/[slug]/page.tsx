import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getGuide, getGuideNeighbors, type Guide } from "../../../lib/guides";
import { renderDashboard } from "../../dashboard-entry";
import { getAccessDecision } from "../../../lib/server/access";
import { getAppSession, hostedAuthConfigured } from "../../../lib/server/auth";
import { isLocalMode } from "../../../lib/server/config";
import { auth } from "@clerk/nextjs/server";

type GuideAnchorProps = ComponentPropsWithoutRef<"a"> & { children?: ReactNode };

function embeddedGuideHref(href: string) {
  const [pathname, hash] = href.split("#", 2);
  const filename = pathname.split("/").pop() || "";
  if (!filename.endsWith(".md")) return null;

  const slug = filename.slice(0, -3);
  if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(slug)) return null;
  return `/guides/${slug}${hash ? `#${hash}` : ""}`;
}

function GuideAnchor({ href, children, ...props }: GuideAnchorProps) {
  if (!href) return <span {...props}>{children}</span>;

  const internalHref = embeddedGuideHref(href);
  if (internalHref) {
    return <Link href={internalHref} {...props}>{children}</Link>;
  }

  const isExternal = /^(https?:|mailto:)/i.test(href);
  return <a href={href} {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})} {...props}>{children}</a>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) return { title: "Guide not found — StackBridge" };
  return {
    title: `${guide.title} — StackBridge`,
    description: guide.description,
  };
}

function GuideDocument({ guide }: { guide: Guide }) {
  const neighbors = getGuideNeighbors(guide.slug);
  const markdownBody = guide.content.replace(/^#\s+.+(?:\r?\n){1,2}/, "");

  return (
    <main className="guide-page">
      <div className="guide-page-shell">
        <nav className="guide-toolbar" aria-label="Guide navigation">
          <Link className="guide-toolbar-link" href="/data-engineering/gcp-to-aws/library">← Field library</Link>
          <span className="guide-toolbar-brand">StackBridge <span>/</span> field notes</span>
          <a className="guide-toolbar-link" href={guide.sourceHref} target="_blank" rel="noreferrer">View source ↗</a>
        </nav>

        <div className="guide-layout">
          <aside className="guide-rail">
            <div className="guide-rail-mark" aria-hidden="true">SB</div>
            <div className="guide-rail-kicker">{guide.kind}</div>
            {guide.number && <div className="guide-rail-number">{guide.number}</div>}
            <p>Read for the decision. Practice for the evidence. Record what became clear.</p>
            <Link className="guide-rail-link" href="/data-engineering/gcp-to-aws">← GCP → AWS path</Link>
          </aside>

          <article className="guide-article">
            <header className="guide-header">
              <div className="eyebrow"><span className="eyebrow-line" /> embedded guide / {guide.kind}</div>
              <h1>{guide.title}</h1>
              <p className="guide-dek">{guide.description}</p>
            </header>

            <div className="guide-markdown">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{ a: GuideAnchor }}
              >
                {markdownBody}
              </ReactMarkdown>
            </div>

            <footer className="guide-footer">
              <div className="guide-footer-note">
                <span className="guide-footer-mark" aria-hidden="true">↳</span>
                <span>This guide is rendered from the open-source Markdown in <code>guides/</code>. Reading it does not mark a milestone complete.</span>
              </div>
              <div className="guide-neighbors" aria-label="Adjacent guides">
                {neighbors.previous ? (
                  <Link className="guide-neighbor guide-neighbor-previous" href={`/guides/${neighbors.previous.slug}`}>
                    <span>← previous</span><strong>{neighbors.previous.number} · {neighbors.previous.title.replace(/^Week \d+ · /, "")}</strong>
                  </Link>
                ) : <span />}
                {neighbors.next ? (
                  <Link className="guide-neighbor guide-neighbor-next" href={`/guides/${neighbors.next.slug}`}>
                    <span>next →</span><strong>{neighbors.next.number} · {neighbors.next.title.replace(/^Week \d+ · /, "")}</strong>
                  </Link>
                ) : <span />}
              </div>
            </footer>
          </article>
        </div>
      </div>
    </main>
  );
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) notFound();

  if (!isLocalMode()) {
    if (!hostedAuthConfigured()) return renderDashboard();

    const { isAuthenticated } = await auth();
    if (!isAuthenticated) return renderDashboard();

    const session = await getAppSession();
    if (!session) return renderDashboard();

    const access = await getAccessDecision(session.user, session.clerkUserId, session.sql);
    if (access.status !== "allowed") return renderDashboard();
  }

  return <GuideDocument guide={guide} />;
}
