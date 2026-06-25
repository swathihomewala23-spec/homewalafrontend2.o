// import { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { api } from "../../axiosConfig";
// import { setFilterdData } from "../../features/BasicSlice";
// import { getWebsiteLogoUrl } from "../../utils/brandAssets";
// import "./footer.css";

// const fallbackFooterLinks = [
//   {
//     name: "Apartments in Kundrathur",
//     type: "apartment",
//     property_area: "kundrathur",
//   },
//   {
//     name: "Villas in ECR",
//     type: "villa",
//     property_area: "ecr",
//   },
//   {
//     name: "Plots in Tiruchirappalli",
//     type: "plot",
//     property_area: "tiruchirappalli",
//   },
// ];

// const normalizeText = (value) =>
//   String(value ?? "")
//     .replace(/[-_]+/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();

// const toTitleCase = (value) =>
//   normalizeText(value)
//     .toLowerCase()
//     .replace(/\b\w/g, (char) => char.toUpperCase());

// const inferTypeFromLabel = (value) => {
//   const text = normalizeText(value).toLowerCase();
//   if (text.includes("apartment") || text.includes("flat")) return "apartment";
//   if (text.includes("villa")) return "villa";
//   if (text.includes("plot") || text.includes("land")) return "plot";
//   return "property";
// };

// const toFooterLink = (item) => {
//   const name = item?.name || item?.link || item?.label || item?.title || "";
//   const rawArea = item?.property_area || item?.area || item?.location || item?.city || name;
//   const propertyArea = toTitleCase(rawArea);

//   return {
//     name: normalizeText(name) || `${toTitleCase(propertyArea)} Properties`,
//     type: item?.type || inferTypeFromLabel(name || rawArea),
//     property_area: propertyArea,
//     count: item?.count ?? item?.properties ?? item?.property_count ?? null,
//   };
// };

// const Footer = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { filter } = useSelector((store) => store.basic);

//   const [footerLinks, setFooterLinks] = useState(fallbackFooterLinks);
//   const [activeTab, setActiveTab] = useState("Real Estate");
//   const [showAllLinks, setShowAllLinks] = useState(false);
//   const [logoBroken, setLogoBroken] = useState(false);
//   const [websiteInfo, setWebsiteInfo] = useState({
//     logo: "",
//     address: "",
//     email_address: "",
//     contact_number: "",
//   });

//   const tabs = ["Real Estate", "Contact Us"];
//   const previewLimit = 12;
//   const displayedFooterLinks = showAllLinks ? footerLinks : footerLinks.slice(0, previewLimit);
//   const shouldShowMore = footerLinks.length > previewLimit;
//   const logoSrc = getWebsiteLogoUrl(websiteInfo);

//   const scrollToTop = () => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleContactClick = () => {
//     scrollToTop();
//     navigate("/contact-us");
//   };

//   const fetchWebsiteInfo = async () => {
//     try {
//       const response = await api.get("/website-info");
//       const data = response.data?.data ?? {};

//       setWebsiteInfo({
//         ...data,
//         logo: getWebsiteLogoUrl(data),
//         contact_number: "+91 8925997080",
//       });
//       setLogoBroken(false);

//       if (data.favicon) {
//         const faviconLink = document.querySelector("link[rel='icon']");
//         if (faviconLink) faviconLink.href = data.favicon;
//       }
//     } catch (error) {
//       console.error("Failed to fetch website information:", error);
//     }
//   };

//   const fetchFooterLinks = async () => {
//     try {
//       const response = await api.get("/get-footer-links");
//       const apiLinks = response.data?.links ?? response.data?.data ?? [];

//       if (Array.isArray(apiLinks) && apiLinks.length > 0) {
//         setFooterLinks(apiLinks.map(toFooterLink));
//         return;
//       }
//     } catch (error) {
//       console.error("Failed to fetch footer links:", error);
//     }

//     try {
//       const response = await api.get("/get-property-places-count");
//       const placeRows = response.data?.data ?? [];

//       if (Array.isArray(placeRows) && placeRows.length > 0) {
//         const mappedLinks = placeRows.slice(0, 20).map((place) => {
//           const name = toTitleCase(place?.name || place?.location || place?.city);
//           const area = normalizeText(place?.name || place?.location || place?.city).toLowerCase();

