import { fetchJobsFromAdzuna } from "../services/adzunaClient.js";
import { getJobs, setJobs } from "../store/memory.js";

export async function jobRoutes(app) {
  app.get("/api/jobs", async (request) => {
    const { refresh, role, location } = request.query || {};
    const existing = getJobs();

    if (!existing.length || refresh === "true") {
      const jobs = await fetchJobsFromAdzuna({ role, location });
      setJobs(jobs);
      return { jobs };
    }

    return { jobs: existing };
  });
}
