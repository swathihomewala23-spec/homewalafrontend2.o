export const normalizeLocationText = (value) =>
  String(value ?? "")
    .replace(/[-_]+/g, " ")
    .replace(/[^a-zA-Z0-9\s,]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const getPrimaryLocationName = (value) =>
  normalizeLocationText(value)
    .split(",")
    .map((part) => part.trim())
    .find(Boolean) || "";

const normalizeMatchKey = (value) =>
  normalizeLocationText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

export const extractProjectLocations = (item) => [
  item?.property_area,
  item?.location,
  item?.project_location,
  item?.locality,
  item?.area,
  item?.city,
  item?.address,
  item?.details?.property_area,
  item?.details?.location,
  item?.details?.project_location,
  item?.details?.locality,
  item?.details?.area,
  item?.details?.city,
]
  .map(getPrimaryLocationName)
  .filter(Boolean);

export const buildUniqueProjectLocations = (items) => {
  const seen = new Map();

  items.forEach((item) => {
    extractProjectLocations(item).forEach((location) => {
      const key = normalizeMatchKey(location);
      if (key && !seen.has(key)) {
        seen.set(key, location);
      }
    });
  });

  return [...seen.values()].sort((a, b) => a.localeCompare(b));
};

export const resolveProjectLocation = (value, locations = []) => {
  const requested = getPrimaryLocationName(value);
  if (!requested) return "";

  const requestedKey = normalizeMatchKey(requested);
  if (!requestedKey) return requested;

  const uniqueLocations = Array.from(
    new Map(
      locations
        .map(getPrimaryLocationName)
        .filter(Boolean)
        .map((location) => [normalizeMatchKey(location), location])
    ).values()
  );

  return (
    uniqueLocations.find((location) => normalizeMatchKey(location) === requestedKey) ||
    uniqueLocations.find((location) => normalizeMatchKey(location).includes(requestedKey)) ||
    uniqueLocations.find((location) => requestedKey.includes(normalizeMatchKey(location))) ||
    requested
  );
};
