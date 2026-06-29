// import { useEffect, useRef, useState } from "react";
// import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   FaCaretDown,
//   FaCaretUp,
// } from "react-icons/fa";
// import {
//   AiOutlineUser,
// } from "react-icons/ai";
// import {
//   HiOutlineKey,
//   HiOutlineLogout,
// } from "react-icons/hi";
// import {
//   MdOutlinePostAdd,
// } from "react-icons/md";
// import { RiHeart3Line } from "react-icons/ri";

// import { setFilterdData, setIsNavbarModalOpen } from "../../features/BasicSlice";
// import { api } from "../../axiosConfig";
// import { toast } from "react-toastify";
// import "./navbar.css";

// const buyerSections = [
//   {
//     title: "Top Picks",
//     links: [
//       { label: "Best Deals", pick: "Best Deals" },
//       { label: "NRI Investment", pick: "NRI Investment" },
//       { label: "Luxury Homes", pick: "Luxury Homes" },
//       { label: "Best Location Picks", pick: "Best Location Picks" },
//     ],
//   },
//   {
//     title: "Property Type",
//     links: [
//       { label: "Apartment", type: "Apartment" },
//       { label: "Villa", type: "Villa" },
//       { label: "Plot", type: "Plot" },
//       { label: "Individual House", type: "Individual House" },
//     ],
//   },
//   {
//     title: "Price Starts From",
//     links: [
//       { label: "₹ 15 - 35 Lakhs", min: 1500000, max: 3499999 },
//       { label: "₹ 35 - 50 Lakhs", min: 3500000, max: 4999999 },
//       { label: "₹ 50 - 75 Lakhs", min: 5000000, max: 7499999 },
//       { label: "₹ 75 Lakhs+", min: 7500000, max: 999999999 },
//     ],
//   },
//   {
//     title: "Blogs",
//     links: [
//       { label: "Homebuyers Blog",  to: "/blog/top-government-schemes-for-home-buyers-in-chennai"},
//     ],
//   },
// ];

// const builderSections = [
//   {
//     title: "Deals",
//     links: [
//       {
//         label: "Projects",
//         to: "https://www.homewala.com/homewala/vendor/",
//       },
//       {
//         label: "Builder Deals",
//         to: "https://www.homewala.com/homewala/vendor/",
//       },
//       {
//         label: "Post Property",
//         to: "https://www.homewala.com/homewala/vendor/",
//       },
//     ],
//   },
//   {
//     title: "Blogs",
//     links: [
//       {
//         label: "Builder Blog",
//         to: "/blog/chennais-real-estate-hotspots-where-to-buy-in-2025",
//       },
//     ],
//   },
// ];

// const nriSections = [
//   {
//     title: "Services",
//     links: [
//       { label: "NRI Investment", to: "/nri-investment" },
//     ],
//   },
//   {
//     title: "Support",
//     links: [
//       { label: "Property Management", to: "/property-management" },
//     ],
//   },
//   {
//     title: "Blogs",
//     links: [
//       {
//         label: "NRI Blog",
//         to: "/blog/nri-investment-in-chennai-a-smart-choice-for-long-term-growth",
//       },
//     ],
//   },
// ];

// const directLinks = [
//   { label: "Interior", to: "/interior" },
//   { label: "Blogs", to: "/blogs" },
//   { label: "About us", to: "/about-us" },
// ];

// const HomeIcon = () => (
//   <svg viewBox="0 0 24 24" aria-hidden="true">
//     <path d="M4 10.5 12 4l8 6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
//     <path d="M6.5 9.5V19h11V9.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
//     <path d="M10 19v-4.5h4V19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
//   </svg>
// );

// const UserIcon = () => (
//   <svg viewBox="0 0 24 24" aria-hidden="true">
//     <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
//     <path d="M5.5 19c1.5-3 4-4.5 6.5-4.5s5 1.5 6.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
//   </svg>
// );

// const ArrowIcon = ({ isOpen }) => (
//   <span className={`nav-arrow ${isOpen ? "is-open" : ""}`} aria-hidden="true">
//     <svg viewBox="0 0 16 16">
//       <path d="M4.5 6.5 8 10l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
//     </svg>
//   </span>
// );

// const ProfileMenu = ({ isOpen, onClose, onLogout, dispatch }) => {
//   const navigate = useNavigate();

//   if (!isOpen) return null;

//   return (
//     <div className="profile-dropdown">
//       <button
//         type="button"
//         onClick={() => {
//           navigate("/profile");
//           onClose();
//         }}
//       >
//         <AiOutlineUser />
//         <span>Profile</span>
//       </button>
//       <button
//         type="button"
//         onClick={() => {
//           navigate("/wish-list");
//           onClose();
//         }}
//       >
//         <RiHeart3Line />
//         <span>Wishlist</span>
//       </button>
//       <button
//         type="button"
//         onClick={() => {
//           navigate("/post-property");
//           onClose();
//         }}
//       >
//         <MdOutlinePostAdd />
//         <span>Post Property</span>
//       </button>
//       <button
//         type="button"
//         onClick={() => {
//           navigate("/change-password");
//           onClose();
//         }}
//       >
//         <HiOutlineKey />
//         <span>Change Password</span>
//       </button>
//       <button type="button" className="logout" onClick={onLogout}>
//         <HiOutlineLogout />
//         <span>Log out</span>
//       </button>
//     </div>
//   );
// };

