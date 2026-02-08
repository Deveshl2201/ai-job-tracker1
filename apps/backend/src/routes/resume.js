import { extractResumeText } from "../services/resumeService.js";
import { setResumeText } from "../store/memory.js";

export async function resumeRoutes(app) {
  app.post("/api/resume", async (request, reply) => {
    const file = await request.file();

    if (!file) {
      reply.code(400);
      return { error: "No file uploaded" };
    }

    const text = await extractResumeText(file);
    setResumeText(text);

    return { status: "stored", length: text.length, text };
  });
}
