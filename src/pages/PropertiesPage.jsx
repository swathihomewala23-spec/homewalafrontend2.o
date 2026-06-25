import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaFilter, FaList, FaMap } from "react-icons/fa";
import Seo from "../components/common/Seo";
import { api } from "../axiosConfig";
import { setPropertiesList, setToggleView } from "../features/BasicSlice";
import "./PropertiesPage.css";
import SideFilter from "../components/SideFilter";
import PropertiesSearchBox from "../components/PropertiesSearchBox";

const getPropertyTitle = (item) =>
  item?.title ||
  item?.property_name ||
  item?.project_name ||
  item?.property_title ||
  item?.name ||
  item?.project_title ||
  "Property";

const getPropertyLocation = (item) =>
  item?.location ||
  item?.property_area ||
  item?.project_location ||
  item?.locality ||
  item?.address ||
  item?.city ||
  "Location not available";

const getPropertyPrice = (item) =>
  item?.priceRange ||
  item?.price ||
  item?.min_price ||
  item?.starting_price ||
  item?.project_price ||
  "Contact for price";

const getPropertyImage = (item) =>
  item?.mainImage || item?.image_url || item?.image || "https://via.placeholder.com/900x600";

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

  "Property";

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

const getPropertyBeds = (item) =>
  item?.bhk ||
  item?.beds ||
  item?.bedrooms ||
  item?.configuration ||
  "";

const getTotalCount = (payload) =>
  payload?.total ??
  payload?.count ??
  payload?.meta?.total ??
  payload?.data?.total ??
  payload?.pagination?.total ??
  payload?.data?.count ??
  0;
const parsePriceScale = (raw) => {
  if (!raw) return 1;
  if (/\b(cr|crore)\b/i.test(raw)) return 10000000;
  if (/\b(lac|lacs|lakh|lakhs)\b/i.test(raw) || /\bL\b/.test(raw)) return 100000;
  if (/\bk\b/i.test(raw)) return 1000;
  return 1;
};


const parseAmountToNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (!value) return null;

  const raw = String(value).replace(/[₹,]/g, "").trim();
  if (!raw) return null;

  const match = raw.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;

  const amount = Number(match[1]);
  if (Number.isNaN(amount)) return null;

  if (/\b(cr|crore)\b/i.test(raw)) return amount * 10000000;
  if (/\b(lac|lacs|lakh|lakhs)\b/i.test(raw) || /\bL\b/.test(raw)) return amount * 100000;
  if (/\bk\b/i.test(raw)) return amount * 1000;

  return amount;
};

const parsePriceRange = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return { min: value, max: value };
  }

  const raw = String(value).replace(/[₹,]/g, "").trim();
  if (!raw) return null;

  const globalScale = parsePriceScale(raw);
  const parts = raw.split(/[-–—to]+/i).map((part) => part.trim()).filter(Boolean);
  const values = parts
    .map((part) => {
      // If the part contains an explicit unit, let parseAmountToNumber handle scaling.
      if (/\b(cr|crore|lac|lacs|lakh|lakhs|L|k)\b/i.test(part)) {
        return parseAmountToNumber(part);
      }

      // Try parsing as a bare number and apply globalScale detected from the whole string.
      const match = part.match(/(\d+(?:\.\d+)?)/);
      if (!match) return null;
      const amount = Number(match[1]);
      return Number.isFinite(amount) ? amount * globalScale : null;
    })
    .filter((amount) => Number.isFinite(amount));

  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { min, max };
};

const getComparablePriceRange = (item) => {
  const directMin = parseAmountToNumber(item?.min_price ?? item?.price ?? item?.starting_price ?? item?.project_price);
  const directMax = parseAmountToNumber(item?.max_price ?? item?.project_price ?? item?.price ?? item?.starting_price);

  if (directMin !== null || directMax !== null) {
    const min = directMin ?? directMax;
    const max = directMax ?? directMin;
    return { min, max };
  }

  return parsePriceRange(item?.priceRange ?? item?.price ?? item?.starting_price ?? item?.project_price ?? item?.min_price);
};

