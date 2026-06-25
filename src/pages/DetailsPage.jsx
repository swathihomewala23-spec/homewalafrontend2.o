import { useEffect, useMemo, useState } from "react";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { AiFillHeart } from "react-icons/ai";
import {
  FaChevronLeft,
  FaChevronRight,
  FaFileAlt,
  FaFileExcel,
  FaFilePdf,
  FaFileWord,
  FaMapMarkerAlt,
  FaShareAlt,
} from "react-icons/fa";
import { IoMdCall, IoMdDownload } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import Seo from "../components/common/Seo";
import { api } from "../axiosConfig";
import { setIsNavbarModalOpen } from "../features/BasicSlice";
import "./DetailsPage.css";

const safeArray = (value) => (Array.isArray(value) ? value : []);

const getTitle = (item) =>
  item?.title || item?.property_name || item?.project_name || "Untitled Property";

const getLocation = (item) =>
  item?.location || item?.property_area || item?.city || "Location not available";

const getPrice = (item) =>
  item?.priceRange || item?.price || item?.min_price || "Contact for price";

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

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Math.round(value || 0));

const formatRupees = (value) => `₹ ${formatCurrency(value)}`;

const formatLakhs = (value) => {
  if (!Number.isFinite(value)) return "₹ 0 Lakhs";
  if (value >= 100) {
    const cr = value / 100;
    return `₹ ${cr.toFixed(cr % 1 === 0 ? 0 : 1)} Cr`;
  }

  return `₹ ${value.toFixed(value >= 10 ? 0 : 1)} Lakhs`;
};

const getImage = (item) =>
  item?.mainImage || item?.image_url || item?.image || "https://via.placeholder.com/1200x800";

const getGallery = (item) => {
  const gallery = safeArray(item?.gallery);
  if (gallery.length > 0) return gallery;
  return getImage(item) ? [getImage(item)] : [];
};

const getHighlights = (item) =>
  safeArray(item?.highlights).length > 0
    ? safeArray(item.highlights)
    : item?.postHighlights
      ? []
      : [];

const getAmenities = (item) => safeArray(item?.propertyAmenities);

const getAmenityIcon = (amenity) =>
  amenity?.icon || amenity?.icon_url || amenity?.image || amenity?.image_url || "";

const renderAmenityIcon = (amenity) => {
  const icon = getAmenityIcon(amenity);
  const alt = amenity?.name || amenity?.title || "Amenity";

  if (!icon) {
    return <img src={getImage({})} alt={alt} className="w-10 h-10 object-contain" />;
  }

  if (typeof icon === "string") {
    const trimmed = icon.trim();
    const svgContent = trimmed.includes("/amenity_icons/")
      ? trimmed.split("/amenity_icons/")[1] || ""
      : trimmed;

    if (svgContent.includes("<svg")) {
      return (
        <span
          className="details-amenity-svg"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      );
    }

    return (
      <img
        src={resolveMediaUrl(trimmed)}
        alt={alt}
        className="w-10 h-10 object-contain"
        onError={(event) => {
          event.currentTarget.src = getImage({});
        }}
      />
    );
  }

  return <img src={getImage({})} alt={alt} className="w-10 h-10 object-contain" />;
};

const getFaqs = (item) => safeArray(item?.faqs);

const getFloorImages = (item) => {
  const floorImages = safeArray(item?.floorSections?.images);
  if (floorImages.length > 0) return floorImages;
  if (item?.floorSections?.image) return [item.floorSections.image];
  return [];
};

const getBrochureFiles = (files) => safeArray(files);

const getDeveloper = (data) => data?.aboutDeveloper ?? {};

