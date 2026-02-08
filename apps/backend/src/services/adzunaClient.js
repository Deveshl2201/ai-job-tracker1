import { nanoid } from "nanoid";

const sampleJobs = [
  {
    id: "sample-1",
    title: "Frontend Engineer",
    company: "Acme",
    location: "Remote",
    jobType: "Full-time",
    workMode: "Remote",
    skills: ["React", "TypeScript", "CSS"],
    datePosted: "2026-02-01",
    description: "Build delightful user interfaces and improve performance.",
    applyUrl: "https://example.com/jobs/1",
    source: "Sample"
  },
  {
    id: "sample-2",
    title: "Backend Engineer",
    company: "Nimbus",
    location: "Austin, TX",
    jobType: "Full-time",
    workMode: "Hybrid",
    skills: ["Node.js", "Fastify", "APIs"],
    datePosted: "2026-02-02",
    description: "Design API services with a focus on reliability.",
    applyUrl: "https://example.com/jobs/2",
    source: "Sample"
  }
];

export async function fetchJobsFromAdzuna({ role, location } = {}) {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  const country = process.env.ADZUNA_COUNTRY || "us";

  if (!appId || !appKey) {
    return sampleJobs.map((job) => ({ ...job, id: job.id || nanoid() }));
  }

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: "20",
    what: role || "software engineer",
    where: location || "remote"
  });

  try {
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      return sampleJobs.map((job) => ({ ...job, id: job.id || nanoid() }));
    }

    const data = await response.json();
    return (data.results || []).map((job) => ({
      id: job.id || nanoid(),
      title: job.title,
      company: job.company?.display_name || "Unknown",
      location: job.location?.display_name || "Unknown",
      description: job.description || "",
      skills: [],
      jobType: job.contract_time || "",
      workMode: job.contract_type || "",
      datePosted: job.created || "",
      applyUrl: job.redirect_url,
      source: "Adzuna"
    }));
  } catch {
    return sampleJobs.map((job) => ({ ...job, id: job.id || nanoid() }));
  }
}