//           return {
//             name: name || "Properties",
//             type: inferTypeFromLabel(name),
//             property_area: area,
//             count: place?.properties ?? place?.property_count ?? place?.count ?? null,
//           };
//         });

//         setFooterLinks(mappedLinks);
//         return;
//       }
//     } catch (error) {
//       console.error("Failed to fetch property places for footer:", error);
//     }

//     setFooterLinks(fallbackFooterLinks);
//   };

//   const handleBuy = (data) => {
//     dispatch(
//       setFilterdData({
//         chennai_property_area: data,
//         paginate: 1,
//       })
//     );

//     navigate(`/properties-in-${data.toLowerCase()}`);
//   };

//   const handleSearch = (value) => {
//     const type = value?.type || inferTypeFromLabel(value?.name);
//     const area = toTitleCase(value?.property_area || value?.name);

//     dispatch(
//       setFilterdData({
//         ...filter,
//         property_area: [area],
//         search: [area],
//         property_type: type,
//         paginate: 1,
//       })
//     );

//     const params = new URLSearchParams();
//     if (area) params.set("location", area);
//     if (type && type !== "property") params.set("type", type);

//     window.scrollTo({ top: 80, left: 0, behavior: "auto" });
//     navigate({
//       pathname: "/properties",
//       search: params.toString() ? `?${params.toString()}` : "",
//     });
//   };

//   const toggleShowAllLinks = () => {
//     setShowAllLinks((prev) => !prev);
//   };

//   useEffect(() => {
//     fetchWebsiteInfo();
//     fetchFooterLinks();
//   }, []);

//   return (
//     <footer className="footer-section">
//       <div className="footer-wrapper">
//         <div className="footer-cta-banner">
//           <div className="footer-cta-content">
//             <h2>Do you need help?</h2>
//             <p>
//               We will provide detailed information about our services, types of work,
//               and top projects. We will calculate the cost and prepare a commercial
//               proposal.
//             </p>
//           </div>
//           <button className="footer-cta-button" onClick={handleContactClick}>
//             Contact Us <span className="arrow">→</span>
//           </button>
//         </div>

//         <div className="footer-middle">
//           <div className="footer-col footer-info-col">
//             <h4 className="footer-col-title">INFO</h4>
//             <ul className="footer-links">
//               <li>
//                 <Link to="/about-us" onClick={scrollToTop}>
//                   About us
//                 </Link>
//               </li>
//               <li>
//                 <Link to="/new-projects">Projects</Link>
//               </li>
//               <li>
//                 <Link to="/contact-us" onClick={scrollToTop}>
//                   Contacts
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           <div className="footer-col footer-properties-col">
//             <h4 className="footer-col-title">PROPERTIES FOR SALE</h4>
//             <ul className="footer-links">
//               {displayedFooterLinks.map((item, index) => (
//                 <li key={`${item.property_area || item.name}-${index}`}>
//                   <button
//                     type="button"
//                     className="footer-property-button"
//                     onClick={() => handleSearch(item)}
//                   >
//                     {item.name}
//                     {item.count !== null && item.count !== undefined ? ` (${item.count})` : ""}
//                   </button>
//                 </li>
//               ))}
//             </ul>

//             {shouldShowMore ? (
//               <button
//                 type="button"
//                 onClick={toggleShowAllLinks}
//                 className="footer-show-more-button"
//               >
//                 {showAllLinks ? "Show Less" : "Show More"}
//               </button>
//             ) : null}
//           </div>

//           <div className="footer-col footer-logo-col">
//             <div className="footer-logo">
//               {logoSrc && !logoBroken ? (
//                 <img
//                   src={logoSrc}
//                   alt="Homewala.com"
//                   className="footer-logo-image"
//                   onError={() => setLogoBroken(true)}
//                 />
//               ) : (
//                 <span className="footer-logo-text">
//                   <span className="logo-home">Home</span>wala.<span className="logo-com">com</span>
//                 </span>
//               )}
//             </div>
//           </div>

