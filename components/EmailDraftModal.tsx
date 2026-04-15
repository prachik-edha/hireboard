"use client";
import { useState } from "react";

interface Draft {
  subject: string;
  body: string;
  tone: string;
}

interface EmailDraftModalProps {
  jobId: string;
  jobTitle: string;
  company: string;
  onClose: () => void;
}

const EMAIL_TYPES = [
  { id: "cold", label: "Cold outreach" },
  { id: "followup", label: "Follow-up" },
  { id: "thankyou", label: "Thank-you" },
];

const TONE_COLORS: Record<string, string> = {
  formal: "var(--blue)",
  friendly: "var(--green)",
  concise: "var(--purple)",
};

export default function EmailDraftModal({ jobId, jobTitle, company, onClose }: EmailDraftModalProps) {
  const [emailType, setEmailType] = useState("cold");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    setDrafts([]);
    try {
      const res = await fetch("/api/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, emailType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setDrafts(data.drafts);
      setSelected(0);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    const d = drafts[selected];
    navigator.clipboard.writeText(`Subject: ${d.subject}\n\n${d.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card animate-in" style={{ width: "100%", maxWidth: "620px", padding: "1.5rem", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 600 }}>AI Email Drafts</h2>
            <p style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>{jobTitle} @ {company}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: "20px" }}>×</button>
        </div>

        {/* Email type picker */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "1.25rem" }}>
          {EMAIL_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setEmailType(t.id)}
              className="btn btn-sm"
              style={{
                background: emailType === t.id ? "var(--accent)" : "transparent",
                color: emailType === t.id ? "#fff" : "var(--text2)",
                border: emailType === t.id ? "1px solid var(--accent)" : "1px solid var(--border)",
              }}
            >
              {t.label}
            </button>
          ))}
          <button
            onClick={generate}
            disabled={loading}
            className="btn btn-primary btn-sm"
            style={{ marginLeft: "auto" }}
          >
            {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Generating…</> : "✦ Generate"}
          </button>
        </div>

        {error && <p style={{ color: "var(--red)", fontSize: "13px", marginBottom: "1rem" }}>{error}</p>}

        {drafts.length === 0 && !loading && (
          <div style={{
            textAlign: "center", padding: "3rem 1rem",
            color: "var(--text3)", fontSize: "14px",
          }}>
            <p style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>✉</p>
            <p>Select an email type and click Generate</p>
            <p style={{ fontSize: "12px", marginTop: "4px" }}>We&apos;ll use your resume to write personalized emails</p>
          </div>
        )}

        {drafts.length > 0 && (
          <>
            {/* Tone tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
              {drafts.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className="btn btn-sm"
                  style={{
                    background: selected === i ? "var(--bg4)" : "transparent",
                    color: selected === i ? TONE_COLORS[d.tone] : "var(--text3)",
                    border: selected === i ? `1px solid ${TONE_COLORS[d.tone]}` : "1px solid var(--border)",
                  }}
                >
                  {d.tone}
                </button>
              ))}
            </div>

            {/* Draft view */}
            <div style={{ background: "var(--bg2)", borderRadius: "var(--radius)", padding: "1rem", border: "1px solid var(--border)" }}>
              <p style={{ fontSize: "11px", color: "var(--text3)", marginBottom: "4px" }}>SUBJECT</p>
              <p style={{ fontSize: "14px", fontWeight: 500, marginBottom: "1rem" }}>{drafts[selected].subject}</p>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                <p style={{ fontSize: "11px", color: "var(--text3)", marginBottom: "8px" }}>BODY</p>
                <p style={{ fontSize: "13px", lineHeight: 1.8, color: "var(--text2)", whiteSpace: "pre-wrap" }}>
                  {drafts[selected].body}
                </p>
              </div>
            </div>

            <button onClick={copy} className="btn btn-ghost" style={{ marginTop: "12px", width: "100%", justifyContent: "center" }}>
              {copied ? "✓ Copied!" : "Copy to clipboard"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
