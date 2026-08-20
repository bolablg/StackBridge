"use client";

import { SignIn, SignUp } from "@clerk/nextjs";

const appearance = {
  variables: {
    colorPrimary: "#bd7464",
    colorBackground: "transparent",
    colorText: "#2d3b3c",
    colorTextSecondary: "#6f7c79",
    borderRadius: "7px",
    fontFamily: '"Avenir Next", "Trebuchet MS", "Segoe UI", sans-serif',
  },
  elements: {
    rootBox: "clerk-auth-root",
    card: "clerk-auth-component-card",
    header: "clerk-auth-hide",
    headerTitle: "clerk-auth-hide",
    headerSubtitle: "clerk-auth-hide",
    logoBox: "clerk-auth-hide",
    formFieldLabel: "clerk-auth-label",
    formFieldInput: "clerk-auth-input",
    formButtonPrimary: "clerk-auth-primary",
    socialButtonsBlockButton: "clerk-auth-social",
    socialButtonsBlockButtonText: "clerk-auth-social-text",
    dividerLine: "clerk-auth-divider",
    dividerText: "clerk-auth-divider-text",
    footer: "clerk-auth-footer",
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
      <section className="auth-card auth-card-clerk" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <div className="brand-mark auth-mark" aria-hidden="true">SB</div>
        <div className="eyebrow"><span className="eyebrow-line" /> {signIn ? "private study path / sign in" : "private study path / create account"}</div>
        <h2 id="auth-title">Welcome to StackBridge.</h2>
        <p>{signIn ? "Sign in to keep your learning path, evidence, and progress private." : "Create your account to start a private, guided learning path."}</p>
        <div className="clerk-auth-provider">
          {signIn ? (
            <SignIn {...routingProps} signUpUrl="/sign-up" appearance={appearance} />
          ) : (
            <SignUp {...routingProps} signInUrl="/sign-in" appearance={appearance} />
          )}
        </div>
      </section>
    </main>
  );
}
