import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://www.homewala.com";
const DEFAULT_AUTHOR = "Homewala";
const DEFAULT_PUBLISHER = "Homewala";
const DEFAULT_LANG = "en-IN";
const DEFAULT_ROBOTS = "index, follow";

const routeSeo = {
  "/": {
    title: "Homewala | Easy Way to Find a Perfect Property",
    description: "Find apartments, villas, plots, and smart property recommendations with a mobile-friendly Homewala experience.",
    keywords: "Homewala, property search, apartments, villas, plots, real estate India, property deals",
  },
  "/buy-property": {
    title: "Buy Property | Homewala",
    description: "Explore homes with a clear mobile-first interface designed for quick browsing, shortlist actions, and future listing expansion.",
    keywords: "buy property, homewala buyers, flats, villas, plots, real estate buyers",
  },
  "/new-projects": {
    title: "New Projects | Homewala",
    description: "Track fresh launches and new communities with project cards, launch updates, timelines, and brochure downloads.",
    keywords: "new projects, property launches, builder projects, homewala new communities",
  },
  "/resale-homes": {
    title: "Resale Homes | Homewala",
    description: "Browse resale apartments, villas, and owner listings from a dedicated Homewala resale route.",
    keywords: "resale homes, resale property, owner listings, second sale apartments, villas",
  },
  "/post-property": {
    title: "Post Property | Homewala",
    description: "Post your property with clarity using a mobile-friendly Homewala route built for listings, plans, and lead entry.",
    keywords: "post property, list property, builder listings, seller leads, homewala",
  },
  "/builder-plans": {
    title: "Builder Plans | Homewala",
    description: "Compare builder plans, premium features, and partnership options through a dedicated builder growth page.",
    keywords: "builder plans, builder growth, property marketing plans, homewala builders",
  },
  "/dashboard": {
    title: "Dashboard | Homewala",
    description: "Access future profile controls, listing analytics, saved properties, and lead updates from the Homewala dashboard.",
    keywords: "dashboard, account area, saved properties, listings analytics, homewala account",
  },
  "/interior": {
    title: "Interior | Homewala",
    description: "Explore Homewala interior services, room ideas, package types, and consultation-focused design content.",
    keywords: "interior design, home interiors, room ideas, homewala interior services",
  },
  "/blogs": {
    title: "Blogs | Homewala",
    description: "Read Homewala blogs for buying tips, location guides, builder updates, and SEO-friendly real estate content.",
    keywords: "real estate blogs, property tips, location guides, builder updates, homewala blog",
  },
  "/aisearch": {
    title: "AI Search | Homewala",
    description: "Search properties with Homewala AI Search to find homes by budget, locality, configuration, and property type.",
    keywords: "AI search, property search, homewala ai, budget homes, locality search, real estate search",
    canonical: `${SITE_URL}/aisearch`,
    robots: "index, follow",
  },
  "/about-us": {
    title: "About Us | Homewala",
    description: "Learn about the Homewala story, mission, values, and the service approach behind our property platform.",
    keywords: "about homewala, company story, real estate brand, homewala mission",
  },
  "/contact-us": {
    title: "Contact Us | Homewala",
    description: "Reach the Homewala team for builder partnerships, brochure requests, property posting help, and general enquiries.",
    keywords: "contact homewala, builder support, property enquiry, homewala contact",
  },
  "/refund-policy": {
    title: "Refund Policy | Homewala",
    description: "Read the Homewala refund policy for listings, subscriptions, transaction fees, support contacts, and exceptions.",
    keywords: "refund policy, listing refund, subscription refund, homewala refunds, property refund support",
  },
  "/sign-in": {
    title: "Sign In | Homewala",
    description: "Use the Homewala sign in page for customer login, builder access, and future account authentication flows.",
    keywords: "sign in, login, homewala account, builder access, customer login",
    robots: "noindex, nofollow",
  },
  "/best-deals": {
    title: "Best Deals | Homewala",
    description: "Explore the best value property deals with dedicated Homewala routing for buyers.",
    keywords: "best deals, property deals, best value homes, homewala offers",
  },
  "/nri-investment": {
    title: "NRI Investment | Homewala",
    description: "Discover NRI investment opportunities, guidance, and property options through a dedicated Homewala page.",
    keywords: "nri investment, nri property, real estate investment india, homewala nri",
  },
  "/luxury-homes": {
    title: "Luxury Homes | Homewala",
    description: "Browse premium villas, apartments, and high-end residences from a dedicated Homewala luxury route.",
    keywords: "luxury homes, premium villas, luxury apartments, high-end residences",
  },
  "/best-location-picks": {
    title: "Best Location Picks | Homewala",
    description: "Discover property options in top-performing and buyer-friendly locations with Homewala location picks.",
    keywords: "best locations, location picks, buyer friendly areas, property hotspots",
  },
  "/apartments": {
    title: "Apartments | Homewala",
    description: "Explore apartment listings, towers, and flat inventory from a dedicated apartments route.",
    keywords: "apartments, flats, apartment listings, towers, homewala apartments",
  },
  "/villas": {
    title: "Villas | Homewala",
    description: "Explore independent villas and gated-community homes from a dedicated villas route.",
    keywords: "villas, gated community homes, independent houses, homewala villas",
  },
  "/plots": {
    title: "Plots | Homewala",
    description: "Browse residential plots and land opportunities through a dedicated Homewala plots page.",
    keywords: "plots, land for sale, residential plots, homewala land",
  },
  "/budget-15-35-lakhs": {
    title: "Rs 15 - 35 Lakhs | Homewala",
    description: "Affordable property options in the Rs 15 to 35 Lakhs budget range.",
    keywords: "budget homes, 15 to 35 lakhs property, affordable homes",
  },
  "/budget-35-50-lakhs": {
    title: "Rs 35 - 50 Lakhs | Homewala",
    description: "Property options in the Rs 35 to 50 Lakhs budget range.",
    keywords: "35 to 50 lakhs property, mid-budget homes, budget property",
  },
  "/budget-50-75-lakhs": {
    title: "Rs 50 - 75 Lakhs | Homewala",
    description: "Property options in the Rs 50 to 75 Lakhs budget range.",
    keywords: "50 to 75 lakhs property, premium budget homes, homewala budget",
  },
  "/budget-75-lakhs-plus": {
    title: "Rs 75 Lakhs+ | Homewala",
    description: "Property options for buyers exploring budgets above Rs 75 Lakhs.",
    keywords: "75 lakhs plus, premium homes, luxury budget property",
  },
  "/for-nri": {
    title: "For NRI | Homewala",
    description: "Homewala services and guidance designed for NRI property buyers and investors.",
    keywords: "for nri, nri buyers, nri property guidance, homewala nri services",
  },
  "/nri-home-search": {
    title: "NRI Home Search | Homewala",
    description: "Search properties remotely with a dedicated NRI home search experience.",
    keywords: "nri home search, remote property search, nri real estate",
  },
  "/nri-legal-support": {
    title: "NRI Legal Support | Homewala",
    description: "Get legal support, documentation help, and NRI buying guidance through Homewala.",
    keywords: "nri legal support, nri documentation, property legal help",
  },
  "/builder-deals": {
    title: "Builder Deals | Homewala",
    description: "Highlight builder-specific deals, featured campaigns, and project promotions from one dedicated route.",
    keywords: "builder deals, project promotions, featured campaigns, homewala builders",
  },
  "/builder-offering": {
    title: "What We Offer | Homewala",
    description: "Understand Homewala builder offerings, marketing support, lead generation, and visibility benefits.",
    keywords: "builder offering, marketing support, lead generation, builder visibility",
  },
  "/brochure": {
    title: "Brochure | Homewala",
    description: "Access brochure downloads, project documents, and presentation assets through a dedicated page.",
    keywords: "brochure download, project documents, builder brochure, presentation assets",
  },
};

