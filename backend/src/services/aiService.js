import OpenAI   from "openai";
import "dotenv/config";

if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️   OPENAI_API_KEY is not set — AI analysis will return 503.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "missing",
});

const AI_MODEL   = process.env.OPENAI_MODEL ?? "gpt-4o";
const MAX_TOKENS = 1200;
const TEMP       = 0.2;

const SYSTEM_PROMPT = `You are an expert FAANG recruiter and ATS (Applicant Tracking System) specialist with 15+ years of experience evaluating technical candidates.

Your task is to compare a candidate's resume against a job description and return a precise, actionable analysis.

You MUST respond with ONLY a valid JSON object — no markdown, no commentary, no code fences — using EXACTLY this structure:
{
  "matchScore": <integer 0-100>,
  "missingKeywords": [<string>, ...],
  "dos": [<string>, ...],
  "donts": [<string>, ...],
  "tailoringSuggestions": "<string>"
}

Field rules:
- matchScore: Integer 0–100. Score against a realistic FAANG bar — calibrated, not generous. 70+ = strong match, 50–69 = partial, <50 = significant gaps.
- missingKeywords: 3–8 high-impact technical or soft-skill keywords present in the JD but absent or underrepresented in the resume. Short strings only (e.g. "Kubernetes", "system design", "cross-functional leadership").
- dos: 3–5 concrete, specific action items the candidate should add, quantify, or highlight. Reference actual resume content where possible.
- donts: 2–3 specific items to remove, de-emphasise, or reframe — irrelevant experience, filler phrases, or red flags for this particular role.
- tailoringSuggestions: A multi-sentence paragraph with specific rewrite guidance for 1–2 existing bullet points. Quote the original phrasing, then show the improved version.`;

const buildUserPrompt = (resumeText, jobDescription) =>
  `## RESUME\n${resumeText.trim()}\n\n## JOB DESCRIPTION\n${jobDescription.trim()}`;

export async function runAiAnalysis(resumeText, jobDescription) {
  if (!resumeText?.trim()) {
    throw new ServiceError(
      "Resume text is empty. Please upload a resume before running analysis.",
      400
    );
  }

  if (!jobDescription?.trim()) {
    throw new ServiceError(
      "Job description is empty. Please add a job description before running analysis.",
      400
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new ServiceError(
      "AI analysis is currently unavailable — OPENAI_API_KEY is not configured.",
      503
    );
  }

  const resumeTruncated = resumeText.slice(0, 6000);
  const jdTruncated     = jobDescription.slice(0, 4000);

  let rawContent;
  try {
    const completion = await openai.chat.completions.create({
      model:           AI_MODEL,
      temperature:     TEMP,
      max_tokens:      MAX_TOKENS,
      response_format: { type: "json_object" }, 
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: buildUserPrompt(resumeTruncated, jdTruncated) },
      ],
    });

    rawContent = completion.choices[0]?.message?.content;

    if (!rawContent) {
      throw new ServiceError("OpenAI returned an empty response.", 502);
    }
  } catch (err) {
    if (err instanceof ServiceError) throw err;
    throw new ServiceError(
      `OpenAI API error: ${err?.message ?? "Unknown error"}`,
      err?.status ?? 502
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new ServiceError(
      "OpenAI returned a response that could not be parsed as JSON.",
      502
    );
  }

  return validateAndNormalise(parsed);
}

function validateAndNormalise(raw) {
  const matchScore = parseInt(raw.matchScore, 10);

  if (isNaN(matchScore) || matchScore < 0 || matchScore > 100) {
    throw new ServiceError(
      `AI returned an invalid matchScore: "${raw.matchScore}". Expected integer 0–100.`,
      502
    );
  }

  return {
    matchScore,
    missingKeywords:      toStringArray(raw.missingKeywords),
    dos:                  toStringArray(raw.dos),
    donts:                toStringArray(raw.donts),
    tailoringSuggestions: String(raw.tailoringSuggestions ?? "").trim(),
    analyzedAt:           new Date(),
  };
}

function toStringArray(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") return value.split("\n").filter(Boolean);
  return [];
}


export class ServiceError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name       = "ServiceError";
    this.statusCode = statusCode;
  }
}
