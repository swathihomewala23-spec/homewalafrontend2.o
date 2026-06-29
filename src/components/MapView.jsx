import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSearch, FaList, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import { api } from "../axiosConfig";
import { setToggleView, setPropertiesList } from "../features/BasicSlice";
import { buildPropertyUrl, getPropertyUrlParams } from "../utils/propertyUrl";
import { extractProjectLocations } from "../utils/projectLocations";
import "./MapView.css";

// ─── helpers ──────────────────────────────────────────────────────────────────

const debounce = (fn, delay) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
};

const getPropertyLocation = (item) =>
  item?.location || item?.property_area || item?.project_location ||
  item?.locality || item?.address || item?.city || "";

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

const normalizeText = (value) =>
  String(value ?? "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const getPropertyTitle = (item) =>
  item?.title || item?.property_name || item?.project_name ||
  item?.property_title || item?.name || item?.project_title || "Property";

const getPropertyPrice = (item) =>
  item?.priceRange || item?.price || item?.min_price ||
  item?.starting_price || item?.project_price || "Contact";

const getPropertyImage = (item) =>
  item?.mainImage || item?.image_url || item?.image ||
  "https://via.placeholder.com/900x600";

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

const normalizePropertyType = (value) => {
  const text = normalizeText(value);
  if (!text) return "";
  if (text.includes("apartment") || text.includes("flat")) return "apartment";
  if (text.includes("villa")) return "villa";
  if (text.includes("plot") || text.includes("land")) return "plot";
  if (text.includes("individual house") || text.includes("house")) return "individual house";
  return text;
};

const normalizeLocationTerms = (value) =>
  String(value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

const matchesProjectSearch = (item, query) => {
  const title = normalizeText(getPropertyTitle(item));
  const search = normalizeText(query);
  if (!title || !search) return false;

  const words = search.split(/\s+/).filter(Boolean);
  if (words.length >= 3) return title === search;
  return title.includes(search);
};

const parseAmountToNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value) return null;

  const raw = String(value).replace(/[₹,]/g, "").trim();
  const match = raw.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return null;
  if (/\b(cr|crore)\b/i.test(raw)) return amount * 10000000;
  if (/\b(lac|lacs|lakh|lakhs)\b/i.test(raw) || /\bL\b/.test(raw)) return amount * 100000;
  if (/\bk\b/i.test(raw)) return amount * 1000;
  return amount;
};

const getComparablePriceRange = (item) => {
  const directMin = parseAmountToNumber(item?.min_price ?? item?.price ?? item?.starting_price ?? item?.project_price);
  const directMax = parseAmountToNumber(item?.max_price ?? item?.project_price ?? item?.price ?? item?.starting_price);

  if (directMin !== null || directMax !== null) {
    return {
      min: directMin ?? directMax,
      max: directMax ?? directMin,
    };
  }

  const raw = String(item?.priceRange ?? "").replace(/[₹,]/g, "").trim();
  const scale = /\b(cr|crore)\b/i.test(raw)
    ? 10000000
    : /\b(lac|lacs|lakh|lakhs)\b/i.test(raw) || /\bL\b/.test(raw)
      ? 100000
      : /\bk\b/i.test(raw)
        ? 1000
        : 1;
  const values = raw
    .match(/(\d+(?:\.\d+)?)/g)
    ?.map((item) => Number(item) * scale)
    .filter(Number.isFinite);

  if (!values?.length) return null;
  return { min: Math.min(...values), max: Math.max(...values) };
};

const matchesBudget = (item, budgetValue) => {
  if (!budgetValue || budgetValue === "all") return true;

  const parts = String(budgetValue).split("-");
  const minLakhs = parseInt(parts[0], 10);
  const maxLakhs = parts[1] === "plus" ? null : parseInt(parts[1], 10);
  const minPrice = Number.isNaN(minLakhs) ? undefined : minLakhs * 100000;
  const maxPrice = maxLakhs === null || Number.isNaN(maxLakhs) ? undefined : maxLakhs * 100000;
  const range = getComparablePriceRange(item);

  if (!range) return false;
  if (minPrice !== undefined && maxPrice !== undefined) {
    return Number(range.min) >= minPrice && Number(range.max) <= maxPrice;
  }
  if (minPrice !== undefined) return Number(range.max) >= minPrice;
  if (maxPrice !== undefined) return Number(range.min) <= maxPrice;
  return true;
};

