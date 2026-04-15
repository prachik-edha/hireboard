"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "⬡" },
  { href: "/resume", label: "Resume", icon: "◈" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <aside style={{
      width: "220px",
      minHeight: "100vh",
      background: "var(--bg2)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      padding: "1.5rem 1rem",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2rem", padding: "0 4px" }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "var(--accent)", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 700, color: "#fff",
        }}>H</div>
        <span style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.02em" }}>HireBoard</span>
      </Link>

      {/* Nav links */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
        {nav.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "9px 12px", borderRadius: "var(--radius)",
              fontSize: "14px", fontWeight: active ? 500 : 400,
              color: active ? "var(--text)" : "var(--text2)",
              background: active ? "var(--bg4)" : "transparent",
              border: active ? "1px solid var(--border)" : "1px solid transparent",
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: "14px", opacity: 0.8 }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
        <UserButton afterSignOutUrl="/" appearance={{ baseTheme: undefined }} />
        <div style={{ overflow: "hidden" }}>
          <p style={{ fontSize: "13px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.firstName || "User"}
          </p>
          <p style={{ fontSize: "11px", color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>
    </aside>
  );
}
