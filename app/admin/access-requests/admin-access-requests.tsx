"use client";

import Link from "next/link";
import { useState } from "react";

type AccessRequest = {
  id: string;
  email: string;
  displayName: string;
  message: string;
  createdAt: string;
  status: "pending" | "approved" | "denied";
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function AdminAccessRequests({ adminEmail, initialRequests }: { adminEmail: string; initialRequests: AccessRequest[] }) {
  const [requests, setRequests] = useState<AccessRequest[]>(initialRequests);
  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState("");
  const [feedback, setFeedback] = useState("");

  async function loadRequests() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/access-requests", { cache: "no-store" });
      const payload = await response.json() as { requests?: AccessRequest[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "Could not load requests.");
      setRequests(payload.requests || []);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not load requests.");
    } finally {
      setLoading(false);
    }
  }

  async function review(id: string, status: "approved" | "denied") {
    setWorkingId(id);
    setFeedback("");
    try {
      const response = await fetch("/api/admin/access-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Could not review request.");
      setRequests((current) => current.filter((item) => item.id !== id));
      setFeedback(status === "approved" ? "Access granted." : "Request denied.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not review request.");
    } finally {
      setWorkingId("");
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> admin / access control</div>
          <h1>Access requests</h1>
          <p>Review who can enter the StackBridge learning path. Notifications are addressed to {adminEmail}.</p>
        </div>
        <Link className="button button-quiet" href="/">Back to dashboard <span aria-hidden="true">↗</span></Link>
      </div>

      <section className="panel admin-request-panel">
        <div className="panel-kicker"><span className="kicker-number">QUEUE</span> pending learners</div>
        <div className="admin-request-toolbar">
          <h2>{loading ? "Loading…" : `${requests.length} pending request${requests.length === 1 ? "" : "s"}`}</h2>
          <button className="button button-outline button-small" type="button" onClick={() => void loadRequests()} disabled={loading}>Refresh</button>
        </div>
        {feedback && <p className="auth-message admin-feedback" aria-live="polite">{feedback}</p>}
        {!loading && !requests.length && <p className="admin-empty">No pending requests. The queue is clear.</p>}
        <div className="admin-request-list">
          {requests.map((request) => (
            <article className="admin-request" key={request.id}>
              <div className="admin-request-main">
                <div className="admin-request-heading"><h3>{request.displayName}</h3><span>{request.email}</span></div>
                <time>{formatDate(request.createdAt)}</time>
                <p>{request.message || "No note provided."}</p>
              </div>
              <div className="admin-request-actions">
                <button className="button button-primary button-small" type="button" disabled={workingId === request.id} onClick={() => void review(request.id, "approved")}>Approve</button>
                <button className="button button-outline button-small" type="button" disabled={workingId === request.id} onClick={() => void review(request.id, "denied")}>Deny</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
