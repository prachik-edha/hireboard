"use client";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";

export default function ResumePage() {
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/user/resume")
      .then(r => r.json())
      .then(d => {
        setResumeText(d.resumeText || "");
        setFileName(d.resumeFileName || "");
        setLoading(false);
      });
  }, []);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setError("");
    setResumeText("");
    setFileName("");

    if (file.type === "application/pdf") {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/user/resume/parse", { method: "POST", body: formData });
      let data = null;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch (err) {
        console.error("Invalid JSON response", err);
      }
      if (res.ok && data?.text) {
        setResumeText(data.text);
        setFileName(file.name);
      } else {
        setError(data?.error || "Failed to parse PDF");
      }
    } else if (file.type === "text/plain") {
      const text = await file.text();
      setResumeText(text);
      setFileName(file.name);
    } else {
      setError("Please upload a PDF or TXT file.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "text/plain": [".txt"] },
    maxFiles: 1,
  });

  const save = async () => {
    setSaving(true);
    await fetch("/api/user/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, resumeFileName: fileName }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ marginLeft: "220px", flex: 1, padding: "2rem", maxWidth: "800px" }}>
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", marginBottom: "4px" }}>Resume</h1>
          <p style={{ fontSize: "14px", color: "var(--text3)" }}>
            Upload your resume once — we use it for all AI match scoring and email generation.
          </p>
        </div>

        {loading ? (
          <div style={{ height: 300 }} className="skeleton" />
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Dropzone */}
            <div
              {...getRootProps()}
              style={{
                border: `2px dashed ${isDragActive ? "var(--accent)" : "var(--border2)"}`,
                borderRadius: "var(--radius-lg)",
                padding: "2.5rem",
                textAlign: "center",
                cursor: "pointer",
                background: isDragActive ? "var(--accent-glow)" : "var(--bg3)",
                transition: "all 0.2s",
                marginBottom: "1.5rem",
              }}
            >
              <input {...getInputProps()} />
              <p style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📄</p>
              <p style={{ fontWeight: 500, marginBottom: "4px" }}>
                {isDragActive ? "Drop it here…" : "Drop your resume or click to upload"}
              </p>
              <p style={{ fontSize: "13px", color: "var(--text3)" }}>PDF or TXT • Used only for AI analysis</p>
              {fileName && (
                <p style={{ fontSize: "12px", color: "var(--green)", marginTop: "8px" }}>✓ {fileName}</p>
              )}
            </div>

            {error && <p style={{ color: "var(--red)", fontSize: "13px", marginBottom: "1rem" }}>{error}</p>}

            {/* Manual text area */}
            <div className="card" style={{ padding: "1.25rem" }}>
              <label className="label">Resume text (editable)</label>
              <p style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "10px" }}>
                You can also paste your resume directly here or edit the extracted text.
              </p>
              <textarea
                className="input"
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                rows={18}
                placeholder="Paste your resume text here, or upload a PDF above…"
                style={{ fontFamily: "var(--mono)", fontSize: "12px" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                <p style={{ fontSize: "12px", color: "var(--text3)" }}>
                  {resumeText.split(/\s+/).filter(Boolean).length} words
                </p>
                <button onClick={save} disabled={saving} className="btn btn-primary">
                  {saving ? <><span className="spinner" style={{ width: 15, height: 15 }} /> Saving…</> :
                   saved ? "✓ Saved!" : "Save resume"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
