import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Job from "@/models/Job";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    await new Promise(res => setTimeout(res, 1000));

    const { jobId } = await req.json();

    const [job, user] = await Promise.all([
      Job.findOne({ _id: jobId, userId }),
      User.findOne({ clerkId: userId }),
    ]);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (!user?.resumeText) {
      return NextResponse.json(
        { error: "Upload your resume first." },
        { status: 400 }
      );
    }

    if (!job.jobDescription) {
      return NextResponse.json(
        { error: "Add job description first." },
        { status: 400 }
      );
    }

    // 🧠 Fake AI logic
    const resume = user.resumeText.toLowerCase();
    const jd = job.jobDescription.toLowerCase();

    const keywords = [
      "react",
      "node",
      "mongodb",
      "javascript",
      "typescript",
      "api",
      "sql",
      "aws",
      "docker",
      "system design",
    ];

    const matchedKeywords = keywords.filter(
      (k) => resume.includes(k) && jd.includes(k)
    );

    const missingKeywords = keywords.filter(
      (k) => jd.includes(k) && !resume.includes(k)
    );

    // 🎯 smarter scoring
    const base = Math.floor((matchedKeywords.length / keywords.length) * 100);
    const score = Math.min(95, Math.max(45, base + Math.floor(Math.random() * 10 - 5)));

    // 🧠 HUMAN-LIKE SUMMARY (THIS IS THE MAGIC)
    let summary = "";

    if (score >= 85) {
      summary = `You're a strong fit for this role. Your profile aligns very well with the key requirements, especially in ${matchedKeywords.slice(0,2).join(", ")}. You’re ready to confidently apply.`;
    } else if (score >= 70) {
      summary = `You have a good match for this role. You're solid in ${matchedKeywords.slice(0,2).join(", ")}, but improving ${missingKeywords.slice(0,2).join(", ")} could significantly boost your chances.`;
    } else {
      summary = `This role is a moderate match for you. You may need to strengthen skills like ${missingKeywords.slice(0,2).join(", ")} before applying confidently.`;
    }

    const result = {
      overallScore: score,
      skillsScore: score - 5,
      experienceScore: score - 10,
      keywordsScore: score - 3,
      matchedKeywords,
      missingKeywords,
      strengths: matchedKeywords.slice(0, 3),
      gaps: missingKeywords.slice(0, 3),
      summary,
    };

    const updated = await Job.findByIdAndUpdate(
      jobId,
      {
        $set: {
          matchScore: result.overallScore,
          matchBreakdown: {
            skills: result.skillsScore,
            experience: result.experienceScore,
            keywords: result.keywordsScore,
          },
          matchedKeywords: result.matchedKeywords,
          missingKeywords: result.missingKeywords,
          matchStrengths: result.strengths,
          matchGaps: result.gaps,
          matchSummary: result.summary,
        },
      },
      { new: true }
    ).lean();

    return NextResponse.json({ job: updated });

  } catch (err) {
    console.error("❌ Match error:", err);
    return NextResponse.json(
      { error: "Failed to analyze match" },
      { status: 500 }
    );
  }
}