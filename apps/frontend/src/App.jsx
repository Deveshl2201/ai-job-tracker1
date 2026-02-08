import { useEffect, useMemo, useState } from "react";
import FilterBar from "./components/FilterBar.jsx";
import JobList from "./components/JobList.jsx";
import BestMatches from "./components/BestMatches.jsx";
import ResumeUpload from "./components/ResumeUpload.jsx";
import ApplicationTracker from "./components/ApplicationTracker.jsx";
import LoginForm from "./components/LoginForm.jsx";
import AssistantBubble from "./components/AssistantBubble.jsx";
import JobCard from "./components/JobCard.jsx";
import { apiUrl } from "./lib/api.js";

const defaultFilters = {
  role: "",
  skills: [],
  dateRange: "any",
  jobType: "any",
  workMode: "any",
  location: "",
  matchScore: "all"
};

export default function App() {
  const [isAuthed, setIsAuthed] = useState(() => localStorage.getItem("isAuthed") === "true");
  const [resumeStored, setResumeStored] = useState(
    () => localStorage.getItem("resumeStored") === "true"
  );
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [matches, setMatches] = useState({});
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [pendingApplication, setPendingApplication] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptStatus, setPromptStatus] = useState("applied");
  const [assistantJobs, setAssistantJobs] = useState([]);

  useEffect(() => {
    if (!isAuthed) {
      return;
    }
    const loadJobs = async () => {
      setLoading(true);
      const response = await fetch(apiUrl("/api/jobs"));
      const data = await response.json();
      setJobs(data.jobs || []);
      setLoading(false);
    };

    loadJobs();
  }, [isAuthed]);

  useEffect(() => {
    if (!resumeStored || !jobs.length) {
      return;
    }

    const scoreJobs = async () => {
      const response = await fetch(apiUrl("/api/match"), { method: "POST" });
      const data = await response.json();
      setMatches(data.matches || {});
    };

    scoreJobs();
  }, [jobs, resumeStored]);

  useEffect(() => {
    if (!isAuthed) {
      return;
    }
    const loadApplications = async () => {
      const response = await fetch(apiUrl("/api/applications"));
      const data = await response.json();
      setApplications(data.applications || []);
    };

    loadApplications();
  }, [isAuthed]);

  useEffect(() => {
    const maybePrompt = () => {
      const stored = localStorage.getItem("pendingApplication");
      if (!stored || showPrompt) {
        return;
      }

      const parsed = JSON.parse(stored);
      if (!parsed?.jobId) {
        return;
      }

      const alreadyTracked = applications.some((item) => item.jobId === parsed.jobId);
      if (alreadyTracked) {
        localStorage.removeItem("pendingApplication");
        return;
      }

      setPendingApplication(parsed);
      setShowPrompt(true);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        maybePrompt();
      }
    };

    window.addEventListener("focus", maybePrompt);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", maybePrompt);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [applications, showPrompt]);

  const skillOptions = useMemo(() => {
    const allSkills = new Set();
    jobs.forEach((job) => {
      (job.skills || []).forEach((skill) => allSkills.add(skill));
    });
    return Array.from(allSkills).sort((a, b) => a.localeCompare(b));
  }, [jobs]);

  const applyFilters = (jobList) => {
    return jobList.filter((job) => {
      const score = matches[job.id]?.matchScore || 0;
      const skillsMatch = (filters.skills || []).length
        ? (job.skills || []).some((skill) =>
            filters.skills.some((selected) =>
              skill.toLowerCase().includes(selected.toLowerCase())
            )
          )
        : true;

      const scoreMatch =
        filters.matchScore === "high"
          ? score >= 70
          : filters.matchScore === "medium"
            ? score >= 40 && score < 70
            : true;

      const dateMatch = (() => {
        if (filters.dateRange === "any") {
          return true;
        }
        const posted = Date.parse(job.datePosted || "");
        if (Number.isNaN(posted)) {
          return false;
        }
        const days =
          filters.dateRange === "24h"
            ? 1
            : filters.dateRange === "week"
              ? 7
              : 30;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return posted >= cutoff.getTime();
      })();

      return (
        (!filters.role || job.title.toLowerCase().includes(filters.role.toLowerCase())) &&
        (!filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase())) &&
        (filters.jobType === "any" || (job.jobType || "").toLowerCase().includes(filters.jobType)) &&
        (filters.workMode === "any" || (job.workMode || "").toLowerCase().includes(filters.workMode)) &&
        dateMatch &&
        skillsMatch &&
        scoreMatch
      );
    });
  };

  const filteredJobs = useMemo(() => applyFilters(jobs), [jobs, filters, matches]);

  const assistantFilteredJobs = useMemo(
    () => applyFilters(assistantJobs),
    [assistantJobs, filters, matches]
  );

  const bestMatches = useMemo(() => {
    return [...filteredJobs]
      .sort((a, b) => (matches[b.id]?.matchScore || 0) - (matches[a.id]?.matchScore || 0))
      .slice(0, 8);
  }, [filteredJobs, matches]);

  const handleResumeStored = async () => {
    const response = await fetch(apiUrl("/api/match"), { method: "POST" });
    const data = await response.json();
    setMatches(data.matches || {});
    setResumeStored(true);
    localStorage.setItem("resumeStored", "true");
  };

  const handleApply = (job) => {
    if (!job?.id) {
      return;
    }

    const pending = { jobId: job.id, openedAt: new Date().toISOString() };
    localStorage.setItem("pendingApplication", JSON.stringify(pending));
    setPendingApplication(pending);
  };

  const createApplication = async (status) => {
    if (!pendingApplication?.jobId) {
      return;
    }

    const response = await fetch(apiUrl("/api/applications"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: pendingApplication.jobId, status })
    });
    const data = await response.json();
    setApplications((prev) => [data.application, ...prev].filter(Boolean));
    localStorage.removeItem("pendingApplication");
    setPendingApplication(null);
    setShowPrompt(false);
  };

  const updateApplication = async (id, status) => {
    const response = await fetch(apiUrl(`/api/applications/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (data.application) {
      setApplications((prev) =>
        prev.map((item) => (item.id === data.application.id ? data.application : item))
      );
    }
  };

  const handleAssistant = (result) => {
    if (result?.intent === "update_filters") {
      if (result.filters?.reset) {
        setFilters(defaultFilters);
        return;
      }
      const nextFilters = { ...defaultFilters, ...result.filters };
      if (Array.isArray(result.filters?.skills)) {
        nextFilters.skills = result.filters.skills;
      } else if (typeof result.filters?.skills === "string") {
        nextFilters.skills = result.filters.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);
      }
      if (result.filters?.dateRange) {
        nextFilters.dateRange = result.filters.dateRange;
      }
      if (result.filters?.date) {
        nextFilters.dateRange = "any";
      }
      setFilters(nextFilters);
    }
    if (Array.isArray(result?.jobs)) {
      setAssistantJobs(result.jobs);
    }
  };

  const handleLogin = () => {
    setIsAuthed(true);
    localStorage.setItem("isAuthed", "true");
  };

  if (!isAuthed) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">AI-Powered Job Tracker</p>
          <h1>Match, track, and ship applications with focus.</h1>
          <p className="subtitle">
            LangChain matching, LangGraph assistant, and a fast job feed in one workspace.
          </p>
        </div>
        <ResumeUpload onStored={handleResumeStored} />
      </header>

      <section className="grid">
        <div className="panel">
          <h2>Filters</h2>
          <FilterBar
            filters={filters}
            onChange={setFilters}
            skillOptions={skillOptions}
          />
        </div>

        <div className="panel">
          {assistantFilteredJobs.length > 0 && (
            <section className="assistant-results">
              <h2>Assistant Results</h2>
              <div className="stack">
                {assistantFilteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} match={matches[job.id]} onApply={handleApply} />
                ))}
              </div>
            </section>
          )}
          <BestMatches jobs={bestMatches} matches={matches} onApply={handleApply} />
          <JobList
            loading={loading}
            jobs={filteredJobs}
            matches={matches}
            onApply={handleApply}
          />
          <ApplicationTracker
            applications={applications}
            jobs={jobs}
            onStatusChange={updateApplication}
          />
        </div>
      </section>
      <AssistantBubble onResult={handleAssistant} />
      {!resumeStored && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <h3>Upload your resume</h3>
            <p className="muted">We use your resume to score job matches.</p>
            <ResumeUpload onStored={handleResumeStored} />
          </div>
        </div>
      )}
      {showPrompt && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <h3>Did you apply?</h3>
            <p className="muted">Choose a status to track this application.</p>
            <select value={promptStatus} onChange={(event) => setPromptStatus(event.target.value)}>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="modal-actions">
              <button onClick={() => createApplication(promptStatus)}>Save status</button>
              <button className="ghost" onClick={() => setShowPrompt(false)}>Not yet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
