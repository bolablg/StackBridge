import path from "node:path";
import { readFile } from "node:fs/promises";
import { CORE_RESOURCES, WEEKS } from "./content";

const GUIDE_DIRECTORY = path.join(process.cwd(), "guides");
const SAFE_SLUG = /^[A-Za-z0-9][A-Za-z0-9-]*$/;

type GuideCatalogEntry = {
  slug: string;
  title: string;
  description: string;
  kind: string;
  number?: string;
};

export type Guide = GuideCatalogEntry & {
  content: string;
  sourceHref: string;
};

function slugFromHref(href: string) {
  return href.split("/").pop()?.replace(/\.md$/, "") || "";
}

const guideCatalog = new Map<string, GuideCatalogEntry>();

for (const resource of CORE_RESOURCES) {
  if (resource.type !== "local") continue;
  const slug = slugFromHref(resource.href);
  if (slug) {
    guideCatalog.set(slug, {
      slug,
      title: resource.title,
      description: resource.description,
      kind: "core field guide",
      number: resource.number,
    });
  }
}

for (const week of WEEKS) {
  const slug = slugFromHref(week.guide);
  if (slug && !guideCatalog.has(slug)) {
    guideCatalog.set(slug, {
      slug,
      title: `Week ${String(week.number).padStart(2, "0")} · ${week.title}`,
      description: week.summary,
      kind: `week ${String(week.number).padStart(2, "0")} field guide`,
      number: `W${String(week.number).padStart(2, "0")}`,
    });
  }
}

function titleFromMarkdown(content: string, fallback: string) {
  const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (heading) return heading.replace(/[`*_]/g, "");
  return fallback
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function getGuide(slug: string): Promise<Guide | null> {
  if (!SAFE_SLUG.test(slug)) return null;

  try {
    const content = await readFile(path.join(GUIDE_DIRECTORY, `${slug}.md`), "utf8");
    const catalogEntry = guideCatalog.get(slug);
    const title = titleFromMarkdown(content, catalogEntry?.title || slug);

    return {
      slug,
      title,
      description: catalogEntry?.description || "A StackBridge field guide for carrying expertise across platforms.",
      kind: catalogEntry?.kind || "field guide",
      number: catalogEntry?.number,
      content,
      sourceHref: `https://github.com/bolablg/StackBridge/blob/main/guides/${slug}.md`,
    };
  } catch {
    return null;
  }
}

export function getGuideNeighbors(slug: string) {
  const weekIndex = WEEKS.findIndex((week) => slugFromHref(week.guide) === slug);
  if (weekIndex < 0) return { previous: null, next: null };

  const neighbor = (index: number) => {
    const week = WEEKS[index];
    if (!week) return null;
    const neighborSlug = slugFromHref(week.guide);
    return {
      slug: neighborSlug,
      title: `Week ${String(week.number).padStart(2, "0")} · ${week.title}`,
      number: `W${String(week.number).padStart(2, "0")}`,
    };
  };

  return {
    previous: neighbor(weekIndex - 1),
    next: neighbor(weekIndex + 1),
  };
}
