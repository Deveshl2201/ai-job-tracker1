import JobCard from "./JobCard.jsx";

export default function JobList({ loading, jobs, matches, onApply }) {
  if (loading) {
    return <p className="muted">Loading jobs...</p>;
  }

  if (!jobs.length) {
    return <p className="muted">No jobs match your filters.</p>;
  }

  return (
    <div className="job-list">
      <h2>Job Feed</h2>
      <div className="stack">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} match={matches[job.id]} onApply={onApply} />
        ))}
      </div>
    </div>
  );
}
