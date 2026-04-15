import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Job from "@/models/Job";

export async function GET(req: Request) {
  // Secure the cron endpoint
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Flag applied/interview jobs with no update in 7 days
  const staleJobs = await Job.find({
    status: { $in: ["applied", "interview"] },
    updatedAt: { $lt: sevenDaysAgo },
    nextAction: { $exists: false },
  });

  let updated = 0;
  for (const job of staleJobs) {
    await Job.findByIdAndUpdate(job._id, {
      $set: {
        nextAction: "Follow up — no activity in 7+ days",
        nextActionDate: new Date(),
      },
    });
    updated++;
  }

  return NextResponse.json({
    ok: true,
    staleJobsUpdated: updated,
    runAt: new Date().toISOString(),
  });
}
