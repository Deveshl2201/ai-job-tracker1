import pdfParse from "pdf-parse";
import { normalizeText } from "../utils/text.js";

export async function extractResumeText(file) {
  if (!file) {
    return "";
  }

  const buffer = await file.toBuffer();
  const filename = file.filename || "";
  const mime = file.mimetype || "";

  if (mime === "application/pdf" || filename.toLowerCase().endsWith(".pdf")) {
    const data = await pdfParse(buffer);
    return normalizeText(data.text);
  }

  return normalizeText(buffer.toString("utf-8"));
}
