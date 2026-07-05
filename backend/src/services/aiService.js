import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️   GEMINI_API_KEY is not set — AI analysis will return 503.");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY ?? "missing",
});

const AI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const MAX_TOKENS = 4000;
const TEMP = 0.2;

const SYSTEM_PROMPT = `You are an expert FAANG recruiter and ATS (Applicant Tracking System) specialist with 15+ years of experience evaluating technical candidates.

Your task is to compare a candidate's resume against a job description and return a precise, actionable analysis.

You MUST respond with a valid JSON object matching the requested schema.

CRITICAL JSON SAFETY RULES:
1. Do NOT use double quotes (") inside any string value. If you need to quote text, use single quotes ('). For example, write: 'Change 'Developer' to 'Lead Developer'' instead of 'Change "Developer" to "Lead Developer"'.
2. Do NOT use literal unescaped newlines inside string values. All suggestions and paragraphs must be on a single line.
3. Be highly concise and brief. Keep suggestions short and actionable. Avoid long explanations.

Field rules:
- matchScore: Integer 0–100. Score against a realistic FAANG bar — calibrated, not generous. 70+ = strong match, 50–69 = partial, <50 = significant gaps.
- missingKeywords: 3–8 high-impact technical or soft-skill keywords present in the JD but absent or underrepresented in the resume. Short strings only (e.g. 'Kubernetes', 'system design').
- dos: 3–5 concrete, specific action items the candidate should add, quantify, or highlight. Reference actual resume content where possible.
- donts: 2–3 specific items to remove, de-emphasise, or reframe.
- tailoringSuggestions: A multi-sentence paragraph with specific rewrite guidance for 1–2 existing bullet points. Quote the original phrasing, then show the improved version.`;

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

  if (!process.env.GEMINI_API_KEY) {
    throw new ServiceError(
      "AI analysis is currently unavailable — GEMINI_API_KEY is not configured.",
      503
    );
  }

  const resumeTruncated = resumeText.slice(0, 6000);
  const jdTruncated = jobDescription.slice(0, 4000);

  const userPrompt = `## RESUME\n${resumeTruncated.trim()}\n\n## JOB DESCRIPTION\n${jdTruncated.trim()}`;

  let parsed;
  try {
    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: TEMP,
        maxOutputTokens: MAX_TOKENS,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            matchScore: {
              type: "INTEGER",
              description: "Match score 0-100."
            },
            missingKeywords: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "3-8 keywords. Use single quotes for inner quotes if needed. No literal newlines."
            },
            dos: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "3-5 concrete action items. Use single quotes for inner quotes. No literal newlines."
            },
            donts: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "2-3 items to remove or reframe. Use single quotes for inner quotes. No literal newlines."
            },
            tailoringSuggestions: {
              type: "STRING",
              description: "Multi-sentence paragraph with specific rewrite guidance. Use single quotes for inner quotes. Do not include literal newlines."
            }
          },
          required: ["matchScore", "missingKeywords", "dos", "donts", "tailoringSuggestions"]
        }
      }
    });

    let rawContent = response.text;
    if (!rawContent || !rawContent.trim()) {
      throw new ServiceError("Gemini returned an empty response.", 502);
    }

    // Safeguard: Strip markdown code fences if present
    rawContent = rawContent.trim();
    if (rawContent.startsWith("```")) {
      rawContent = rawContent.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    parsed = JSON.parse(rawContent);
  } catch (err) {
    if (err instanceof ServiceError) throw err;
    throw new ServiceError(
      `Gemini API error: ${err?.message ?? "Unknown error"}`,
      err?.status ?? 502
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
    missingKeywords: toStringArray(raw.missingKeywords),
    dos: toStringArray(raw.dos),
    donts: toStringArray(raw.donts),
    tailoringSuggestions: String(raw.tailoringSuggestions ?? "").trim(),
    analyzedAt: new Date(),
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
    this.name = "ServiceError";
    this.statusCode = statusCode;
  }
}
