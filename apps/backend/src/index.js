import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import dotenv from "dotenv";
import { jobRoutes } from "./routes/jobs.js";
import { resumeRoutes } from "./routes/resume.js";
import { matchRoutes } from "./routes/match.js";
import { assistantRoutes } from "./routes/assistant.js";
import { applicationRoutes } from "./routes/applications.js";

dotenv.config();

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(multipart, {
  limits: { fileSize: 5 * 1024 * 1024 }
});

app.register(jobRoutes);
app.register(resumeRoutes);
app.register(matchRoutes);
app.register(assistantRoutes);
app.register(applicationRoutes);

const port = Number(process.env.PORT || 4000);

app.listen({ port, host: "0.0.0.0" });
