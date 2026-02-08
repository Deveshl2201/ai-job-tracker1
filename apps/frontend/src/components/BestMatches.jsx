import JobCard from "./JobCard.jsx";

export default function BestMatches({ jobs, matches, onApply }) {
  if (!jobs.length) {
    return null;
  }

  return (
    <section className="best-matches">
      <h2>Best Matches</h2>
      <div className="stack">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} match={matches[job.id]} onApply={onApply} />
        ))}
      </div>
    </section>
  );
}
