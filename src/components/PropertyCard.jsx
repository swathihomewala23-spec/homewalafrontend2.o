import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { api } from "../axiosConfig";
import { setIsNavbarModalOpen, setPropertiesList } from "../features/BasicSlice";
import "./PropertyCard.css";

const Icon = ({ children }) => (
  <span className="property-card-icon" aria-hidden="true">
    {children}
  </span>
);

const LocationIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M12 21s6-5.4 6-10.8a6 6 0 1 0-12 0C6 15.6 12 21 12 21Zm0-8.2a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4Z" fill="currentColor" />
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);
const CurrencyIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M12 3v18M16 6.5c0-1.4-1.8-2.5-4-2.5S8 4.8 8 6.5 9.9 9 12 9s4 1.1 4 2.5S14.2 14 12 14s-4 1.1-4 2.5S9.9 19 12 19s4-1.1 4-2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M6 21V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v16M4 21h16M9 8h2M9 12h2M13 8h2M13 12h2M9 16h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const HeartIcon = ({ active }) => (
  <svg viewBox="0 0 24 24">
    <path
      d="M12 21s-7-4.4-9.2-9.1C1.2 8.4 3.2 5 6.8 5c2 0 3.3 1 4.2 2.4C11.9 6 13.2 5 15.2 5c3.6 0 5.6 3.4 4 6.9C19 16.6 12 21 12 21Z"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M15 8a3 3 0 1 0-2.8-4H12a3 3 0 0 0 0 6c.4 0 .8-.1 1.1-.2l3 2A3 3 0 0 0 15 13a3 3 0 1 0 2.2 1L14.1 12a3 3 0 0 0 0-1l3.1-2A3 3 0 0 0 15 8Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
);

const getPropertyTitle = (property) => property?.title || property?.property_name || "Property";

const getPropertyLocation = (property) =>
  property?.location || property?.property_area || property?.city || "Location not available";

const getPropertyImage = (property) =>
  property?.mainImage || property?.image_url || property?.image || "https://via.placeholder.com/600x400";

const getPropertyPrice = (property) =>
  property?.priceRange || property?.price || property?.min_price || "Contact for price";

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { filter } = useSelector((store) => store.basic);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);

  const isAuthenticated = Boolean(localStorage.getItem("access_token"));
  const title = getPropertyTitle(property);
  const slug = title.toLowerCase().replace(/\s+/g, "-");

  const handleViewDetails = () => {
    navigate(`/details/${property.id}/${slug}`);
  };

  const refreshLiveList = async () => {
    try {
      const response = await api.post("get-filtered-listview-properties", filter);
      const nextList = response.data?.data ?? response.data ?? [];
      dispatch(setPropertiesList(nextList));
    } catch (error) {
      console.error("Failed to fetch property details:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      window.alert("Please login to continue");
      dispatch(setIsNavbarModalOpen("login"));
      return;
    }

    if (isUpdatingFavorite) {
      return;
    }

    setIsUpdatingFavorite(true);
    try {
      const response = await api.post("/buyer/wishlist/", {
        property_id: property.id,
        status: property.isFavourites,
      });
      window.alert(response.data?.status || "Wishlist updated");
      await refreshLiveList();
    } catch (error) {
      console.error("Wishlist update failed:", error);
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  if (!property) {
    return <div className="property-card-empty">Loading...</div>;
  }

  return (
    <article className="property-card-shell">
      <div className="property-card-media">
        <img onClick={handleViewDetails} src={getPropertyImage(property)} alt={title} />
        <span className="property-card-badge">For Sale</span>
      </div>

      <div className="property-card-actions">
        <button type="button" className="property-card-action" onClick={toggleFavorite} aria-label="Add to favourites">
          <HeartIcon active={property.isFavourites === true} />
        </button>
        <button type="button" className="property-card-action" aria-label="Share property">
          <ShareIcon />
        </button>
      </div>

      <div className="property-card-content">
        <p className="property-card-price">
          <Icon>
            <CurrencyIcon />
          </Icon>
          <span>{getPropertyPrice(property)}</span>
        </p>

        <h3 onClick={handleViewDetails}>{title}</h3>

        <p className="property-card-location">
          <Icon>
            <LocationIcon />
          </Icon>
          <span>{getPropertyLocation(property)}</span>
        </p>

        <div className="property-card-details">
          <p>
            <Icon>
              <BuildingIcon />
            </Icon>
            <span>
              <strong>Possession Date:</strong> {property?.details?.possessionDate?.trim() ? property.details.possessionDate : "N/A"}
            </span>
          </p>
          <p>
            <Icon>
              <CurrencyIcon />
            </Icon>
            <span>
              <strong>Average Price:</strong> {property?.details?.averagePrice || "N/A"}
            </span>
          </p>
          <p>
            <Icon>
              <HomeIcon />
            </Icon>
            <span>
              <strong>Possession Status:</strong> {property?.details?.possessionStatus || "N/A"}
            </span>
          </p>
        </div>

        <p className="property-card-description">
          {(property?.description || "").slice(0, 100) || "No description available"}
        </p>

        <div className="property-card-footer">
          <button type="button" onClick={handleViewDetails} className="property-card-view-btn">
            View Details
          </button>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
