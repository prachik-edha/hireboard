"use client";
import { useState } from "react";
import { JobStatus } from "@/models/Job";

interface JobModalProps {
  onClose: () => void;
  onSave: (job: any) => Promise<void>;
  initial?: any;
}

export default function JobModal({ onClose, onSave, initial }: JobModalProps) {
  const [form, setForm] = useState({
    company: initial?.company || "",
    role: initial?.role || "",
    jobDescription: initial?.jobDescription || "",
    jobUrl: initial?.jobUrl || "",
    location: initial?.location || "",
    status: (initial?.status as JobStatus) || "wishlist",
    salaryMin: initial?.salary?.min || "",
    salaryMax: initial?.salary?.max || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      company: form.company,
      role: form.role,
      jobDescription: form.jobDescription,
      jobUrl: form.jobUrl,
      location: form.location,
      status: form.status,
      salary: form.salaryMin ? { min: Number(form.salaryMin), max: Number(form.salaryMax), currency: "USD" } : undefined,
    });
    setSaving(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card animate-in" style={{ width: "100%", maxWidth: "540px", padding: "1.5rem", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "17px", fontWeight: 600 }}>{initial ? "Edit job" : "Add job"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: "20px", lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="label">Company *</label>
              <input className="input" value={form.company} onChange={set("company")} required placeholder="Google" />
            </div>
            <div>
              <label className="label">Role *</label>
              <input className="input" value={form.role} onChange={set("role")} required placeholder="Software Engineer" />
            </div>
          </div>

          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={set("status")} style={{ cursor: "pointer" }}>
              {["wishlist", "applied", "interview", "offer", "rejected"].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Job URL</label>
            <input className="input" value={form.jobUrl} onChange={set("jobUrl")} placeholder="https://..." type="url" />
          </div>

          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={set("location")} placeholder="Remote / San Francisco, CA" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="label">Salary min (USD)</label>
              <input className="input" value={form.salaryMin} onChange={set("salaryMin")} type="number" placeholder="100000" />
            </div>
            <div>
              <label className="label">Salary max (USD)</label>
              <input className="input" value={form.salaryMax} onChange={set("salaryMax")} type="number" placeholder="150000" />
            </div>
          </div>

          <div>
            <label className="label">Job description (paste for AI matching)</label>
            <textarea className="input" value={form.jobDescription} onChange={set("jobDescription")} rows={5} placeholder="Paste the full job description here..." />
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "4px" }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : initial ? "Save changes" : "Add job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