// const BuyerDropdown = ({ openMenu, onToggle, onNavigate, onSelectItem }) => {
//   const isOpen = openMenu === "For Buyers";
//   const [activeBuyerSection, setActiveBuyerSection] = useState("Top Picks");
//   const activeSection = buyerSections.find((section) => section.title === activeBuyerSection) ?? buyerSections[0];

//   useEffect(() => {
//     if (!isOpen) {
//       setActiveBuyerSection("Top Picks");
//     }
//   }, [isOpen]);

//   return (
//     <div className={`nav-dropdown-group nav-dropdown-buyers ${isOpen ? "is-open" : ""}`}>
//       <button type="button" className="nav-item nav-dropdown-trigger" onClick={() => onToggle(isOpen ? null : "For Buyers")}>
//         <span>For Buyers</span>
//         <ArrowIcon isOpen={isOpen} />
//       </button>

//       <div className="nav-dropdown-menu buyers-mega-menu">
//         <aside className="buyers-side-menu">
//           <div className="buyers-side-links">
//             {buyerSections.map((section) => (
//               <button key={section.title} type="button" className={`buyers-side-link ${activeBuyerSection === section.title ? "is-active" : ""}`} onClick={() => setActiveBuyerSection(section.title)}>
//                 {section.title}
//               </button>
//             ))}
//           </div>
//           <div className="buyers-contact-box">
//             <div className="buyers-contact-head">
//               <span className="buyers-contact-icon" aria-hidden="true">
//                 <svg viewBox="0 0 24 24">
//                   <path d="M6.7 4.9h2.4l1.2 3.1-1.5 1.7a13 13 0 0 0 5.4 5.4l1.7-1.5 3.1 1.2v2.4a1.4 1.4 0 0 1-1.4 1.4A14.7 14.7 0 0 1 5.3 6.3 1.4 1.4 0 0 1 6.7 4.9Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
//                 </svg>
//               </span>
//               <span className="buyers-contact-label">Contact us</span>
//             </div>
//             <a className="buyers-contact-number" href="tel:+918925997080">
//               +91 8925997080
//               <span className="buyers-contact-time">(9.30-5.30 IST)</span>
//             </a>
//           </div>
//         </aside>
//         <div className="buyers-main-panel">
//           <div className="buyers-main-copy">
//             <span className="buyers-main-label">{activeSection.title}</span>
//             <div className="buyers-link-grid">
//               {activeSection.links.map((item) => (
//                 <button
//                   key={`${activeSection.title}-${item.label}`}
//                   type="button"
//                   className="dropdown-link buyers-link"
//                   style={{ textAlign: "left" }}
//                   onClick={() => {
//                      if (item.to) {
//   onNavigate();
//   window.location.href = item.to;
// } else if (item.min != null && item.max != null) {
//   onSelectItem(item.min, item.max);
// } else if (item.pick) {
//   onSelectItem(item.pick);
// } else {
//   onSelectItem(item.to ?? item.type);
// }
//                   }}
//                 >
//                   {item.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="buyers-insight-card">
//             <span className="buyers-insight-tag">Introducing</span>
//             <strong>Insights</strong>
//             <p>Understand localities, compare options, and explore smarter property decisions.</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const BuilderDropdown = ({ openMenu, onToggle, onNavigate, onSelectItem }) => {
//   const isOpen = openMenu === "For Builders";
//   const [activeBuilderSection, setActiveBuilderSection] = useState("Deals");
//   const activeSection = builderSections.find((section) => section.title === activeBuilderSection) ?? builderSections[0];

//   useEffect(() => {
//     if (!isOpen) {
//       setActiveBuilderSection("Deals");
//     }
//   }, [isOpen]);

//   return (
//     <div className={`nav-dropdown-group nav-dropdown-buyers ${isOpen ? "is-open" : ""}`}>
//       <button type="button" className="nav-item nav-dropdown-trigger" onClick={() => onToggle(isOpen ? null : "For Builders")}>
//         <span>For Builders</span>
//         <ArrowIcon isOpen={isOpen} />
//       </button>

//       <div className="nav-dropdown-menu buyers-mega-menu">
//         <aside className="buyers-side-menu">
//           <div className="buyers-side-links">
//             {builderSections.map((section) => (
//               <button key={section.title} type="button" className={`buyers-side-link ${activeBuilderSection === section.title ? "is-active" : ""}`} onClick={() => setActiveBuilderSection(section.title)}>
//                 {section.title}
//               </button>
//             ))}
//           </div>
//           <div className="buyers-contact-box">
//             <div className="buyers-contact-head">
//               <span className="buyers-contact-icon" aria-hidden="true">
//                 <svg viewBox="0 0 24 24">
//                   <path d="M6.7 4.9h2.4l1.2 3.1-1.5 1.7a13 13 0 0 0 5.4 5.4l1.7-1.5 3.1 1.2v2.4a1.4 1.4 0 0 1-1.4 1.4A14.7 14.7 0 0 1 5.3 6.3 1.4 1.4 0 0 1 6.7 4.9Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
//                 </svg>
//               </span>
//               <span className="buyers-contact-label">Contact us</span>
//             </div>
//             <a className="buyers-contact-number" href="tel:+918925997080" onClick={onNavigate}>
//               <span className="buyers-contact-time">Builder support & partnerships</span>
//             </a>
//           </div>
//         </aside>
//         <div className="buyers-main-panel">
//           <div className="buyers-main-copy">
//             <span className="buyers-main-label">{activeSection.title}</span>
//             <div className="buyers-link-grid">
//               {activeSection.links.map((item) => (
//                 <button
//                   key={`${activeSection.title}-${item.label}`}
//                   type="button"
//                   className="dropdown-link buyers-link"
//                   style={{ textAlign: "left" }}
//                   onClick={() => {
//                         onSelectItem(item.to ?? item.type);
//                         onNavigate();
//                   }}
//                 >
//                   {item.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="buyers-insight-card">
//             <span className="buyers-insight-tag">For Builders</span>
//             <strong>Live Projects</strong>
//             <p>Browse and promote projects pulled from the live database, then share brochures and offers from one dedicated builder menu.</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const NriDropdown = ({ openMenu, onToggle, onNavigate, onSelectItem }) => {
//   const isOpen = openMenu === "For NRI";
//   const [activeNriSection, setActiveNriSection] = useState("Services");
//   const activeSection = nriSections.find((section) => section.title === activeNriSection) ?? nriSections[0];

