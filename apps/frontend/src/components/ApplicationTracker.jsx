const statusLabels = {
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected"
};

function formatDate(value) {
  if (!value) {
    return "";
  }
  return new Date(value).toLocaleString();
}

export default function ApplicationTracker({ applications, jobs, onStatusChange }) {
  if (!applications.length) {
    return (
      <section className="applications">
        <h2>Application Timeline</h2>
        <p className="muted">No applications tracked yet.</p>
      </section>
    );
  }

  return (
    <section className="applications">
      <h2>Application Timeline</h2>
      <div className="stack">
        {applications.map((application) => {
          const job = jobs.find((item) => item.id === application.jobId);
          return (
            <article key={application.id} className="application-card">
              <div>
                <h3>{job?.title || "Role"}</h3>
                <p className="muted">{job?.company || "Company"} · {job?.location || ""}</p>
              </div>
              <div className="application-meta">
                <select
                  value={application.status}
                  onChange={(event) => onStatusChange(application.id, event.target.value)}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <div className="timeline">
                  {(application.history || []).map((entry, index) => (
                    <div key={index} className="timeline-row">
                      <span>{statusLabels[entry.status] || entry.status}</span>
                      <span className="muted">{formatDate(entry.at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
