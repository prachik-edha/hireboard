"use client";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) router.push("/dashboard");
  }, [isSignedIn, router]);

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(var(--border2) 1px, transparent 1px), linear-gradient(90deg, var(--border2) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />
      {/* Glow orb */}
      <div style={{
        position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "300px",
        background: "radial-gradient(ellipse, rgba(124,106,247,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", textAlign: "center", maxWidth: "640px" }} className="animate-in">
        <div className="badge" style={{ background: "var(--accent-glow)", color: "var(--accent2)", border: "1px solid rgba(124,106,247,0.3)", marginBottom: "1.5rem", fontSize: "12px" }}>
          ✦ AI-Powered Job Tracker
        </div>

        <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 600, lineHeight: 1.1, marginBottom: "1.25rem", letterSpacing: "-0.03em" }}>
          Land your dream job<br />
          <span className="gradient-text">with AI in your corner</span>
        </h1>

        <p style={{ fontSize: "1.1rem", color: "var(--text2)", marginBottom: "2.5rem", lineHeight: 1.7 }}>
          Track applications on a Kanban board, score your resume against any job description,
          and generate tailored emails — all powered by Claude AI.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <SignUpButton mode="modal">
            <button className="btn btn-primary" style={{ padding: "12px 28px", fontSize: "15px" }}>
              Get started free →
            </button>
          </SignUpButton>
          <SignInButton mode="modal">
            <button className="btn btn-ghost" style={{ padding: "12px 28px", fontSize: "15px" }}>
              Sign in
            </button>
          </SignInButton>
        </div>

        <div style={{ display: "flex", gap: "2rem", justifyContent: "center", marginTop: "3rem", flexWrap: "wrap" }}>
          {[
            ["Kanban Board", "Drag-and-drop pipeline"],
            ["AI Match Score", "Resume ↔ JD analysis"],
            ["Email Drafts", "3 AI tone variants"],
          ].map(([title, sub]) => (
            <div key={title} style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 500, fontSize: "14px" }}>{title}</p>
              <p style={{ fontSize: "12px", color: "var(--text3)" }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
