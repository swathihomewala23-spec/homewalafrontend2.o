import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import Slider from "@mui/material/Slider";
import { api } from "../axiosConfig";
import { setFilterdData } from "../features/BasicSlice";
import "./SideFilter.css";

const formatIndianCurrency = (value) => {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(1)} Cr`;
  }

  if (value >= 100000) {
    return `${(value / 100000).toFixed(1)} L`;
  }

  return `₹${value.toLocaleString("en-IN")}`;
};

const formatArea = (value) => `${value.toLocaleString("en-IN")} sq ft`;

const normalizeFilterText = (value) =>
  String(value ?? "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toTitleCase = (value) =>
  normalizeFilterText(value)
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getNestedValue = (item, path) =>
  path.split(".").reduce((current, key) => current?.[key], item);

const extractBedCount = (item) => {
  const candidates = [
    item?.beds,
    item?.bedrooms,
    item?.bhk,
    item?.configuration,
    item?.details?.beds,
    item?.details?.bedrooms,
    item?.details?.bhk,
    item?.details?.configuration,
  ];

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined || candidate === "") continue;

    const match = String(candidate).match(/(\d+)/);
    if (match) {
      return Number(match[1]);
    }
  }

  return null;
};

const buildUniqueTextOptions = (items, fields) => {
  const seen = new Map();

  items.forEach((item) => {
    fields.forEach((field) => {
      const normalized = normalizeFilterText(getNestedValue(item, field));
      if (!normalized) return;

      const canonical = toTitleCase(normalized);
      const dedupeKey = canonical.toLowerCase();

      if (!seen.has(dedupeKey)) {
        seen.set(dedupeKey, canonical);
      }
    });
  });

  return [...seen.values()].map((value) => ({
    label: value,
    value,
  }));
};

const extractLocationValue = (item) => {
  const candidates = [
    item?.location,
    item?.property_area,
    item?.project_location,
    item?.locality,
    item?.area,
    item?.city,
    item?.state,
    item?.address,
  ];

  const raw = candidates.find((candidate) => normalizeFilterText(candidate));
  if (!raw) return [];

  return normalizeFilterText(raw)
    .split(",")
    .map((part) => toTitleCase(part))
    .filter(Boolean);
};

const buildUniqueLocations = (items) => {
  const seen = new Map();

  items.forEach((item) => {
    extractLocationValue(item).forEach((location) => {
      const key = location.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, location);
      }
    });
  });

  return [...seen.values()].sort((a, b) => a.localeCompare(b));
};

const DEFAULT_FILTER = {
  categoryId: null,
  property_area: [],
  min_price: 500000,
  max_price: 100000000,
  beds: [],
  area_min: 500,
  area_max: 5000,
  construction_status: [],
  furnished_status: [],
  city: [],
  state: [],
  country: [],
  search: [],
  isAlreadySeen: false,
  properyType: "",
  isFavourites: true,
  paginate: 1,
};

const BUDGET_MAX = 200000000;
const BUDGET_DEFAULT = [10000000, 50000000];
const AREA_MAX = 10000;
const AREA_DEFAULT = [1000, 3000];

const budgetOptions = [
  500000,
  1000000,
  2500000,
  5000000,
  10000000,
  50000000,
  100000000,
  200000000,
];

const areaOptions = [500, 1000, 1500, 2000, 3000, 4000, 5000, 10000];

const defaultBedroomOptions = [
  { label: "1 BHK", value: 1 },
  { label: "2 BHK", value: 2 },
  { label: "3 BHK", value: 3 },
  { label: "4 BHK", value: 4 },
  { label: "5 BHK", value: 5 },
];

const defaultConstructionStatus = [
  { label: "New Launch", value: "New Launch" },
  { label: "Under Construction", value: "Under Construction" },
  { label: "Ready To Move", value: "Ready To Move" },
];

const defaultFurnishingStatus = [
  { label: "Unfurnished", value: "Unfurnished" },
  { label: "Semi Furnished", value: "Semi Furnished" },
  { label: "Furnished", value: "Furnished" },
];

const FEATURED_LOCALITIES = [
  "Tambaram",
  "Poonamallee",
  "Kanchipuram",
  "Kelambakkam",
  "Maraimalai Nagar",
];

const SideFilter = ({ isFiltersOpen, setIsFiltersOpen }) => {
  const dispatch = useDispatch();
  const filter = useSelector((state) => state.basic?.filter ?? {});
  const autocompleteServiceRef = useRef(null);

  const [localities, setLocalities] = useState([]);
  const [liveFilterOptions, setLiveFilterOptions] = useState({
    beds: [],
    construction_status: [],
    furnished_status: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLocationSearchOpen, setIsLocationSearchOpen] = useState(false);
  const [locationSearchValue, setLocationSearchValue] = useState("");
  const [googleLocationSuggestions, setGoogleLocationSuggestions] = useState([]);

  const [tempBudget, setTempBudget] = useState(() => {
    if (filter?.min_price !== undefined && filter?.max_price !== undefined) {
      return [Number(filter.min_price), Number(filter.max_price)];
    }

    return BUDGET_DEFAULT;
  });

  const [minBudget, setMinBudget] = useState(() => {
    if (filter?.min_price !== undefined) {
      return Number(filter.min_price);
    }

    return BUDGET_DEFAULT[0];
  });

  const [maxBudget, setMaxBudget] = useState(() => {
    if (filter?.max_price !== undefined) {
      return Number(filter.max_price);
    }

    return BUDGET_DEFAULT[1];
  });

  const [tempArea, setTempArea] = useState(() => {
    if (filter?.area_min !== undefined && filter?.area_max !== undefined) {
      return [Number(filter.area_min), Number(filter.area_max)];
    }

    return AREA_DEFAULT;
  });

  const [minArea, setMinArea] = useState(() => {
    if (filter?.area_min !== undefined) {
      return Number(filter.area_min);
    }

    return AREA_DEFAULT[0];
  });

  const [maxArea, setMaxArea] = useState(() => {
    if (filter?.area_max !== undefined) {
      return Number(filter.area_max);
    }

    return AREA_DEFAULT[1];
  });

  useEffect(() => {
    let isMounted = true;

    const fetchLiveFilterData = async () => {
      try {
        const [propertiesResponse, placesResponse] = await Promise.all([
          api.post("get-filtered-listview-properties", {
            paginate: 1,
            per_page: 5000,
          }),
          api.get("get-property-places-count"),
        ]);

        const properties = propertiesResponse?.data?.data ?? [];
        const placeRows = placesResponse?.data?.data ?? [];

        const localityMap = new Map();

        buildUniqueLocations(properties).forEach((location) => {
          localityMap.set(location.toLowerCase(), location);
        });

        if (Array.isArray(placeRows)) {
          placeRows
            .map((place) => toTitleCase(place?.name))
            .filter(Boolean)
            .forEach((location) => {
              const key = location.toLowerCase();
              if (!localityMap.has(key)) {
                localityMap.set(key, location);
              }
            });
        }

        const beds = [...new Set(properties.map(extractBedCount).filter((value) => Number.isFinite(value)))]
          .sort((a, b) => a - b)
          .map((value) => ({
            label: `${value} BHK`,
            value,
          }));

        const construction_status = buildUniqueTextOptions(properties, [
          "construction_status",
          "status",
          "details.possessionStatus",
          "details.status",
          "floorSections.status",
        ]);

        const furnished_status = buildUniqueTextOptions(properties, [
          "furnished_status",
          "furnishing_status",
          "details.furnishing",
          "details.furnishingStatus",
        ]);

        if (!isMounted) return;

        const allProjectLocalities = [...localityMap.values()];
        const featuredByProjectData = FEATURED_LOCALITIES.filter((locality) =>
          allProjectLocalities.some(
            (projectLocality) =>
              normalizeFilterText(projectLocality) === normalizeFilterText(locality) ||
              normalizeFilterText(projectLocality).includes(normalizeFilterText(locality)) ||
              normalizeFilterText(locality).includes(normalizeFilterText(projectLocality))
          )
        );

        const mergedLocalities = [
          ...featuredByProjectData,
          ...FEATURED_LOCALITIES.filter(
            (locality) => !featuredByProjectData.some(
              (present) => normalizeFilterText(present) === normalizeFilterText(locality)
            )
          ),
          ...allProjectLocalities.filter(
            (locality) =>
              !FEATURED_LOCALITIES.some(
                (featured) =>
                  normalizeFilterText(featured) === normalizeFilterText(locality) ||
                  normalizeFilterText(featured).includes(normalizeFilterText(locality)) ||
                  normalizeFilterText(locality).includes(normalizeFilterText(featured))
              )
          ),
        ];

        setLocalities(mergedLocalities);
        setLiveFilterOptions({
          beds,
          construction_status,
          furnished_status,
        });
      } catch (error) {
        console.error("Error fetching live filter data:", error);
      }
    };

    fetchLiveFilterData();

    return () => {
      isMounted = false;
    };
  }, []);

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

  useEffect(() => {
    if (filter?.min_price !== undefined && filter?.max_price !== undefined) {
      const nextBudget = [Number(filter.min_price), Number(filter.max_price)];
      setTempBudget(nextBudget);
      setMinBudget(nextBudget[0]);
      setMaxBudget(nextBudget[1]);
    }

    if (filter?.area_min !== undefined && filter?.area_max !== undefined) {
      const nextArea = [Number(filter.area_min), Number(filter.area_max)];
      setTempArea(nextArea);
      setMinArea(nextArea[0]);
      setMaxArea(nextArea[1]);
    }
  }, [filter?.min_price, filter?.max_price, filter?.area_min, filter?.area_max]);

  const displayLocalities = FEATURED_LOCALITIES;

  const filteredLocalities = localities.filter((locality) =>
    locality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!locationSearchValue.trim()) {
      setGoogleLocationSuggestions([]);
      return;
    }

    const autocomplete = autocompleteServiceRef.current;
    if (!autocomplete) {
      setGoogleLocationSuggestions(
        localities.filter((locality) =>
          locality.toLowerCase().includes(locationSearchValue.toLowerCase())
        )
      );
      return;
    }

    const timer = setTimeout(() => {
      autocomplete.getPlacePredictions(
        {
          input: locationSearchValue,
          componentRestrictions: { country: "IN" },
          types: ["(regions)"],
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setGoogleLocationSuggestions(
              predictions.map((prediction) => prediction.description)
            );
          } else {
            setGoogleLocationSuggestions(
              localities.filter((locality) =>
                locality.toLowerCase().includes(locationSearchValue.toLowerCase())
              )
            );
          }
        }
      );
    }, 250);

    return () => clearTimeout(timer);
  }, [locationSearchValue, localities]);

  const locationSuggestions = Array.from(
    new Set([
      ...googleLocationSuggestions,
      ...localities.filter((locality) =>
        locality.toLowerCase().includes(locationSearchValue.toLowerCase())
      ),
    ])
  ).map((location) => {
    const parts = String(location).split(",").map((part) => part.trim()).filter(Boolean);
    const title = parts[0] || location;
    const subtitle = parts.slice(1).join(", ");

    return {
      title,
      subtitle,
      value: location,
    };
  });

  const isSelected = (key, value) => {
    const selectedValue = filter?.[key];

    if (Array.isArray(selectedValue)) {
      return selectedValue.includes(value);
    }

    return selectedValue === value;
  };

  const getToggleButtonClass = (active) =>
    [
      "properties-filter-chip",
      active ? "is-active" : "",
    ]
      .filter(Boolean)
      .join(" ");

  const updateFilter = (patch) => {
    dispatch(
      setFilterdData({
        ...filter,
        ...patch,
        paginate: 1,
      })
    );
  };

  const toggleFilter = (key, value) => {
    const currentValues = Array.isArray(filter?.[key]) ? filter[key] : [];
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    updateFilter({ [key]: nextValues });
  };

  const updateRangeFilter = (minKey, maxKey, nextValue) => {
    updateFilter({
      [minKey]: nextValue[0],
      [maxKey]: nextValue[1],
    });
  };

  const handleTempBudgetChange = (_event, nextValue) => {
    setTempBudget(nextValue);
  };

  const handleBudgetChangeCommitted = (_event, nextValue) => {
    setMinBudget(nextValue[0]);
    setMaxBudget(nextValue[1]);
    updateRangeFilter("min_price", "max_price", nextValue);
  };

  const handleMinBudgetChange = (event) => {
    const nextMin = Number(event.target.value);
    if (Number.isNaN(nextMin)) return;

    const nextMax = Math.max(nextMin, maxBudget);
    const nextBudget = [nextMin, nextMax];

    setMinBudget(nextMin);
    setMaxBudget(nextMax);
    setTempBudget(nextBudget);
    updateRangeFilter("min_price", "max_price", nextBudget);
  };

  const handleMaxBudgetChange = (event) => {
    const nextMax = Number(event.target.value);
    if (Number.isNaN(nextMax)) return;

    const nextMin = Math.min(minBudget, nextMax);
    const nextBudget = [nextMin, nextMax];

    setMinBudget(nextMin);
    setMaxBudget(nextMax);
    setTempBudget(nextBudget);
    updateRangeFilter("min_price", "max_price", nextBudget);
  };

  const handleTempAreaChange = (_event, nextValue) => {
    setTempArea(nextValue);
  };

  const handleAreaChangeCommitted = (_event, nextValue) => {
    setMinArea(nextValue[0]);
    setMaxArea(nextValue[1]);
    updateRangeFilter("area_min", "area_max", nextValue);
  };

  const handleMinAreaChange = (event) => {
    const nextMin = Number(event.target.value);
    if (Number.isNaN(nextMin)) return;

    const nextMax = Math.max(nextMin, maxArea);
    const nextArea = [nextMin, nextMax];

    setMinArea(nextMin);
    setMaxArea(nextMax);
    setTempArea(nextArea);
    updateRangeFilter("area_min", "area_max", nextArea);
  };

  const handleMaxAreaChange = (event) => {
    const nextMax = Number(event.target.value);
    if (Number.isNaN(nextMax)) return;

    const nextMin = Math.min(minArea, nextMax);
    const nextArea = [nextMin, nextMax];

    setMinArea(nextMin);
    setMaxArea(nextMax);
    setTempArea(nextArea);
    updateRangeFilter("area_min", "area_max", nextArea);
  };

  const handleResetAll = () => {
    dispatch(setFilterdData({ ...DEFAULT_FILTER }));
    setSearchTerm("");
    setTempBudget(BUDGET_DEFAULT);
    setMinBudget(BUDGET_DEFAULT[0]);
    setMaxBudget(BUDGET_DEFAULT[1]);
    setTempArea(AREA_DEFAULT);
    setMinArea(AREA_DEFAULT[0]);
    setMaxArea(AREA_DEFAULT[1]);
    setIsFiltersOpen(false);
  };

  const handleApplyFilters = () => {
    setIsFiltersOpen(false);
  };

  const handleLocationSelect = (location) => {
    if (!location) return;

    toggleFilter("property_area", location);
    setLocationSearchValue(location);
    setSearchTerm(location);
    setIsLocationSearchOpen(false);
  };

  const handleLocationRemove = (location) => {
    if (!location) return;

    const currentValues = Array.isArray(filter?.property_area) ? filter.property_area : [];
    const nextValues = currentValues.filter((item) => item !== location);

    updateFilter({ property_area: nextValues });
  };

  const handleLocationSearchKeyDown = (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    const nextLocation = locationSuggestions[0]?.value || locationSearchValue.trim();

    if (nextLocation) {
      handleLocationSelect(nextLocation);
    }
  };

  const bedroomOptions = liveFilterOptions.beds.length ? liveFilterOptions.beds : defaultBedroomOptions;
  const constructionOptions = liveFilterOptions.construction_status.length
    ? liveFilterOptions.construction_status
    : defaultConstructionStatus;
  const furnishingOptions = [
    ...defaultFurnishingStatus,
    ...(liveFilterOptions.furnished_status || []).filter(
      (opt) =>
        !defaultFurnishingStatus.some(
          (def) => def.value.toLowerCase() === opt.value.toLowerCase()
        )
    ),
  ];

  return (
    <aside className={`properties-filters ${isFiltersOpen ? "is-open" : ""}`}>
      <div className="properties-filters-head">
        <div className="properties-filters-head-copy">
          <h2>Filter Properties</h2>
        </div>
        <div className="properties-filters-head-actions">
          <Link to="/properties" onClick={handleResetAll}>
            Reset All
          </Link>
          <button
            type="button"
            className="properties-filters-close-mobile"
            onClick={() => setIsFiltersOpen(false)}
            aria-label="Close filters"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      <div className="properties-filter-group">
        <h3>Localities</h3>
        <input
          type="text"
          placeholder="Search your location"
          className="properties-filter-search"
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setLocationSearchValue(event.target.value);
            setIsLocationSearchOpen(true);
          }}
          onClick={() => setIsLocationSearchOpen(true)}
          onFocus={() => setIsLocationSearchOpen(true)}
        />
        {isLocationSearchOpen ? (
          <div className="properties-location-dropdown">
            <div className="properties-location-suggestions">
              {locationSuggestions.length > 0 ? (
                locationSuggestions.slice(0, 8).map((location, index) => {
                  const checked = Array.isArray(filter?.property_area)
                    ? filter.property_area.includes(location.value)
                    : false;

                  return (
                    <button
                      key={`${location.value}-${index}`}
                      type="button"
                      className={[
                        "properties-location-option",
                        checked ? "is-active" : "",
                      ].filter(Boolean).join(" ")}
                      onClick={() => handleLocationSelect(location.value)}
                    >
                      <span className="properties-location-option-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <path d="M12 21s6-5.4 6-10.8a6 6 0 1 0-12 0C6 15.6 12 21 12 21Zm0-8.2a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4Z" />
                        </svg>
                      </span>
                      <span className="properties-location-option-copy">
                        <span className="properties-location-option-title">{location.title}</span>
                        {location.subtitle ? (
                          <span className="properties-location-option-subtitle">{location.subtitle}</span>
                        ) : (
                          <span className="properties-location-option-subtitle">Tamil Nadu, India</span>
                        )}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="properties-location-empty">No matching locations</p>
              )}
            </div>
          </div>
        ) : null}
        {Array.isArray(filter?.property_area) && filter.property_area.length > 0 ? (
          <div className="properties-selected-locations">
            <div className="properties-selected-locations-head">
              <span>Selected localities</span>
              <button
                type="button"
                onClick={() => updateFilter({ property_area: [] })}
              >
                Clear
              </button>
            </div>
            <div className="properties-selected-locations-list">
              {filter.property_area.map((location) => (
                <button
                  key={location}
                  type="button"
                  className="properties-selected-location-chip"
                  onClick={() => handleLocationRemove(location)}
                >
                  <span>{location}</span>
                  <FaTimes aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {/* <div className="properties-filter-options">
          {displayLocalities.map((locality, index) => {
            const checked = Array.isArray(filter?.property_area)
              ? filter.property_area.includes(locality)
              : false;

            return (
              <button
                key={`${locality}-${index}`}
                type="button"
                aria-pressed={checked}
                onClick={() => toggleFilter("property_area", locality)}
                className={getToggleButtonClass(checked)}
              >
                {locality}
              </button>
            );
          })}
        </div> */}
      </div>

      <div className="properties-filter-group">
        <h3>Budget</h3>
        <Slider
          value={tempBudget}
          onChange={handleTempBudgetChange}
          onChangeCommitted={handleBudgetChangeCommitted}
          min={500000}
          max={BUDGET_MAX}
          step={500000}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => formatIndianCurrency(value)}
          sx={{
            color: "#2153a7",
            "& .MuiSlider-thumb": {
              width: 18,
              height: 18,
              border: "2px solid #ffffff",
              boxShadow: "0 6px 18px rgba(33, 83, 167, 0.28)",
            },
            "& .MuiSlider-track": {
              border: "none",
              height: 6,
            },
            "& .MuiSlider-rail": {
              opacity: 1,
              backgroundColor: "#dce4f1",
              height: 6,
            },
          }}
        />

        <div className="properties-filter-select-row">
          <select
            value={minBudget}
            onChange={handleMinBudgetChange}
            className="properties-filter-select"
          >
            {budgetOptions.map((amount) => (
              <option key={amount} value={amount}>
                {formatIndianCurrency(amount)}
              </option>
            ))}
          </select>

          <select
            value={maxBudget}
            onChange={handleMaxBudgetChange}
            className="properties-filter-select"
          >
            {budgetOptions.map((amount) => (
              <option key={amount} value={amount}>
                {formatIndianCurrency(amount)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="properties-filter-group">
        <h3>Area (sq ft)</h3>
        <Slider
          value={tempArea}
          onChange={handleTempAreaChange}
          onChangeCommitted={handleAreaChangeCommitted}
          min={0}
          max={AREA_MAX}
          step={100}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => formatArea(value)}
          sx={{
            color: "#2153a7",
            "& .MuiSlider-thumb": {
              width: 18,
              height: 18,
              border: "2px solid #ffffff",
              boxShadow: "0 6px 18px rgba(33, 83, 167, 0.28)",
            },
            "& .MuiSlider-track": {
              border: "none",
              height: 6,
            },
            "& .MuiSlider-rail": {
              opacity: 1,
              backgroundColor: "#dce4f1",
              height: 6,
            },
          }}
        />

        <div className="properties-filter-select-row">
          <select
            value={minArea}
            onChange={handleMinAreaChange}
            className="properties-filter-select"
          >
            {areaOptions.map((areaValue) => (
              <option className="text-[10px]" key={areaValue} value={areaValue}>
                {areaValue === 10000 ? "10000+ sq ft" : `${areaValue} sq ft`}
              </option>
            ))}
          </select>

          <select
            value={maxArea}
            onChange={handleMaxAreaChange}
            className="properties-filter-select"
          >
            {areaOptions.map((areaValue) => (
              <option className="text-[10px]" key={areaValue} value={areaValue}>
                {areaValue === AREA_MAX ? "10000+ sq ft" : `${areaValue} sq ft`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="properties-filter-group">
        <h3>No. of Bedrooms</h3>
        <div className="properties-filter-options">
          {bedroomOptions.map((bedroom) => (
            <button
              key={bedroom.value}
              type="button"
              aria-pressed={isSelected("beds", bedroom.value)}
              onClick={() => toggleFilter("beds", bedroom.value)}
              className={getToggleButtonClass(isSelected("beds", bedroom.value))}
            >
              {bedroom.label}
            </button>
          ))}
        </div>
      </div>

      <div className="properties-filter-group">
        <h3>Construction Status</h3>
        <div className="properties-filter-options">
          {constructionOptions.map((status) => (
            <button
              key={status.value}
              type="button"
              aria-pressed={isSelected("construction_status", status.value)}
              onClick={() => toggleFilter("construction_status", status.value)}
              className={getToggleButtonClass(isSelected("construction_status", status.value))}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      <div className="properties-filter-group">
        <h3>Furnishing Status</h3>
        <div className="properties-filter-options">
          {furnishingOptions.map((status) => (
            <button
              key={status.value}
              type="button"
              aria-pressed={isSelected("furnished_status", status.value)}
              onClick={() => toggleFilter("furnished_status", status.value)}
              className={getToggleButtonClass(isSelected("furnished_status", status.value))}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      <button type="button" className="properties-apply-btn" onClick={handleApplyFilters}>
        Apply Filters
      </button>
    </aside>
  );
};

export default SideFilter;
