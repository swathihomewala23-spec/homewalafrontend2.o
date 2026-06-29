const PARAM_KEYS = new Set(["search", "location", "type", "budget", "developer", "quick"]);

const cleanSegment = (value) =>
  String(value ?? "")
    .trim()
    .replace(/%/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const restoreSegment = (key, value) => {
  const text = String(value ?? "").trim();

  if (key === "budget" || key === "quick") return text;

  return text.replace(/-+/g, " ").trim();
};

const appendParam = (segments, key, value) => {
  if (value === null || value === undefined || value === "") return;

  if (Array.isArray(value)) {
    value.forEach((item) => appendParam(segments, key, item));
    return;
  }

  const segment = cleanSegment(value);
  if (!segment) return;
  segments.push(key, segment);
};

export const buildPropertyUrl = (basePath = "/properties", params = {}) => {
  const segments = [];

  appendParam(segments, "location", params.location);
  appendParam(segments, "search", params.search);
  appendParam(segments, "type", params.type);
  appendParam(segments, "budget", params.budget);
  appendParam(segments, "developer", params.developer);
  appendParam(segments, "quick", params.quick);

  const cleanBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  return segments.length ? `${cleanBase}/${segments.join("/")}` : cleanBase || "/";
};

export const getPropertyBasePath = (pathname = "/properties") => {
  const segments = String(pathname || "")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  const firstParamIndex = segments.findIndex((part) => PARAM_KEYS.has(part));
  const baseSegments = firstParamIndex === -1 ? segments : segments.slice(0, firstParamIndex);

  return baseSegments.length ? `/${baseSegments.join("/")}` : "/properties";
};

export const getPropertyUrlParams = (location) => {
  const queryParams = new URLSearchParams(location.search);
  const params = {
    search: queryParams.get("search") || "",
    location: queryParams.get("location") || "",
    type: queryParams.get("type") || "",
    budget: queryParams.get("budget") || "",
    developer: queryParams.get("developer") || "",
    quick: queryParams.get("quick") || "",
  };

  const segments = String(location.pathname || "")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  const firstParamIndex = segments.findIndex((part) => PARAM_KEYS.has(part));

  if (firstParamIndex === -1) return params;

  for (let index = firstParamIndex; index < segments.length; index += 2) {
    const key = segments[index];
    const value = restoreSegment(key, segments[index + 1]);

    if (!PARAM_KEYS.has(key) || !value) continue;
    params[key] = params[key] ? `${params[key]}, ${value}` : value;
  }

  return params;
};
