"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import Link from "next/link";

const appearance = {
  variables: {
    colorPrimary: "#bd7464",
    colorBackground: "transparent",
    colorText: "#2d3b3c",
    colorTextSecondary: "#6f7c79",
    borderRadius: "7px",
    fontFamily: '"Avenir Next", "Trebuchet MS", "Segoe UI", sans-serif',
  },
  options: {
    socialButtonsVariant: "blockButton" as const,
    socialButtonsPlacement: "top" as const,
  },
  elements: {
    rootBox: "clerk-auth-root",
    card: "clerk-auth-component-card",
    header: "clerk-auth-hide",
    headerTitle: "clerk-auth-hide",
    headerSubtitle: "clerk-auth-hide",
    logoBox: "clerk-auth-hide",
    formFieldLabel: "clerk-auth-label",
    formField: "clerk-auth-field",
    formFieldRow: "clerk-auth-field-row",
    formFieldInput: "clerk-auth-input",
    formButtonPrimary: "clerk-auth-primary",
    socialButtonsBlockButton: "clerk-auth-social",
    socialButtonsBlockButtonText: "clerk-auth-social-text",
    dividerLine: "clerk-auth-divider",
    dividerText: "clerk-auth-divider-text",
    footer: "clerk-auth-hide",
    footerActionLink: "clerk-auth-link",
  },
};

export default function ClerkAuthPanel({ mode, routing }: { mode: "sign-in" | "sign-up"; routing: "hash" | "path" }) {
  const signIn = mode === "sign-in";
  const routingProps = routing === "path"
    ? { path: signIn ? "/sign-in" : "/sign-up", routing: "path" as const }
    : { routing: "hash" as const };

  return (
    <main className="auth-gate auth-page-gate">
      <section className="auth-shell" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <aside className="auth-visual" aria-label="StackBridge learning path">
          <div className="auth-visual-brand">
            <div className="auth-visual-mark" aria-hidden="true">SB</div>
            <span>STACKBRIDGE</span>
          </div>
          <div className="auth-visual-copy">
            <span className="auth-visual-kicker">cross-platform / 01</span>
            <h1>Carry your<br /><em>judgment</em><br />across clouds.</h1>
            <p>Translate the decisions that matter from one platform to the next.</p>
          </div>
          <div className="auth-route-card">
            <div><span>source</span><strong>GCP</strong><small>certified foundation</small></div>
            <div className="auth-route-connector" aria-hidden="true"><i />→<i /></div>
            <div><span>target</span><strong>AWS</strong><small>data engineering</small></div>
          </div>
          <div className="auth-visual-footer"><span>DATA ENGINEERING</span><span>GCP → AWS</span></div>
        </aside>
        <div className="auth-form-pane">
          <div className="auth-form-kicker"><span className="auth-form-kicker-dot" /> {signIn ? "private study path / sign in" : "private study path / create account"}</div>
          <h2 id="auth-title">{signIn ? "Welcome back." : "Start your bridge."}</h2>
          <p className="auth-form-description">{signIn ? "Your next platform is already mapped." : "Build a private path from what you already know."}</p>
          <div className="clerk-auth-provider">
            {signIn ? (
              <SignIn {...routingProps} signUpUrl="/sign-up" appearance={appearance} />
            ) : (
              <SignUp {...routingProps} signInUrl="/sign-in" appearance={appearance} />
            )}
          </div>
          <p className="auth-switch">{signIn ? "New to StackBridge?" : "Already have an account?"} <Link href={signIn ? "/sign-up" : "/sign-in"}>{signIn ? "Create an account" : "Sign in"}</Link></p>
          <p className="auth-trust"><span aria-hidden="true">↳</span> Your learning path and evidence stay private to your account.</p>
        </div>
      </section>
    </main>
  );
}
