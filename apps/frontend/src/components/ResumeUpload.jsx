import { useState } from "react";
import { apiUrl } from "../lib/api.js";

export default function ResumeUpload({ onStored }) {
  const [status, setStatus] = useState("Upload your resume once to score matches.");

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setStatus("Uploading...");
    const response = await fetch(apiUrl("/api/resume"), {
      method: "POST",
      body: formData
    });

    if (response.ok) {
      setStatus("Resume stored. Scoring matches...");
      await onStored();
      setStatus("Resume scored. You are ready to explore.");
    } else {
      setStatus("Upload failed. Try again.");
    }
  };

  return (
    <div className="resume">
      <label className="upload">
        Upload Resume
        <input type="file" accept=".pdf,.txt" onChange={handleUpload} />
      </label>
      <p className="muted">{status}</p>
    </div>
  );
}