const isPriceRangeMatchingFilter = (range, minPrice, maxPrice) => {
  if (!range) return false;

  const hasMin = minPrice !== undefined && Number.isFinite(Number(minPrice));
  const hasMax = maxPrice !== undefined && Number.isFinite(Number(maxPrice));

  // When both bounds provided, require the property's reported range to be
  // fully inside the selected bounds.
  if (hasMin && hasMax) {
    return Number(range.min) >= Number(minPrice) && Number(range.max) <= Number(maxPrice);
  }

  // Only min provided: accept properties whose max is >= min (some part meets min)
  if (hasMin) {
    return Number(range.max) >= Number(minPrice);
  }

  // Only max provided: accept properties whose min is <= max (some part within max)
  if (hasMax) {
    return Number(range.min) <= Number(maxPrice);
  }

  // No bounds -> accept
  return true;
};


const getNestedValue = (item, path) =>
  path.split(".").reduce((current, key) => current?.[key], item);

const normalizeFilterText = (value) =>
  String(value ?? "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
const normalizePropertyType = (value) => {
  const text = normalizeFilterText(value);
  if (!text) return "";
  if (text.includes("apartment") || text.includes("flat")) return "apartment";
  if (text.includes("villa") || text.includes("villas") || text.includes("villa project")) return "villa";
  if (text.includes("plot") || text.includes("plots") || text.includes("land")) return "plot";
  if (text.includes("individual house") || text.includes("individual houses") || text.includes("house")) return "individual house";
  if (text.includes("residential apartment")) return "apartment";
  return text;
};

const isUsablePrice = (value, defaultValue) => {
  if (value === null || value === undefined || value === "") return false;
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return false;
  if (defaultValue !== undefined && numericValue === Number(defaultValue)) return false;
  return numericValue > 0;
};

const matchesPropertyType = (itemType, activeType) => {
  const normalizedItemType = normalizePropertyType(itemType);
  const normalizedActiveType = normalizePropertyType(activeType);

  if (!normalizedActiveType) return true;
  if (!normalizedItemType) return false;
  if (normalizedItemType === normalizedActiveType) return true;

  return (
    normalizedItemType.includes(normalizedActiveType) ||
    normalizedActiveType.includes(normalizedItemType)
  );
};


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

const parseAreaRange = (value) => {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    return { min: value, max: value };
  }

  const raw = String(value).replace(/,/g, "").trim();
  if (!raw) return null;

  const numbers = raw.match(/(\d+(?:\.\d+)?)/g)?.map(Number) ?? [];
  if (numbers.length === 0) return null;

  if (numbers.length >= 2) {
    return {
      min: numbers[0],
      max: numbers[1],
    };
  }

  return {
    min: numbers[0],
    max: numbers[0],
  };
};

const getComparableAreaRange = (item) => {
  const directMin = parseAmountToNumber(
    item?.area_min ||
      item?.min_area ||
      item?.minimum_area ||
      item?.min_sqft ||
      item?.min_square_feet ||
      item?.details?.area_min ||
      item?.details?.min_area ||
      item?.details?.minimum_area ||
      item?.details?.min_sqft ||
      item?.details?.min_square_feet
  );

  const directMax = parseAmountToNumber(
    item?.area_max ||
      item?.max_area ||
      item?.maximum_area ||
      item?.max_sqft ||
      item?.max_square_feet ||
      item?.details?.area_max ||
      item?.details?.max_area ||
      item?.details?.maximum_area ||
      item?.details?.max_sqft ||
      item?.details?.max_square_feet
  );

  if (directMin !== null || directMax !== null) {
    const min = directMin ?? directMax;
    const max = directMax ?? directMin;
    return { min, max };
  }

  const candidates = [
    item?.area,
    item?.sqft,
    item?.sq_ft,
    item?.square_feet,
    item?.squareFeet,
    item?.builtup_area,
    item?.built_up_area,
    item?.buildupArea,
    item?.buildUpArea,
    item?.details?.area,
    item?.details?.sqft,
    item?.details?.sq_ft,
    item?.details?.square_feet,
    item?.details?.squareFeet,
    item?.details?.builtup_area,
    item?.details?.built_up_area,
    item?.details?.buildupArea,
    item?.details?.buildUpArea,
    item?.details?.super_area,
    item?.details?.superArea,
    item?.details?.carpet_area,
    item?.details?.carpetArea,
    item?.floorSections?.buildUpArea,
    item?.floorSections?.buildupArea,
    item?.floorSections?.averagePrice,
    item?.super_area,
    item?.superArea,
    item?.carpet_area,
    item?.carpetArea,
  ];

  for (const candidate of candidates) {
    const range = parseAreaRange(candidate);
    if (range) return range;
  }

  return null;
};

