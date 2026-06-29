import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./searchbox.css";
import { BUDGET_OPTIONS, PROPERTY_TYPE_OPTIONS } from "./searchData";
import { api } from "../axiosConfig";
import { setFilterdData, setToggleView, setPropertiesList } from "../features/BasicSlice";
import { buildPropertyUrl } from "../utils/propertyUrl";
import {
  buildUniqueProjectLocations,
  resolveProjectLocation,
} from "../utils/projectLocations";

const LOCATION_OPTIONS = [
  "Tambaram",
  "Poonamallee",
  "Kanchipuram",
  "Kelambakkam",
  "Maraimalai Nagar",
  "Thandalam",
  "Sithalapakkam",
  "Mambakkam",
];

const Searchbox = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const filter = useSelector((state) => state.basic.filter);

  const locationDropdownRef = useRef(null);
  const budgetDropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const filterRef = useRef(filter);

  const [selectedType, setSelectedType] = useState(PROPERTY_TYPE_OPTIONS[0].value);
  const [selectedBudget, setSelectedBudget] = useState(BUDGET_OPTIONS[0].value);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [liveLocations, setLiveLocations] = useState(LOCATION_OPTIONS);

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  useEffect(() => {
    if (location.pathname !== "/") return;

    setSelectedLocations([]);
    setSearchValue("");
    setSelectedType(PROPERTY_TYPE_OPTIONS[0].value); // Reset to "All" or first type
    setSelectedBudget(BUDGET_OPTIONS[0].value);   // Reset to "Any Budget"
    setIsLocationOpen(false);
    setIsBudgetOpen(false);
    setShowMore(false);

    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setIsLocationOpen(false);
      }
      if (budgetDropdownRef.current && !budgetDropdownRef.current.contains(event.target)) {
        setIsBudgetOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchLocations = async () => {
      try {
        const response = await api.post("get-filtered-listview-properties", {
          paginate: 0,
          per_page: 9999,
        });
        const items = response?.data?.data ?? response?.data ?? [];
        const locations = buildUniqueProjectLocations(Array.isArray(items) ? items : []);

        if (isMounted && locations.length > 0) {
          setLiveLocations(Array.from(new Set([...LOCATION_OPTIONS, ...locations])));
        }
      } catch (error) {
        console.error("Failed to load search locations:", error);
      }
    };

    fetchLocations();

    return () => {
      isMounted = false;
    };
  }, []);

  const [googlePredictions, setGooglePredictions] = useState([]);
  const autocompleteServiceRef = useRef(null);

  // Load Google Maps script
  useEffect(() => {
    if (window.google?.maps?.places) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      return;
    }

    const existingScript = document.getElementById("google-map-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-map-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        import.meta.env.VITE_GOOGLE_MAP_API_KEY
      }&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.maps?.places) {
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        }
      };
      document.body.appendChild(script);
    } else {
      existingScript.onload = () => {
        if (window.google?.maps?.places) {
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        }
      };
    }
  }, []);

  // Fetch predictions when search value changes
  useEffect(() => {
    if (!searchValue.trim()) {
      setGooglePredictions([]);
      return;
    }

    if (!autocompleteServiceRef.current) return;

    // Optional debounce can be added here
    const timer = setTimeout(() => {
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: searchValue,
          componentRestrictions: { country: "IN" },
          bounds: new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(12.6, 79.6),
            new window.google.maps.LatLng(13.3, 80.35)
          ),
          types: ["(regions)"],
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setGooglePredictions(predictions.map((p) => p.description));
          } else {
            setGooglePredictions([]);
          }
        }
      );
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchValue]);

  const filteredLocalLocations = liveLocations.filter((loc) =>
    loc.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Combine local and google predictions, removing duplicates
  const combinedLocations = Array.from(
    new Map(
      [...filteredLocalLocations, ...googlePredictions]
        .map((location) => resolveProjectLocation(location, liveLocations))
        .filter(Boolean)
        .map((location) => [location.toLowerCase(), location])
    ).values()
  );

  const handleLocationSelect = (location) => {
    const locationName = resolveProjectLocation(location, liveLocations);
    if (!locationName) return;

    setSelectedLocations((prev) => (prev.includes(locationName) ? prev : [...prev, locationName]));
    setSearchValue(locationName);
    if (searchInputRef.current) {
      searchInputRef.current.value = locationName;
    }
    setIsLocationOpen(false);

    dispatch(
      setFilterdData({
        ...filterRef.current,
        search: [locationName],
        property_area: [locationName],
        paginate: 1,
      })
    );
  };

  const handleSearch = () => {
    const allSearchTerms = [...selectedLocations];
    const typedValue = resolveProjectLocation(searchValue, liveLocations);

    if (typedValue && !allSearchTerms.includes(typedValue)) {
      allSearchTerms.push(typedValue);
    }

    const filters = {
      paginate: 1,
      search: allSearchTerms,
      property_area: allSearchTerms,
    };

    if (selectedType && selectedType !== "all") {
      filters.property_type = selectedType;
    }

    if (selectedBudget && selectedBudget !== "all") {
      filters.budget = selectedBudget;
    }

    dispatch(setFilterdData(filters));

    const targetUrl = buildPropertyUrl("/properties", {
      location: allSearchTerms,
      type: selectedType && selectedType !== "all" ? selectedType : "",
      budget: selectedBudget && selectedBudget !== "all" ? selectedBudget : "",
    });
    navigate(targetUrl, {
      state: {
        heading: allSearchTerms.length ? `${allSearchTerms.join(", ")} Properties` : "Chennai Properties",
        subtitle: "Explore live properties from the database.",
        filters,
      },
    });
  };

  const handleMapSearch = () => {
    dispatch(setToggleView("Map"));
    // By dispatching an empty object and clearing the list, 
    // MapView will trigger its "Fetch All" logic on mount.
    dispatch(setFilterdData({}));
    dispatch(setPropertiesList({ data: [] }));
    navigate("/map");
  };

  const syncSelectedLocations = (nextLocations) => {
    setSelectedLocations(nextLocations);

    dispatch(
      setFilterdData({
        ...filterRef.current,
        search: nextLocations,
        property_area: nextLocations,
        paginate: 1,
      })
    );
  };

  const handleClearSearch = () => {
    setSearchValue("");
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
    setIsLocationOpen(false);
    setShowMore(false);
    syncSelectedLocations([]);
  };

  const selectedBudgetLabel =
    BUDGET_OPTIONS.find((option) => option.value === selectedBudget)?.label || "Any Budget";

  const handleBudgetSelect = (value) => {
    setSelectedBudget(value);
    setIsBudgetOpen(false);
  };

  const handleAiScroll = () => {
    const target = document.getElementById("ai-search");
    if (target) {
      const yOffset = -150; 
      const y = target.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Backspace" && !searchValue.trim() && selectedLocations.length > 0) {
      event.preventDefault();
      const nextLocations = selectedLocations.slice(0, -1);
      syncSelectedLocations(nextLocations);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="searchbox-wrap">
      <div className="searchbox-head" role="tablist" aria-label="Property categories">
        {PROPERTY_TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={selectedType === option.value ? "is-active" : ""}
            onClick={() => setSelectedType(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="searchbox-panel">
        <div
          className="searchbox-field searchbox-mobile-top-field searchbox-location-field"
          ref={locationDropdownRef}
        >
          <span>Locations</span>
          <div className={`searchbox-select-trigger ${isLocationOpen ? "is-open" : ""}`}>
            <span
              className="searchbox-select-wrap"
              style={{ width: "100%", cursor: "text" }}
              onClick={() => searchInputRef.current?.focus()}
            >
              <span className="searchbox-field-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 21s6-5.4 6-10.8a6 6 0 1 0-12 0C6 15.6 12 21 12 21Zm0-8.2a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4Z" />
                </svg>
              </span>

              <input
  ref={searchInputRef}
  id="location-search-input"
  type="text"
  placeholder="Search for Locality & Project"
  value={searchValue}
  onChange={(e) => {
    setSearchValue(e.target.value);
    setIsLocationOpen(true);
  }}
  onFocus={() => setIsLocationOpen(true)}
  onKeyDown={handleKeyDown}
  autoComplete="off"
  style={{
    border: "none",
    background: "transparent",
    outline: "none",
    width: "100%",
    minWidth: 0,
    flex: 1,
    color: "#1b2330",
    fontSize: "0.88rem",
    fontWeight: "500",
  }}
/>
              {(searchValue || selectedLocations.length > 0) ? (
                <button
                  type="button"
                  className="searchbox-clear-button"
                  aria-label="Clear search"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleClearSearch();
                  }}
                >
                  ×
                </button>
              ) : null}
            </span>

            <span
              className="searchbox-select-caret"
              aria-hidden="true"
              onClick={(e) => {
                e.stopPropagation();
                setIsLocationOpen((current) => !current);
              }}
              style={{ cursor: "pointer" }}
            >
              <svg viewBox="0 0 24 24">
                <path
                  d="M7 10l5 5 5-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

          {isLocationOpen ? (
            <div className="searchbox-location-menu">
              <div className="searchbox-location-options">
                {combinedLocations.length > 0 ? (
                  combinedLocations.slice(0, showMore ? 8 : 4).map((location) => (
                    <button
                      key={location}
                      type="button"
                      className={`searchbox-location-option ${
                        selectedLocations.includes(location) ? "is-active" : ""
                      }`}
                      onClick={() => handleLocationSelect(location)}
                      style={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <span
                        className="searchbox-location-option-icon"
                        style={{ display: "flex", alignItems: "center", color: "#1fb3f0" }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path
                            d="M12 21s6-5.4 6-10.8a6 6 0 1 0-12 0C6 15.6 12 21 12 21Zm0-8.2a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4Z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                      {location}
                    </button>
                  ))
                ) : (
                  <div className="searchbox-location-no-results">No locations found</div>
                )}

                {combinedLocations.length > 4 ? (
                  <button
                    type="button"
                    onClick={() => setShowMore((current) => !current)}
                    style={{
                      textAlign: "center",
                      padding: "8px 0",
                      borderTop: "1px solid #e7ecf1",
                      width: "100%",
                      background: "transparent",
                      borderLeft: "none",
                      borderRight: "none",
                      borderBottom: "none",
                      color: "#1fb3f0",
                      fontSize: "0.88rem",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    {showMore ? "Show Less ▲" : "Show More ▼"}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div
          className="searchbox-field searchbox-divider searchbox-mobile-top-field searchbox-price-field"
          ref={budgetDropdownRef}
        >
          <span>Budget</span>
          <button
            type="button"
            className={`searchbox-select-trigger ${isBudgetOpen ? "is-open" : ""}`}
            onClick={() => {
              setIsBudgetOpen((current) => !current);
              setIsLocationOpen(false);
            }}
            aria-haspopup="listbox"
            aria-expanded={isBudgetOpen}
          >
            <span className="searchbox-select-wrap">
              <span className="searchbox-field-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 3a1 1 0 0 1 1 1v1.1c1.9.2 3.3 1.2 4 3 .2.5 0 1.1-.5 1.3-.5.2-1.1 0-1.3-.5-.5-1.2-1.4-1.7-3-1.7-1.7 0-2.8.6-2.8 1.6 0 .9.7 1.3 3 1.8 2.7.6 4.9 1.3 4.9 4.1 0 2.1-1.5 3.5-4.3 3.8V20a1 1 0 1 1-2 0v-1c-2.2-.2-3.9-1.2-4.6-3.2a1 1 0 1 1 1.9-.7c.4 1.1 1.5 1.8 3.2 1.9 2.1 0 3.6-.8 3.6-2 0-1.1-.8-1.6-3.1-2.1-2.8-.6-4.8-1.4-4.8-4 0-2 1.6-3.5 4.2-3.8V4a1 1 0 0 1 1-1Z" />
                </svg>
              </span>
              <span className="searchbox-select-value">{selectedBudgetLabel}</span>
            </span>

            <span className="searchbox-select-caret" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path
                  d="M7 10l5 5 5-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>

          {isBudgetOpen ? (
            <div className="searchbox-budget-menu" role="listbox" aria-label="Budget options">
              <div className="searchbox-budget-options">
                {BUDGET_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`searchbox-budget-option ${
                      selectedBudget === option.value ? "is-active" : ""
                    }`}
                    onClick={() => handleBudgetSelect(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="searchbox-map searchbox-divider searchbox-mobile-top-field"
          onClick={handleMapSearch}
        >
          <span className="searchbox-map-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M15 5.2 9 3 4 5.1v15l5-2.1 6 2.2 5-2.1v-15L15 5.2Zm-1 1.7v10.8l-4-1.5V5.4l4 1.5Z" />
            </svg>
          </span>
          <span>Map Search</span>
        </button>

        <button type="button" className="searchbox-ai searchbox-divider" onClick={handleAiScroll}>
          <span className="searchbox-ai-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 5.5 13.6 9l3.9.6-2.8 2.7.7 3.9-3.4-1.8-3.5 1.8.7-3.9-2.8-2.7 3.9-.6L12 5.5Z" />
            </svg>
          </span>
          <span>AI Search</span>
        </button>

        <button type="button" className="searchbox-button" onClick={handleSearch}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10.5 4a6.5 6.5 0 1 1 0 13a6.5 6.5 0 0 1 0-13Zm0 2a4.5 4.5 0 1 0 0 9a4.5 4.5 0 0 0 0-9Zm8.91 11.5 2.3 2.3a1 1 0 0 1-1.42 1.4l-2.28-2.28a1 1 0 0 1 1.4-1.42Z" />
          </svg>
          <span>Search</span>
        </button>
      </div>
    </div>
  );
};

export default Searchbox;