const upsertMetaTag = (selector, attributes) => {
  let tag = document.head.querySelector(selector);

  if (!tag) {
    tag = document.createElement("meta");
    Object.entries(attributes)
      .filter(([key]) => key !== "content")
      .forEach(([key, value]) => tag.setAttribute(key, value));
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", attributes.content);
};

const upsertLinkTag = (selector, attributes) => {
  let tag = document.head.querySelector(selector);

  if (!tag) {
    tag = document.createElement("link");
    Object.entries(attributes).forEach(([key, value]) => tag.setAttribute(key, value));
    document.head.appendChild(tag);
    return;
  }

  Object.entries(attributes).forEach(([key, value]) => tag.setAttribute(key, value));
};

const Seo = (overrides = {}) => {
  const location = useLocation();
  const pathname = location.pathname;
  const routeData = routeSeo[pathname] ?? {};
  const metadata = {
    title: "Homewala",
    description: "Discover properties and real estate services with Homewala.",
    keywords: "Homewala, real estate, property, builders, interiors",
    robots: DEFAULT_ROBOTS,
    author: DEFAULT_AUTHOR,
    publisher: DEFAULT_PUBLISHER,
    lang: DEFAULT_LANG,
    ...routeData,
    ...overrides,
  };

  const pageUrl = metadata.url ?? `${SITE_URL}${pathname}`;
  const canonical = metadata.canonical ?? pageUrl;

  useEffect(() => {
    document.title = metadata.title;
    document.documentElement.lang = metadata.lang;

    upsertMetaTag('meta[name="description"]', {
      name: "description",
      content: metadata.description,
    });

    upsertMetaTag('meta[name="keywords"]', {
      name: "keywords",
      content: metadata.keywords,
    });

    upsertMetaTag('meta[name="robots"]', {
      name: "robots",
      content: metadata.robots,
    });

    upsertMetaTag('meta[name="author"]', {
      name: "author",
      content: metadata.author,
    });

    upsertMetaTag('meta[name="publisher"]', {
      name: "publisher",
      content: metadata.publisher,
    });

    upsertMetaTag('meta[property="og:title"]', {
      property: "og:title",
      content: metadata.title,
    });

    upsertMetaTag('meta[property="og:description"]', {
      property: "og:description",
      content: metadata.description,
    });

    upsertMetaTag('meta[property="og:url"]', {
      property: "og:url",
      content: pageUrl,
    });

    upsertMetaTag('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: metadata.publisher,
    });

    upsertMetaTag('meta[property="og:locale"]', {
      property: "og:locale",
      content: metadata.lang,
    });

    upsertLinkTag('link[rel="canonical"]', {
      rel: "canonical",
      href: canonical,
    });
  }, [canonical, metadata.author, metadata.description, metadata.keywords, metadata.lang, metadata.publisher, metadata.robots, metadata.title, pageUrl]);

  return null;
};

export default Seo;