//   useEffect(() => {
//     if (!isOpen) {
//       setActiveNriSection("Services");
//     }
//   }, [isOpen]);

//   return (
//     <div className={`nav-dropdown-group nav-dropdown-buyers ${isOpen ? "is-open" : ""}`}>
//       <button type="button" className="nav-item nav-dropdown-trigger" onClick={() => onToggle(isOpen ? null : "For NRI")}>
//         <span>For NRI</span>
//         <ArrowIcon isOpen={isOpen} />
//       </button>

//       <div className="nav-dropdown-menu buyers-mega-menu">
//         <aside className="buyers-side-menu">
//           <div className="buyers-side-links">
//             {nriSections.map((section) => (
//               <button key={section.title} type="button" className={`buyers-side-link ${activeNriSection === section.title ? "is-active" : ""}`} onClick={() => setActiveNriSection(section.title)}>
//                 {section.title}
//               </button>
//             ))}
//           </div>
//           <div className="buyers-contact-box">
//             <div className="buyers-contact-head">
//               <span className="buyers-contact-icon" aria-hidden="true">
//                 <svg viewBox="0 0 24 24">
//                   <path d="M6.7 4.9h2.4l1.2 3.1-1.5 1.7a13 13 0 0 0 5.4 5.4l1.7-1.5 3.1 1.2v2.4a1.4 1.4 0 0 1-1.4 1.4A14.7 14.7 0 0 1 5.3 6.3 1.4 1.4 0 0 1 6.7 4.9Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
//                 </svg>
//               </span>
//               <span className="buyers-contact-label">Contact us</span>
//             </div>
//             <a className="buyers-contact-number" href="tel:+918925997080" onClick={onNavigate}>
//               <span className="buyers-contact-time">NRI support & guidance</span>
//             </a>
//           </div>
//         </aside>
//         <div className="buyers-main-panel">
//           <div className="buyers-main-copy">
//             <span className="buyers-main-label">{activeSection.title}</span>
//             <div className="buyers-link-grid">
//               {activeSection.links.map((item) => (
//                 <button
//                   key={`${activeSection.title}-${item.label}`}
//                   type="button"
//                   className="dropdown-link buyers-link"
//                   style={{ textAlign: "left" }}
//                   onClick={() => {
//                         onSelectItem(item.to ?? item.type);
//                         onNavigate();
//                   }}
//                 >
//                   {item.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="buyers-insight-card">
//             <span className="buyers-insight-tag">For NRI</span>
//             <strong>Buy from anywhere</strong>
//             <p>Explore investment, home search, and legal support with a dedicated NRI navigation flow.</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default function Navbar() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const location = useLocation();
//   const navRef = useRef(null);
//   const profileRef = useRef(null);

//   const auth = localStorage.getItem("access_token");
//   const { user } = useSelector((state) => state.basic);

//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [openMenu, setOpenMenu] = useState(null);
//   const [profileOpen, setProfileOpen] = useState(false);

//   useEffect(() => {
//     setMobileOpen(false);
//     setOpenMenu(null);
//     setProfileOpen(false);
//   }, [location.pathname]);

//   useEffect(() => {
//     const handleOutsideClick = (event) => {
//       if (navRef.current && !navRef.current.contains(event.target)) {
//         setOpenMenu(null);
//       }
//       if (profileRef.current && !profileRef.current.contains(event.target)) {
//         setProfileOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleOutsideClick);
//     return () => document.removeEventListener("mousedown", handleOutsideClick);
//   }, []);

//   useEffect(() => {
//     document.body.style.overflow = mobileOpen ? "hidden" : "";
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [mobileOpen]);

//   const logout = async () => {
//     try {
//       const response = await api.post("/logout");
//       if (response.data.status === "success") {
//         dispatch(setIsNavbarModalOpen(false));
//         toast.success(response.data.message);
//         localStorage.removeItem("access_token");
//         window.location.reload();
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Logout failed");
//     }
//   };

//   const closeAll = () => {
//     setMobileOpen(false);
//     setOpenMenu(null);
//     setProfileOpen(false);
//   };

//   const handleBudgetSelection = (min, max) => {
//     const updatedFilter = {
//       paginate: 1,
//       min_price: min,
//       max_price: max || 999999999,
//       property_type: "",
//       top_pick: "",
//       chennai_property_area: "",
//       categoryId: "",
//       property_area: "",
//     };
//     dispatch(setFilterdData(updatedFilter));
    
