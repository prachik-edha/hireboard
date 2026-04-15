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

    const { jobId, emailType } = await req.json();

    const [job, user] = await Promise.all([
      Job.findOne({ _id: jobId, userId }),
      User.findOne({ clerkId: userId }),
    ]);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (!user?.resumeText) {
      return NextResponse.json(
        { error: "No resume found. Upload resume first." },
        { status: 400 }
      );
    }

    // 🔥 FAKE AI EMAIL GENERATOR

    const baseIntro = `Hi,

I hope you're doing well. I came across the ${job.role} role at ${job.company} and found it very exciting.`;

    const resumeLine = `With my experience in ${extractSkills(user.resumeText)}, I believe I can contribute effectively to your team.`;

    const closing = `I'd love the opportunity to discuss how my background aligns with your needs.

Best regards,
`;

    const drafts = [
      {
        subject: `Application for ${job.role} at ${job.company}`,
        body: `${baseIntro}

${resumeLine}

${closing}`,
        tone: "formal",
        type: emailType || "cold",
      },
      {
        subject: `Interested in ${job.role} opportunity`,
        body: `${baseIntro}

I am particularly interested in the work your team is doing.

${closing}`,
        tone: "casual",
        type: emailType || "cold",
      },
    ];

    // Save drafts
    await Job.findByIdAndUpdate(jobId, {
      $push: {
        emailDrafts: {
          $each: drafts,
        },
      },
    });

    return NextResponse.json({ drafts });

  } catch (err) {
    console.error("❌ Email draft error:", err);

    return NextResponse.json(
      { error: "Failed to generate email drafts" },
      { status: 500 }
    );
  }
}

// 🔧 helper: extract simple skills from resume
function extractSkills(text: string) {
  const skills = ["React", "Node.js", "MongoDB", "JavaScript", "TypeScript"];

  const found = skills.filter(s =>
    text.toLowerCase().includes(s.toLowerCase())
  );

  return found.length ? found.join(", ") : "software development";
}