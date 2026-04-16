const normalizeBaseUrl = (value) => String(value || "").replace(/\/+$/, "");

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

export const resolveMediaUrl = (mediaPath, fallback = "/avatar-holder.avif") => {
  const value = String(mediaPath || "").trim();

  if (!value) {
    return fallback;
  }

  // Keep fully qualified links (e.g. Google avatar URLs) unchanged.
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
