import { ChatOpenAI } from "@langchain/openai";
import { safeJsonParse } from "../utils/text.js";

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  temperature: 0.2
});

const systemPrompt = `You compare a resume to a job for matching.\nReturn JSON only: {"matchScore": number, "matchedSkills": string[], "relevantExperience": string, "keywordAlignment": string}.\nScore range: 0-100. Keep text brief. Avoid extra keys.`;

export async function scoreJob(resumeText, job) {
  if (!resumeText) {
    return {
      matchScore: 0,
      matchedSkills: [],
      relevantExperience: "Resume not provided",
      keywordAlignment: "No resume provided"
    };
  }

  const response = await model.invoke([
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Resume:\n${resumeText}\n\nJob:\nTitle: ${job.title}\nDescription: ${job.description}\nSkills: ${(job.skills || []).join(", ")}`
    }
  ]);

  const parsed = safeJsonParse(response.content, {
    matchScore: 0,
    matchedSkills: [],
    relevantExperience: "No summary",
    keywordAlignment: "No alignment"
  });
  return {
    matchScore: Math.max(0, Math.min(100, Number(parsed.matchScore) || 0)),
    matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
    relevantExperience: parsed.relevantExperience || "No summary",
    keywordAlignment: parsed.keywordAlignment || "No alignment"
  };
}
