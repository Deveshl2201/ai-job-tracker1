const API_BASE = import.meta.env.VITE_API_BASE || "";

export function apiUrl(path) {
  if (!API_BASE) {
    return path;
  }
  return `${API_BASE}${path}`;
}
