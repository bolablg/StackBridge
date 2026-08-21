"use client";

import { Show, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { DEFAULT_PATH_KEY, getPathBlueprint } from "../lib/content";

type ShellView = "overview" | "roadmap" | "diagnostic" | "checkin" | "library" | "simulations";
type NavigationIconName = "home" | "paths" | "roadmap" | "diagnostic" | "checkin" | "library" | "exam" | "admin" | "sun" | "moon";

type AuthenticatedPageShellProps = {
  children: ReactNode;
  clerkEnabled: boolean;
  contextLabel: string;
  displayName?: string;
  isAdmin?: boolean;
  pathKey?: string;
  activeView?: ShellView;
  activeAdmin?: boolean;
};

const PATH_NAVIGATION: Array<[ShellView, NavigationIconName, string]> = [
  ["overview", "home", "Overview"],
  ["roadmap", "roadmap", "Learning plan"],
  ["diagnostic", "diagnostic", "Diagnostic"],
  ["checkin", "checkin", "Check-ins"],
  ["library", "library", "Resources"],
  ["simulations", "exam", "Exam simulations"],
];

function pathHref(pathKey: string, view: ShellView = "overview") {
  const segment = pathKey === DEFAULT_PATH_KEY ? "gcp-to-aws" : pathKey;
  const base = `/data-engineering/${segment}`;
  return view === "overview" ? base : `${base}/${view}`;
}

function NavigationIcon({ name }: { name: NavigationIconName }) {
  const paths: Record<NavigationIconName, ReactNode> = {
    home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5.5 9.5V21h13V9.5M9.5 21v-6h5v6" /></>,
    paths: <><circle cx="6" cy="6" r="2.25" /><circle cx="18" cy="18" r="2.25" /><path d="M8 7.2c4.8 1.1 6.8 3.1 8.7 8.6" /><path d="m13.5 14.8 3.4 1.2-1.2-3.4" /></>,
    roadmap: <><path d="M4 19V5" /><path d="M4 7h10l-2.5 3L14 13H4" /><path d="M9 19h11" /></>,
    diagnostic: <><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5M8.5 11l1.8 1.8 3.6-4" /></>,
    checkin: <><path d="M5 3.5h10l4 4V21H5z" /><path d="M15 3.5V8h4M8.5 13h7M8.5 17h5" /></>,
    library: <><path d="M4 5.5h5v14H4zM10.5 5.5h5v14h-5zM17 5.5h3v14h-3z" /></>,
    exam: <><path d="M6 3.5h12V21H6z" /><path d="M9 8h6M9 12h6M9 16h3" /><path d="m14 16 1.3 1.3L18 14.5" /></>,
    admin: <><path d="M12 3 20 6v5.5c0 4.4-3 7.8-8 9.5-5-1.7-8-5.1-8-9.5V6z" /><path d="M9 12h6M12 9v6" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon: <path d="M20.5 15.1A8.7 8.7 0 0 1 8.9 3.5 8.7 8.7 0 1 0 20.5 15.1Z" />,
  };

  return <svg aria-hidden="true" className="navigation-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6">{paths[name]}</svg>;
}

function Account({ displayName }: { displayName: string }) {
  return (
    <Show when="signed-in">
      <div className="sidebar-account">
        <UserButton appearance={{ elements: { avatarBox: "clerk-sidebar-avatar" } }} />
        <div className="sidebar-account-copy">
          <strong title={displayName}>{displayName}</strong>
          <span title="Progress synced"><i className="status-dot status-dot-active" aria-hidden="true" /> Progress synced</span>
        </div>
      </div>
    </Show>
  );
}

export default function AuthenticatedPageShell({
  children,
  clerkEnabled,
  contextLabel,
  displayName = "Learner",
  isAdmin = false,
  pathKey,
  activeView,
  activeAdmin = false,
}: AuthenticatedPageShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const sidebarRef = useRef<HTMLElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const blueprint = pathKey ? getPathBlueprint(pathKey) : null;

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("stackbridge-theme");
    const pageTheme = document.body.dataset.theme;
    const nextTheme = storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : pageTheme === "dark" || pageTheme === "light"
        ? pageTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    // Hydrate the browser preference after the server-rendered shell is mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    document.body.dataset.theme = theme;
    window.localStorage.setItem("stackbridge-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const sidebar = sidebarRef.current;
    const focusable = () => Array.from(sidebar?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]):not([tabindex="-1"]), summary') || []).filter((item) => item.offsetParent !== null);
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        window.requestAnimationFrame(() => mobileMenuButtonRef.current?.focus());
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyboard);
    window.requestAnimationFrame(() => focusable()[0]?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);
  const mobileContext = blueprint ? `${blueprint.source.short} → ${blueprint.target.short}` : activeAdmin ? "Administration" : "Path library";

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div className="app-shell">
        <aside ref={sidebarRef} className={`sidebar${mobileMenuOpen ? " is-mobile-open" : ""}`} aria-label="StackBridge navigation">
          <div className="sidebar-header">
            <Link className="brand-lockup" href="/" aria-label="StackBridge overview" onClick={closeMenu}>
              <Image className="brand-mark" src="/images/icon.svg" alt="" width={42} height={42} priority />
              <div className="brand-copy">
                <div className="brand-wordmark"><strong>Stack</strong><em>Bridge</em></div>
                <div className="brand-subtitle">Carry expertise forward</div>
              </div>
            </Link>
            <span className="mobile-current-context">{mobileContext}</span>
            <button ref={mobileMenuButtonRef} className="mobile-menu-toggle" type="button" aria-expanded={mobileMenuOpen} aria-controls="stackbridge-menu" onClick={() => setMobileMenuOpen((open) => !open)}>
              <span className="mobile-menu-icon" aria-hidden="true"><i /><i /></span>
              <span>{mobileMenuOpen ? "Close" : "Menu"}</span>
            </button>
          </div>

          <div className="sidebar-menu" id="stackbridge-menu">
            {blueprint ? (
              <>
                <div className="sidebar-context">
                  <Link className="sidebar-context-back" href="/data-engineering" onClick={closeMenu}>All data engineering paths</Link>
                  <span className="sidebar-route" aria-label={`From ${blueprint.source.label} to ${blueprint.target.label}`}><b>{blueprint.source.short}</b><i aria-hidden="true">→</i><b>{blueprint.target.short}</b></span>
                  <small>{blueprint.focus}</small>
                </div>
                <nav className="primary-nav" aria-label="Selected path">
                  {PATH_NAVIGATION.map(([target, icon, title]) => (
                    <Link key={target} className={`nav-item${activeView === target ? " is-active" : ""}`} href={pathHref(blueprint.key, target)} aria-current={activeView === target ? "page" : undefined} onClick={closeMenu}>
                      <span className="nav-icon"><NavigationIcon name={icon} /></span><strong>{title}</strong>
                    </Link>
                  ))}
                </nav>
              </>
            ) : (
              <nav className="primary-nav primary-nav-library" aria-label="Path library">
                <Link className="nav-item" href="/" onClick={closeMenu}><span className="nav-icon"><NavigationIcon name="home" /></span><strong>Overview</strong></Link>
                <Link className="nav-item" href="/data-engineering" onClick={closeMenu}><span className="nav-icon"><NavigationIcon name="paths" /></span><strong>Data engineering</strong><span className="nav-count">12</span></Link>
                <div className="sidebar-future"><span>Coming later</span><p>Machine learning</p><p>Cloud architecture</p></div>
              </nav>
            )}

            <div className="sidebar-bottom">
              {isAdmin && (
                <Link className={`sidebar-admin-link${activeAdmin ? " is-active" : ""}`} href="/admin/access-requests" aria-current={activeAdmin ? "page" : undefined} onClick={closeMenu}>
                  <span className="nav-icon"><NavigationIcon name="admin" /></span><strong>Administration</strong>
                </Link>
              )}
              {clerkEnabled
                ? <Account displayName={displayName} />
                : <div className="local-status" title="Saved on this device"><span className="status-dot status-dot-browser" /> <span>Saved on this device</span></div>}
            </div>
          </div>
          <button className="mobile-menu-backdrop" type="button" aria-label="Close navigation" tabIndex={-1} onClick={closeMenu} />
        </aside>

        <main id="main-content" className="main-content authenticated-page-main" inert={mobileMenuOpen || undefined}>
          <header className="topbar">
            <div className="topbar-context">
              <span>{blueprint ? `${blueprint.source.short} → ${blueprint.target.short}` : "StackBridge"}</span>
              <i aria-hidden="true">/</i><strong>{contextLabel}</strong>
            </div>
            <div className="topbar-actions">
              {!clerkEnabled && <span className="local-mode-label">local mode</span>}
              <button className="icon-button" type="button" onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}><NavigationIcon name={theme === "dark" ? "sun" : "moon"} /></button>
              {blueprint && <Link className="button button-small button-dark topbar-checkin" href={pathHref(blueprint.key, "checkin")}><span aria-hidden="true">＋</span><span className="topbar-checkin-label">Log check-in</span></Link>}
            </div>
          </header>
          <div className="authenticated-page-content">{children}</div>
        </main>
      </div>
    </>
  );
}