//           <div className="footer-col footer-contact-col">
//             <p className="footer-contact-number">
//               <a href={`tel:${String(websiteInfo.contact_number || "+91 8925997080").replace(/[^\d+]/g, "")}`}>
//                 {websiteInfo.contact_number || "+91 8925997080"}
//               </a>
//             </p>
//             <p className="footer-contact-email">
//               <a href={`mailto:${websiteInfo.email_address || "homewala@gmail.com"}`}>
//                 {websiteInfo.email_address || "homewala@gmail.com"}
//               </a>
//             </p>
//           </div>
//         </div>

//         <div className="footer-divider" />

//         <div className="footer-social-row">
//           <a href="https://www.instagram.com/homewala_chennai/" target="_blank" rel="noopener noreferrer" className="social-link">
//             Instagram
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
//               <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
//               <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
//               <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
//             </svg>
//           </a>
//           <a href="https://www.facebook.com/p/Homewalacom-61576002254020/" target="_blank" rel="noopener noreferrer" className="social-link">
//             Facebook
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
//               <path d="M14 9.5h2V7h-2c-2.21 0-4 1.79-4 4v2H8v2.5h2V19h2.5v-3.5H15l.5-2.5h-3V11c0-.83.67-1.5 1.5-1.5z"></path>
//             </svg>
//           </a>
//           <a href="https://www.youtube.com/@Homewala-com" target="_blank" rel="noopener noreferrer" className="social-link">
//             Youtube
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
//               <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.16 1 12 1 12s0 3.84.46 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.84 23 12 23 12s0-3.84-.46-5.58z"></path>
//               <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
//             </svg>
//           </a>
//           <a
//             href={`https://wa.me/${String(websiteInfo.contact_number || "+91 8925997080").replace(/[^\d]/g, "")}`}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="social-link"
//           >
//             Whatsapp
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
//               <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
//             </svg>
//           </a>
//         </div>

//         <div className="footer-divider-subtle" />

//        <div className="footer-bottom-bar">
//   <div className="footer-bottom-links">
//     <Link to="/">Home</Link>
//     <span className="separator">|</span>

//     <Link to="/buy-property">Buy</Link>
//     <span className="separator">|</span>

//     <Link to="/interior">Interior</Link>
//     <span className="separator">|</span>

//     <Link to="/budget-50-75-lakhs">Plot below 70L</Link>
//     <span className="separator">|</span>

//     <Link to="/privacy-policy">Privacy Policy</Link>
//     <span className="separator">|</span>

//     <Link to="/refund-policy">Refund Policy</Link>
//     <span className="separator">|</span>

//     <Link to="/terms">Terms</Link>
    
//   </div>

//   <p className="copyright-text">
//     © 2026 Homewala Property. All rights reserved
//   </p>
// </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;


import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../../axiosConfig";
import { setFilterdData } from "../../features/BasicSlice";
import { getWebsiteLogoUrl } from "../../utils/brandAssets";
import "./footer.css";

const fallbackFooterLinks = [
  {
    name: "Apartments in Kundrathur",
    type: "apartment",
    property_area: "kundrathur",
  },
  
  {
    name: "Villas in ECR",
    type: "villa",
    property_area: "ecr",
  },
  {
    name: "Plots in Tiruchirappalli",
    type: "plot",
    property_area: "tiruchirappalli",
  },
];

