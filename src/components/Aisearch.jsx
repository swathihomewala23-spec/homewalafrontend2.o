import "./ai.css";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaMicrophone, FaSearch } from "react-icons/fa";
import { api } from "../axiosConfig";
import Seo from "./common/Seo";

const suggestions = [
  "Plots in Tambaram",
  "Flats near schools",
  "Budget apartments",
];

const ignoredSearchWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "at",
  "below",
  "best",
  "budget",
  "for",
  "from",
  "home",
  "homes",
  "house",
  "in",
  "is",
  "lac",
  "lacs",
  "lakh",
  "lakhs",
  "near",
  "of",
  "on",
  "or",
  "property",
  "properties",
  "show",
  "the",
  "to",
  "under",
  "want",
  "with",
  "cr",
  "crore",
  "crores",
]);

const normalizeFilterText = (value) =>
  String(value ?? "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toTitleCase = (value) =>
  normalizeFilterText(value)
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const extractBedCount = (item) => {
  const candidates = [item?.beds, item?.bedrooms, item?.bhk, item?.configuration];

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
      const normalized = normalizeFilterText(item?.[field]);
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

const getPropertyTitle = (item) =>
  item?.title ||
  item?.property_name ||
  item?.project_name ||
  item?.property_title ||
  item?.name ||
  item?.project_title ||
  "";

const getPropertyType = (item) =>
  item?.property_type ||
  item?.type ||
  item?.project_type ||
  item?.category ||
  item?.propertyCategory ||
  item?.property_category ||
  item?.project_category ||
  item?.details?.property_type ||
  item?.details?.type ||
  item?.details?.project_type ||
  item?.details?.category ||
  "";

const flattenSearchableValues = (value, depth = 0) => {
  if (value === null || value === undefined || depth > 3) return [];

  if (["string", "number", "boolean"].includes(typeof value)) {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenSearchableValues(item, depth + 1));
  }

  if (typeof value === "object") {
    return Object.values(value).flatMap((item) => flattenSearchableValues(item, depth + 1));
  }

  return [];
};

const buildPropertySearchText = (item) =>
  normalizeFilterText(
    [
      getPropertyTitle(item),
      getPropertyType(item),
      extractLocationValue(item).join(" "),
      item?.priceRange,
      item?.price,
      item?.min_price,
      item?.max_price,
      item?.starting_price,
      item?.project_price,
      item?.beds,
      item?.bedrooms,
      item?.bhk,
      item?.configuration,
      item?.construction_status,
      item?.status,
      item?.furnished_status,
      item?.furnishing_status,
      ...flattenSearchableValues(item?.details),
      ...flattenSearchableValues(item?.amenities),
      ...flattenSearchableValues(item?.floorSections),
    ].join(" ")
  ).toLowerCase();

const getQueryTokens = (query) =>
  normalizeFilterText(query)
    .toLowerCase()
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !ignoredSearchWords.has(token));

const dots = Array.from({ length: 140 }, (_, index) => {
  const dotColors = [
    "rgba(31, 183, 232, 0.85)",
    "rgba(33, 83, 167, 0.82)",
    "rgba(223, 155, 69, 0.78)",
    "rgba(148, 201, 115, 0.72)",
  ];
  const orbit = 26 + (index % 14) * 2.4;
  const angle = (index / 140) * Math.PI * 5.8;

  const x = 50 + Math.cos(angle) * orbit;
  const y = 52 + Math.sin(angle) * (orbit * 0.75);

  return {
    id: index,
    x,
    y,
    size: 1.6 + (index % 4) * 0.55,
    opacity: 0.22 + (index % 6) * 0.08,
    color: dotColors[index % dotColors.length],
    pull: 10 + (index % 5) * 4,
  };
});

