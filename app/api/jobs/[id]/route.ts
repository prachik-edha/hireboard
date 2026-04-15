import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Job from "@/models/Job";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const job = await Job.findOne({ _id: params.id, userId }).lean();
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ job });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();

  let update: any = {};

  // Handle note addition separately
  if (body.addNote) {
    update = { $push: { notes: { text: body.addNote, createdAt: new Date() } } };
  } else {
    const { addNote, ...rest } = body;
    update = { $set: rest };
  }

  const job = await Job.findOneAndUpdate(
    { _id: params.id, userId },
    update,
    { new: true }
  ).lean();

  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ job });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  await Job.findOneAndDelete({ _id: params.id, userId });
  return NextResponse.json({ success: true });
}