//     if (min === 1500000) {
//       navigate("/budget-15-35-lakhs");
//     } else if (min === 3500000) {
//       navigate("/budget-35-50-lakhs");
//     } else if (min === 5000000) {
//       navigate("/budget-50-75-lakhs");
//     } else if (min === 7500000) {
//       navigate("/budget-75-lakhs-plus");
//     } else {
//       navigate("/properties-for-sale-in-chennai");
//     }
//   };

//   const handleTopPickSelection = (value) => {
//     dispatch(setFilterdData({ 
//       paginate: 1, 
//       top_pick: value,
//       min_price: "",
//       max_price: "",
//       property_type: "",
//       chennai_property_area: "",
//       categoryId: "",
//       property_area: "",
//       location: ""
//     }));

//     if (value === "Best Deals") {
//       navigate("/best-deals");
//       return;
//     }

//     if (value === "Best Location Picks") {
//       navigate("/best-location-picks");
//       return;
//     }

//     if (value === "Luxury Homes") {
//       navigate("/luxury-homes-in-chennai");
//       return;
//     }

//     if (value === "NRI Investment") {
//       navigate("/nri-investment");
//       return;
//     }

//     navigate("/list-view");
//   };

//   const onBuySelection = (value, max) => {
//     if (typeof max === "number") {
//       handleBudgetSelection(value, max);
//       return;
//     }
//     if (typeof value === "string") {
//       if (["Apartment", "Villa", "Plot", "Individual House"].includes(value)) {
//         const updatedFilter = {
//           paginate: 1,
//           property_type: value,
//           top_pick: "",
//           min_price: "",
//           max_price: "",
//           chennai_property_area: "",
//           categoryId: "",
//           property_area: "",
//           location: "",
//         };

//         dispatch(setFilterdData(updatedFilter));

//         if (value === "Apartment") {
//           navigate("/apartments-in-chennai/type/Apartment", {
//             state: {
//               filters: updatedFilter,
//               heading: "Apartments in Chennai",
//               subtitle: "Browse all apartment projects.",
//             },
//           });
//         } else if (value === "Villa") {
//           navigate("/villas-in-chennai/type/Villa", {
//             state: {
//               filters: updatedFilter,
//               heading: "Villas in Chennai",
//               subtitle: "Browse all villa projects.",
//             },
//           });
//         } else if (value === "Plot") {
//           navigate("/plots-in-chennai/type/Plot", {
//             state: {
//               filters: updatedFilter,
//               heading: "Plots in Chennai",
//               subtitle: "Browse all plot projects.",
//             },
//           });
//         } else if (value === "Individual House") {
//           navigate("/individual-house-in-chennai/type/Individual-House", {
//             state: {
//               filters: updatedFilter,
//               heading: "Individual Houses in Chennai",
//               subtitle: "Browse all individual house projects.",
//             },
//           });
//         } else {
//           navigate("/list-view");
//         }
//         return;
//       }
//       handleTopPickSelection(value);
//     }
//   };

// const handleRouteSelection = (to) => {
//   if (to.startsWith("http")) {
//     window.open(to, "_blank");
//   } else {
//     navigate(to);
//   }
// };

//   return (
//     <header className={`navbar-wrap ${mobileOpen ? "is-mobile-open" : ""}`} ref={navRef}>
//       <div className="navbar-container">
//         <Link className="logo" to="/" aria-label="Homewala home page">
//           <span className="logo-blue">Home</span>
//           <span className="logo-dark">wala</span>
//           <span className="logo-dot">.com</span>
//         </Link>

//         {!auth ? (
//           <button
//             type="button"
//             className="mobile-signin-btn"
//             onClick={() => {
//               dispatch(setIsNavbarModalOpen("login"));
//               setMobileOpen(false);
//               setOpenMenu(null);
//               setProfileOpen(false);
//             }}
//             aria-label="Sign in"
//           >
//             <UserIcon />
//           </button>
//         ) : null}

//         <button
//           type="button"
//           className={`menu-toggle ${mobileOpen ? "is-open" : ""}`}
//           aria-label="Toggle navigation menu"
//           aria-expanded={mobileOpen}
//           onClick={() => {
//             setMobileOpen((current) => !current);
//             setOpenMenu(null);
//             setProfileOpen(false);
//           }}
//         >
//           <span />
//           <span />
//           <span />
//         </button>

//         <div className={`nav-panel ${mobileOpen ? "is-open" : ""}`}>
//           <nav className="menu" aria-label="Primary navigation">
//             <BuyerDropdown openMenu={openMenu} onToggle={setOpenMenu} onNavigate={closeAll} onSelectItem={onBuySelection} />
//             <BuilderDropdown openMenu={openMenu} onToggle={setOpenMenu} onNavigate={closeAll} onSelectItem={handleRouteSelection} />
//             <NriDropdown openMenu={openMenu} onToggle={setOpenMenu} onNavigate={closeAll} onSelectItem={handleRouteSelection} />

//             {directLinks.map((item) => (
//               <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={closeAll}>
//                 {item.label}
//               </NavLink>
//             ))}
//           </nav>

//           <div className="right-section">
//             <NavLink className="post-btn post-btn-combined" to="/post-property" onClick={closeAll}>
//               <span className="post-btn-icon" aria-hidden="true">
//                 <HomeIcon />
//               </span>
//               <span>Post Property</span>
//             </NavLink>