const Aisearch = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const sectionRef = useRef(null);
  const dotRefs = useRef([]);

  const [aiQuery, setAiQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [liveFilterOptions, setLiveFilterOptions] = useState({
    properties: [],
    locations: [],
    beds: [],
    construction_status: [],
    furnished_status: [],
  });

  const showBackButton = location.pathname === "/aisearch";
  const liveLocations = liveFilterOptions.locations;

  useEffect(() => {
    let isMounted = true;

    const fetchFilterOptions = async () => {
      try {
        const [propertiesResponse, placesResponse] = await Promise.all([
          api.post("get-filtered-listview-properties", {
            paginate: 1,
            per_page: 5000,
          }),
          api.get("get-property-places-count"),
        ]);

        const properties = propertiesResponse?.data?.data || [];
        const placeRows = placesResponse?.data?.data || [];

        const localityMap = new Map();

        buildUniqueLocations(properties).forEach((locationName) => {
          localityMap.set(locationName.toLowerCase(), locationName);
        });

        if (Array.isArray(placeRows)) {
          placeRows
            .map((place) => toTitleCase(place?.name))
            .filter(Boolean)
            .forEach((locationName) => {
              const key = locationName.toLowerCase();
              if (!localityMap.has(key)) {
                localityMap.set(key, locationName);
              }
            });
        }

        const beds = [...new Set(
          properties
            .map(extractBedCount)
            .filter((value) => Number.isFinite(value))
        )]
          .sort((a, b) => a - b)
          .map((value) => ({
            label: `${value} BHK`,
            value,
          }));

        const construction_status = buildUniqueTextOptions(properties, [
          "construction_status",
          "status",
        ]);

        const furnished_status = buildUniqueTextOptions(properties, [
          "furnished_status",
          "furnishing_status",
        ]);

        if (!isMounted) return;

        setLiveFilterOptions({
          locations: [...localityMap.values()],
          properties,
          beds,
          construction_status,
          furnished_status,
        });
      } catch (error) {
        console.log("Location fetch failed", error);
      }
    };

    fetchFilterOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFullscreenToggle = () => {
    navigate("/aisearch");
  };

  const handleBackHome = () => {
    navigate("/");
  };

  const addSearchDetail = (detail) => {
    const nextDetail = normalizeFilterText(detail);

    if (!nextDetail) return;

    setAiQuery((currentQuery) => {
      const current = currentQuery.trim();
      const normalizedCurrent = current.toLowerCase();

      if (normalizedCurrent.includes(nextDetail.toLowerCase())) {
        return current;
      }

      return current ? `${current} ${nextDetail}` : nextDetail;
    });
  };

  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition || isListening) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      addSearchDetail(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handlePointerMove = (event) => {
    if (!sectionRef.current) return;

    const rect = sectionRef.current.getBoundingClientRect();

    dots.forEach((dot, index) => {
      const node = dotRefs.current[index];

      if (!node) return;

      const dotX = (dot.x / 100) * rect.width;
      const dotY = (dot.y / 100) * rect.height;

      const dx = event.clientX - rect.left - dotX;
      const dy = event.clientY - rect.top - dotY;

      const distance = Math.hypot(dx, dy) || 1;

      const influence = Math.max(0, 1 - distance / 320);

      const offsetX = (dx / distance) * influence * dot.pull;
      const offsetY = (dy / distance) * influence * dot.pull;

      const scale = 1 + influence * 1.15;

      node.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
      node.style.opacity = `${Math.min(dot.opacity + influence * 0.55, 1)}`;
    });
  };

  const handlePointerLeave = () => {
    dotRefs.current.forEach((node, index) => {
      if (!node) return;

      node.style.transform = "translate(0px, 0px) scale(1)";
      node.style.opacity = `${dots[index].opacity}`;
    });
  };

  const handleQuickFilterSearch = (label, filters) => {
    if (!label) return;

    setAiQuery(label);

    navigate("/properties", {
      state: {
        heading: "AI Search Results",
        subtitle: `Showing results for "${label}"`,
        aiQuery: label,
        filters: {
          paginate: 1,
          ...filters,
        },
      },
    });
  };

  const parseAiQuery = (query) => {
    const lowerQuery = query.toLowerCase().trim();
    const compactQuery = lowerQuery.replace(/\s+/g, "");
    const queryTokens = getQueryTokens(query);

    const filters = {
      paginate: 1,
    };

    if (lowerQuery.includes("plot") || lowerQuery.includes("land")) {
      filters.property_type = "Plot";
    }

    if (lowerQuery.includes("villa")) {
      filters.property_type = "Villa";
    }

    if (lowerQuery.includes("flat") || lowerQuery.includes("apartment")) {
      filters.property_type = "Apartment";
    }

    if (lowerQuery.includes("house")) {
      filters.property_type = "Individual House";
    }

    if (compactQuery.includes("1bhk")) {
      filters.beds = [1];
    }

    if (compactQuery.includes("2bhk")) {
      filters.beds = [2];
    }

    if (compactQuery.includes("3bhk")) {
      filters.beds = [3];
    }

    if (compactQuery.includes("4bhk")) {
      filters.beds = [4];
    }

    if (compactQuery.includes("5bhk")) {
      filters.beds = [5];
    }

    const foundLocations = liveLocations.filter(
      (loc) =>
        loc.toLowerCase().includes(lowerQuery) ||
        lowerQuery.includes(loc.toLowerCase())
    );

    if (foundLocations.length > 0) {
      filters.search = foundLocations;
    }

    const convertBudgetToPaise = (amount, unit) => {
      let actualAmount = amount;

      if (["l", "lac", "lakh"].includes(unit)) {
        actualAmount = amount * 100000;
      }

      if (["cr", "crore"].includes(unit)) {
        actualAmount = amount * 10000000;
      }

      return actualAmount;
    };

    const aboveBudgetMatch = lowerQuery.match(
      /(above|more than|greater than|over|at least|minimum|min)\s?(\d+)\s?(l|lac|lakh|cr|crore)/i
    );

    const underBudgetMatch = lowerQuery.match(
      /(under|below|within|up to|upto|less than|max(?:imum)?)(?:\s+price)?\s?(\d+)\s?(l|lac|lakh|cr|crore)/i
    );

    const trailingUnderBudgetMatch = lowerQuery.match(
      /(\d+)\s?(l|lac|lakh|cr|crore)?\s*(smaller than|less than|under|below|within|up to|upto|max(?:imum)?)\b/i
    );

    const budgetMatch = lowerQuery.match(/(\d+)\s?(l|lac|lakh|cr|crore)/i);

    if (aboveBudgetMatch) {
      const amount = Number(aboveBudgetMatch[2]);
      const unit = aboveBudgetMatch[3].toLowerCase();
      const minPrice = convertBudgetToPaise(amount, unit);
      filters.min_price = minPrice;
    } else if (underBudgetMatch) {
      const amount = Number(underBudgetMatch[2]);
      const unit = underBudgetMatch[3].toLowerCase();
      const maxPrice = convertBudgetToPaise(amount, unit);
      filters.ai_max_budget = maxPrice;
      filters.max_price = maxPrice;
    } else if (trailingUnderBudgetMatch) {
      const amount = Number(trailingUnderBudgetMatch[1]);
      const unit = (trailingUnderBudgetMatch[2] || "l").toLowerCase();
      const maxPrice = convertBudgetToPaise(amount, unit);
      filters.ai_max_budget = maxPrice;
      filters.max_price = maxPrice;
    } else if (budgetMatch) {
      const amount = Number(budgetMatch[1]);
      const unit = budgetMatch[2].toLowerCase();
      const maxPrice = convertBudgetToPaise(amount, unit);
      filters.ai_max_budget = maxPrice;
      filters.max_price = maxPrice;
    }

    const sqftMatch = lowerQuery.match(/(\d+)\s?(sqft|sq\.ft|square feet)/i);

    if (sqftMatch) {
      const sqft = Number(sqftMatch[1]);
      filters.ai_max_sqft = sqft;
    }

    if (lowerQuery.includes("furnished")) {
      filters.furnished_status = ["Furnished"];
    }

    if (lowerQuery.includes("semi furnished")) {
      filters.furnished_status = ["Semi Furnished"];
    }

    if (lowerQuery.includes("unfurnished")) {
      filters.furnished_status = ["Unfurnished"];
    }

    if (lowerQuery.includes("ready to move")) {
      filters.construction_status = ["Ready To Move"];
    }

    if (lowerQuery.includes("under construction")) {
      filters.construction_status = ["Under Construction"];
    }

    if (lowerQuery.includes("new launch")) {
      filters.construction_status = ["New Launch"];
    }

    const hasStructuredFilters = Boolean(
      filters.property_type ||
      filters.beds?.length ||
      filters.search?.length ||
      filters.construction_status?.length ||
      filters.furnished_status?.length ||
      filters.min_price ||
      filters.max_price ||
      filters.ai_max_budget ||
      filters.area_min ||
      filters.area_max ||
      filters.ai_max_sqft
    );

    if (
      queryTokens.length > 0 &&
      liveFilterOptions.properties.length > 0 &&
      !hasStructuredFilters
    ) {
      const scoredMatches = liveFilterOptions.properties
        .map((item) => {
          const title = normalizeFilterText(getPropertyTitle(item)).toLowerCase();
          const locationText = extractLocationValue(item).join(" ").toLowerCase();
          const searchableText = buildPropertySearchText(item);
          const matchedTokens = queryTokens.filter((token) => searchableText.includes(token));
          const exactTitleMatch = title && lowerQuery.includes(title);
          const exactLocationMatch = locationText && lowerQuery.includes(locationText);
          const score =
            matchedTokens.length +
            (exactTitleMatch ? 4 : 0) +
            (exactLocationMatch ? 2 : 0);

          return {
            id: item?.id,
            title: getPropertyTitle(item),
            score,
          };
        })
        .filter((item) => item.id && item.score > 0)
        .sort((a, b) => b.score - a.score);

      const strongestScore = scoredMatches[0]?.score ?? 0;
      const matchedProperties = scoredMatches
        .filter((item) => item.score >= Math.max(1, strongestScore - 1))
        .slice(0, 60);

      if (matchedProperties.length > 0) {
        filters.ai_matched_ids = matchedProperties.map((item) => item.id);
        filters.ai_matched_titles = matchedProperties
          .map((item) => item.title)
          .filter(Boolean)
          .slice(0, 8);
        filters.ai_match_summary = `${matchedProperties.length} website matches found`;
      }
    }

    return filters;
  };

  const handleSearch = (customQuery) => {
    const finalQuery = customQuery || aiQuery;

    if (!finalQuery.trim()) return;

    const filters = parseAiQuery(finalQuery);

    navigate("/properties", {
      state: {
        heading: "AI Search Results",
        subtitle: `Showing results for "${finalQuery}"`,
        aiQuery: finalQuery,
        filters,
      },
    });
  };

  return (
    <>
      <Seo />
      <section
        id="ai-search"
        className="ai-search-section"
        ref={sectionRef}
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
      >
        <div className="ai-search-dots" aria-hidden="true">
          {dots.map((dot, index) => (
            <span
              key={dot.id}
              ref={(node) => {
                dotRefs.current[index] = node;
              }}
              className="ai-search-dot"
              style={{
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                width: `${dot.size}px`,
                height: `${dot.size}px`,
                opacity: dot.opacity,
                background: dot.color,
              }}
            />
          ))}
        </div>

        <div className="ai-search-actions">
          {showBackButton ? (
            <button
              type="button"
              className="ai-search-back-btn"
              onClick={handleBackHome}
              aria-label="Back to home"
            >
              <span aria-hidden="true">&larr;</span>
              <span>Home</span>
            </button>
          ) : null}

          <button
            type="button"
            className="ai-search-fullscreen-btn"
            onClick={handleFullscreenToggle}
            aria-label="Open AI Search"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M9 4H5v4M15 4h4v4M9 20H5v-4M19 20h-4v-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="ai-search-hero">
          <span className="ai-search-kicker">Homewala AI Search</span>
          <h2 className="ai-search-title">Find Your Dream Home with AI</h2>

          <p className="ai-search-subtitle">
            Ask anything. Smart search powered experience.
          </p>

          <div className="ai-search-box">
            <div className="ai-search-input-row">
              <span className="ai-search-spark" aria-hidden="true"></span>
              <input
                type="text"
                aria-label="Ask Homewala AI"
                placeholder="Plots in Tambaram"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />

              <button
                type="button"
                className={`ai-search-icon-btn${isListening ? " is-active" : ""}`}
                aria-label="Use voice search"
                aria-pressed={isListening}
                onClick={handleVoiceInput}
              >
                <FaMicrophone />
              </button>

              <button
                type="button"
                className="ai-search-submit"
                onClick={() => handleSearch()}
                aria-label="Search properties"
              >
                <FaSearch />
              </button>
            </div>
          </div>

          <div className="ai-search-suggestions">
            {suggestions.map((item) => (
              <span
                key={item}
                role="button"
                tabIndex={0}
                onClick={() => {
                  handleQuickFilterSearch(item, parseAiQuery(item));
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleQuickFilterSearch(item, parseAiQuery(item));
                  }
                }}
              >
                {item}
              </span>
            ))}
          </div>

        </div>
      </section>
    </>
  );
};

export default Aisearch;
