"use client";
import { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number;
  size?: number;
  label?: string;
  color?: string;
}

export default function ScoreRing({
  score,
  size = 80,
  label,
  color,
}: ScoreRingProps) {
  const [animated, setAnimated] = useState(0);
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  const getColor = (s: number) => {
    if (color) return color;
    if (s >= 75) return "var(--green)";
    if (s >= 50) return "var(--amber)";
    return "var(--red)";
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--bg4)" strokeWidth={6}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <text
          x={size / 2} y={size / 2}
          textAnchor="middle" dominantBaseline="central"
          style={{ transform: "rotate(90deg)", transformOrigin: `${size / 2}px ${size / 2}px` }}
          fill={getColor(score)}
          fontSize={size < 60 ? "13px" : "16px"}
          fontWeight={600}
          fontFamily="var(--font)"
        >
          {animated}
        </text>
      </svg>
      {label && <p style={{ fontSize: "11px", color: "var(--text3)", textAlign: "center" }}>{label}</p>}
    </div>
  );
}