// ─── component ────────────────────────────────────────────────────────────────

const MapView = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const dispatch   = useDispatch();

  // ✅ Same Redux store as PropertiesPage — no duplicate fetch if already loaded
  const { propertiesList } = useSelector((s) => s.basic);

  // ── Merged from MapComponent: react to filter.search changes ──────────────
  const filter = useSelector((s) => s.basic.filter);

  const mapDivRef        = useRef(null);  // DOM node
  const mapRef           = useRef(null);  // { map, maps }
  const markersRef       = useRef([]);    // native google.maps.Marker[]
  const infoWindowRef    = useRef(null);
  const autocompleteRef  = useRef(null);
  const geocodeCacheRef  = useRef({});
  const searchWrapperRef = useRef(null);

  const [mapReady,        setMapReady]        = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [geocoding,       setGeocoding]       = useState(false);
  const [searchValue,     setSearchValue]     = useState("");
  const [suggestions,     setSuggestions]     = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [placedCount,     setPlacedCount]     = useState(0);
  const cleanUrlParams = useMemo(() => getPropertyUrlParams(location), [location.pathname, location.search]);
  const selectedSearch = cleanUrlParams.search;
  const selectedLocation = cleanUrlParams.location;
  const selectedType = cleanUrlParams.type;
  const selectedBudget = cleanUrlParams.budget;
  const selectedDeveloper = cleanUrlParams.developer;

  useEffect(() => {
    if (!location.search) return;

    navigate(buildPropertyUrl("/map", {
      location: selectedLocation,
      search: !selectedLocation ? selectedSearch : "",
      type: selectedType,
      budget: selectedBudget,
      developer: selectedDeveloper,
    }), {
      replace: true,
      state: location.state,
    });
  }, [
    location.search,
    location.state,
    navigate,
    selectedLocation,
    selectedSearch,
    selectedType,
    selectedBudget,
    selectedDeveloper,
  ]);

  // flat array — same shape PropertiesPage uses
  const properties = useMemo(
    () => (Array.isArray(propertiesList) ? propertiesList : propertiesList?.data ?? []),
    [propertiesList]
  );

  const filteredProperties = useMemo(() => {
    let data = [...properties];

    const locationTerms = normalizeLocationTerms(selectedLocation);
    if (locationTerms.length > 0) {
      data = data.filter((item) => {
        const itemLocations = extractProjectLocations(item)
          .map(normalizeText)
          .filter(Boolean);

        return itemLocations.some((itemLocation) =>
          locationTerms.some((term) => {
            const normalizedTerm = normalizeText(term);
            return (
              itemLocation.includes(normalizedTerm) ||
              normalizedTerm.includes(itemLocation)
            );
          })
        );
      });
    }

    if (selectedSearch && !selectedLocation) {
      data = data.filter((item) => matchesProjectSearch(item, selectedSearch));
    }

    const targetType = normalizePropertyType(selectedType);
    if (targetType && targetType !== "all") {
      data = data.filter((item) => {
        const itemType = normalizePropertyType(getPropertyType(item));
        if (!itemType) return true;
        return itemType === targetType || itemType.includes(targetType) || targetType.includes(itemType);
      });
    }

    if (selectedBudget) {
      data = data.filter((item) => matchesBudget(item, selectedBudget));
    }

    if (!selectedDeveloper) return data;

    const targetDeveloper = normalizeText(selectedDeveloper);
    if (!targetDeveloper) return data;

    return data.filter((item) => {
      const itemDeveloper = normalizeText(getPropertyDeveloper(item));
      return (
        itemDeveloper === targetDeveloper ||
        itemDeveloper.includes(targetDeveloper) ||
        targetDeveloper.includes(itemDeveloper)
      );
    });
  }, [properties, selectedSearch, selectedLocation, selectedType, selectedBudget, selectedDeveloper]);

  // ── 1. fetch ALL properties (no filters) if store is empty ──────────────────
  useEffect(() => {
    if (properties.length > 0) return; // PropertiesPage already loaded them

    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await api.post("get-filtered-listview-properties", {
          paginate: 0,   // tell backend: no pagination
          per_page: 9999,
          limit: 9999,
          is_map_view: true,
          // ✅ zero filters — every property comes back
        });
        dispatch(setPropertiesList(res.data));
      } catch (err) {
        console.error("MapView fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [dispatch, properties.length]);

  // ── 2. initialise map once the div exists ───────────────────────────────────
  useEffect(() => {
    // Inject Google Maps script if not already present
    const loadGoogleMaps = () => {
      if (window.google?.maps) {
        initMap();
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
        script.onload = initMap;
        document.body.appendChild(script);
      } else {
        // If script exists but google.maps isn't ready yet
        const originalOnLoad = existingScript.onload;
        existingScript.onload = (e) => {
          if (originalOnLoad) originalOnLoad(e);
          initMap();
        };
        // Polling as a fallback just in case onload already fired
        const id = setInterval(() => {
          if (window.google?.maps) {
            clearInterval(id);
            initMap();
          }
        }, 200);
      }
    };

    const initMap = () => {
      if (!mapDivRef.current || mapReady || mapRef.current) return;
      const map = new window.google.maps.Map(mapDivRef.current, {
        center: { lat: 13.0827, lng: 80.2707 }, // Chennai
        zoom: 10,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: false,
        zoomControl: true,
        gestureHandling: "greedy",
      });
      mapRef.current = { map, maps: window.google.maps };
      setMapReady(true);

      if (window.google.maps.places) {
        autocompleteRef.current = new window.google.maps.places.AutocompleteService();
      }
    };

    loadGoogleMaps();
  }, [mapReady]);

  // ── 3. place native markers for every property ──────────────────────────────
  useEffect(() => {
    if (!mapReady) return;

    const { map, maps } = mapRef.current;
    const geocoder = new maps.Geocoder();

    // Define custom HTML overlay marker class
    class CustomHTMLMarker extends maps.OverlayView {
      constructor(position, html, onClick, mapInstance) {
        super();
        this.position = new maps.LatLng(position.lat, position.lng);
        this.html = html;
        this.onClick = onClick;
        this.setMap(mapInstance);
      }

      onAdd() {
        const div = document.createElement("div");
        div.className = "custom-property-marker";
        div.innerHTML = this.html;
        
        if (this.onClick) {
          div.addEventListener("click", (e) => {
            e.stopPropagation();
            this.onClick();
          });
        }
        
        this.div = div;
        const panes = this.getPanes();
        panes.overlayMouseTarget.appendChild(div);
      }

      draw() {
        if (!this.div) return;
        const projection = this.getProjection();
        if (!projection) return;
        const positionPixel = projection.fromLatLngToDivPixel(this.position);
        if (positionPixel) {
          this.div.style.left = positionPixel.x + "px";
          this.div.style.top = positionPixel.y + "px";
        }
      }

      onRemove() {
        if (this.div) {
          if (this.div.parentNode) {
            this.div.parentNode.removeChild(this.div);
          }
          this.div = null;
        }
      }

      getPosition() {
        return this.position;
      }
    }

    // clear previous markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (infoWindowRef.current) { infoWindowRef.current.close(); infoWindowRef.current = null; }
    setPlacedCount(0);
    setGeocoding(false);

    if (!filteredProperties.length) return;

    const bounds = new maps.LatLngBounds();
    const DELAY  = 100; // ms between geocode calls to avoid OVER_QUERY_LIMIT
    setGeocoding(true);

    // unique location strings
    const uniqueLocs = [...new Set(filteredProperties.map(getPropertyLocation).filter(Boolean))];

    const run = async () => {
      // step 1: geocode every unique location string
      for (const loc of uniqueLocs) {
        if (geocodeCacheRef.current[loc]) continue;
        await new Promise((resolve) => {
          geocoder.geocode(
            { address: `${loc}, Tamil Nadu, India` },
            (results, status) => {
              if (status === "OK" && results[0]) {
                const pos = results[0].geometry.location;
                geocodeCacheRef.current[loc] = { lat: pos.lat(), lng: pos.lng() };
              }
              setTimeout(resolve, DELAY);
            }
          );
        });
      }

      // step 2: drop a custom HTML marker for each property
      let placed = 0;
      filteredProperties.forEach((prop) => {
        const locKey = getPropertyLocation(prop);
        const cached = geocodeCacheRef.current[locKey];
        if (!cached) return;

        const position = { lat: cached.lat, lng: cached.lng };

        const html = `
          <div class="marker-home-icon">
            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 576 512" height="11" width="11" xmlns="http://www.w3.org/2000/svg">
              <path d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.06a16 16 0 0 0 16-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v99.94a16 16 0 0 0 16 16L464 480a16 16 0 0 0 16-16V300.11l-184.37-151.85zM292 27.27a24 24 0 0 0-32 0l-248 204c-12 9.87-13.73 27.7-3.86 39.7s27.7 13.73 39.7 3.86L276 89.69 508.16 280.8c12 9.87 29.83 10.14 39.7-3.86s7.87-29.83-3.86-39.7l-252-209.97z"></path>
            </svg>
          </div>
          <div class="marker-price-pill">
            ${getPropertyPrice(prop)}
          </div>
        `;

        const marker = new CustomHTMLMarker(
          position,
          html,
          () => {
            if (infoWindowRef.current) infoWindowRef.current.close();
            const iw = new maps.InfoWindow({
              content: `
                <div class="map-info-window">
                  <img class="map-info-image"
                    src="${getPropertyImage(prop)}"
                    alt="${getPropertyTitle(prop)}"
                    onerror="this.src='https://via.placeholder.com/900x600'"
                  />
                  <h4 class="map-info-title">${getPropertyTitle(prop)}</h4>
                  <p class="map-info-price">${getPropertyPrice(prop)}</p>
                  <p class="map-info-loc">${locKey}</p>
                  <button class="map-info-button"
                    onclick="window.__mvNav('${prop.id}','${encodeURIComponent(getPropertyTitle(prop))}')">
                    View Details
                  </button>
                </div>`,
              position,
            });
            iw.open(map);
            infoWindowRef.current = iw;
            map.panTo(position);
          },
          map
        );

        bounds.extend(position);
        placed++;
        markersRef.current.push(marker);
      });

      setPlacedCount(placed);

      if (placed > 1)        map.fitBounds(bounds);
      else if (placed === 1) { map.setCenter(bounds.getCenter()); map.setZoom(13); }

      setGeocoding(false);
    };

    run();
  }, [filteredProperties, mapReady]);

  // expose navigate for InfoWindow onclick
  useEffect(() => {
    window.__mvNav = (id, encoded) => {
      const slug = decodeURIComponent(encoded).toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
      navigate(`/details/${id}/${slug}`);
    };
    return () => { delete window.__mvNav; };
  }, [navigate]);

  // ── 4. click-outside → close suggestions ───────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── 5. Places autocomplete ──────────────────────────────────────────────────
  const fetchSuggestions = useMemo(
    () => debounce((input) => {
      if (!input.trim() || !autocompleteRef.current) {
        setSuggestions([]); setShowSuggestions(false); return;
      }
      setIsLoadingPlaces(true);
      autocompleteRef.current.getPlacePredictions(
        { input, componentRestrictions: { country: "IN" } },
        (preds, status) => {
          setIsLoadingPlaces(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && preds) {
            setSuggestions(preds.map((p) => ({
              place_id: p.place_id,
              main_text: p.structured_formatting.main_text,
              secondary_text: p.structured_formatting.secondary_text,
            })));
            setShowSuggestions(true);
          } else { setSuggestions([]); setShowSuggestions(false); }
        }
      );
    }, 300),
    []
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    if (val.trim()) fetchSuggestions(val);
    else { setSuggestions([]); setShowSuggestions(false); }
  };

  // ✅ Search = PAN ONLY — zero markers removed
  const panToLocation = useCallback((name) => {
    if (!mapRef.current || !name) return;
    const { map, maps } = mapRef.current;
    new maps.Geocoder().geocode(
      { address: `${name}, Tamil Nadu, India` },
      (results, status) => {
        if (status === "OK" && results[0]) {
          const pos = results[0].geometry.location;
          map.panTo({ lat: pos.lat(), lng: pos.lng() });
          map.setZoom(13);
        }
      }
    );
  }, []);

  const handleSuggestionSelect = (s) => {
    setSearchValue(s.main_text);
    setShowSuggestions(false);
    panToLocation(s.main_text);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const loc = (suggestions[0]?.main_text || searchValue).trim();
    if (!loc) { handleClearSearch(); return; }
    setShowSuggestions(false);
    panToLocation(loc);
  };

  const handleClearSearch = () => {
    setSearchValue(""); setSuggestions([]); setShowSuggestions(false);
    if (mapReady && markersRef.current.length > 0) {
      const { map, maps } = mapRef.current;
      const bounds = new maps.LatLngBounds();
      markersRef.current.forEach((m) => bounds.extend(m.getPosition()));
      map.fitBounds(bounds);
    }
  };

  const handleSwitchToList = () => {
    dispatch(setToggleView("List"));
    navigate(buildPropertyUrl("/properties", {
      location: selectedLocation,
      search: !selectedLocation ? selectedSearch : "",
      type: selectedType,
      budget: selectedBudget,
      developer: selectedDeveloper,
    }));
  };

  // ── 6. Merged from MapComponent: pan when filter.search changes ─────────────
  // filter.search is an array in Redux (e.g. ["Adyar"]). Whenever it updates
  // and the map is ready, pan to the first entry — exactly what MapComponent did,
  // but reusing the panToLocation already defined above.
  useEffect(() => {
    if (!mapReady) return;
    const loc = filter?.search?.[0];
    if (loc?.trim()) panToLocation(loc.trim());
  }, [filter?.search, mapReady, panToLocation]);

  // ── render ─────────────────────────────────────────────────────────────────

  const isBusy = loading || geocoding;
  const statusLabel = loading
    ? "Loading properties…"
    : geocoding
    ? `Placing ${filteredProperties.length} properties…`
    : `${placedCount} properties on map`;

  return (
    <div className="map-page-container">

      {/* ── floating top bar ── */}
      <div className="map-floating-controls" ref={searchWrapperRef}>
        <div className="map-controls-bar">

          <div className="map-counter-badge">
            {isBusy && <span className="map-spinner" />}
            {statusLabel}
          </div>

          <form className="map-search-wrapper" onSubmit={handleSearch}>
            <button type="submit" className="map-search-submit" aria-label="Search">
              <FaSearch size={14} />
            </button>
            <input
              className="map-search-input"
              type="text"
              placeholder="Search area, locality…"
              value={searchValue}
              onChange={handleInputChange}
              onFocus={() => suggestions.length && setShowSuggestions(true)}
            />
            {searchValue && (
              <button type="button" className="map-search-clear" onClick={handleClearSearch}>
                <FaTimes size={13} />
              </button>
            )}
          </form>

          <button className="map-view-switch-btn" onClick={handleSwitchToList}>
            <FaList size={12} /><span>List view</span>
          </button>

        </div>

        {showSuggestions && (suggestions.length > 0 || isLoadingPlaces) && (
          <div className="map-suggestions-dropdown">
            {isLoadingPlaces ? (
              <div className="map-suggestion-loading">Loading…</div>
            ) : suggestions.map((s) => (
              <button key={s.place_id} className="map-suggestion-item"
                onClick={() => handleSuggestionSelect(s)}>
                <FaMapMarkerAlt size={12} className="map-suggestion-icon" />
                <div>
                  <div className="map-suggestion-title">{s.main_text}</div>
                  <div className="map-suggestion-subtitle">{s.secondary_text}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── map canvas — Google Maps injects directly into this div ── */}
      <div ref={mapDivRef} className="map-canvas-container" />

    </div>
  );
};

export default MapView;


// import { useEffect, useRef, useState, useMemo, useCallback } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { FaSearch, FaList, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
// import { api } from "../axiosConfig";
// import { setToggleView, setPropertiesList } from "../features/BasicSlice";
// import "./MapView.css";

// // ─── helpers ──────────────────────────────────────────────────────────────────

// const debounce = (fn, delay) => {
//   let t;
//   return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
// };

// const getPropertyLocation = (item) =>
//   item?.location || item?.property_area || item?.project_location ||
//   item?.locality || item?.address || item?.city || "";

// const getPropertyTitle = (item) =>
//   item?.title || item?.property_name || item?.project_name ||
//   item?.property_title || item?.name || item?.project_title || "Property";

// const getPropertyPrice = (item) =>
//   item?.priceRange || item?.price || item?.min_price ||
//   item?.starting_price || item?.project_price || "Contact";

// const getPropertyImage = (item) =>
//   item?.mainImage || item?.image_url || item?.image ||
//   "https://via.placeholder.com/900x600";

// // ─── component ────────────────────────────────────────────────────────────────

// const MapView = () => {
//   const navigate   = useNavigate();
//   const dispatch   = useDispatch();

//   // ✅ Same Redux store as PropertiesPage — no duplicate fetch if already loaded
//   const { propertiesList } = useSelector((s) => s.basic);

//   // ── Merged from MapComponent: react to filter.search changes ──────────────
//   const filter = useSelector((s) => s.basic.filter);

//   const mapDivRef        = useRef(null);  // DOM node
//   const mapRef           = useRef(null);  // { map, maps }
//   const markersRef       = useRef([]);    // native google.maps.Marker[]
//   const infoWindowRef    = useRef(null);
//   const autocompleteRef  = useRef(null);
//   const geocodeCacheRef  = useRef({});
//   const searchWrapperRef = useRef(null);

//   const [mapReady,        setMapReady]        = useState(false);
//   const [loading,         setLoading]         = useState(false);
//   const [geocoding,       setGeocoding]       = useState(false);
//   const [searchValue,     setSearchValue]     = useState("");
//   const [suggestions,     setSuggestions]     = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
//   const [placedCount,     setPlacedCount]     = useState(0);

//   // flat array — same shape PropertiesPage uses
//   const properties = useMemo(
//     () => (Array.isArray(propertiesList) ? propertiesList : propertiesList?.data ?? []),
//     [propertiesList]
//   );

//   // ── 1. fetch ALL properties (no filters) if store is empty ──────────────────
//   useEffect(() => {
//     if (properties.length > 0) return; // PropertiesPage already loaded them

//     const fetchAll = async () => {
//       setLoading(true);
//       try {
//         const res = await api.post("get-filtered-listview-properties", {
//           paginate: 0,   // tell backend: no pagination
//           per_page: 9999,
//           limit: 9999,
//           is_map_view: true,
//           // ✅ zero filters — every property comes back
//         });
//         dispatch(setPropertiesList(res.data));
//       } catch (err) {
//         console.error("MapView fetch error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAll();
//   }, [dispatch]); // mount-only

//   // ── 2. initialise map once the div exists ───────────────────────────────────
//   useEffect(() => {
//     // Inject Google Maps script if not already present
//     const loadGoogleMaps = () => {
//       if (window.google?.maps) {
//         initMap();
//         return;
//       }
      
//       const existingScript = document.getElementById("google-map-script");
//       if (!existingScript) {
//         const script = document.createElement("script");
//         script.id = "google-map-script";
//         script.src = `https://maps.googleapis.com/maps/api/js?key=${
//           import.meta.env.VITE_GOOGLE_MAP_API_KEY
//         }&libraries=places`;
//         script.async = true;
//         script.defer = true;
//         script.onload = initMap;
//         document.body.appendChild(script);
//       } else {
//         // If script exists but google.maps isn't ready yet
//         const originalOnLoad = existingScript.onload;
//         existingScript.onload = (e) => {
//           if (originalOnLoad) originalOnLoad(e);
//           initMap();
//         };
//         // Polling as a fallback just in case onload already fired
//         const id = setInterval(() => {
//           if (window.google?.maps) {
//             clearInterval(id);
//             initMap();
//           }
//         }, 200);
//       }
//     };

//     const initMap = () => {
//       if (!mapDivRef.current || mapReady || mapRef.current) return;
//       const map = new window.google.maps.Map(mapDivRef.current, {
//         center: { lat: 13.0827, lng: 80.2707 }, // Chennai
//         zoom: 10,
//         mapTypeControl: true,
//         fullscreenControl: true,
//         streetViewControl: false,
//         zoomControl: true,
//         gestureHandling: "greedy",
//       });
//       mapRef.current = { map, maps: window.google.maps };
//       setMapReady(true);

//       if (window.google.maps.places) {
//         autocompleteRef.current = new window.google.maps.places.AutocompleteService();
//       }
//     };

//     loadGoogleMaps();
//   }, [mapReady]);

//   // ── 3. place native markers for every property ──────────────────────────────
//   useEffect(() => {
//     if (!mapReady || !properties.length) return;

//     const { map, maps } = mapRef.current;
//     const geocoder = new maps.Geocoder();

//     // clear previous markers
//     markersRef.current.forEach((m) => m.setMap(null));
//     markersRef.current = [];
//     if (infoWindowRef.current) { infoWindowRef.current.close(); infoWindowRef.current = null; }
//     setPlacedCount(0);

//     const bounds = new maps.LatLngBounds();
//     const DELAY  = 100; // ms between geocode calls to avoid OVER_QUERY_LIMIT
//     setGeocoding(true);

//     // unique location strings
//     const uniqueLocs = [...new Set(properties.map(getPropertyLocation).filter(Boolean))];

//     const run = async () => {
//       // step 1: geocode every unique location string
//       for (const loc of uniqueLocs) {
//         if (geocodeCacheRef.current[loc]) continue;
//         await new Promise((resolve) => {
//           geocoder.geocode(
//             { address: `${loc}, Tamil Nadu, India` },
//             (results, status) => {
//               if (status === "OK" && results[0]) {
//                 const pos = results[0].geometry.location;
//                 geocodeCacheRef.current[loc] = { lat: pos.lat(), lng: pos.lng() };
//               }
//               setTimeout(resolve, DELAY);
//             }
//           );
//         });
//       }

//       // step 2: drop a native marker for each property
//       let placed = 0;
//       properties.forEach((prop) => {
//         const locKey = getPropertyLocation(prop);
//         const cached = geocodeCacheRef.current[locKey];
//         if (!cached) return;

//         const position = { lat: cached.lat, lng: cached.lng };

//         const marker = new maps.Marker({
//           map,
//           position,
//           title: getPropertyTitle(prop),
//           icon: {
//             path: maps.SymbolPath.CIRCLE,
//             scale: 8,
//             fillColor: "#007bff",
//             fillOpacity: 1,
//             strokeColor: "#ffffff",
//             strokeWeight: 2,
//           },
//         });

//         marker.addListener("click", () => {
//           if (infoWindowRef.current) infoWindowRef.current.close();
//           const iw = new maps.InfoWindow({
//             content: `
//               <div class="map-info-window">
//                 <img class="map-info-image"
//                   src="${getPropertyImage(prop)}"
//                   alt="${getPropertyTitle(prop)}"
//                   onerror="this.src='https://via.placeholder.com/900x600'"
//                 />
//                 <h4 class="map-info-title">${getPropertyTitle(prop)}</h4>
//                 <p class="map-info-price">${getPropertyPrice(prop)}</p>
//                 <p class="map-info-loc">${locKey}</p>
//                 <button class="map-info-button"
//                   onclick="window.__mvNav('${prop.id}','${encodeURIComponent(getPropertyTitle(prop))}')">
//                   View Details
//                 </button>
//               </div>`,
//             position,
//           });
//           iw.open(map);
//           infoWindowRef.current = iw;
//           map.panTo(position);
//         });

//         bounds.extend(position);
//         placed++;
//         markersRef.current.push(marker);
//       });

//       setPlacedCount(placed);

//       if (placed > 1)        map.fitBounds(bounds);
//       else if (placed === 1) { map.setCenter(bounds.getCenter()); map.setZoom(13); }

//       setGeocoding(false);
//     };

//     run();
//   }, [properties, mapReady]);

//   // expose navigate for InfoWindow onclick
//   useEffect(() => {
//     window.__mvNav = (id, encoded) => {
//       const slug = decodeURIComponent(encoded).toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
//       navigate(`/details/${id}/${slug}`);
//     };
//     return () => { delete window.__mvNav; };
//   }, [navigate]);

//   // ── 4. click-outside → close suggestions ───────────────────────────────────
//   useEffect(() => {
//     const h = (e) => {
//       if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target))
//         setShowSuggestions(false);
//     };
//     document.addEventListener("mousedown", h);
//     return () => document.removeEventListener("mousedown", h);
//   }, []);

//   // ── 5. Places autocomplete ──────────────────────────────────────────────────
//   const fetchSuggestions = useMemo(
//     () => debounce((input) => {
//       if (!input.trim() || !autocompleteRef.current) {
//         setSuggestions([]); setShowSuggestions(false); return;
//       }
//       setIsLoadingPlaces(true);
//       autocompleteRef.current.getPlacePredictions(
//         { input, componentRestrictions: { country: "IN" } },
//         (preds, status) => {
//           setIsLoadingPlaces(false);
//           if (status === window.google.maps.places.PlacesServiceStatus.OK && preds) {
//             setSuggestions(preds.map((p) => ({
//               place_id: p.place_id,
//               main_text: p.structured_formatting.main_text,
//               secondary_text: p.structured_formatting.secondary_text,
//             })));
//             setShowSuggestions(true);
//           } else { setSuggestions([]); setShowSuggestions(false); }
//         }
//       );
//     }, 300),
//     []
//   );

//   const handleInputChange = (e) => {
//     const val = e.target.value;
//     setSearchValue(val);
//     if (val.trim()) fetchSuggestions(val);
//     else { setSuggestions([]); setShowSuggestions(false); }
//   };

//   // ✅ Search = PAN ONLY — zero markers removed
//   const panToLocation = useCallback((name) => {
//     if (!mapRef.current || !name) return;
//     const { map, maps } = mapRef.current;
//     new maps.Geocoder().geocode(
//       { address: `${name}, Tamil Nadu, India` },
//       (results, status) => {
//         if (status === "OK" && results[0]) {
//           const pos = results[0].geometry.location;
//           map.panTo({ lat: pos.lat(), lng: pos.lng() });
//           map.setZoom(13);
//         }
//       }
//     );
//   }, []);

//   const handleSuggestionSelect = (s) => {
//     setSearchValue(s.main_text);
//     setShowSuggestions(false);
//     panToLocation(s.main_text);
//   };

//   const handleSearch = (e) => {
//     e.preventDefault();
//     const loc = (suggestions[0]?.main_text || searchValue).trim();
//     if (!loc) { handleClearSearch(); return; }
//     setShowSuggestions(false);
//     panToLocation(loc);
//   };

//   const handleClearSearch = () => {
//     setSearchValue(""); setSuggestions([]); setShowSuggestions(false);
//     if (mapReady && markersRef.current.length > 0) {
//       const { map, maps } = mapRef.current;
//       const bounds = new maps.LatLngBounds();
//       markersRef.current.forEach((m) => bounds.extend(m.getPosition()));
//       map.fitBounds(bounds);
//     }
//   };

//   const handleSwitchToList = () => { dispatch(setToggleView("List")); navigate("/properties"); };

//   // ── 6. Merged from MapComponent: pan when filter.search changes ─────────────
//   // filter.search is an array in Redux (e.g. ["Adyar"]). Whenever it updates
//   // and the map is ready, pan to the first entry — exactly what MapComponent did,
//   // but reusing the panToLocation already defined above.
//   useEffect(() => {
//     if (!mapReady) return;
//     const loc = filter?.search?.[0];
//     if (loc?.trim()) panToLocation(loc.trim());
//   }, [filter?.search, mapReady, panToLocation]);

//   // ── render ─────────────────────────────────────────────────────────────────

//   const isBusy = loading || geocoding;
//   const statusLabel = loading
//     ? "Loading properties…"
//     : geocoding
//     ? `Placing ${properties.length} properties…`
//     : `${placedCount} properties on map`;

//   return (
//     <div className="map-page-container">

//       {/* ── floating top bar ── */}
//       <div className="map-floating-controls" ref={searchWrapperRef}>
//         <div className="map-controls-bar">

//           <div className="map-counter-badge">
//             {isBusy && <span className="map-spinner" />}
//             {statusLabel}
//           </div>

//           <form className="map-search-wrapper" onSubmit={handleSearch}>
//             <button type="submit" className="map-search-submit" aria-label="Search">
//               <FaSearch size={14} />
//             </button>
//             <input
//               className="map-search-input"
//               type="text"
//               placeholder="Search area, locality…"
//               value={searchValue}
//               onChange={handleInputChange}
//               onFocus={() => suggestions.length && setShowSuggestions(true)}
//             />
//             {searchValue && (
//               <button type="button" className="map-search-clear" onClick={handleClearSearch}>
//                 <FaTimes size={13} />
//               </button>
//             )}
//           </form>

//           <button className="map-view-switch-btn" onClick={handleSwitchToList}>
//             <FaList size={12} /><span>List view</span>
//           </button>

//         </div>

//         {showSuggestions && (suggestions.length > 0 || isLoadingPlaces) && (
//           <div className="map-suggestions-dropdown">
//             {isLoadingPlaces ? (
//               <div className="map-suggestion-loading">Loading…</div>
//             ) : suggestions.map((s) => (
//               <button key={s.place_id} className="map-suggestion-item"
//                 onClick={() => handleSuggestionSelect(s)}>
//                 <FaMapMarkerAlt size={12} className="map-suggestion-icon" />
//                 <div>
//                   <div className="map-suggestion-title">{s.main_text}</div>
//                   <div className="map-suggestion-subtitle">{s.secondary_text}</div>
//                 </div>
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* ── map canvas — Google Maps injects directly into this div ── */}
//       <div ref={mapDivRef} className="map-canvas-container" />

//     </div>
//   );
// };

// export default MapView;
