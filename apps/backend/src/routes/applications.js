import { addApplication, getApplications, updateApplicationStatus } from "../store/memory.js";
import { nanoid } from "nanoid";

export async function applicationRoutes(app) {
  app.get("/api/applications", async () => {
    return { applications: getApplications() };
  });

  app.post("/api/applications", async (request) => {
    const { jobId, status } = request.body || {};

    if (!jobId) {
      return { error: "Job id required" };
    }

    const normalizedStatus = (status || "applied").toLowerCase();

    const application = {
      id: nanoid(),
      jobId,
      status: normalizedStatus,
      appliedAt: new Date().toISOString(),
      history: [
        {
          status: normalizedStatus,
          at: new Date().toISOString()
        }
      ]
    };

    addApplication(application);
    return { application };
  });

  app.put("/api/applications/:id", async (request, reply) => {
    const { id } = request.params || {};
    const { status } = request.body || {};

    if (!status) {
      reply.code(400);
      return { error: "Status required" };
    }

    const updated = updateApplicationStatus(id, String(status).toLowerCase());
    if (!updated) {
      reply.code(404);
      return { error: "Application not found" };
    }

    return { application: updated };
  });
}
