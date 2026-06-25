import { api } from "../axiosConfig";

const resolveMediaUrl = (value) => {
  if (!value) return "";

  const raw = typeof value === "string" ? value : value?.url || value?.src || value?.path || "";
  const trimmed = String(raw).trim();
  if (!trimmed) return "";

  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  const base = api.defaults.baseURL || "";
  if (!base) return trimmed;

  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
  return `${normalizedBase}/${normalizedPath}`;
};

const getWebsiteLogoUrl = (websiteInfo = {}) =>
  resolveMediaUrl(
    websiteInfo.logo ||
      websiteInfo.logo_url ||
      websiteInfo.logoUrl ||
      websiteInfo.website_logo ||
      websiteInfo.websiteLogo ||
      websiteInfo.site_logo ||
      websiteInfo.siteLogo ||
      websiteInfo.image ||
      websiteInfo.image_url
  );

export { resolveMediaUrl, getWebsiteLogoUrl };
