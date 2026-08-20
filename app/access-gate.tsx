"use client";

import { UserButton, useClerk } from "@clerk/nextjs";
import { useState } from "react";

type AccessStatus = "allowed" | "pending" | "denied" | "not_requested";

type AccessGateProps = {
  status: Exclude<AccessStatus, "allowed">;
  email: string;
  displayName: string;
  adminEmail: string;
  requestId?: string;
};

export default function AccessGate({ status: initialStatus, email, displayName, adminEmail, requestId }: AccessGateProps) {
  const { signOut } = useClerk();
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function requestAccess() {
    setSubmitting(true);
    setFeedback("");
    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const payload = await response.json() as { status?: AccessStatus; notificationSent?: boolean; error?: string };
      if (!response.ok) throw new Error(payload.error || "Could not submit the access request.");
      setStatus(payload.status === "pending" ? "pending" : "not_requested");
      setFeedback(payload.notificationSent
        ? `Your request was sent to ${adminEmail}.`
        : "Your request was saved for admin review.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not submit the access request.");
    } finally {
      setSubmitting(false);
    }
  }

  const canRequest = status === "not_requested" || status === "denied";

  return (
    <main className="auth-gate access-gate">
      <section className="auth-card access-card" role="dialog" aria-modal="true" aria-labelledby="access-title">
        <div className="access-card-top">
          <div className="brand-mark auth-mark" aria-hidden="true">SB</div>
          <UserButton appearance={{ elements: { avatarBox: "clerk-avatar" } }} />
        </div>
        <div className="eyebrow"><span className="eyebrow-line" /> private study path</div>
        <h2 id="access-title">Access is restricted.</h2>
        <p>
          Hi {displayName}. The account <strong>{email}</strong> is not approved for this StackBridge path yet.
        </p>

        {status === "pending" ? (
          <div className="access-status access-status-pending">
            <strong>Request pending</strong>
            <span>{requestId ? `Request ${requestId.slice(0, 8)} is waiting for review by ${adminEmail}.` : `The administrator is reviewing your request.`}</span>
          </div>
        ) : (
          <>
            {status === "denied" && <div className="access-status access-status-denied"><strong>Previous request not approved</strong><span>You can submit a new request if your circumstances have changed.</span></div>}
            <p>Would you like to send an access request to the administrator?</p>
            <label className="field-label access-message-label">
              Optional note
              <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1000} placeholder="Tell the admin why you would like to join." />
            </label>
            <button className="button button-primary button-full" type="button" disabled={!canRequest || submitting} onClick={requestAccess}>
              {submitting ? "Submitting…" : status === "denied" ? "Submit another request" : "Request access"} <span aria-hidden="true">→</span>
            </button>
          </>
        )}

        <p className="auth-message access-feedback" aria-live="polite">{feedback}</p>
        <div className="access-footer">
          <span>Signed in as {email}</span>
          <button className="text-button" type="button" onClick={() => void signOut()}>Sign out</button>
        </div>
      </section>
    </main>
  );
}
