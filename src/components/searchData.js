export const PROPERTY_TYPE_OPTIONS = [
  { label: "All", value: "all", to: "/buy-property" },
  { label: "Apartment", value: "apartment", to: "/apartments" },
  { label: "Villa", value: "villa", to: "/villas" },
  { label: "Plot", value: "plot", to: "/plots" },
];

export const TOP_PICK_OPTIONS = [
  { label: "Best Deals", value: "best-deals", to: "/best-deals" },
  { label: "NRI Investment", value: "nri-investment", to: "/nri-investment" },
  { label: "Luxury Homes", value: "luxury-homes", to: "/luxury-homes" },
  { label: "Best Location Picks", value: "best-location-picks", to: "/best-location-picks" },
];

export const BUDGET_OPTIONS = [
  { label: "Any Budget", value: "all", to: "" },
  { label: "Rs 15 - 35 Lakhs", value: "15-35", to: "/budget-15-35-lakhs" },
  { label: "Rs 35 - 50 Lakhs", value: "35-50", to: "/budget-35-50-lakhs" },
  { label: "Rs 50 - 75 Lakhs", value: "50-75", to: "/budget-50-75-lakhs" },
  { label: "Rs 75 Lakhs+", value: "75-plus", to: "/budget-75-lakhs-plus" },
];

export const CONTACT_ROUTE = "/contact-us";

export const QUICK_LINKS = TOP_PICK_OPTIONS.map(({ label, to }) => ({ label, to }));
