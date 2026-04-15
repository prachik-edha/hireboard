"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import ScoreRing from "@/components/ScoreRing";
import JobModal from "@/components/JobModal";
import EmailDraftModal from "@/components/EmailDraftModal";
import { IJob, JobStatus } from "@/models/Job";

const STATUS_COLORS: Record<JobStatus, string> = {
  wishlist: "var(--text3)",
  applied: "var(--blue)",
  interview: "var(--amber)",
  offer: "var(--green)",
  rejected: "var(--red)",
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<IJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [note, setNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then(r => r.json())
      .then(d => { setJob(d.job); setLoading(false); });
  }, [id]);

 const runMatch = async () => {
  if (!job?.jobDescription) {
    return alert("Add a job description first.");
  }

  setMatching(true);

  try {
    const res = await fetch("/api/ai/match", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jobId: id }), // ✅ correct
    });

    const text = await res.text();
    let data = null;

    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("JSON parse failed:", text);
    }

    console.log("MATCH RESPONSE:", data);

    if (res.ok && data?.job) {
      setJob(data.job); // ✅ full job update (VERY IMPORTANT)
    } else {
      console.error("Match failed:", data);
    }

  } catch (err) {
    console.error("Match error:", err);
  }

  setMatching(false);
};
  const addNote = async () => {
    if (!note.trim()) return;
    setAddingNote(true);
    const res = await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addNote: note }),
    });
    const data = await res.json();
    if (res.ok) setJob(data.job);
    setNote("");
    setAddingNote(false);
  };

  const handleEdit = async (updates: any) => {
    const res = await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (res.ok) setJob(data.job);
    setShowEdit(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this job?")) return;
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    router.push("/dashboard");
  };

  if (loading) return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ marginLeft: "220px", flex: 1, padding: "2rem" }}>
        <div style={{ height: 400 }} className="skeleton" />
      </main>
    </div>
  );

  if (!job) return null;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ marginLeft: "220px", flex: 1, padding: "2rem", maxWidth: "900px" }}>
        {/* Back */}
        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text3)", marginBottom: "1.5rem" }}>
          ← Back to board
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>{job.role}</h1>
              <p style={{ fontSize: "16px", color: "var(--text2)", marginTop: "4px" }}>{job.company}</p>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
                <span className={`badge status-${job.status}`}>{job.status}</span>
                {job.location && <span style={{ fontSize: "13px", color: "var(--text3)" }}>📍 {job.location}</span>}
                {job.salary?.min && (
                  <span style={{ fontSize: "13px", color: "var(--text3)" }}>
                    💰 ${job.salary.min.toLocaleString()}–${job.salary.max?.toLocaleString()}
                  </span>
                )}
                {job.jobUrl && (
                  <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "var(--accent2)" }}>
                    View posting ↗
                  </a>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setShowEmail(true)} className="btn btn-ghost btn-sm">✉ Drafts</button>
              <button onClick={() => setShowEdit(true)} className="btn btn-ghost btn-sm">Edit</button>
              <button onClick={handleDelete} className="btn btn-sm" style={{ background: "var(--red-bg)", color: "var(--red)", border: "1px solid rgba(248,113,113,0.2)" }}>
                Delete
              </button>
            </div>
          </div>

          {/* AI Match Section */}
          <div className="card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "14px", fontWeight: 600 }}>AI Resume Match</h2>
              <button onClick={runMatch} disabled={matching} className="btn btn-primary btn-sm">
                  {matching ? (<><span className="spinner" style={{ width: 13, height: 13 }} />{" "}Analyzing resume...</>) : ( "✦ Analyze fit")}      
              </button>
            </div>

            {job.matchScore != null ? (
              <div>
                <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
                  <ScoreRing score={job.matchScore} size={80} label="Overall" />
                  {job.matchBreakdown && (
                    <>
                      <ScoreRing score={job.matchBreakdown.skills} size={60} label="Skills" />
                      <ScoreRing score={job.matchBreakdown.experience} size={60} label="Experience" />
                      <ScoreRing score={job.matchBreakdown.keywords} size={60} label="Keywords" />
                    </>
                  )}
                </div>

                {job.matchSummary && (
                  <p style={{ fontSize: "13px", color: "var(--text2)", marginTop: "1rem", lineHeight: 1.7, borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                    {job.matchSummary}
                  </p>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "1rem" }}>
                  {job.matchStrengths && job.matchStrengths.length > 0 && (
                    <div style={{ background: "var(--green-bg)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: "var(--radius)", padding: "12px" }}>
                      <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--green)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Strengths</p>
                      {job.matchStrengths.map((s, i) => (
                        <p key={i} style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "4px" }}>✓ {s}</p>
                      ))}
                    </div>
                  )}
                  {job.matchGaps && job.matchGaps.length > 0 && (
                    <div style={{ background: "var(--red-bg)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: "var(--radius)", padding: "12px" }}>
                      <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--red)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Gaps</p>
                      {job.matchGaps.map((g, i) => (
                        <p key={i} style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "4px" }}>✗ {g}</p>
                      ))}
                    </div>
                  )}
                </div>

                {job.missingKeywords && job.missingKeywords.length > 0 && (
                  <div style={{ marginTop: "12px" }}>
                    <p style={{ fontSize: "11px", color: "var(--text3)", marginBottom: "6px" }}>Missing keywords to add to resume:</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {job.missingKeywords.map((kw, i) => (
                        <span key={i} style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "99px", background: "var(--amber-bg)", color: "var(--amber)", border: "1px solid rgba(251,191,36,0.2)" }}>
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ fontSize: "13px", color: "var(--text3)" }}>
                {job.jobDescription ? "Click Analyze fit to see how well your resume matches this role." : "Add a job description first, then analyze your fit."}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "1rem" }}>Notes</h2>
            <div style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
              <input
                className="input"
                value={note}
                onChange={e => setNote(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addNote()}
                placeholder="Add a note…"
              />
              <button onClick={addNote} disabled={addingNote} className="btn btn-primary btn-sm" style={{ whiteSpace: "nowrap" }}>
                {addingNote ? <span className="spinner" style={{ width: 13, height: 13 }} /> : "Add"}
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(job.notes || []).slice().reverse().map((n: any, i: number) => (
                <div key={i} style={{ fontSize: "13px", padding: "10px 12px", background: "var(--bg2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                  <p style={{ color: "var(--text2)" }}>{n.text}</p>
                  <p style={{ fontSize: "11px", color: "var(--text3)", marginTop: "4px" }}>
                    {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              ))}
              {(!job.notes || job.notes.length === 0) && (
                <p style={{ fontSize: "13px", color: "var(--text3)" }}>No notes yet.</p>
              )}
            </div>
          </div>

          {/* Job Description */}
          {job.jobDescription && (
            <div className="card" style={{ padding: "1.25rem" }}>
              <h2 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "1rem" }}>Job Description</h2>
              <p style={{ fontSize: "13px", color: "var(--text2)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {job.jobDescription}
              </p>
            </div>
          )}
        </motion.div>
      </main>

      {showEdit && <JobModal onClose={() => setShowEdit(false)} onSave={handleEdit} initial={job} />}
      {showEmail && <EmailDraftModal jobId={id} jobTitle={job.role} company={job.company} onClose={() => setShowEmail(false)} />}
    </div>
  );
}
