// Thin API client. In dev, Vite proxies these paths to the FastAPI backend.
const BASE = import.meta.env.VITE_API_BASE ?? "";

async function json(res) {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      detail = (await res.json()).detail ?? detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json();
}

export const api = {
  health: () => fetch(`${BASE}/health`).then(json),

  createJob: ({ file, numVariations, avatarStyle }) => {
    const form = new FormData();
    form.append("file", file);
    form.append("num_variations", numVariations);
    form.append("avatar_style", avatarStyle);
    return fetch(`${BASE}/jobs`, { method: "POST", body: form }).then(json);
  },

  listJobs: () => fetch(`${BASE}/jobs`).then(json),
  getJob: (id) => fetch(`${BASE}/jobs/${id}`).then(json),
  getStatus: (id) => fetch(`${BASE}/jobs/${id}/status`).then(json),

  remix: (id, { avatarStyle, numVariations }) => {
    const form = new FormData();
    form.append("avatar_style", avatarStyle);
    if (numVariations) form.append("num_variations", numVariations);
    return fetch(`${BASE}/jobs/${id}/remix`, { method: "POST", body: form }).then(json);
  },

  downloadAllUrl: (id) => `${BASE}/jobs/${id}/download`,
  mediaUrl: (path) => `${BASE}${path}`,
};

export const AVATAR_STYLES = [
  { value: "realistic_female", label: "Realistic female" },
  { value: "realistic_male", label: "Realistic male" },
  { value: "diverse_cast", label: "Diverse cast" },
];

export const VARIATION_OPTIONS = [3, 5, 10];
