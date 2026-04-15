import mongoose, { Schema, Document, Model } from "mongoose";

export type JobStatus =
  | "wishlist"
  | "applied"
  | "interview"
  | "offer"
  | "rejected";

export interface INote {
  text: string;
  createdAt: Date;
}

export interface IEmailDraft {
  subject: string;
  body: string;
  tone: string;
  type: string;
}

export interface IMatchBreakdown {
  skills: number;
  experience: number;
  keywords: number;
}

export interface IJob {
  _id: string;
  userId: string;
  company: string;
  role: string;
  jobDescription: string;
  jobUrl?: string;
  location?: string;
  salary?: { min?: number; max?: number; currency: string };
  status: JobStatus;
  appliedDate?: Date;
  notes: INote[];
  matchScore?: number;
  matchBreakdown?: IMatchBreakdown;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  matchStrengths?: string[];
  matchGaps?: string[];
  matchSummary?: string;
  emailDrafts: IEmailDraft[];
  nextAction?: string;
  nextActionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const EmailDraftSchema = new Schema<IEmailDraft>({
  subject: String,
  body: String,
  tone: String,
  type: String,
});

const JobSchema = new Schema<IJob>(
  {
    userId: { type: String, required: true, index: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    jobDescription: { type: String, default: "" },
    jobUrl: String,
    location: String,
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: "USD" },
    },
    status: {
      type: String,
      enum: ["wishlist", "applied", "interview", "offer", "rejected"],
      default: "wishlist",
    },
    appliedDate: Date,
    notes: [NoteSchema],
    matchScore: Number,
    matchBreakdown: {
      skills: Number,
      experience: Number,
      keywords: Number,
    },
    matchedKeywords: [String],
    missingKeywords: [String],
    matchStrengths: [String],
    matchGaps: [String],
    matchSummary: String,
    emailDrafts: [EmailDraftSchema],
    nextAction: String,
    nextActionDate: Date,
  },
  { timestamps: true }
);

const Job: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);

export default Job;
