import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { api } from "../axiosConfig";
import { setFilterdData } from "../features/BasicSlice";
import { buildPropertyUrl } from "../utils/propertyUrl";
import { buildUniqueProjectLocations } from "../utils/projectLocations";
import "./PropertiesSearch.css";

const normalizeFilterText = (value) =>
  String(value ?? "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const getPropertyTitle = (item) =>
  item?.title ||
  item?.property_name ||
  item?.project_name ||
  item?.property_title ||
  item?.name ||
  item?.project_title ||
  "";

const getPropertyDeveloper = (item) =>
  item?.developer_name ||
  item?.developerName ||
  item?.builder_name ||
  item?.builderName ||
  item?.vendor_name ||
  item?.vendorName ||
  item?.company_name ||
  item?.companyName ||
  item?.aboutDeveloper?.developerTitle ||
  item?.aboutDeveloper?.name ||
  item?.details?.developer_name ||
  item?.details?.developerName ||
  item?.details?.builder_name ||
  item?.details?.builderName ||
  "";

const matchesProjectSuggestion = (title, query) => {
  const normalizedTitle = normalizeFilterText(title);
  const normalizedQuery = normalizeFilterText(query);

  if (!normalizedTitle || !normalizedQuery) return false;

  if (normalizedQuery.includes(" ")) {
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    return tokens.every((token) => normalizedTitle.includes(token));
  }

  return normalizedTitle.includes(normalizedQuery);
};

const PropertiesSearchBox = ({ value, onChange }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const searchBoxRef = useRef(null);

  const query = value ?? "";
  const [projectTitles, setProjectTitles] = useState([]);
  const [localityTitles, setLocalityTitles] = useState([]);
  const [developerTitles, setDeveloperTitles] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProjectTitles = async () => {
      try {
        const response = await api.post("get-filtered-listview-properties", {
          paginate: 1,
          per_page: 5000,
        });

        const items = response?.data?.data ?? [];
        const titles = Array.from(
          new Map(
            items
              .map(getPropertyTitle)
              .map((title) => title.trim())
              .filter(Boolean)
              .map((title) => [title.toLowerCase(), title])
          ).values()
        );

        if (isMounted) {
          setProjectTitles(titles);
          setLocalityTitles(buildUniqueProjectLocations(items));
          setDeveloperTitles(
            Array.from(
              new Map(
                items
                  .map(getPropertyDeveloper)
                  .map((developer) => developer.trim())
                  .filter(Boolean)
                  .map((developer) => [developer.toLowerCase(), developer])
              ).values()
            )
          );
        }
      } catch (error) {
        console.error("Failed to load project title suggestions:", error);
      }
    };

    fetchProjectTitles();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const projectSuggestions = useMemo(() => {
    if (!showSuggestions || !query.trim()) return [];

    return projectTitles
      .filter((title) => matchesProjectSuggestion(title, query))
      .slice(0, 8);
  }, [projectTitles, query, showSuggestions]);

  const localitySuggestions = useMemo(() => {
    if (!showSuggestions || !query.trim()) return [];

    return localityTitles
      .filter((location) => matchesProjectSuggestion(location, query))
      .slice(0, 8);
  }, [localityTitles, query, showSuggestions]);

  const developerSuggestions = useMemo(() => {
    if (!showSuggestions || !query.trim()) return [];

    return developerTitles
      .filter((developer) => matchesProjectSuggestion(developer, query))
      .slice(0, 8);
  }, [developerTitles, query, showSuggestions]);

  const combinedSuggestions = useMemo(() => {
    const seen = new Set();
    return [...developerSuggestions, ...localitySuggestions, ...projectSuggestions].filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [developerSuggestions, localitySuggestions, projectSuggestions]);

  const handleSearch = (nextQuery) => {
    const finalQuery = (nextQuery ?? query).trim();
    const filters = {
      paginate: 1,
    };

    if (!finalQuery) {
      dispatch(setFilterdData(filters));
      setShowSuggestions(false);
      navigate("/properties", {
        state: {
          heading: "Chennai Properties",
          subtitle: "Explore live properties from the database.",
          filters,
        },
      });
      return;
    }

    const cleanParams = {};
    const matchedLocation = localityTitles.find(
      (location) =>
        normalizeFilterText(location) === normalizeFilterText(finalQuery) ||
        normalizeFilterText(location).includes(normalizeFilterText(finalQuery)) ||
        normalizeFilterText(finalQuery).includes(normalizeFilterText(location))
    );
    const matchedDeveloper = developerTitles.find(
      (developer) =>
        normalizeFilterText(developer) === normalizeFilterText(finalQuery) ||
        normalizeFilterText(developer).includes(normalizeFilterText(finalQuery)) ||
        normalizeFilterText(finalQuery).includes(normalizeFilterText(developer))
    );

    if (matchedDeveloper) {
      cleanParams.developer = matchedDeveloper;
      filters.developer_name = [matchedDeveloper];
    } else if (matchedLocation) {
      cleanParams.location = matchedLocation;
      filters.search = [matchedLocation];
      filters.property_area = [matchedLocation];
    } else {
      cleanParams.search = finalQuery;
    }

    dispatch(setFilterdData(filters));
    navigate(buildPropertyUrl("/properties", cleanParams), {
      state: {
        heading: matchedDeveloper
          ? `${matchedDeveloper} Projects`
          : matchedLocation
            ? `${matchedLocation} Properties`
            : `${finalQuery} Properties`,
        subtitle: "Explore live properties from the database.",
        filters,
        },
      });
    setShowSuggestions(false);
  };

  return (
    <div className="properties-searchbox" ref={searchBoxRef}>
      <div className="properties-searchbox-row">
        <label className="properties-searchbox-field">
          <input
            id="search-input"
            type="text"
            placeholder="Search by project name, locality, or budget"
            value={query}
            onFocus={() => {
              if (query.trim()) setShowSuggestions(true);
            }}
            onChange={(event) => {
              onChange(event.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSearch();
              }
            }}
          />
        </label>

        <button type="button" className="properties-searchbox-btn" onClick={() => handleSearch()}>
          Search
        </button>
      </div>

      {combinedSuggestions.length > 0 ? (
        <div className="properties-searchbox-suggestions" role="listbox" aria-label="Project suggestions">
          {combinedSuggestions.map((title) => (
            <button
              key={title}
              type="button"
              className="properties-searchbox-suggestion"
              onClick={() => {
                onChange(title);
                setShowSuggestions(false);
                handleSearch(title);
              }}
            >
              {title}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default PropertiesSearchBox;
