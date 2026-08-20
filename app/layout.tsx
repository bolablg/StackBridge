import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "StackBridge — GCP → AWS Data Engineering",
  description: "Carry data and AI expertise across platforms.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const content = publishableKey ? <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider> : children;

  return (
    <html lang="en">
      <body>{content}</body>
    </html>
  );
}
