"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import Link from "next/link";

const appearance = {
  variables: {
    colorPrimary: "#a45d52",
    colorBackground: "transparent",
    colorText: "#2d3b3c",
    colorTextSecondary: "#626f6d",
    borderRadius: "14px",
    fontFamily: '"Avenir Next", "Trebuchet MS", "Segoe UI", sans-serif',
  },
  options: {
    socialButtonsVariant: "blockButton" as const,
    socialButtonsPlacement: "top" as const,
  },
  elements: {
    rootBox: "clerk-auth-root",
    cardBox: "clerk-auth-card-box",
    card: "clerk-auth-component-card",
    main: "clerk-auth-main",
    form: "clerk-auth-form",
    socialButtons: "clerk-auth-social-buttons",
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
      <section className="auth-minimal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
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
      </section>
    </main>
  );
}
