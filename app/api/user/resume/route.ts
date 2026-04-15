import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await User.findOne({ clerkId: userId }).lean();
  return NextResponse.json({
    resumeText: user?.resumeText || "",
    resumeFileName: user?.resumeFileName || "",
  });
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { resumeText, resumeFileName } = await req.json();

  await User.findOneAndUpdate(
    { clerkId: userId },
    { $set: { resumeText, resumeFileName } },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true });
}
