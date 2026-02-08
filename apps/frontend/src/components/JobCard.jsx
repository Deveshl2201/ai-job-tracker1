export default function JobCard({ job, match, onApply }) {
  const score = match?.matchScore ?? "-";
  const badgeLabel =
    typeof score === "number"
      ? score >= 70
        ? "High"
        : score >= 40
          ? "Medium"
          : "Low"
      : "-";
  const matchedSkills = match?.matchedSkills || [];

  const handleApply = () => {
    if (job.applyUrl) {
      window.open(job.applyUrl, "_blank", "noopener,noreferrer");
    }
    onApply(job);
  };

  return (
    <article className="job-card">
      <div>
        <h3>{job.title}</h3>
        <p className="muted">{job.company} · {job.location}</p>
        <p className="job-type">{job.jobType || ""}</p>
        <p>{job.description}</p>
        {matchedSkills.length > 0 && (
          <p className="match-detail">Matching skills: {matchedSkills.join(", ")}</p>
        )}
        {match?.relevantExperience && (
          <p className="match-detail">Experience: {match.relevantExperience}</p>
        )}
        {match?.keywordAlignment && (
          <p className="match-detail">Keywords: {match.keywordAlignment}</p>
        )}
        <div className="tags">
          {(job.skills || []).map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </div>
      <div className="job-meta">
        <div className={`score-badge score-${badgeLabel.toLowerCase()}`}>
          {badgeLabel} {typeof score === "number" ? `${score}%` : score}
        </div>
        <button onClick={handleApply}>Apply</button>
        <a href={job.applyUrl} target="_blank" rel="noreferrer">Open</a>
      </div>
    </article>
  );
}
