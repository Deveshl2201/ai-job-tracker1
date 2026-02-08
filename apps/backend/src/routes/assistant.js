import { runAssistant } from "../ai/assistantGraph.js";

export async function assistantRoutes(app) {
  app.post("/api/assistant", async (request) => {
    const { message, sessionId } = request.body || {};

    if (!message) {
      return { intent: "answer", filters: {}, answer: "How can I help?" };
    }

    const result = await runAssistant({ message, sessionId });
    return result;
  });
}
