const store = {
  jobs: [],
  resumeText: "",
  matches: {},
  applications: []
};

export function setJobs(jobs) {
  store.jobs = jobs;
}

export function getJobs() {
  return store.jobs;
}

export function setResumeText(text) {
  store.resumeText = text;
}

export function getResumeText() {
  return store.resumeText;
}

export function setMatches(matches) {
  store.matches = matches;
}

export function getMatches() {
  return store.matches;
}

export function addApplication(application) {
  store.applications.push(application);
}

export function getApplications() {
  return store.applications;
}

export function updateApplicationStatus(id, status) {
  const application = store.applications.find((item) => item.id === id);
  if (!application) {
    return null;
  }

  const entry = { status, at: new Date().toISOString() };
  application.status = status;
  application.history = [...(application.history || []), entry];
  return application;
}