const DEFAULT_AREA_MIN = 500;
const DEFAULT_AREA_MAX = 5000;
const DEFAULT_MIN_PRICE = 500000;
const DEFAULT_MAX_PRICE = 100000000;

const normalizeArrayFilter = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === null || value === undefined || value === "") return [];
  return [value];
};

const normalizeLocationTerms = (value) =>
  normalizeArrayFilter(value)
    .flatMap((item) =>
      String(item)
        .split(",")
        .map((part) => part.trim())
    )
    .filter(Boolean);

const normalizeSearchTokens = (value) =>
  normalizeArrayFilter(value)
    .flatMap((item) =>
      String(item)
        .replace(/[-_]+/g, " ")
        .split(/[\s,]+/)
        .map((part) => part.trim())
    )
    .filter(Boolean);

const matchesFreeTextProjectQuery = (title, query) => {
  const normalizedTitle = normalizeFilterText(title);
  const normalizedQuery = normalizeFilterText(query);

  if (!normalizedTitle || !normalizedQuery) return false;

  const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);

  if (queryWords.length >= 3) {
    return normalizedTitle === normalizedQuery;
  }

  return normalizedTitle.includes(normalizedQuery);
};


const PropertiesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { propertiesList, filter: storedFilter, viewType } = useSelector((store) => store.basic);
  const rawAiFilters = location.state?.filters || {};
  const aiMinBudget = rawAiFilters?.min_price;
  const aiMaxBudget = rawAiFilters?.ai_max_budget ?? rawAiFilters?.max_price;
  const aiMinArea = rawAiFilters?.area_min;
  const aiMaxArea = rawAiFilters?.area_max;
  const aiMatchedIds = useMemo(
    () =>
      Array.isArray(rawAiFilters?.ai_matched_ids)
        ? rawAiFilters.ai_matched_ids.map((id) => String(id))
        : [],
    [rawAiFilters?.ai_matched_ids]
  );
  const aiFilters = { ...rawAiFilters };
  const storedAreaMin = storedFilter?.area_min;
  const storedAreaMax = storedFilter?.area_max;
  const hasActiveAreaFilter =
    (aiMinArea !== undefined && aiMinArea !== null) ||
    (aiMaxArea !== undefined && aiMaxArea !== null) ||
    (storedAreaMin !== undefined &&
      storedAreaMin !== null &&
      Number(storedAreaMin) !== DEFAULT_AREA_MIN) ||
    (storedAreaMax !== undefined &&
      storedAreaMax !== null &&
      Number(storedAreaMax) !== DEFAULT_AREA_MAX);

  if (aiMaxBudget) {
    delete aiFilters.max_price;
  }
  if (aiMaxArea) {
    delete aiFilters.area_max;
  }

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  const searchParams = new URLSearchParams(location.search);
  const selectedSearch = searchParams.get("search");
  const selectedLocation = searchParams.get("location");
  const isFreeTextSearch = Boolean(selectedSearch && !selectedLocation);
  const selectedLocationTerms = useMemo(
    () => normalizeLocationTerms(selectedLocation),
    [selectedLocation]
  );
  const selectedType = searchParams.get("type");
  const selectedBudget = searchParams.get("budget");
  const selectedDeveloper = searchParams.get("developer");
  const quick = searchParams.get("quick");
  const activeRouteType = useMemo(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes("apartments")) return "Apartment";
    if (path.includes("villas")) return "Villa";
    if (path.includes("plots")) return "Plot";
    if (path.includes("individual-house")) return "Individual House";
    return "";
  }, [location.pathname]);
  const selectedPropertyType = useMemo(
    () => normalizePropertyType(selectedType || activeRouteType),
    [selectedType, activeRouteType]
  );

  const viewTypeHandleChange = (view) => {
    dispatch(setToggleView(view));
    if (view === "Map") {
      const params = new URLSearchParams();

      if (selectedLocation) {
        params.set("location", selectedLocation);
      } else if (selectedSearch) {
        params.set("search", selectedSearch);
      }

      if (selectedType) {
        params.set("type", selectedType);
      }

      if (selectedBudget) {
        params.set("budget", selectedBudget);
      }

      if (selectedDeveloper) {
        params.set("developer", selectedDeveloper);
      } else if (Array.isArray(rawAiFilters?.developer_name) && rawAiFilters.developer_name[0]) {
        params.set("developer", rawAiFilters.developer_name[0]);
      } else if (storedFilter?.developer_name?.[0]) {
        params.set("developer", storedFilter.developer_name[0]);
      }

      navigate(`/map${params.toString() ? `?${params.toString()}` : ""}`);
    }
  };

  const getHeading = () => {
    if (location.state?.heading) return location.state.heading;
    const path = location.pathname;
    if (path === "/best-deals") return "Best Deals";
    if (path === "/best-location-picks") return "Best Location Picks";
    if (path === "/luxury-homes" || path === "/luxury-homes-in-chennai") return "Luxury Homes";
    if (path === "/nri-investment") return "NRI Investment";
    if (path === "/budget-15-35-lakhs") return "Properties between 15 - 35 Lakhs";
    if (path === "/budget-35-50-lakhs") return "Properties between 35 - 50 Lakhs";
    if (path === "/budget-50-75-lakhs") return "Properties between 50 - 75 Lakhs";
    if (path === "/budget-75-lakhs-plus") return "Properties above 75 Lakhs";
    if (path.includes("apartments")) return "Apartments in Chennai";
    if (path.includes("villas")) return "Villas in Chennai";
    if (path.includes("plots")) return "Plots in Chennai";
    if (path.includes("individual-house")) return "Individual Houses in Chennai";
    if (selectedSearch) return `${selectedSearch} Properties`;
    if (selectedDeveloper) return `${selectedDeveloper} Projects`;
    if (selectedLocationTerms.length > 0) return `${selectedLocationTerms[0]} Properties`;
    if (selectedPropertyType === "apartment") return "Apartment Projects";
    if (selectedPropertyType === "villa") return "Villa Projects";
    if (selectedPropertyType === "plot") return "Plot Projects";
    if (selectedPropertyType === "individual house") return "Individual House Projects";

    return "Chennai Properties";
  };
  const heading = getHeading();
  const subtitle =
    rawAiFilters?.ai_match_summary ||
    location.state?.subtitle ||
    "Explore live properties from the database.";
  const listData = useMemo(() => (Array.isArray(propertiesList) ? propertiesList : propertiesList?.data ?? []), [propertiesList]);

  const resultList = useMemo(() => {
    if (!Array.isArray(listData)) return [];

    let data = [...listData];
    if (aiMatchedIds.length > 0) {
      const matchedIdSet = new Set(aiMatchedIds);
      data = data.filter((item) => item?.id && matchedIdSet.has(String(item.id)));
    }

    const activeSearchLocations =
      !isFreeTextSearch && normalizeLocationTerms(rawAiFilters?.search).length > 0
        ? normalizeLocationTerms(rawAiFilters?.search)
        : selectedLocationTerms.length > 0
          ? selectedLocationTerms
          : !isFreeTextSearch && normalizeLocationTerms(storedFilter?.search).length > 0
            ? normalizeLocationTerms(storedFilter?.search)
            : !isFreeTextSearch
              ? normalizeLocationTerms(storedFilter?.property_area)
              : [];
    const activeSearchPhrase = normalizeFilterText(selectedSearch);
    const activeDeveloperTerms =
      normalizeArrayFilter(rawAiFilters?.developer_name).length > 0
        ? normalizeArrayFilter(rawAiFilters?.developer_name)
        : selectedDeveloper
          ? [selectedDeveloper]
          : normalizeArrayFilter(storedFilter?.developer_name);
    const activeConstructionStatus = normalizeArrayFilter(rawAiFilters?.construction_status).length > 0
      ? normalizeArrayFilter(rawAiFilters?.construction_status)
      : normalizeArrayFilter(storedFilter?.construction_status);
    const activeFurnishedStatus = normalizeArrayFilter(rawAiFilters?.furnished_status).length > 0
      ? normalizeArrayFilter(rawAiFilters?.furnished_status)
      : normalizeArrayFilter(storedFilter?.furnished_status);
    const effectiveAreaMin =
      aiMinArea ??
      (storedAreaMin !== undefined && Number(storedAreaMin) !== DEFAULT_AREA_MIN
        ? storedAreaMin
        : undefined);
    const effectiveAreaMax =
      aiMaxArea ??
      (storedAreaMax !== undefined && Number(storedAreaMax) !== DEFAULT_AREA_MAX
        ? storedAreaMax
        : undefined);
    const effectivePriceMin =
      isUsablePrice(aiMinBudget, DEFAULT_MIN_PRICE)
        ? Number(aiMinBudget)
        : isUsablePrice(storedFilter?.min_price, DEFAULT_MIN_PRICE)
          ? Number(storedFilter.min_price)
          : undefined;
    const effectivePriceMax =
      isUsablePrice(aiMaxBudget, DEFAULT_MAX_PRICE)
        ? Number(aiMaxBudget)
        : isUsablePrice(storedFilter?.max_price, DEFAULT_MAX_PRICE)
          ? Number(storedFilter.max_price)
          : undefined;

    if (effectivePriceMin !== undefined || effectivePriceMax !== undefined) {
      const minB = effectivePriceMin !== undefined ? Number(effectivePriceMin) : undefined;
      const maxB = effectivePriceMax !== undefined ? Number(effectivePriceMax) : undefined;
      try {
        // eslint-disable-next-line no-console
        console.log("Price filter active:", { minB, maxB, originalCount: data.length });
      } catch (e) {}
      data = data.filter((item) => {
        const priceRange = getComparablePriceRange(item);
        return isPriceRangeMatchingFilter(priceRange, minB, maxB);
      });
    }

    if (effectiveAreaMin !== undefined) {
      const minArea = Number(effectiveAreaMin);
      data = data.filter((item) => {
        const areaRange = getComparableAreaRange(item);
        if (!areaRange) return false;
        return Number.isFinite(areaRange.min) ? areaRange.min >= minArea : false;
      });
    }

    if (effectiveAreaMax !== undefined) {
      const maxArea = Number(effectiveAreaMax);
      data = data.filter((item) => {
        const areaRange = getComparableAreaRange(item);
        if (!areaRange) return false;
        return Number.isFinite(areaRange.max) ? areaRange.max <= maxArea : false;
      });
    }

    if (effectiveAreaMin !== undefined || effectiveAreaMax !== undefined) {
      try {
        // eslint-disable-next-line no-console
        console.log("Area filter active:", { effectiveAreaMin, effectiveAreaMax, resultCount: data.length });
      } catch (e) {}
    }

    if (activeSearchLocations.length > 0) {
      data = data.filter((item) => {
        const itemLocation = normalizeFilterText(getPropertyLocation(item));
        if (!itemLocation) return false;
        return activeSearchLocations.some((location) => {
          const normalizedLocation = normalizeFilterText(location);
          return (
            itemLocation.includes(normalizedLocation) ||
            normalizedLocation.includes(itemLocation)
          );
        });
      });
    }

    if (activeSearchPhrase) {
      data = data.filter((item) => {
        const itemTitle = getPropertyTitle(item);
        return matchesFreeTextProjectQuery(itemTitle, activeSearchPhrase);
      });
    }

    if (activeDeveloperTerms.length > 0) {
      data = data.filter((item) => {
        const itemDeveloper = normalizeFilterText(getPropertyDeveloper(item));
        if (!itemDeveloper) return false;

        return activeDeveloperTerms.some((developer) => {
          const normalizedDeveloper = normalizeFilterText(developer);
          return (
            itemDeveloper === normalizedDeveloper ||
            itemDeveloper.includes(normalizedDeveloper) ||
            normalizedDeveloper.includes(itemDeveloper)
          );
        });
      });
    }

    if (activeConstructionStatus.length > 0) {
      data = data.filter((item) => {
        const itemStatus = normalizeFilterText(
          item?.construction_status ||
          item?.status ||
          getNestedValue(item, "details.possessionStatus") ||
          getNestedValue(item, "details.status") ||
          getNestedValue(item, "floorSections.status")
        );
        if (!itemStatus) return false;

        return activeConstructionStatus.some((status) => {
          const normalizedStatus = normalizeFilterText(status);
          return (
            itemStatus === normalizedStatus ||
            itemStatus.includes(normalizedStatus) ||
            normalizedStatus.includes(itemStatus)
          );
        });
      });
    }

    if (activeFurnishedStatus.length > 0) {
      data = data.filter((item) => {
        const itemStatus = normalizeFilterText(
          item?.furnished_status ||
          item?.furnishing_status ||
          getNestedValue(item, "details.furnishing") ||
          getNestedValue(item, "details.furnishingStatus")
        );
        if (!itemStatus) return false;

        return activeFurnishedStatus.some((status) => {
          const normalizedStatus = normalizeFilterText(status);
          return (
            itemStatus === normalizedStatus ||
            itemStatus.includes(normalizedStatus) ||
            normalizedStatus.includes(itemStatus)
          );
        });
      });
    }

    const typeValue =
      selectedPropertyType ||
      rawAiFilters?.property_type ||
      storedFilter?.property_type ||
      storedFilter?.properyType;

    const normalizedType = normalizePropertyType(typeValue);

    if (normalizedType && normalizedType !== "all") {
      data = data.filter((item) => {
        const itemType = getPropertyType(item);
        const normalizedItemType = normalizePropertyType(itemType);
        if (!normalizedItemType || normalizedItemType === "property") return true;
        return matchesPropertyType(normalizedItemType, normalizedType);
      });
    }

    return data;
  }, [
    propertiesList,
    aiMatchedIds,
    rawAiFilters?.search,
    rawAiFilters?.property_type,
    rawAiFilters?.developer_name,
    rawAiFilters?.construction_status,
    rawAiFilters?.furnished_status,
    aiMinArea,
    aiMaxArea,
    storedAreaMin,
    storedAreaMax,
    storedFilter?.min_price,
    storedFilter?.max_price,
    selectedLocationTerms,
    selectedDeveloper,
    selectedType,
    activeRouteType,
    selectedPropertyType,
    storedFilter?.search,
    storedFilter?.property_area,
    storedFilter?.developer_name,
    storedFilter?.property_type,
    storedFilter?.properyType,
    storedFilter?.construction_status,
    selectedLocationTerms,
    selectedSearch,
    selectedType,
    storedFilter?.search,
    storedFilter?.property_area,
    storedFilter?.property_type,
    storedFilter?.properyType,
    storedFilter?.construction_status,
    storedFilter?.furnished_status,
  ]);

  const hasActivePriceFilter =
    isUsablePrice(aiMinBudget, DEFAULT_MIN_PRICE) ||
    isUsablePrice(aiMaxBudget, DEFAULT_MAX_PRICE) ||
    isUsablePrice(storedFilter?.min_price, DEFAULT_MIN_PRICE) ||
    isUsablePrice(storedFilter?.max_price, DEFAULT_MAX_PRICE);

  const effectiveTotalCount = resultList.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotalCount / itemsPerPage));

