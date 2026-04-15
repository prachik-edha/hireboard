export interface MatchResult {
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  keywordsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  gaps: string[];
  summary: string;
}

export interface EmailDraft {
  subject: string;
  body: string;
  tone: "formal" | "friendly" | "concise";
}

// 🔥 SAFE MATCH (no API)
export async function analyzeResumeMatch(
  resumeText: string,
  jobDescription: string,
  jobTitle: string,
  company: string
): Promise<MatchResult> {

  const resume = resumeText.toLowerCase();
  const jd = jobDescription.toLowerCase();

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
    k => resume.includes(k) && jd.includes(k)
  );

  const missingKeywords = keywords.filter(
    k => jd.includes(k) && !resume.includes(k)
  );

  const score = Math.min(
    95,
    Math.max(40, Math.floor((matchedKeywords.length / keywords.length) * 100))
  );

  return {
    overallScore: score,
    skillsScore: score - 5,
    experienceScore: score - 10,
    keywordsScore: score - 3,
    matchedKeywords,
    missingKeywords,
    strengths: matchedKeywords.slice(0, 3),
    gaps: missingKeywords.slice(0, 3),
    summary:
      matchedKeywords.length > missingKeywords.length
        ? "Strong alignment with the role. You meet most requirements."
        : "Partial match. Improve missing skills for better fit.",
  };
}

// 🔥 SAFE EMAIL GENERATOR
export async function generateEmailDrafts(
  resumeText: string,
  jobTitle: string,
  company: string,
  jobDescription: string,
  emailType: "cold" | "followup" | "thankyou"
): Promise<EmailDraft[]> {

  const intro = `Hi,

I hope you're doing well. I came across the ${jobTitle} role at ${company} and found it very exciting.`;

  const closing = `I'd love the opportunity to connect and discuss further.

Best regards,`;

  return [
    {
      subject: `Application for ${jobTitle} at ${company}`,
      body: `${intro}

Based on my experience, I believe I can contribute effectively to your team.

${closing}`,
      tone: "formal",
    },
    {
      subject: `Interested in ${jobTitle} role`,
      body: `${intro}

I am particularly interested in the work your team is doing.

${closing}`,
      tone: "friendly",
    },
    {
      subject: `${jobTitle} opportunity`,
      body: `${intro}

Looking forward to hearing from you.

${closing}`,
      tone: "concise",
    },
  ];
}