//             {auth ? (
//               <div className="profile-wrap" ref={profileRef}>
//                 <button
//                   type="button"
//                   className="profile-toggle"
//                   onClick={() => setProfileOpen((current) => !current)}
//                 >
//                   <span className="profile-avatar">
//                     {user?.profile_image ? (
//                         <img src={user.profile_image} alt="Profile" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
//                     ) : (
//                         <UserIcon />
//                     )}
//                   </span>
//                 </button>
//                 <ProfileMenu
//                   isOpen={profileOpen}
//                   onClose={() => setProfileOpen(false)}
//                   onLogout={logout}
//                   dispatch={dispatch}
//                 />
//               </div>
//             ) : (
//               <button
//                 type="button"
//                 className="icon-link profile-link"
//                 onClick={() => {
//                   dispatch(setIsNavbarModalOpen("login"));
//                   closeAll();
//                 }}
//                 aria-label="Sign in"
//                 style={{ cursor: "pointer" }}
//               >
//                 <UserIcon />
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaCaretDown,
  FaCaretUp,
} from "react-icons/fa";
import {
  AiOutlineUser,
} from "react-icons/ai";
import {
  HiOutlineKey,
  HiOutlineLogout,
} from "react-icons/hi";
import {
  MdOutlinePostAdd,
} from "react-icons/md";
import { RiHeart3Line } from "react-icons/ri";
import postPropertyImage from "../../assets/postpropertypage.jpeg";

// FIX: import setPropertiesList so we can clear stale data before navigating
import { setFilterdData, setIsNavbarModalOpen, setPropertiesList } from "../../features/BasicSlice";
import { api } from "../../axiosConfig";
import { getWebsiteLogoUrl } from "../../utils/brandAssets";
import { buildPropertyUrl } from "../../utils/propertyUrl";
import { toast } from "react-toastify";
import "./navbar.css";

const buyerSections = [
  {
    title: "Top Picks",
    links: [
      { label: "Best Deals", pick: "Best Deals" },
      { label: "NRI Investment", pick: "NRI Investment" },
      { label: "Luxury Homes", pick: "Luxury Homes" },
      { label: "Best Location Picks", pick: "Best Location Picks" },
    ],
  },
  {
    title: "Property Type",
    links: [
      { label: "Apartment", type: "Apartment" },
      { label: "Villa", type: "Villa" },
      { label: "Plot", type: "Plot" },
      { label: "Individual House", type: "Individual House" },
    ],
  },
  {
    title: "Price Starts From",
    links: [
      { label: "₹ 15 - 35 Lakhs", min: 1500000, max: 3499999 },
      { label: "₹ 35 - 50 Lakhs", min: 3500000, max: 4999999 },
      { label: "₹ 50 - 75 Lakhs", min: 5000000, max: 7499999 },
      { label: "₹ 75 Lakhs+", min: 7500000, max: 999999999 },
    ],
  },
  {
    title: "Blogs",
    links: [
      { label: "Homebuyers Blog", to: "/blog/top-government-schemes-for-home-buyers-in-chennai" },
    ],
  },
];

const builderSections = [
  {
    title: "Deals",
    links: [
      { label: "Projects", to: "https://www.homewala.com/homewala/vendor/" },
      { label: "Builder Deals", to: "https://www.homewala.com/homewala/vendor/" },
      { label: "Post Property", to: "https://www.homewala.com/homewala/vendor/" },
    ],
  },
  {
    title: "Blogs",
    links: [
      { label: "Builder Blog", to: "/blog/chennais-real-estate-hotspots-where-to-buy-in-2025" },
    ],
  },
];

