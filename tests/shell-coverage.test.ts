import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const appRoot = join(projectRoot, "app");

function pageFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return pageFiles(path);
    return entry.name === "page.tsx" ? [relative(projectRoot, path)] : [];
  });
}

const routePolicies = {
  "app/page.tsx": "renderDashboard",
  "app/[domain]/[[...path]]/page.tsx": "renderDashboard",
  "app/admin/access-requests/page.tsx": "AuthenticatedPageShell",
  "app/data-engineering/[pathKey]/guides/[week]/page.tsx": "AuthenticatedPageShell",
  "app/guides/[slug]/page.tsx": "AuthenticatedPageShell",
  // Authentication screens are intentionally focused pre-workspace gates.
  "app/sign-in/[[...sign-in]]/page.tsx": "ClerkAuthPanel",
  "app/sign-up/[[...sign-up]]/page.tsx": "ClerkAuthPanel",
} as const;

test("every application page has an explicit navigation-shell policy", () => {
  const actualPages = pageFiles(appRoot).sort();
  const governedPages = Object.keys(routePolicies).sort();
  assert.deepEqual(actualPages, governedPages, "new pages must declare whether they use the workspace shell or a focused auth gate");

  for (const [file, requiredBoundary] of Object.entries(routePolicies)) {
    const source = readFileSync(join(projectRoot, file), "utf8");
    assert.match(source, new RegExp(`\\b${requiredBoundary}\\b`), `${file} must render through ${requiredBoundary}`);
  }
});

test("the not-found screen preserves the authorized workspace shell", () => {
  const source = readFileSync(join(projectRoot, "app/not-found.tsx"), "utf8");
  assert.match(source, /\bAuthenticatedPageShell\b/);
});
