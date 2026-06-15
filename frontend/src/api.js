import axios from "axios";

// Point the frontend at the Django API. Override with VITE_API_URL in
// a .env file for production.
const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export const api = axios.create({ baseURL });

export const getCategories = () =>
  api.get("/categories/").then((r) => r.data.results ?? r.data);

export const getPosts = (params = {}) =>
  api.get("/posts/", { params }).then((r) => r.data);

export const getPost = (slug) =>
  api.get(`/posts/${slug}/`).then((r) => r.data);

// Media files come back as absolute URLs from DRF already; this is a
// safety net for any relative paths.
const ORIGIN = baseURL.replace(/\/api\/?$/, "");
export const mediaUrl = (path) =>
  !path ? "" : path.startsWith("http") ? path : `${ORIGIN}${path}`;