const nriSections = [
  {
    title: "Services",
    links: [
      { label: "NRI Investment", to: "/nri-investment" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Property Management", to: "/property-management" },
    ],
  },
  {
    title: "Blogs",
    links: [
      { label: "NRI Blog", to: "/blog/nri-investment-in-chennai-a-smart-choice-for-long-term-growth" },
    ],
  },
];

const directLinks = [
  { label: "Interior", to: "/interior" },
  { label: "Blogs", to: "/blogs" },
  { label: "About us", to: "/about-us" },
];

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 10.5 12 4l8 6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.5 9.5V19h11V9.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 19v-4.5h4V19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path d="M5.5 19c1.5-3 4-4.5 6.5-4.5s5 1.5 6.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const ArrowIcon = ({ isOpen }) => (
  <span className={`nav-arrow ${isOpen ? "is-open" : ""}`} aria-hidden="true">
    <svg viewBox="0 0 16 16">
      <path d="M4.5 6.5 8 10l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

const ProfileMenu = ({ isOpen, onClose, onLogout, dispatch }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;
  return (
    <div className="profile-dropdown">
      <button type="button" onClick={() => { navigate("/profile"); onClose(); }}>
        <AiOutlineUser /><span>Profile</span>
      </button>
      <button type="button" onClick={() => { navigate("/wish-list"); onClose(); }}>
        <RiHeart3Line /><span>Wishlist</span>
      </button>
      <button type="button" onClick={() => { navigate("/post-property"); onClose(); }}>
        <MdOutlinePostAdd /><span>Post Property</span>
      </button>
      <button type="button" onClick={() => { navigate("/change-password"); onClose(); }}>
        <HiOutlineKey /><span>Change Password</span>
      </button>
      <button type="button" className="logout" onClick={onLogout}>
        <HiOutlineLogout /><span>Log out</span>
      </button>
    </div>
  );
};

const BuyerDropdown = ({ openMenu, onToggle, onNavigate, onSelectItem }) => {
  const isOpen = openMenu === "For Buyers";
  const [activeBuyerSection, setActiveBuyerSection] = useState("Top Picks");
  const activeSection = buyerSections.find((section) => section.title === activeBuyerSection) ?? buyerSections[0];
  const navigate = useNavigate();
  useEffect(() => {
    if (!isOpen) {
      setActiveBuyerSection("Top Picks");
    }
  }, [isOpen]);

  return (
    <div className={`nav-dropdown-group nav-dropdown-buyers ${isOpen ? "is-open" : ""}`}>
      <button type="button" className="nav-item nav-dropdown-trigger" onClick={() => onToggle(isOpen ? null : "For Buyers")}>
        <span>For Buyers</span>
        <ArrowIcon isOpen={isOpen} />
      </button>

      <div className="nav-dropdown-menu buyers-mega-menu">
        <aside className="buyers-side-menu">
          <div className="buyers-side-links">
            {buyerSections.map((section) => (
              <button
                key={section.title}
                type="button"
                className={`buyers-side-link ${activeBuyerSection === section.title ? "is-active" : ""}`}
                onClick={() => setActiveBuyerSection(section.title)}
              >
                {section.title}
              </button>
            ))}
          </div>
          <div className="buyers-contact-box">
            <div className="buyers-contact-head">
              <span className="buyers-contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M6.7 4.9h2.4l1.2 3.1-1.5 1.7a13 13 0 0 0 5.4 5.4l1.7-1.5 3.1 1.2v2.4a1.4 1.4 0 0 1-1.4 1.4A14.7 14.7 0 0 1 5.3 6.3 1.4 1.4 0 0 1 6.7 4.9Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="buyers-contact-label">Contact us</span>
            </div>
            <a className="buyers-contact-number" href="tel:+918925997080">
              +91 8925997080
              <span className="buyers-contact-time">(9.30-5.30 IST)</span>
            </a>
          </div>
        </aside>
          <div className="buyers-main-panel">
          <div className="buyers-main-copy">
            <span className="buyers-main-label">{activeSection.title}</span>
            <div className="buyers-link-grid">
              {activeSection.links.map((item) => (
                <button
                  key={`${activeSection.title}-${item.label}`}
                  type="button"
                  className="dropdown-link buyers-link"
                  style={{ textAlign: "left" }}
                  onClick={() => {
                    if (item.to) {
                      onNavigate();
                      window.location.href = item.to;
                    } else if (item.min != null && item.max != null) {
                      onSelectItem(item.min, item.max);
                    } else if (item.pick) {
                      onSelectItem(item.pick);
                    } else {
                      onSelectItem(item.to ?? item.type);
                    }
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
         <div className="buyers-insight-card" onClick={() => navigate("/properties")}>

            <div className="buyers-insight-card-inner">
              <div className="buyers-insight-copy">
                <strong>Buy faster at the right place!</strong>
                {/* <p>Explore localities, compare options, and find your perfect property.</p> */}
              </div>
              <img src={postPropertyImage} alt="Post Property" className="buyers-insight-image" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const viewTypeHandleChange = (view) => {
  dispatch(setToggleView(view));
  if (view === "Map") {
    const locationParam = searchParams.get("location");
    // Pass location in URL → MapView reads it once at mount, no Redux needed
    navigate(buildPropertyUrl("/map", { location: locationParam }));
  }
};
const BuilderDropdown = ({ openMenu, onToggle, onNavigate, onSelectItem }) => {
  const isOpen = openMenu === "For Builders";
  const [activeBuilderSection, setActiveBuilderSection] = useState("Deals");
  const activeSection = builderSections.find((section) => section.title === activeBuilderSection) ?? builderSections[0];
  const navigate = useNavigate();
  useEffect(() => {
    if (!isOpen) {
      setActiveBuilderSection("Deals");
    }
  }, [isOpen]);

  return (
    <div className={`nav-dropdown-group nav-dropdown-buyers ${isOpen ? "is-open" : ""}`}>
      <button type="button" className="nav-item nav-dropdown-trigger" onClick={() => onToggle(isOpen ? null : "For Builders")}>
        <span>For Builders</span>
        <ArrowIcon isOpen={isOpen} />
      </button>

      <div className="nav-dropdown-menu buyers-mega-menu">
        <aside className="buyers-side-menu">
          <div className="buyers-side-links">
            {builderSections.map((section) => (
              <button
                key={section.title}
                type="button"
                className={`buyers-side-link ${activeBuilderSection === section.title ? "is-active" : ""}`}
                onClick={() => setActiveBuilderSection(section.title)}
              >
                {section.title}
              </button>
            ))}
          </div>
          <div className="buyers-contact-box">
            <div className="buyers-contact-head">
              <span className="buyers-contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M6.7 4.9h2.4l1.2 3.1-1.5 1.7a13 13 0 0 0 5.4 5.4l1.7-1.5 3.1 1.2v2.4a1.4 1.4 0 0 1-1.4 1.4A14.7 14.7 0 0 1 5.3 6.3 1.4 1.4 0 0 1 6.7 4.9Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="buyers-contact-label">Contact us</span>
            </div>
            <a className="buyers-contact-number" href="tel:+918925997080" onClick={onNavigate}>
              <span className="buyers-contact-time">Builder support & partnerships</span>
            </a>
          </div>
        </aside>
        <div className="buyers-main-panel">
          <div className="buyers-main-copy">
            <span className="buyers-main-label">{activeSection.title}</span>
            <div className="buyers-link-grid">
              {activeSection.links.map((item) => (
                <button
                  key={`${activeSection.title}-${item.label}`}
                  type="button"
                  className="dropdown-link buyers-link"
                  style={{ textAlign: "left" }}
                  onClick={() => {
                    onSelectItem(item.to ?? item.type);
                    onNavigate();
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        
          <div className="buyers-insight-card" onClick={() => navigate("/contact-us")}>
            <div className="buyers-insight-card-inner">
              <div className="buyers-insight-copy">
                <strong> Sell faster at the right place!</strong>
                {/* <p>Get discovered by the right people at the right time.</p> */}
              </div>
              <img src={postPropertyImage} alt="Post Property" className="buyers-insight-image" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NriDropdown = ({ openMenu, onToggle, onNavigate, onSelectItem }) => {
  const isOpen = openMenu === "For NRI";
  const [activeNriSection, setActiveNriSection] = useState("Services");
  const activeSection = nriSections.find((section) => section.title === activeNriSection) ?? nriSections[0];
  const navigate = useNavigate();
  useEffect(() => {

    if (!isOpen) {
      setActiveNriSection("Services");
    }
  }, [isOpen]);

  return (
    <div className={`nav-dropdown-group nav-dropdown-buyers ${isOpen ? "is-open" : ""}`}>
      <button type="button" className="nav-item nav-dropdown-trigger" onClick={() => onToggle(isOpen ? null : "For NRI")}>
        <span>For NRI</span>
        <ArrowIcon isOpen={isOpen} />
      </button>

      <div className="nav-dropdown-menu buyers-mega-menu">
        <aside className="buyers-side-menu">
          <div className="buyers-side-links">
            {nriSections.map((section) => (
              <button
                key={section.title}
                type="button"
                className={`buyers-side-link ${activeNriSection === section.title ? "is-active" : ""}`}
                onClick={() => setActiveNriSection(section.title)}
              >
                {section.title}
              </button>
            ))}
          </div>
          <div className="buyers-contact-box">
            <div className="buyers-contact-head">
              <span className="buyers-contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M6.7 4.9h2.4l1.2 3.1-1.5 1.7a13 13 0 0 0 5.4 5.4l1.7-1.5 3.1 1.2v2.4a1.4 1.4 0 0 1-1.4 1.4A14.7 14.7 0 0 1 5.3 6.3 1.4 1.4 0 0 1 6.7 4.9Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="buyers-contact-label">Contact us</span>
            </div>
            <a className="buyers-contact-number" href="tel:+918925997080" onClick={onNavigate}>
              <span className="buyers-contact-time">NRI support & guidance</span>
            </a>
          </div>
        </aside>
        <div className="buyers-main-panel">
          <div className="buyers-main-copy">
            <span className="buyers-main-label">{activeSection.title}</span>
            <div className="buyers-link-grid">
              {activeSection.links.map((item) => (
                <button
                  key={`${activeSection.title}-${item.label}`}
                  type="button"
                  className="dropdown-link buyers-link"
                  style={{ textAlign: "left" }}
                  onClick={() => {
                    onSelectItem(item.to ?? item.type);
                    onNavigate();
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="buyers-insight-card" onClick={() => navigate("/property-management")}>
            <div className="buyers-insight-card-inner">
              <div className="buyers-insight-copy">
                <strong>Property Management at the right place!</strong>
                
                {/* <p>Invest in your future with verified properties across India.</p> */}
              </div>
              <img src={postPropertyImage} alt="Post Property" className="buyers-insight-image" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const navRef = useRef(null);
  const profileRef = useRef(null);

  const auth = localStorage.getItem("access_token");
  const { user } = useSelector((state) => state.basic);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoBroken, setLogoBroken] = useState(false);
  const [websiteInfo, setWebsiteInfo] = useState({ logo: "" });
  const logoSrc = getWebsiteLogoUrl(websiteInfo);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    let isMounted = true;

    const fetchWebsiteInfo = async () => {
      try {
        const response = await api.get("/website-info");
        const data = response.data?.data ?? {};

        if (!isMounted) return;

        setWebsiteInfo({
          ...data,
          logo: getWebsiteLogoUrl(data),
        });
        setLogoBroken(false);
      } catch (error) {
        console.error("Failed to fetch website information:", error);
      }
    };

    fetchWebsiteInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = async () => {
    try {
      const response = await api.post("/logout");
      if (response.data.status === "success") {
        dispatch(setIsNavbarModalOpen(false));
        toast.success(response.data.message);
        localStorage.removeItem("access_token");
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
      toast.error("Logout failed");
    }
  };

  const closeAll = () => {
    setMobileOpen(false);
    setOpenMenu(null);
    setProfileOpen(false);
  };

  const handleBudgetSelection = (min, max) => {
    const updatedFilter = {
      paginate: 1,
      min_price: min,
      max_price: max || 999999999,
      property_type: "",
      top_pick: "",
      chennai_property_area: "",
      categoryId: "",
      property_area: "",
    };
    dispatch(setFilterdData(updatedFilter));
    // FIX: clear stale list so old results don't flash while new fetch runs
    dispatch(setPropertiesList({ data: [] }));

    if (min === 1500000) {
      navigate("/budget-15-35-lakhs");
    } else if (min === 3500000) {
      navigate("/budget-35-50-lakhs");
    } else if (min === 5000000) {
      navigate("/budget-50-75-lakhs");
    } else if (min === 7500000) {
      navigate("/budget-75-lakhs-plus");
    } else {
      navigate("/properties-for-sale-in-chennai");
    }
  };

  const handleTopPickSelection = (value) => {
    dispatch(setFilterdData({
      paginate: 1,
      top_pick: value,
      min_price: "",
      max_price: "",
      property_type: "",
      chennai_property_area: "",
      categoryId: "",
      property_area: "",
      location: "",
    }));
    // FIX: clear stale list so old results don't flash while new fetch runs
    dispatch(setPropertiesList({ data: [] }));

    if (value === "Best Deals") {
      navigate("/best-deals");
      return;
    }
    if (value === "Best Location Picks") {
      navigate("/best-location-picks");
      return;
    }
    if (value === "Luxury Homes") {
      navigate("/luxury-homes-in-chennai");
      return;
    }
    if (value === "NRI Investment") {
      navigate("/nri-investment");
      return;
    }
    navigate("/list-view");
  };

  const onBuySelection = (value, max) => {
    if (typeof max === "number") {
      handleBudgetSelection(value, max);
      return;
    }
    if (typeof value === "string") {
      if (["Apartment", "Villa", "Plot", "Individual House"].includes(value)) {
        const updatedFilter = {
          paginate: 1,
          property_type: value,
          top_pick: "",
          min_price: "",
          max_price: "",
          chennai_property_area: "",
          categoryId: "",
          property_area: "",
          location: "",
        };

        dispatch(setFilterdData(updatedFilter));
        // FIX: clear stale Redux list BEFORE navigating so the new page starts
        // empty instead of briefly showing the previous type's results while
        // the fresh API call is still in-flight.
        dispatch(setPropertiesList({ data: [] }));

        if (value === "Apartment") {
          navigate("/apartments-in-chennai", {
            state: {
              filters: updatedFilter,
              heading: "Apartments in Chennai",
              subtitle: "Browse all apartment projects.",
            },
          });
        } else if (value === "Villa") {
          navigate("/villas-in-chennai", {
            state: {
              filters: updatedFilter,
              heading: "Villas in Chennai",
              subtitle: "Browse all villa projects.",
            },
          });
        } else if (value === "Plot") {
          navigate("/plots-in-chennai", { 
            state: {
              filters: updatedFilter,
              heading: "Plots in Chennai",
              subtitle: "Browse all plot projects.",
            },
          });
        } else if (value === "Individual House") {
          navigate("/individual-house-in-chennai", {
            state: {
              filters: updatedFilter,
              heading: "Individual Houses in Chennai",
              subtitle: "Browse all individual house projects.",
            },
          });
        } else {
          navigate("/list-view");
        }
        return;
      }
      handleTopPickSelection(value);
    }
  };

  const handleRouteSelection = (to) => {
    if (to.startsWith("http")) {
      window.open(to, "_blank");
    } else {
      navigate(to);
    }
  };

  return (
    <header className={`navbar-wrap ${mobileOpen ? "is-mobile-open" : ""}`} ref={navRef}>
      <div className="navbar-container">
        <Link className="logo" to="/" aria-label="Homewala home page">
          {logoSrc && !logoBroken ? (
            <img
              src={logoSrc}
              alt="Homewala.com"
              className="logo-image"
              onError={() => setLogoBroken(true)}
            />
          ) : (
            <>
              <span className="logo-blue">Home</span>
              <span className="logo-dark">wala</span>
              <span className="logo-dot">.com</span>
            </>
          )}
        </Link>

        {!auth ? (
          <button
            type="button"
            className="mobile-signin-btn"
            onClick={() => {
              dispatch(setIsNavbarModalOpen("login"));
              setMobileOpen(false);
              setOpenMenu(null);
              setProfileOpen(false);
            }}
            aria-label="Sign in"
          >
            <UserIcon />
          </button>
        ) : null}

        <button
          type="button"
          className={`menu-toggle ${mobileOpen ? "is-open" : ""}`}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          onClick={() => {
            setMobileOpen((current) => !current);
            setOpenMenu(null);
            setProfileOpen(false);
          }}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`nav-panel ${mobileOpen ? "is-open" : ""}`}>
          <nav className="menu" aria-label="Primary navigation">
            <BuyerDropdown openMenu={openMenu} onToggle={setOpenMenu} onNavigate={closeAll} onSelectItem={onBuySelection} />
            <BuilderDropdown openMenu={openMenu} onToggle={setOpenMenu} onNavigate={closeAll} onSelectItem={handleRouteSelection} />
            <NriDropdown openMenu={openMenu} onToggle={setOpenMenu} onNavigate={closeAll} onSelectItem={handleRouteSelection} />

            {directLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                onClick={closeAll}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="right-section">
            <NavLink className="post-btn post-btn-combined" to="/post-property" onClick={closeAll}>
              <span className="post-btn-icon" aria-hidden="true">
                <HomeIcon />
              </span>
              <span>Post Property</span>
            </NavLink>

            {auth ? (
              <div className="profile-wrap" ref={profileRef}>
                <button
                  type="button"
                  className="profile-toggle"
                  onClick={() => setProfileOpen((current) => !current)}
                >
                  <span className="profile-avatar">
                    {user?.profile_image ? (
                      <img
                        src={user.profile_image}
                        alt="Profile"
                        style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      <UserIcon />
                    )}
                  </span>
                </button>
                <ProfileMenu
                  isOpen={profileOpen}
                  onClose={() => setProfileOpen(false)}
                  onLogout={logout}
                  dispatch={dispatch}
                />
              </div>
            ) : (
              <button
                type="button"
                className="icon-link profile-link"
                onClick={() => {
                  dispatch(setIsNavbarModalOpen("login"));
                  closeAll();
                }}
                aria-label="Sign in"
                style={{ cursor: "pointer" }}
              >
                <UserIcon />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