const paginatedList = useMemo(() => {
  if (!Array.isArray(resultList)) return [];

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return [...resultList].slice(startIndex, endIndex);
}, [currentPage, resultList, itemsPerPage]);

  const handleViewDetails = (item) => {
    if (!item?.id) return;
    const slug = getPropertyTitle(item)
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    navigate(`/details/${item.id}/${slug}`);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLocation, selectedSearch, selectedType, selectedBudget, selectedDeveloper, quick, storedFilter]);

  useEffect(() => {
    setSearchQuery(selectedSearch ?? selectedLocation ?? selectedDeveloper ?? "");
  }, [selectedSearch, selectedLocation, selectedDeveloper]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 720px)");

    const handleChange = (event) => {
      if (!event.matches) {
        setIsFiltersOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!isFiltersOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsFiltersOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFiltersOpen]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const target = document.querySelector(".properties-layout");
    if (target) {
      const topOffset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const filters = {
          paginate: 1,
          per_page: 1000,
        };
// ======================
// AI FILTERS
// ======================

const aiFilters = location.state?.filters;

const sidebarBeds = storedFilter?.beds;
const sidebarConstructionStatus = storedFilter?.construction_status;
const sidebarFurnishedStatus = storedFilter?.furnished_status;

if (aiFilters?.property_type) {
  filters.property_type =
    aiFilters.property_type;
}

if (aiFilters?.search) {
  filters.search = aiFilters.search;
}

if (aiFilters?.developer_name) {
  filters.developer_name = aiFilters.developer_name;
}

if (aiFilters?.beds) {
  filters.beds = aiFilters.beds;
}

if (!filters.beds?.length && Array.isArray(sidebarBeds) && sidebarBeds.length > 0) {
  filters.beds = sidebarBeds;
}

if (aiFilters?.construction_status) {
  filters.construction_status =
    aiFilters.construction_status;
}

if (
  !filters.construction_status?.length &&
  Array.isArray(sidebarConstructionStatus) &&
  sidebarConstructionStatus.length > 0
) {
  filters.construction_status = sidebarConstructionStatus;
}

if (aiFilters?.furnished_status) {
  filters.furnished_status =
    aiFilters.furnished_status;
}

if (
  !filters.furnished_status?.length &&
  Array.isArray(sidebarFurnishedStatus) &&
  sidebarFurnishedStatus.length > 0
) {
  filters.furnished_status = sidebarFurnishedStatus;
}

// IMPORTANT
// Keep AI budget searches client-side so we can compare against the parsed
// property minimum price for both "40lac and above" and "under 40lac" queries.
if (isUsablePrice(aiMaxBudget, DEFAULT_MAX_PRICE)) {
  filters.ai_max_budget = aiMaxBudget;
  filters.max_price = aiMaxBudget;
}
if (isUsablePrice(aiMinBudget, DEFAULT_MIN_PRICE)) {
  filters.min_price = aiMinBudget;
}

        if (aiMinArea) {
          filters.area_min = aiMinArea;
        }

        if (aiMaxArea) {
          filters.area_max = aiMaxArea;
        }

        // Merge AI filters
        Object.assign(filters, aiFilters);
        delete filters.ai_matched_ids;
        delete filters.ai_matched_titles;
        delete filters.ai_match_summary;

        const locationTerms =
          selectedLocationTerms.length > 0
            ? selectedLocationTerms
            : !isFreeTextSearch && normalizeLocationTerms(storedFilter?.search).length > 0
              ? normalizeLocationTerms(storedFilter?.search)
              : !isFreeTextSearch
                ? normalizeLocationTerms(storedFilter?.property_area)
                : [];

        if (locationTerms.length > 0) {
          filters.search = locationTerms;
          filters.property_area = locationTerms;
        }
        if (selectedDeveloper) {
          filters.developer_name = [selectedDeveloper];
        } else if (Array.isArray(storedFilter?.developer_name) && storedFilter.developer_name.length > 0) {
          filters.developer_name = storedFilter.developer_name;
        }
        if (selectedPropertyType) {
          filters.property_type = selectedPropertyType;
        }

        const budgetValue =
  selectedBudget ||
  aiFilters?.budget ||
  storedFilter?.budget;

        let pathTopPick = null;
        if (location.pathname === "/best-deals") pathTopPick = "Best Deals";
        else if (location.pathname === "/best-location-picks") pathTopPick = "Best Location Picks";
        else if (location.pathname === "/luxury-homes" || location.pathname === "/luxury-homes-in-chennai") pathTopPick = "Luxury Homes";
        else if (location.pathname === "/nri-investment") pathTopPick = "NRI Investment";

        const topPickValue = pathTopPick || storedFilter?.top_pick;



        if (!filters.beds?.length && Array.isArray(storedFilter?.beds) && storedFilter.beds.length > 0) {
          filters.beds = storedFilter.beds;
        }

        if (
          !filters.construction_status?.length &&
          Array.isArray(storedFilter?.construction_status) &&
          storedFilter.construction_status.length > 0
        ) {
          filters.construction_status = storedFilter.construction_status;
        }

        if (
          !filters.furnished_status?.length &&
          Array.isArray(storedFilter?.furnished_status) &&
          storedFilter.furnished_status.length > 0
        ) {
          filters.furnished_status = storedFilter.furnished_status;
        }

        if (topPickValue && topPickValue !== "all") {
          filters.top_pick = topPickValue;
        }

        const hasCustomSidebarPrice =
          (storedFilter?.min_price && Number(storedFilter.min_price) !== DEFAULT_MIN_PRICE) ||
          (storedFilter?.max_price && Number(storedFilter.max_price) !== DEFAULT_MAX_PRICE);

        if (location.pathname === "/budget-15-35-lakhs") {
          filters.min_price = 1500000;
          filters.max_price = 3499999;
        } else if (location.pathname === "/budget-35-50-lakhs") {
          filters.min_price = 3500000;
          filters.max_price = 4999999;
        } else if (location.pathname === "/budget-50-75-lakhs") {
          filters.min_price = 5000000;
          filters.max_price = 7499999;
        } else if (location.pathname === "/budget-75-lakhs-plus") {
          filters.min_price = 7500000;
          filters.max_price = 999999999;
        } else if (hasCustomSidebarPrice) {
          if (storedFilter?.min_price && Number(storedFilter.min_price) !== DEFAULT_MIN_PRICE) {
            filters.min_price = storedFilter.min_price;
          }
          if (storedFilter?.max_price && Number(storedFilter.max_price) !== DEFAULT_MAX_PRICE) {
            filters.max_price = storedFilter.max_price;
          }
        } else if (budgetValue && budgetValue !== "all") {
          const parts = budgetValue.split("-");
          const minLakhs = parseInt(parts[0], 10);
          const maxLakhs = parts[1] === "plus" ? null : parseInt(parts[1], 10);

          if (!Number.isNaN(minLakhs)) {
            filters.min_price = minLakhs * 100000;
          }

          if (maxLakhs !== null && !Number.isNaN(maxLakhs)) {
            filters.max_price = maxLakhs * 100000;
          }
        } else if (aiFilters?.min_price) {
          filters.min_price = aiFilters.min_price;
        }

        if (aiFilters?.area_min && aiFilters.area_min !== DEFAULT_AREA_MIN) {
          filters.area_min = aiFilters.area_min;
        } else if (storedAreaMin && storedAreaMin !== DEFAULT_AREA_MIN) {
          filters.area_min = storedAreaMin;
        }

        if (aiFilters?.area_max && aiFilters.area_max !== DEFAULT_AREA_MAX) {
          filters.area_max = aiFilters.area_max;
        } else if (storedAreaMax && storedAreaMax !== DEFAULT_AREA_MAX) {
          filters.area_max = storedAreaMax;
        }

        if (quick) {
          filters.quick = quick;
        }

        const res = await api.post("get-filtered-listview-properties", filters);
        dispatch(setPropertiesList(res.data));
      } catch (error) {
        console.error("Failed to fetch properties:", error);
        dispatch(setPropertiesList({ data: [] }));
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
   }, [dispatch, selectedLocation, selectedType, selectedBudget, quick, storedFilter, location.pathname, activeRouteType]);

  return (
    <>
      <Seo />
      <main className="properties-page-shell">
        
        <section className="properties-layout">
          {isFiltersOpen ? (
            <button
              type="button"
              className="properties-filters-overlay"
              aria-label="Close filters"
              onClick={() => setIsFiltersOpen(false)}
            />
          ) : null}

          <SideFilter isFiltersOpen={isFiltersOpen} setIsFiltersOpen={setIsFiltersOpen} />

          <section className="properties-results">
            <div className="properties-results-head">
              <div>
                <h2>
                  {loading
                    ? "Loading properties..."
                    : effectiveTotalCount
                      ? `Showing ${effectiveTotalCount} properties`
                      : "Showing 0 properties"}
                </h2>
              </div>
              <div className="properties-results-head-actions">
                <button
                  type="button"
                  className="properties-filter-launcher"
                  onClick={() => setIsFiltersOpen(true)}
                >
                  <FaFilter />
                  Filters
                </button>
              </div>
            </div>

            <div className="properties-results-toolbar">
              <PropertiesSearchBox value={searchQuery} onChange={setSearchQuery} />
              <div className="properties-view-toggle" role="tablist" aria-label="Property view mode">
                <button
                  type="button"
                  onClick={() => viewTypeHandleChange("List")}
                  className={`properties-view-btn ${viewType === "List" || !viewType ? "is-active" : ""}`}
                >
                  <FaList className="mr-2" /> List
                </button>
                <button
                  type="button"
                  onClick={() => viewTypeHandleChange("Map")}
                  className={`properties-view-btn ${viewType === "Map" ? "is-active" : ""}`}
                >
                  <FaMap className="mr-2" /> Map
                </button>
              </div>
            </div>

            <div className="properties-grid">
            {loading ? (
              <p>Loading...</p>
            ) : paginatedList.length > 0 ? (
              paginatedList.map((item) => (
                  <article
                    className="property-card"
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleViewDetails(item)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleViewDetails(item);
                      }
                    }}
                  >
                    <div className="property-card-image">
                      <img
                        src={getPropertyImage(item)}
                        alt={getPropertyTitle(item)}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleViewDetails(item);
                        }}
                      />
                      <span className="property-card-chip">{getPropertyType(item)}</span>
                    </div>
                    <div className="property-card-body">
                      <div className="property-card-price-row">
                        <strong>{getPropertyPrice(item)}</strong>
                        {getPropertyBeds(item) ? (
                          <span className="property-card-badge">{getPropertyBeds(item)}</span>
                        ) : null}
                      </div>
                      <h3
                        onClick={(event) => {
                          event.stopPropagation();
                          handleViewDetails(item);
                        }}
                      >
                        {getPropertyTitle(item)}
                      </h3>
                      <p className="property-card-location">{getPropertyLocation(item)}</p>
                      <div className="property-card-actions">
                        
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <p>No properties found</p>
              )}
            </div>
            {!loading && resultList.length > 0 ? (
              <div className="properties-pagination">
                <button
                  type="button"
                  className="properties-page-btn"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="properties-page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="properties-page-btn"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            ) : null}
          </section>
        </section>
      </main>
    </>
  );
};

export default PropertiesPage;
