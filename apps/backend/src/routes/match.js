import { getJobs, getResumeText, setMatches } from "../store/memory.js";
import { scoreJob } from "../ai/matcher.js";

export async function matchRoutes(app) {
  app.post("/api/match", async () => {
    const jobs = getJobs();
    const resumeText = getResumeText();

    const entries = await Promise.all(
      jobs.map(async (job) => {
        const match = await scoreJob(resumeText, job);
        return [job.id, match];
      })
    );

    const matches = Object.fromEntries(entries);
    setMatches(matches);

    return { matches };
  });
}