const resolveMediaUrl = (value) => {
  if (!value || typeof value !== "string") return "";

  const trimmed = value.trim();
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

const getDeveloperLogo = (developer) =>
  resolveMediaUrl(
    developer?.developerLogo ||
      developer?.developer_logo ||
      developer?.logo ||
      developer?.logoUrl ||
      developer?.logo_url ||
      developer?.image ||
      developer?.image_url ||
      developer?.profile_image ||
      developer?.profileImage
  );

const getVendorLogo = (property) =>
  resolveMediaUrl(
      property?.vendorLogo ||
      property?.vendor_logo ||
      property?.clientLogo ||
      property?.client_logo ||
      property?.adminimage ||
      property?.admin_image
  );

const fileNameFromUrl = (url) => {
  if (!url) return "file";
  return decodeURIComponent(url).split("/").pop().split("?")[0];
};

const getFileType = (url) => {
  const ext = (url || "").split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "word";
  if (["xls", "xlsx"].includes(ext)) return "excel";
  return "file";
};

const formatPropertyType = (value) => {
  if (!value) return "Property";
  const cleaned = String(value).replace(/[_-]+/g, " ").trim();
  return cleaned
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const countryCodes = [
  { code: "+91", country: "India" },
  { code: "+1", country: "United States" },
  { code: "+44", country: "United Kingdom" },
];

const SAVED_PROPERTIES_KEY = "homewala:saved-properties";

const getSavedProperties = () => {
  try {
    const raw = localStorage.getItem(SAVED_PROPERTIES_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const getUserStorageKey = (user) => {
  if (user?.email) return user.email.toLowerCase();
  if (user?.id != null) return String(user.id);
  return "anonymous";
};

const detailsSectionItems = [
  { key: "overview", label: "Overview / Home" },
  { key: "highlights", label: "Highlights" },
  { key: "floorPlan", label: "Floor Plan" },
  { key: "amenities", label: "Amenities" },
  { key: "brochure", label: "Project Brochure" },
  { key: "developer", label: "About Developer" },
];

const getSimilarPropertiesFromPayload = (data) => {
  const candidates = [
    data?.relavantProperties,
    data?.relevantProperties,
    data?.relatedProperties,
    data?.similarProperties,
    data?.propertyDetails?.relavantProperties,
    data?.propertyDetails?.relevantProperties,
    data?.propertyDetails?.relatedProperties,
    data?.propertyDetails?.similarProperties,
  ];

  for (const candidate of candidates) {
    const items = safeArray(candidate);
    if (items.length > 0) return items;
  }

  return [];
};

const getDetailSlug = (item) =>
  getTitle(item)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

const getSimilarPropertyTags = (item) =>
  [
    item?.property_type,
    item?.configuration || item?.bhk || item?.beds || item?.bedrooms,
    item?.status || item?.construction_status,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim())
    .slice(0, 3);

const DetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.basic);
  const [loading, setLoading] = useState(true);
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [aboutDeveloper, setAboutDeveloper] = useState({});
  const [projectBrochure, setProjectBrochure] = useState([]);
  const [relevantProperties, setRelevantProperties] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [viewerImageIndex, setViewerImageIndex] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showMoreOverview, setShowMoreOverview] = useState(false);
  const [showMoreHighlights, setShowMoreHighlights] = useState(false);
  const [showMoreAboutProject, setShowMoreAboutProject] = useState(false);
  const [showMoreDeveloper, setShowMoreDeveloper] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryEmail, setEnquiryEmail] = useState("");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
  const [enquiryErrors, setEnquiryErrors] = useState({});
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [isWheelLocked, setIsWheelLocked] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [activeBrochureIndex, setActiveBrochureIndex] = useState(0);
  const [isBrochureViewerOpen, setIsBrochureViewerOpen] = useState(false);
  const [brochureViewerUrl, setBrochureViewerUrl] = useState("");
  const [showMobileEnquiry, setShowMobileEnquiry] = useState(false);
  const [loanAmountLakhs, setLoanAmountLakhs] = useState(50);
  const [interestRate, setInterestRate] = useState(8);
  const [tenureYears, setTenureYears] = useState(20);
  const [hasAttemptedFallbackSimilar, setHasAttemptedFallbackSimilar] = useState(false);
  const enquiryCardRef = useRef(null);
  const similarPropertiesTrackRef = useRef(null);
  const sectionRefs = {
    overview: useRef(null),
    highlights: useRef(null),
    floorPlan: useRef(null),
    amenities: useRef(null),
    brochure: useRef(null),
    developer: useRef(null),
  };

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`get-property-details/${id}`);
        const data = response.data?.data ?? {};
        const details = data.propertyDetails ?? data ?? null;
        setPropertyDetails(
          details
            ? {
                ...details,
                vendorLogo:
                  details.vendorLogo ||
                  details.vendor_logo ||
                  details.clientLogo ||
                  details.client_logo ||
                  details.adminimage ||
                  details.admin_image ||
                  data.vendorLogo ||
                  data.vendor_logo ||
                  data.clientLogo ||
                  data.client_logo ||
                  data.adminimage ||
                  data.admin_image,
              }
            : null
        );
          setAboutDeveloper(getDeveloper(data));
          console.log("API DATA:", data);
          console.log("ABOUT DEVELOPER:", data.aboutDeveloper);
          console.log("Developer Logo URL:", data.aboutDeveloper?.developerLogo);
          setProjectBrochure(getBrochureFiles(data.projectBrochure));
          setRelevantProperties(getSimilarPropertiesFromPayload(data));
          setHasAttemptedFallbackSimilar(false);
          setActiveImageIndex(0);
          setActiveBrochureIndex(0);
        } catch (error) {
        console.error("Failed to fetch property details:", error);
        setPropertyDetails(null);
        setAboutDeveloper({});
        setProjectBrochure([]);
        setRelevantProperties([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const updateIsMobileView = (event) => {
      setIsMobileView(event.matches);
    };

    setIsMobileView(mediaQuery.matches);
    mediaQuery.addEventListener("change", updateIsMobileView);

    return () => mediaQuery.removeEventListener("change", updateIsMobileView);
  }, []);

  useEffect(() => {
    if (!isMobileView) setShowMobileEnquiry(false);
  }, [isMobileView]);

  useEffect(() => {
    if (showMobileEnquiry && isMobileView) {
      window.requestAnimationFrame(() => {
        enquiryCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [showMobileEnquiry, isMobileView]);

  useEffect(() => {
    const loadFallbackSimilarProperties = async () => {
      if (!propertyDetails || relevantProperties.length > 0 || hasAttemptedFallbackSimilar) return;
      setHasAttemptedFallbackSimilar(true);

      const fallbackFilters = { paginate: 1, per_page: 8 };
      const fallbackSearch =
        propertyDetails?.location || propertyDetails?.property_area || propertyDetails?.city || propertyDetails?.area;
      const fallbackType = propertyDetails?.property_type || propertyDetails?.type || propertyDetails?.project_type;

      if (fallbackSearch) {
        fallbackFilters.search = [fallbackSearch];
      }

      if (fallbackType && fallbackType !== "Property") {
        fallbackFilters.property_type = fallbackType;
      }

      try {
        const response = await api.post("get-filtered-listview-properties", fallbackFilters);
        const fallbackList = safeArray(response.data?.data ?? response.data ?? []).filter(
          (item) => String(item?.id) !== String(id)
        );

        if (fallbackList.length > 0) {
          setRelevantProperties(fallbackList);
          return;
        }

        const genericResponse = await api.post("get-filtered-listview-properties", {
          paginate: 1,
          per_page: 8,
        });
        const genericList = safeArray(genericResponse.data?.data ?? genericResponse.data ?? []).filter(
          (item) => String(item?.id) !== String(id)
        );
        setRelevantProperties(genericList);
      } catch (error) {
        console.error("Failed to load fallback similar properties:", error);
      }
    };

    loadFallbackSimilarProperties();
  }, [id, propertyDetails, relevantProperties.length, hasAttemptedFallbackSimilar]);

  useEffect(() => {
    if (!isMobileView) {
      setShowMobileEnquiry(false);
    }
  }, [isMobileView]);

  useEffect(() => {
    if (showMobileEnquiry && isMobileView) {
      window.requestAnimationFrame(() => {
        enquiryCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [showMobileEnquiry, isMobileView]);

  const title = useMemo(() => getTitle(propertyDetails), [propertyDetails]);
  const location = useMemo(() => getLocation(propertyDetails), [propertyDetails]);
  const price = useMemo(() => getPrice(propertyDetails), [propertyDetails]);
  const gallery = useMemo(() => getGallery(propertyDetails), [propertyDetails]);
  const highlights = useMemo(() => getHighlights(propertyDetails), [propertyDetails]);
  const amenities = useMemo(() => getAmenities(propertyDetails), [propertyDetails]);
  const faqs = useMemo(() => getFaqs(propertyDetails), [propertyDetails]);
  const floorImages = useMemo(() => getFloorImages(propertyDetails), [propertyDetails]);
  const vendorLogo = useMemo(
    () => getVendorLogo(propertyDetails) || getDeveloperLogo(aboutDeveloper) || getImage(propertyDetails),
    [propertyDetails, aboutDeveloper]
  );
  const activeGalleryImage = gallery[activeImageIndex] || getImage(propertyDetails);
  const similarProperties = useMemo(() => relevantProperties.slice(0, 4), [relevantProperties]);

  const openImageViewer = (index = activeImageIndex) => {
    if (!gallery.length) return;
    setViewerImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setIsImageViewerOpen(false);
  };

  const handleViewerPrev = () => {
    if (!gallery.length) return;
    setViewerImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const handleViewerNext = () => {
    if (!gallery.length) return;
    setViewerImageIndex((prev) => (prev + 1) % gallery.length);
  };

  useEffect(() => {
    if (!isImageViewerOpen && !isBrochureViewerOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isImageViewerOpen, isBrochureViewerOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isImageViewerOpen && !isBrochureViewerOpen) return;

      if (event.key === "Escape") {
        if (isBrochureViewerOpen) {
          closeBrochureViewer();
          return;
        }
        closeImageViewer();
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        if (isBrochureViewerOpen) {
          closeBrochureViewer();
          return;
        }
        closeImageViewer();
      }

      if (isImageViewerOpen && event.key === "ArrowLeft") {
        handleViewerPrev();
      }

      if (isImageViewerOpen && event.key === "ArrowRight") {
        handleViewerNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isImageViewerOpen, isBrochureViewerOpen, gallery.length]);
  const activeBrochure = projectBrochure[activeBrochureIndex] ?? projectBrochure[0];
  const propertyPriceAmount = useMemo(() => {
    const candidates = [
      propertyDetails?.priceRange,
      propertyDetails?.price,
      propertyDetails?.min_price,
      propertyDetails?.floorSections?.averagePrice,
    ];

    for (const candidate of candidates) {
      const parsed = parseAmountToNumber(candidate);
      if (parsed) return parsed;
    }

    return 5000000;
  }, [propertyDetails]);
  const propertyPriceLakhs = propertyPriceAmount / 100000;
  const loanMaxLakhs = Math.max(25, Math.min(500, Math.ceil(propertyPriceLakhs * 2)));
  const isMobileCollapsed = isMobileView;
  const overviewText = propertyDetails?.description || "Description not available.";
  const aboutProjectText = propertyDetails?.aboutProject || "Description not available.";
  const developerDescription = aboutDeveloper?.description || "No developer information available.";
  const displayedHighlights = highlights.slice(0, isMobileCollapsed && !showMoreHighlights ? 3 : highlights.length);
  const displayedAmenities = amenities.slice(0, isMobileCollapsed && !showAllAmenities ? 2 : amenities.length);
  const overviewShouldTruncate = isMobileCollapsed && !showMoreOverview;
  const aboutProjectShouldTruncate = isMobileCollapsed && !showMoreAboutProject;
  const developerShouldTruncate = isMobileCollapsed && !showMoreDeveloper;
  const loanAmount = loanAmountLakhs * 100000;
  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = tenureYears * 12;
  const monthlyEmi = useMemo(() => {
    if (!loanAmount || !totalMonths) return 0;
    if (monthlyRate === 0) return loanAmount / totalMonths;

    const factor = Math.pow(1 + monthlyRate, totalMonths);
    return (loanAmount * monthlyRate * factor) / (factor - 1);
  }, [loanAmount, monthlyRate, totalMonths]);
  const totalPayable = monthlyEmi * totalMonths;
  const totalInterestPayable = totalPayable - loanAmount;
  const whatsappMessage = useMemo(() => {
    const projectTitle = title || "this property";
    const projectLocation = location || "your preferred location";
    return `Hi, I am interested in ${projectTitle} (${projectLocation}, Tamil Nadu, India). Kindly share the details.`;
  }, [title, location]);
  const whatsappLink = useMemo(() => {
    const phone = String(propertyDetails?.contact || "+918925997080").replace(/[^\d]/g, "");
    return `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;
  }, [propertyDetails?.contact, whatsappMessage]);
  const similarPropertiesUrl = useMemo(() => {
    if (!location) return "/properties";

    const params = new URLSearchParams();
    params.set("location", location);
    return `/properties?${params.toString()}`;
  }, [location]);
  const showBrochureList = projectBrochure.length > 1;

  useEffect(() => {
    if (propertyPriceLakhs > 0) {
      setLoanAmountLakhs(Math.max(1, Math.round(propertyPriceLakhs * 0.8)));
    }
  }, [propertyPriceLakhs]);

  useEffect(() => {
    const saved = getSavedProperties();
    const userKey = getUserStorageKey(user);
    const list = Array.isArray(saved[userKey]) ? saved[userKey] : [];
    setIsWishlisted(list.some((item) => String(item?.id) === String(id)));
  }, [id, user]);

  const handlePrevImage = () => {
    if (!gallery.length) return;
    setActiveImageIndex((current) => (current === 0 ? gallery.length - 1 : current - 1));
  };

  const handleNextImage = () => {
    if (!gallery.length) return;
    setActiveImageIndex((current) => (current === gallery.length - 1 ? 0 : current + 1));
  };

  const handleImageWheel = (event) => {
    if (!isMobileView || !gallery.length || gallery.length < 2) return;
    event.preventDefault();
    if (isWheelLocked) return;

    setIsWheelLocked(true);
    if (event.deltaY > 0) {
      handleNextImage();
    } else {
      handlePrevImage();
    }

    window.setTimeout(() => setIsWheelLocked(false), 220);
  };

  const handleImageKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openImageViewer(activeImageIndex);
      return;
    }
    if (event.key === "ArrowLeft") {
      handlePrevImage();
    }
    if (event.key === "ArrowRight") {
      handleNextImage();
    }
  };

  const handleTouchStart = (event) => {
    setTouchStartX(event.touches?.[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event) => {
    if (touchStartX === null) return;
    const endX = event.changedTouches?.[0]?.clientX ?? touchStartX;
    const deltaX = touchStartX - endX;

    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }

    setTouchStartX(null);
  };

  const downloadFile = async (url, filename) => {
    if (!url) return;

    const safeName = filename || fileNameFromUrl(url);

    try {
      const response = await fetch(url, { mode: "cors" });
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = safeName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      const a = document.createElement("a");
      a.href = url;
      a.download = safeName;
      a.target = "_self";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const openBrochure = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const closeBrochureViewer = () => {
    setIsBrochureViewerOpen(false);
  };

  const scrollSimilarProperties = (direction) => {
    similarPropertiesTrackRef.current?.scrollBy({
      left: direction * 360,
      behavior: "smooth",
    });
  };

  const scrollToSection = (key) => {
    const target = sectionRefs[key]?.current;
    if (!target) return;

    const headerOffset = isMobileView ? 132 : 112;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const getTruncatedText = (text, limit = 120) => {
    if (!text) return "";
    if (text.length <= limit) return text;
    return `${text.slice(0, limit).trim()}...`;
  };

  const handleShare = async () => {
    const shareData = {
      title,
      text: `${title} - ${location}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("Shared");
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        setShareStatus("Link copied");
      }
    } catch (error) {
      console.error("Share failed:", error);
      setShareStatus("Share unavailable");
    } finally {
      window.setTimeout(() => setShareStatus(""), 2000);
    }
  };

  const handleWishlistToggle = () => {
    if (!localStorage.getItem("access_token")) {
      setShowLoginPrompt(true);
      return;
    }

    const saved = getSavedProperties();
    const userKey = getUserStorageKey(user);
    const currentList = Array.isArray(saved[userKey]) ? saved[userKey] : [];
    const alreadySaved = currentList.some((item) => String(item?.id) === String(id));

    const nextList = alreadySaved
      ? currentList.filter((item) => String(item?.id) !== String(id))
      : [
          ...currentList,
          {
            id: propertyDetails?.id ?? id,
            title,
            location,
            price,
            image: activeGalleryImage,
            savedAt: new Date().toISOString(),
          },
        ];

    localStorage.setItem(
      SAVED_PROPERTIES_KEY,
      JSON.stringify({ ...saved, [userKey]: nextList })
    );
    setIsWishlisted(!alreadySaved);
  };

  const validateEnquiry = () => {
    const nextErrors = {};

    if (!enquiryName || enquiryName.trim().length < 3) {
      nextErrors.name = "Name must be at least 3 characters long";
    }
    if (!enquiryEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiryEmail)) {
      nextErrors.email = "Invalid email address";
    }
    if (!selectedCountryCode.trim()) {
      nextErrors.countryCode = "Country code is required";
    }
    if (!enquiryPhone || !/^[0-9]{7,15}$/.test(enquiryPhone.trim())) {
      nextErrors.mobile = "Mobile number must be between 7-15 digits";
    }
    if (!enquiryMessage || enquiryMessage.trim().length < 10) {
      nextErrors.message = "Message must be at least 10 characters long";
    }
    if (!termsAccepted) {
      nextErrors.terms = "Please accept the terms";
    }

    setEnquiryErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleEnquirySubmit = async (event) => {
    event.preventDefault();
    if (!validateEnquiry()) return;

    const outputData = {
      name: enquiryName.trim(),
      email: enquiryEmail.trim(),
      countryCode: selectedCountryCode,
      mobile: enquiryPhone.trim(),
      message: enquiryMessage.trim(),
      property_id: id,
    };

    setEnquiryLoading(true);
    try {
      const response = await api.post("property-enquiries", outputData);
      if (response.status === 200) {
        window.alert("Enquiry submitted successfully!");
        setEnquiryName("");
        setEnquiryEmail("");
        setEnquiryPhone("");
        setEnquiryMessage("");
        setSelectedCountryCode("+91");
        setTermsAccepted(false);
        setEnquiryErrors({});
        setEnquirySubmitted(true);
      }
    } catch (error) {
      console.error("Enquiry submission failed:", error);
      window.alert("Something went wrong!");
    } finally {
      setEnquiryLoading(false);
    }
  };


  return (
    <>
      <Seo
        title={`${title} | Homewala`}
        description={`${title} in ${location}. View live project details, gallery, amenities, brochures, and FAQs on Homewala.`}
      />

      <main className="details-page-main min-h-screen bg-[#f4f7fb] px-4 py-6">
        <div className="details-page-container">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="details-back-btn"
          >
            Back
          </button>

          {loading ? (
            <div className="details-section">Loading property details...</div>
          ) : propertyDetails ? (
            <div className="space-y-6">
              <section className="details-top-card">
                <div className="details-top-grid">
                  <div
                    className="details-main-image"
                    role="button"
                    tabIndex={0}
                    onWheel={isMobileView ? handleImageWheel : undefined}
                    onKeyDown={handleImageKeyDown}
                    onTouchStart={isMobileView ? handleTouchStart : undefined}
                    onTouchEnd={isMobileView ? handleTouchEnd : undefined}
                    onClick={() => openImageViewer(activeImageIndex)}
                  >
                    <img src={activeGalleryImage} alt={title} className="h-full w-full object-cover" />
                    {gallery.length > 1 ? (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevImage}
                          className="details-image-arrow details-image-arrow-left"
                          aria-label="Previous image"
                        >
                          <FaChevronLeft />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextImage}
                          className="details-image-arrow details-image-arrow-right"
                          aria-label="Next image"
                        >
                          <FaChevronRight />
                        </button>
                      </>
                    ) : null}
                  </div>

                  {isImageViewerOpen && (
                    <div
                      className="details-image-viewer"
                      role="dialog"
                      aria-modal="true"
                      aria-label="Property image gallery"
                      onClick={closeImageViewer}
                    >
                      <div
                        className="details-image-viewer__content"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="details-image-viewer__close"
                          onClick={closeImageViewer}
                          aria-label="Close image viewer"
                        >
                          <IoClose className="details-image-viewer__close-icon" />
                        </button>

                        {gallery.length > 1 && (
                          <button
                            type="button"
                            className="details-image-viewer__nav details-image-viewer__nav--prev"
                            onClick={handleViewerPrev}
                            aria-label="Previous image"
                          >
                            <FaChevronLeft />
                          </button>
                        )}

                        <div className="details-image-viewer__stage">
                          <img
                            src={gallery[viewerImageIndex] || activeGalleryImage}
                            alt={title}
                            className="details-image-viewer__image"
                          />
                        </div>

                        {gallery.length > 1 && (
                          <button
                            type="button"
                            className="details-image-viewer__nav details-image-viewer__nav--next"
                            onClick={handleViewerNext}
                            aria-label="Next image"
                          >
                            <FaChevronRight />
                          </button>
                        )}

                        {gallery.length > 1 && (
                          <div className="details-image-viewer__thumbs">
                            {gallery.map((image, index) => (
                              <button
                                key={`${image}-${index}`}
                                type="button"
                                className={`details-image-viewer__thumb ${
                                  index === viewerImageIndex ? "is-active" : ""
                                }`}
                                onClick={() => setViewerImageIndex(index)}
                                aria-label={`View image ${index + 1}`}
                              >
                                <img src={image} alt={`Thumbnail ${index + 1}`} />
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="details-image-viewer__count">
                          {gallery.length > 0 ? viewerImageIndex + 1 : 0}/{gallery.length}
                        </div>
                      </div>
                    </div>
                  )}

                  {isBrochureViewerOpen && (
                    <div
                      className="details-brochure-viewer"
                      role="dialog"
                      aria-modal="true"
                      aria-label="Brochure viewer"
                      onClick={closeBrochureViewer}
                    >
                      <div
                        className="details-brochure-viewer__content"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="details-brochure-viewer__close"
                          onClick={closeBrochureViewer}
                          aria-label="Close brochure viewer"
                        >
                          <IoClose className="details-brochure-viewer__close-icon" />
                        </button>

                        <div className="details-brochure-viewer__stage">
                          {getFileType(brochureViewerUrl) === "image" ? (
                            <img
                              src={brochureViewerUrl}
                              alt="Brochure preview"
                              className="details-brochure-viewer__media"
                            />
                          ) : (
                            <iframe
                              src={brochureViewerUrl}
                              title="Brochure preview"
                              className="details-brochure-viewer__media details-brochure-viewer__iframe"
                            />
                          )}
                        </div>

                        <a
                          href={brochureViewerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="details-brochure-viewer__open"
                        >
                          Open in new tab
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="details-sidebar">
                    {gallery.length > 1 ? (
                      <div className="details-sidebar-thumbs">
                        {gallery.slice(0, 3).map((image, index) => {
                          const hiddenCount = gallery.length - 3;
                          const isLastVisibleThumb = index === 2 && hiddenCount > 0;

                          return (
                            <button
                              key={`${image}-${index}`}
                              type="button"
                              onClick={() => {
                                setActiveImageIndex(index);
                                openImageViewer(index);
                              }}
                              className={`details-sidebar-thumb ${
                                index === activeImageIndex ? "is-active" : ""
                              }`}
                            >
                              <img src={image} alt={`${title} ${index + 1}`} />
                              {isLastVisibleThumb ? (
                                <span className="details-sidebar-thumb-more">
                                  +{hiddenCount} images
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}

                    <div className="details-summary">
                      <h1 className="details-title">{title}</h1>
                      <p className="details-location">
                        <FaMapMarkerAlt className="text-[#2153a7]" />
                        {location}
                      </p>
                      <p className="details-price">{price}</p>
                    </div>

                    <div className="details-actions">
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="details-action-link"
                      >
                        <IoMdCall />
                        Book a Site Visit
                      </a>
                      <button
                        type="button"
                        className="details-action-btn"
                        onClick={handleShare}
                      >
                        <FaShareAlt />
                        Share
                      </button>
                      <button
                        type="button"
                        className="details-action-btn"
                        onClick={handleWishlistToggle}
                        aria-pressed={isWishlisted}
                      >
                        <AiFillHeart />
                        {isWishlisted ? "Saved" : "Like"}
                      </button>
                      {shareStatus ? <span className="details-share-status">{shareStatus}</span> : null}
                    </div>
                  </div>
                </div>

              </section>

              <nav className="details-page-nav" aria-label="Details page sections">
                {detailsSectionItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className="details-page-nav__link"
                    onClick={() => scrollToSection(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <section className="details-content-grid">
                <div className="details-stack">
                  <div className="details-section" ref={sectionRefs.overview}>
                    <h2 className="mb-3 text-xl font-bold text-[#20314f]">Overview / Home</h2>
                    <p className="details-copy details-mobile-clamp">
                      {overviewShouldTruncate ? getTruncatedText(overviewText, 120) : overviewText}
                    </p>
                    {isMobileCollapsed && overviewText.length > 120 ? (
                      <button
                        type="button"
                        className="details-mobile-toggle"
                        onClick={() => setShowMoreOverview((current) => !current)}
                      >
                        {showMoreOverview ? "Show Less" : "Show More"}
                      </button>
                    ) : null}
                  </div>

                  <div className="details-section" ref={sectionRefs.highlights}>
                    <div className="details-highlights-panel">
                      <h2 className="details-highlights-panel-title">Highlights</h2>
                      {propertyDetails?.postHighlights ? (
                        <div
                          className="rich-text-container details-copy details-highlights-rich"
                          dangerouslySetInnerHTML={{ __html: propertyDetails.postHighlights }}
                        />
                      ) : displayedHighlights.length > 0 ? (
                        <div className="details-highlights-table-wrap">
                          <table className="details-highlights-table">
                            <thead>
                              <tr>
                                <th scope="col">#</th>
                                <th scope="col">Highlight</th>
                              </tr>
                            </thead>
                            <tbody>
                              {displayedHighlights.map((item, index) => (
                                <tr key={`${item}-${index}`}>
                                  <td>
                                    <span className="details-highlight-badge">
                                      {String(index + 1).padStart(2, "0")}
                                    </span>
                                  </td>
                                  <td>{typeof item === "string" ? item : item?.name || item?.title || item?.value || "Highlight"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="details-highlights-empty">No highlights available.</div>
                      )}
                      {isMobileCollapsed && highlights.length > 3 && !propertyDetails?.postHighlights ? (
                        <button
                          type="button"
                          className="details-mobile-toggle"
                          onClick={() => setShowMoreHighlights((current) => !current)}
                        >
                          {showMoreHighlights ? "Show Less" : "Show More"}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="details-section">
                    <h2 className="mb-3 text-xl font-bold text-[#20314f]">About Project</h2>
                    <p className="details-copy details-mobile-clamp">
                      {aboutProjectShouldTruncate ? getTruncatedText(aboutProjectText, 120) : aboutProjectText}
                    </p>
                    {isMobileCollapsed && aboutProjectText.length > 120 ? (
                      <button
                        type="button"
                        className="details-mobile-toggle"
                        onClick={() => setShowMoreAboutProject((current) => !current)}
                      >
                        {showMoreAboutProject ? "Show Less" : "Show More"}
                      </button>
                    ) : null}
                  </div>

                  <div className="details-section" ref={sectionRefs.floorPlan}>
                    <h2 className="mb-3 text-xl font-bold text-[#20314f]">Floor Plans</h2>
                    {floorImages.length > 0 ? (
                      <div className="details-floor-layout">
                        <div className="details-floor-stage">
                          <button
                            type="button"
                            className="details-floor-arrow details-floor-arrow-left"
                            onClick={() => setActiveImageIndex((current) => (current === 0 ? floorImages.length - 1 : current - 1))}
                            aria-label="Previous floor plan"
                          >
                            <FaChevronLeft />
                          </button>
                          <div className="details-floor-preview">
                            <img
                              src={floorImages[activeImageIndex % floorImages.length]}
                              alt={`Floor plan ${activeImageIndex + 1}`}
                            />
                          </div>
                          <button
                            type="button"
                            className="details-floor-arrow details-floor-arrow-right"
                            onClick={() => setActiveImageIndex((current) => (current === floorImages.length - 1 ? 0 : current + 1))}
                            aria-label="Next floor plan"
                          >
                            <FaChevronRight />
                          </button>
                        </div>
                        <div className="details-floor-metrics">
                          <div className="details-floor-metric">
                            <div className="details-floor-metric-icon details-floor-metric-icon-price">₹</div>
                            <div>
                              <span className="details-floor-label">Average Price</span>
                              <p className="details-floor-value">
                                {propertyDetails?.floorSections?.averagePrice || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="details-floor-metric">
                            <div className="details-floor-metric-icon details-floor-metric-icon-status">↻</div>
                            <div>
                              <span className="details-floor-label">Status</span>
                              <p className="details-floor-value">
                                {propertyDetails?.floorSections?.status || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="details-floor-metric">
                            <div className="details-floor-metric-icon details-floor-metric-icon-area">▣</div>
                            <div>
                              <span className="details-floor-label">Buildup Area</span>
                              <p className="details-floor-value">
                                {propertyDetails?.floorSections?.buildUpArea || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="details-copy">No floor plans available.</p>
                    )}
                  </div>

                  <div className="details-section details-emi-section">
                    <div className="details-emi-header">
                      <h2 className="mb-0 text-xl font-bold text-[#20314f]">EMI Calculator</h2>
                      <p className="details-emi-subtitle">Adjust the sliders to calculate your monthly EMI.</p>
                    </div>

                    <div className="details-emi-layout">
                      <div className="details-emi-controls">
                        <div className="details-emi-control">
                          <div className="details-emi-control-head">
                            <span className="details-emi-label">Loan Amount in Lakhs</span>
                            <span className="details-emi-value">{formatLakhs(loanAmountLakhs)}</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max={loanMaxLakhs}
                            step="1"
                            value={loanAmountLakhs}
                            onChange={(event) => setLoanAmountLakhs(Number(event.target.value))}
                            className="details-emi-range"
                          />
                          <div className="details-emi-scale">
                            <span>0</span>
                            <span>{Math.round(loanMaxLakhs / 4)}</span>
                            <span>{Math.round(loanMaxLakhs / 2)}</span>
                            <span>{Math.round((loanMaxLakhs * 3) / 4)}</span>
                            <span>{loanMaxLakhs}</span>
                          </div>
                        </div>

                        <div className="details-emi-control">
                          <div className="details-emi-control-head">
                            <span className="details-emi-label">Rate of Interest</span>
                            <span className="details-emi-value">{interestRate.toFixed(1)} %</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="20"
                            step="0.1"
                            value={interestRate}
                            onChange={(event) => setInterestRate(Number(event.target.value))}
                            className="details-emi-range"
                          />
                          <div className="details-emi-scale">
                            <span>5</span>
                            <span>8.75</span>
                            <span>12.5</span>
                            <span>16.25</span>
                            <span>20</span>
                          </div>
                        </div>

                        <div className="details-emi-control">
                          <div className="details-emi-control-head">
                            <span className="details-emi-label">Loan Tenure</span>
                            <span className="details-emi-value">{tenureYears} Years</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="30"
                            step="1"
                            value={tenureYears}
                            onChange={(event) => setTenureYears(Number(event.target.value))}
                            className="details-emi-range"
                          />
                          <div className="details-emi-scale">
                            <span>1</span>
                            <span>8</span>
                            <span>15</span>
                            <span>22</span>
                            <span>30</span>
                          </div>
                        </div>
                      </div>

                      <div className="details-emi-summary">
                        <div className="details-emi-summary-item">
                          <span>Property Price</span>
                          <strong>{formatRupees(propertyPriceAmount)}</strong>
                        </div>
                        <div className="details-emi-summary-item">
                          <span>Loan Amount</span>
                          <strong>{formatRupees(loanAmount)}</strong>
                        </div>
                        <div className="details-emi-summary-item details-emi-summary-item--highlight">
                          <span>Monthly EMI</span>
                          <strong>{formatRupees(monthlyEmi)}</strong>
                        </div>
                        <div className="details-emi-summary-item">
                          <span>Total Interest Payable</span>
                          <strong>{formatRupees(totalInterestPayable)}</strong>
                        </div>
                        <div className="details-emi-summary-total">
                          <span>Total Amount Payable</span>
                          <p>{formatRupees(totalPayable)}</p>
                          <small>Principal + Interest</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="details-section" ref={sectionRefs.amenities}>
                    <h2 className="mb-3 text-xl font-bold text-[#20314f]">Property Amenities</h2>
                    {amenities.length > 0 ? (
                      <>
                        <div className="details-amenity-grid">
                          {(isMobileCollapsed
                            ? displayedAmenities
                            : showAllAmenities
                              ? amenities
                              : amenities.slice(0, 10)
                          ).map((amenity, index) => (
                            <div
                              key={`${amenity.name || index}-${index}`}
                              className="details-amenity-card"
                            >
                              <div className="details-amenity-icon">
                                {renderAmenityIcon(amenity, index)}
                              </div>
                              <p className="text-sm font-semibold text-[#20314f]">{amenity.name || "Amenity"}</p>
                            </div>
                          ))}
                        </div>
                        {isMobileCollapsed && amenities.length > 2 ? (
                          <button
                            type="button"
                            onClick={() => setShowAllAmenities((value) => !value)}
                            className="details-amenity-toggle mt-4"
                          >
                            {showAllAmenities ? "Show Less" : `View More (${amenities.length - 2} more)`}
                          </button>
                        ) : amenities.length > 10 ? (
                          <button
                            type="button"
                            onClick={() => setShowAllAmenities((value) => !value)}
                            className="details-amenity-toggle mt-4"
                          >
                            {showAllAmenities ? "Show Less" : `View More (${amenities.length - 10} more)`}
                          </button>
                        ) : null}
                      </>
                    ) : (
                      <p className="details-copy">No amenities listed for this property.</p>
                    )}
                  </div>

                  <div className="details-section" ref={sectionRefs.brochure}>
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <h2 className="text-xl font-bold text-[#20314f]">Project Brochure</h2>
                      </div>
                      {projectBrochure.length > 0 ? (
                        <div
                          className={`details-brochure-layout ${
                            showBrochureList ? "" : "details-brochure-layout--single"
                          }`}
                        >
                          <div className="details-brochure-main">
                            {(() => {
                              const url = activeBrochure?.image || activeBrochure?.url || activeBrochure;
                              const type = getFileType(url);
                              return (
                                  <button
                                    type="button"
                                    className="details-brochure-preview details-brochure-preview--main"
                                    onClick={() => openBrochure(url)}
                                  >
                                  {type === "image" ? (
                                    <img src={url} alt="Brochure preview" />
                                  ) : type === "pdf" ? (
                                    <FaFilePdf size={72} className="text-red-500" />
                                  ) : type === "word" ? (
                                    <FaFileWord size={72} className="text-blue-500" />
                                  ) : type === "excel" ? (
                                    <FaFileExcel size={72} className="text-green-500" />
                                  ) : (
                                    <FaFileAlt size={72} className="text-gray-500" />
                                  )}
                                  <span className="details-brochure-preview-action">Click to view brochure</span>
                                  </button>
                                );
                              })()}
                          </div>

                          {showBrochureList ? (
                            <div className="details-brochure-list">
                              {projectBrochure.map((item, index) => {
                                const url = item?.image || item?.url || item;
                                const type = getFileType(url);
                                return (
                                  <div
                                      key={`${url}-${index}`}
                                      role="button"
                                      tabIndex={0}
                                      onClick={() => setActiveBrochureIndex(index)}
                                      onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                          event.preventDefault();
                                          setActiveBrochureIndex(index);
                                        }
                                      }}
                                    className={`details-brochure-card ${
                                      index === activeBrochureIndex ? "is-active" : ""
                                    }`}
                                  >
                                    <div className="details-brochure-thumb">
                                      {type === "image" ? (
                                        <img src={url} alt="Brochure" />
                                      ) : type === "pdf" ? (
                                        <FaFilePdf size={34} className="text-red-500" />
                                      ) : type === "word" ? (
                                        <FaFileWord size={34} className="text-blue-500" />
                                      ) : type === "excel" ? (
                                        <FaFileExcel size={34} className="text-green-500" />
                                      ) : (
                                        <FaFileAlt size={34} className="text-gray-500" />
                                      )}
                                    </div>
                                    <div className="details-brochure-row">
                                      <p className="truncate text-sm font-semibold text-[#20314f]">
                                        {item?.name || fileNameFromUrl(url)}
                                      </p>
                                      <button
                                        type="button"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          downloadFile(url, fileNameFromUrl(url));
                                        }}
                                        className="details-download-btn"
                                        aria-label={`Download ${item?.name || fileNameFromUrl(url)}`}
                                      >
                                        <IoMdDownload />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <p className="details-copy">No brochure available.</p>
                      )}
                  </div>
{/* Vendor  Logo */}
                  <div className="details-section" ref={sectionRefs.developer}>
                      <h2 className="mb-3 text-xl font-bold text-[#20314f]">About Developer</h2>
                      <div className="details-developer-row">
                        <div className="bg-gradient-to-t from-[#151e68] to-[#0078db] border border-white w-20 h-20 flex items-center justify-center rounded-md overflow-hidden p-[10px]">
                          <img
                            src={aboutDeveloper?.developerLogo}
                            alt={aboutDeveloper?.developerTitle}
                            className="w-full h-full object-cover rounded-md"
                            loading="lazy"
                            onError={() => console.log("Developer image failed:", aboutDeveloper?.developerLogo)}
                          />
                        </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-[#20314f]">
                          {aboutDeveloper?.developerTitle || "Developer Info Not Available"}
                        </h3>
                        <p className="text-sm font-semibold text-[#5f6b81]">
                          {aboutDeveloper?.established ? `Established: ${aboutDeveloper.established}` : ""}
                        </p>
                        <p className="details-copy details-mobile-clamp">
                          {developerShouldTruncate ? getTruncatedText(developerDescription, 110) : developerDescription}
                        </p>
                        {isMobileCollapsed && developerDescription.length > 110 ? (
                          <button
                            type="button"
                            className="details-mobile-toggle"
                            onClick={() => setShowMoreDeveloper((current) => !current)}
                          >
                            {showMoreDeveloper ? "Show Less" : "Show More"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="details-section">
                    <h2 className="mb-3 text-xl font-bold text-[#20314f]">Frequently Asked Questions</h2>
                    {faqs.length > 0 ? (
                      <div className="details-faq-list">
                        {faqs.map((item, index) => (
                          <details key={`${item.question || index}-${index}`} className="details-faq-item">
                            <summary className="cursor-pointer font-semibold text-[#20314f]">
                              {item.question || "Question"}
                            </summary>
                            <p>
                              {item.answer || "Answer not available."}
                            </p>
                          </details>
                        ))}
                      </div>
                    ) : (
                      <p className="details-copy">No FAQs available.</p>
                    )}
                  </div>

                </div>

                <aside className="space-y-8 lg:sticky lg:top-[120px] lg:h-fit details-aside-rail">
                  <div className="details-aside-card details-quick-facts-card">
                    <h2 className="mb-4 text-xl font-bold text-[#20314f]">Quick Facts</h2>
                    <div className="space-y-3 text-sm text-[#5f6b81]">
                      <p>
                        <strong className="text-[#20314f]">Type:</strong>{" "}
                        {propertyDetails?.property_type || "Property"}
                      </p>
                      <p>
                        <strong className="text-[#20314f]">Developer:</strong>{" "}
                        {aboutDeveloper?.developerTitle || "N/A"}
                      </p>
                      <p>
                        <strong className="text-[#20314f]">Location:</strong> {location}
                      </p>
                    </div>
                  </div>

                  <div
                    ref={enquiryCardRef}
                    className={`details-aside-card details-enquiry-card ${isMobileView ? "details-enquiry-card--mobile" : ""} ${showMobileEnquiry ? "is-open" : ""}`}
                  >
                    {enquirySubmitted ? (
                      <div className="details-enquiry-success">
                        <div className="details-enquiry-success-icon">✓</div>
                        <h2>Thank You!</h2>
                        <p>Your enquiry has been submitted successfully. Our team will contact you shortly.</p>
                        <button type="button" className="details-enquiry-submit" onClick={() => setEnquirySubmitted(false)}>
                          Send Another Enquiry
                        </button>
                      </div>
                    ) : (
                      <>
                        {isMobileView && !showMobileEnquiry ? (
                          <button
                            type="button"
                            className="details-mobile-enquiry-launcher"
                            onClick={() => setShowMobileEnquiry(true)}
                          >
                            Enquiry
                          </button>
                        ) : (
                          <form className="details-enquiry-form" onSubmit={handleEnquirySubmit}>
                            <div className="details-enquiry-header">
                              <h2>Enquire About This Property</h2>
                            </div>
                            <label>
                              <span className="details-field-label">
                                Full Name <span className="text-red-500">*</span>
                              </span>
                              <input value={enquiryName} onChange={(e) => setEnquiryName(e.target.value)} type="text" placeholder="Enter your full name" />
                              {enquiryErrors.name ? <p className="details-field-error">{enquiryErrors.name}</p> : null}
                            </label>
                            <label>
                              <span className="details-field-label">
                                Email <span className="text-red-500">*</span>
                              </span>
                              <input value={enquiryEmail} onChange={(e) => setEnquiryEmail(e.target.value)} type="email" placeholder="your@email.com" />
                              {enquiryErrors.email ? <p className="details-field-error">{enquiryErrors.email}</p> : null}
                            </label>
                            <label>
                              <span className="details-field-label">
                                Mobile Number <span className="text-red-500">*</span>
                              </span>
                              <div className="details-phone-row">
                                <div className="details-country-code">
                                  <select value={selectedCountryCode} onChange={(e) => setSelectedCountryCode(e.target.value)}>
                                    {countryCodes.map((country) => (
                                      <option key={country.code} value={country.code}>
                                        {country.code} ({country.country})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <input value={enquiryPhone} onChange={(e) => setEnquiryPhone(e.target.value)} type="tel" placeholder="9876543210" />
                              </div>
                              {enquiryErrors.mobile ? <p className="details-field-error">{enquiryErrors.mobile}</p> : null}
                              {enquiryErrors.countryCode ? <p className="details-field-error">{enquiryErrors.countryCode}</p> : null}
                            </label>
                            <label>
                              <span className="details-field-label">
                                Message <span className="text-red-500">*</span>
                              </span>
                              <textarea value={enquiryMessage} onChange={(e) => setEnquiryMessage(e.target.value)} rows={4} placeholder="Your message or questions..." />
                              {enquiryErrors.message ? <p className="details-field-error">{enquiryErrors.message}</p> : null}
                            </label>
                            <label className="details-enquiry-checkbox">
                              <input checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} type="checkbox" />
                              I agree to be contacted by Homewala and agents via WhatsApp, SMS, Phone, Email etc.
                            </label>
                            {enquiryErrors.terms ? <p className="details-field-error">{enquiryErrors.terms}</p> : null}
                            <button type="submit" className="details-enquiry-submit" disabled={enquiryLoading || !termsAccepted}>
                              {enquiryLoading ? "Processing..." : "Submit Enquiry"}
                            </button>
                          </form>
                        )}
                      </>
                    )}
                  </div>

                </aside>
              </section>
              {similarProperties.length > 0 ? (
                <section className="details-similar-section">
                  <div className="details-similar-head">
                    <div>
                      <h2>Similar Properties</h2>
                    </div>
                    <button
                      type="button"
                      className="details-similar-view-all"
                      onClick={() =>
                        navigate(similarPropertiesUrl, {
                          state: {
                            heading: `${location} Properties`,
                            subtitle: "Explore live properties from this location.",
                          },
                        })
                      }
                    >
                      View all
                      <FaChevronRight />
                    </button>
                  </div>

                  <div className="details-similar-carousel">
                    <button
                      type="button"
                      className="details-similar-nav details-similar-nav--left"
                      onClick={() => scrollSimilarProperties(-1)}
                      aria-label="Scroll similar properties left"
                    >
                      <FaChevronLeft />
                    </button>

                    <div className="details-similar-track" ref={similarPropertiesTrackRef}>
                      {similarProperties.map((item, index) => {
                        const slug = getDetailSlug(item);
                        const tags = getSimilarPropertyTags(item);
                        return (
                          <article key={`${item?.id || index}-${index}`} className="details-similar-card">
                            <button
                              type="button"
                              className="details-similar-media"
                              onClick={() => navigate(`/details/${item?.id}/${slug}`)}
                            >
                              <img src={getImage(item)} alt={getTitle(item)} />
                              <span className="details-similar-badge">For Sale</span>
                              <span className="details-similar-fav" aria-hidden="true">
                                <AiFillHeart />
                              </span>
                            </button>

                            <div className="details-similar-body">
                              <button
                                type="button"
                                className="details-similar-title"
                                onClick={() => navigate(`/details/${item?.id}/${slug}`)}
                              >
                                {getTitle(item)}
                              </button>

                              <p className="details-similar-location">
                                <FaMapMarkerAlt />
                                <span>{getLocation(item)}</span>
                              </p>

                              {tags.length > 0 ? (
                                <div className="details-similar-tags">
                                  {tags.map((tag) => (
                                    <span key={`${item?.id}-${tag}`} className="details-similar-tag">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              ) : null}

                              <div className="details-similar-footer">
                                <div className="details-similar-price">
                                  {getPrice(item)}
                                </div>
                                <button
                                  type="button"
                                  className="details-similar-view-btn"
                                  onClick={() => navigate(`/details/${item?.id}/${slug}`)}
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      className="details-similar-nav details-similar-nav--right"
                      onClick={() => scrollSimilarProperties(1)}
                      aria-label="Scroll similar properties right"
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-6 shadow-sm">Property details not found.</div>
          )}

          {showLoginPrompt ? (
            <div
              className="details-login-overlay"
              role="presentation"
              onClick={() => setShowLoginPrompt(false)}
            >
              <div
                className="details-login-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="details-login-title"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="details-login-icon">♥</div>
                <h3 id="details-login-title">Please login to save</h3>
                <p>Login to store this project in your profile and access it later.</p>
                <div className="details-login-actions">
                  <button
                    type="button"
                    className="details-login-secondary"
                    onClick={() => setShowLoginPrompt(false)}
                  >
                    Not now
                  </button>
                  <button
                    type="button"
                    className="details-login-primary"
                    onClick={() => {
                      setShowLoginPrompt(false);
                      dispatch(setIsNavbarModalOpen("login"));
                    }}
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          {isMobileView && !enquirySubmitted ? (
            <button type="button" className="details-mobile-sticky-enquiry" onClick={() => setShowMobileEnquiry((current) => !current)}>
              For Enquiry
            </button>
          ) : null}
        </div>
      </main>
    </>
  );
};

export default DetailsPage;