const normalizeText = (value) =>
  String(value ?? "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toTitleCase = (value) =>
  normalizeText(value)
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const inferTypeFromLabel = (value) => {
  const text = normalizeText(value).toLowerCase();
  if (text.includes("apartment") || text.includes("flat")) return "apartment";
  if (text.includes("villa")) return "villa";
  if (text.includes("plot") || text.includes("land")) return "plot";
  return "property";
};

const toFooterLink = (item) => {
  const name = item?.name || item?.link || item?.label || item?.title || "";
  const rawArea = item?.property_area || item?.area || item?.location || item?.city || name;
  const propertyArea = toTitleCase(rawArea);

  return {
    name: normalizeText(name) || `${toTitleCase(propertyArea)} Properties`,
    type: item?.type || inferTypeFromLabel(name || rawArea),
    property_area: propertyArea,
    count: item?.count ?? item?.properties ?? item?.property_count ?? null,
  };
};

const Footer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { filter } = useSelector((store) => store.basic);

  const [footerLinks, setFooterLinks] = useState(fallbackFooterLinks);
  const [activeTab, setActiveTab] = useState("Real Estate");
  const [showAllLinks, setShowAllLinks] = useState(false);
  const [logoBroken, setLogoBroken] = useState(false);
  const [websiteInfo, setWebsiteInfo] = useState({
    logo: "",
    address: "",
    email_address: "",
    contact_number: "",
  });

  const tabs = ["Real Estate", "Contact Us"];
  const previewLimit = 12;
  const displayedFooterLinks = showAllLinks ? footerLinks : footerLinks.slice(0, previewLimit);
  const shouldShowMore = footerLinks.length > previewLimit;
  const logoSrc = getWebsiteLogoUrl(websiteInfo);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContactClick = () => {
    scrollToTop();
    navigate("/contact-us");
  };

  const fetchWebsiteInfo = async () => {
    try {
      const response = await api.get("/website-info");
      const data = response.data?.data ?? {};

      setWebsiteInfo({
        ...data,
        logo: getWebsiteLogoUrl(data),
        contact_number: "+91 8925997080",
      });
      setLogoBroken(false);

      if (data.favicon) {
        const faviconLink = document.querySelector("link[rel='icon']");
        if (faviconLink) faviconLink.href = data.favicon;
      }
    } catch (error) {
      console.error("Failed to fetch website information:", error);
    }
  };

  const fetchFooterLinks = async () => {
    try {
      const response = await api.get("/get-footer-links");
      const apiLinks = response.data?.links ?? response.data?.data ?? [];

      if (Array.isArray(apiLinks) && apiLinks.length > 0) {
        setFooterLinks(apiLinks.map(toFooterLink));
        return;
      }
    } catch (error) {
      console.error("Failed to fetch footer links:", error);
    }

    try {
      const response = await api.get("/get-property-places-count");
      const placeRows = response.data?.data ?? [];

      if (Array.isArray(placeRows) && placeRows.length > 0) {
        const mappedLinks = placeRows.slice(0, 20).map((place) => {
          const name = toTitleCase(place?.name || place?.location || place?.city);
          const area = normalizeText(place?.name || place?.location || place?.city).toLowerCase();

          return {
            name: name || "Properties",
            type: inferTypeFromLabel(name),
            property_area: area,
            count: place?.properties ?? place?.property_count ?? place?.count ?? null,
          };
        });

        setFooterLinks(mappedLinks);
        return;
      }
    } catch (error) {
      console.error("Failed to fetch property places for footer:", error);
    }

    setFooterLinks(fallbackFooterLinks);
  };

  const handleBuy = (data) => {
    dispatch(
      setFilterdData({
        chennai_property_area: data,
        paginate: 1,
      })
    );

    navigate(`/properties-in-${data.toLowerCase()}`);
  };

  const handleSearch = (value) => {
    const type = value?.type || inferTypeFromLabel(value?.name);
    const area = toTitleCase(value?.property_area || value?.name);

    dispatch(
      setFilterdData({
        ...filter,
        property_area: [area],
        search: [area],
        property_type: type,
        paginate: 1,
      })
    );

    const params = new URLSearchParams();
    if (area) params.set("location", area);
    if (type && type !== "property") params.set("type", type);

    window.scrollTo({ top: 80, left: 0, behavior: "auto" });
    navigate({
      pathname: "/properties",
      search: params.toString() ? `?${params.toString()}` : "",
    });
  };

  const toggleShowAllLinks = () => {
    setShowAllLinks((prev) => !prev);
  };

  useEffect(() => {
    fetchWebsiteInfo();
    fetchFooterLinks();
  }, []);

  return (
    <footer className="footer-section">
      <div className="footer-wrapper">
        <div className="footer-cta-banner">
          <div className="footer-cta-content">
            <h2>Do you need help?</h2>
            <p>
              We will provide detailed information about our services, types of work,
              and top projects. We will calculate the cost and prepare a commercial
              proposal.
            </p>
          </div>
          <button className="footer-cta-button" onClick={handleContactClick}>
            Contact Us <span className="arrow">→</span>
          </button>
        </div>

        <div className="footer-middle">
          <div className="footer-col footer-info-col">
            <h4 className="footer-col-title">INFO</h4>
            <ul className="footer-links">
              <li>
                <Link to="/about-us" onClick={scrollToTop}>
                  About us
                </Link>
              </li>
              <li>
                <Link to="/new-projects">Projects</Link>
              </li>
              <li>
                <Link to="/contact-us" onClick={scrollToTop}>
                  Contacts
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-col footer-properties-col">
            <h4 className="footer-col-title">PROPERTIES FOR SALE</h4>
            <ul className="footer-links">
              {displayedFooterLinks.map((item, index) => (
                <li key={`${item.property_area || item.name}-${index}`}>
                  <button
                    type="button"
                    className="footer-property-button"
                    onClick={() => handleSearch(item)}
                  >
                    {item.name}
                    {item.count !== null && item.count !== undefined ? ` (${item.count})` : ""}
                  </button>
                </li>
              ))}
            </ul>

            {shouldShowMore ? (
              <button
                type="button"
                onClick={toggleShowAllLinks}
                className="footer-show-more-button"
              >
                {showAllLinks ? "Show Less" : "Show More"}
              </button>
            ) : null}
          </div>

          <div className="footer-col footer-logo-col">
            <div className="footer-logo">
              {logoSrc && !logoBroken ? (
                <img
                  src={logoSrc}
                  alt="Homewala.com"
                  className="footer-logo-image"
                  onError={() => setLogoBroken(true)}
                />
              ) : (
                <span className="footer-logo-text">
                  <span className="logo-home">Home</span>wala.<span className="logo-com">com</span>
                </span>
              )}
            </div>
          </div>

          <div className="footer-col footer-contact-col">
            <p className="footer-contact-number">
              <a href={`tel:${String(websiteInfo.contact_number || "+91 8925997080").replace(/[^\d+]/g, "")}`}>
                {websiteInfo.contact_number || "+91 8925997080"}
              </a>
            </p>
            <p className="footer-contact-email">
              <a href={`mailto:${websiteInfo.email_address || "homewala@gmail.com"}`}>
                {websiteInfo.email_address || "homewala@gmail.com"}
              </a>
            </p>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-social-row">
          <a href="https://www.instagram.com/homewala_chennai/" target="_blank" rel="noopener noreferrer" className="social-link social-link--instagram">
            Instagram
            <span className="social-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </span>
          </a>
          <a href="https://www.facebook.com/p/Homewalacom-61576002254020/" target="_blank" rel="noopener noreferrer" className="social-link social-link--facebook">
            Facebook
            <span className="social-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9.5h2V7h-2c-2.21 0-4 1.79-4 4v2H8v2.5h2V19h2.5v-3.5H15l.5-2.5h-3V11c0-.83.67-1.5 1.5-1.5z"></path>
              </svg>
            </span>
          </a>
          <a href="https://www.youtube.com/@Homewala-com" target="_blank" rel="noopener noreferrer" className="social-link social-link--youtube">
            Youtube
            <span className="social-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.16 1 12 1 12s0 3.84.46 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.84 23 12 23 12s0-3.84-.46-5.58z"></path>
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
              </svg>
            </span>
          </a>
          <a
            href={`https://wa.me/${String(websiteInfo.contact_number || "+91 8925997080").replace(/[^\d]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link social-link--whatsapp"
          >
            Whatsapp
            <span className="social-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </span>
          </a>
        </div>

        <div className="footer-divider-subtle" />

       <div className="footer-bottom-bar">
  <div className="footer-bottom-links">
    <Link to="/">Home</Link>
    <span className="separator">|</span>

    <Link to="/buy-property">Buy</Link>
    <span className="separator">|</span>

    <Link to="/interior">Interior</Link>
    <span className="separator">|</span>

    <Link to="/budget-50-75-lakhs">Plot below 70L</Link>
    <span className="separator">|</span>

    <Link to="/privacy-policy">Privacy Policy</Link>
    <span className="separator">|</span>

    <Link to="/refund-policy">Refund Policy</Link>
    <span className="separator">|</span>

    <Link to="/terms">Terms</Link>
    
  </div>

  <p className="copyright-text">
    © 2026 Homewala Property. All rights reserved
  </p>
</div>
      </div>
    </footer>
  );
};

export default Footer;