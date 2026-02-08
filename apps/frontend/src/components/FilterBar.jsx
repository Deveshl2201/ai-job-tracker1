export default function FilterBar({ filters, onChange, skillOptions }) {
  const update = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleSkill = (skill) => {
    const current = new Set(filters.skills || []);
    if (current.has(skill)) {
      current.delete(skill);
    } else {
      current.add(skill);
    }
    update("skills", Array.from(current));
  };

  return (
    <div className="filters">
      <label>
        Role
        <input value={filters.role} onChange={(e) => update("role", e.target.value)} />
      </label>
      <div className="filter-group">
        <span className="filter-label">Skills</span>
        <div className="skill-options">
          {skillOptions.length ? (
            skillOptions.map((skill) => (
              <label key={skill} className="skill-chip">
                <input
                  type="checkbox"
                  checked={(filters.skills || []).includes(skill)}
                  onChange={() => toggleSkill(skill)}
                />
                <span>{skill}</span>
              </label>
            ))
          ) : (
            <p className="muted">No skills loaded yet.</p>
          )}
        </div>
      </div>
      <label>
        Date Posted
        <select value={filters.dateRange} onChange={(e) => update("dateRange", e.target.value)}>
          <option value="any">Any time</option>
          <option value="24h">Last 24 hours</option>
          <option value="week">Last week</option>
          <option value="month">Last month</option>
        </select>
      </label>
      <label>
        Job Type
        <select value={filters.jobType} onChange={(e) => update("jobType", e.target.value)}>
          <option value="any">Any</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </select>
      </label>
      <label>
        Work Mode
        <select value={filters.workMode} onChange={(e) => update("workMode", e.target.value)}>
          <option value="any">Any</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="on-site">On-site</option>
        </select>
      </label>
      <label>
        Location
        <input value={filters.location} onChange={(e) => update("location", e.target.value)} />
      </label>
      <label>
        Match Score
        <select value={filters.matchScore} onChange={(e) => update("matchScore", e.target.value)}>
          <option value="all">All</option>
          <option value="high">High (70%+)</option>
          <option value="medium">Medium (40-70%)</option>
        </select>
      </label>
    </div>
  );
}
