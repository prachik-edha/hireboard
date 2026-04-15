"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import KanbanBoard from "@/components/KanbanBoard";
import JobModal from "@/components/JobModal";
import { IJob, JobStatus } from "@/models/Job";

const STATS = [
  { key: "total", label: "Total" },
  { key: "applied", label: "Applied" },
  { key: "interview", label: "Interviews" },
  { key: "offer", label: "Offers" },
];

export default function DashboardPage() {
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const router = useRouter();

  // ✅ FINAL CLEAN FETCH
  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs");

      if (!res.ok) {
        throw new Error(`API failed: ${res.status}`);
      }

      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error("Fetch jobs error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ✅ ADD JOB
  const handleAdd = async (job: any) => {
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });

      if (!res.ok) throw new Error("Failed to add job");

      const data = await res.json();
      setJobs(prev => [data.job, ...prev]);
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ STATUS UPDATE (safe + rollback)
  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    const prevJobs = jobs;

    // optimistic update
    setJobs(prev => prev.map(job => job._id === jobId ? { ...job, status: newStatus as JobStatus } : job ));
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
    } catch (err) {
      console.error(err);

      // rollback if API fails
      setJobs(prevJobs);
    }
  };

  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === "applied").length,
    interview: jobs.filter(j => j.status === "interview").length,
    offer: jobs.filter(j => j.status === "offer").length,
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <main
        style={{
          marginLeft: "220px",
          flex: 1,
          padding: "2rem",
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "1.75rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                marginBottom: "4px",
              }}
            >
              Dashboard
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text3)" }}>
              {jobs.length} application{jobs.length !== 1 ? "s" : ""} tracked
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            + Add job
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
            marginBottom: "2rem",
          }}
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: "var(--bg3)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "1.1rem 1.25rem",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--text3)",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "6px",
                }}
              >
                {s.label}
              </p>
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                }}
              >
                {stats[s.key as keyof typeof stats]}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Board */}
        {loading ? (
          <div style={{ display: "flex", gap: "16px" }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                style={{ flex: "0 0 220px", height: "200px" }}
                className="skeleton"
              />
            ))}
          </div>
        ) : (
          <KanbanBoard
            jobs={jobs}
            onStatusChange={handleStatusChange}
            onCardClick={job => router.push(`/jobs/${job._id}`)}
          />
        )}
      </main>

      {showAddModal && (
        <JobModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
        />
      )}
    </div>
  );
}