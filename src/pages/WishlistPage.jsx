import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../axiosConfig";
import "./WishlistPage.css";

const WishlistPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/buyer/wishlist");
      setProperties(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="wishlist-page">
      <div className="wishlist-shell">
        <header className="wishlist-header">
          <p className="wishlist-eyebrow">Saved homes</p>
          <h1>Your Wishlist Properties</h1>
          <p>These are your saved properties.</p>
        </header>

        {loading ? (
          <div className="wishlist-loading" aria-label="Loading wishlist">
            <span className="wishlist-spinner" />
          </div>
        ) : properties.length === 0 ? (
          <div className="wishlist-empty">
            <h2>No saved properties yet</h2>
            <p>You have not added any properties to your wishlist.</p>
            <Link to="/properties" className="wishlist-empty-btn">
              Explore Properties
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {properties.map((property) => {
              const title = property?.title || property?.property_name || property?.project_name || "Untitled Property";
              const location = property?.location || property?.property_area || property?.city || "Location not available";
              const image = property?.mainImage || property?.image_url || property?.image || "https://via.placeholder.com/800x520";
              const price = property?.priceRange || property?.price || property?.min_price || "Contact for price";

             return (
<Link
  key={property.id || property.propertId}
  to={`/details/${property.id || property.propertId}/${title
    .toLowerCase()
    .replace(/\s+/g, "-")}`}
  className="wishlist-card-link"
>
  <article className="wishlist-card">
    <div className="wishlist-card-image">
      <img src={image} alt={title} />
    </div>

    <div className="wishlist-card-body">
      <h2>{title}</h2>
      <p className="wishlist-location">{location}</p>
      <p className="wishlist-price">{price}</p>
    </div>
  </article>
</Link>
);
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
