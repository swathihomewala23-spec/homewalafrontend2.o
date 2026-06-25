import "./dealOfMonth.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../axiosConfig";

const getDealTitle = (deal) => deal?.title || deal?.property_name || "Property";

const getDealLocation = (deal) =>
  deal?.location || deal?.property_area || deal?.city || "Location not available";

const getDealPrice = (deal) =>
  deal?.priceRange || deal?.price || deal?.min_price || "Contact for price";

const getDealImage = (deal) =>
  deal?.mainImage || deal?.image_url || deal?.image || "https://via.placeholder.com/400x250?text=Property+Image";

const isProjectDeal = (deal) => {
  const rawType = `${deal?.property_type || deal?.type || deal?.category || ""}`.toLowerCase();
  const rawName = `${deal?.title || deal?.property_name || ""}`.toLowerCase();
  return rawType.includes("project") || rawName.includes("project");
};

const DealOfMonth = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestDeals = async () => {
      setLoading(true);
      try {
        const bestDealsFilters = {
          paginate: 1,
          per_page: 8,
          top_pick: "Best Deals",
        };

        const response = await api.post("get-filtered-listview-properties", bestDealsFilters);

        const list = response.data?.data ?? response.data ?? [];
        const normalizedList = Array.isArray(list) ? list : [];
        const projectOnlyDeals = normalizedList.filter(isProjectDeal);

        if (projectOnlyDeals.length > 0) {
          setDeals(projectOnlyDeals);
          return;
        }

        if (normalizedList.length > 0) {
          setDeals(normalizedList);
          return;
        }

        const fallbackResponse = await api.post("get-filtered-listview-properties", {
          ...bestDealsFilters,
          quick: "best-deals",
        });
        const fallbackList = fallbackResponse.data?.data ?? fallbackResponse.data ?? [];
        const normalizedFallback = Array.isArray(fallbackList) ? fallbackList : [];
        setDeals(normalizedFallback.filter(isProjectDeal).length > 0 ? normalizedFallback.filter(isProjectDeal) : normalizedFallback);
      } catch (error) {
        console.error("Failed to fetch deal of the month:", error);
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBestDeals();
  }, []);

  const extendedDeals = useMemo(() => {
    if (!deals.length) return [];
    return [...deals, ...deals, ...deals];
  }, [deals]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || deals.length === 0) return;

    const setupInfiniteScroll = () => {
      if (container.children.length === 0 || container.children.length <= deals.length) return;
      const singleSetWidth =
        container.children[deals.length].offsetLeft - container.children[0].offsetLeft;

      container.style.scrollBehavior = "auto";
      container.scrollLeft = singleSetWidth;

      requestAnimationFrame(() => {
        container.style.scrollBehavior = "smooth";
      });
    };

    setupInfiniteScroll();
    const timeoutId = window.setTimeout(setupInfiniteScroll, 100);

    let isScrolling;
    const handleScrollEvent = () => {
      window.clearTimeout(isScrolling);
      isScrolling = window.setTimeout(() => {
        if (!container || isDown.current) return;

        const singleSetWidth =
          container.children[deals.length].offsetLeft - container.children[0].offsetLeft;

        if (container.scrollLeft < singleSetWidth * 0.5) {
          container.style.scrollBehavior = "auto";
          container.scrollLeft += singleSetWidth;
        } else if (container.scrollLeft > singleSetWidth * 1.5) {
          container.style.scrollBehavior = "auto";
          container.scrollLeft -= singleSetWidth;
        }

        requestAnimationFrame(() => {
          container.style.scrollBehavior = "smooth";
        });
      }, 150);
    };

    container.addEventListener("scroll", handleScrollEvent);
    return () => {
      window.clearTimeout(timeoutId);
      container.removeEventListener("scroll", handleScrollEvent);
    };
  }, [deals]);

  const handleMouseDown = (e) => {
    if (!scrollContainerRef.current) return;
    isDown.current = true;
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftPos.current = scrollContainerRef.current.scrollLeft;
    scrollContainerRef.current.style.scrollSnapType = "none";
    scrollContainerRef.current.style.scrollBehavior = "auto";
    scrollContainerRef.current.style.cursor = "grabbing";
  };

  const resetDragState = () => {
    isDown.current = false;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.scrollSnapType = "x mandatory";
      scrollContainerRef.current.style.scrollBehavior = "smooth";
      scrollContainerRef.current.style.cursor = "grab";
      scrollContainerRef.current.dispatchEvent(new Event("scroll"));
    }
  };

  const handleMouseMove = (e) => {
    if (!isDown.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftPos.current - walk;
  };

  const handlePrev = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleCardClick = (deal) => {
    const slug = getDealTitle(deal).toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
    navigate(`/details/${deal.id}/${slug}`);
  };

  return (
    <section className="deal-month-section">
      <div className="deal-month-header-row">
        <div className="deal-month-heading">
          <h2 className="deal-month-title">Deal of the Month</h2>
        </div>
      </div>

      <div className="deal-month-carousel">
        <button type="button" className="deal-month-arrow deal-month-arrow-left" onClick={handlePrev} aria-label="Previous deals">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14.5 5.5 8 12l6.5 6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div
          className="deal-month-grid"
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={resetDragState}
          onMouseUp={resetDragState}
          onMouseMove={handleMouseMove}
        >
          {loading ? (
            <p>Loading best deals...</p>
          ) : extendedDeals.length > 0 ? (
            extendedDeals.map((deal, index) => (
              <article
                className="deal-card"
                key={`${deal.id || index}-${index}`}
                role="button"
                tabIndex={0}
                onClick={() => handleCardClick(deal)}
              >
                <div className="deal-card-image">
                  <img
                    src={getDealImage(deal)}
                    alt={getDealTitle(deal)}
                    draggable="false"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/400x250?text=Property+Image";
                    }}
                  />
                  <span className="deal-card-tag deal-card-tag-green">Best Deal</span>
                </div>

                <div className="deal-card-body">
                  <div>
                    <h3>{getDealTitle(deal)}</h3>
                    <p>{getDealLocation(deal)}</p>
                  </div>

                  <span className="deal-card-price">{getDealPrice(deal)}</span>
                </div>
              </article>
            ))
          ) : (
            <p>No best deals found</p>
          )}
        </div>

        <button type="button" className="deal-month-arrow deal-month-arrow-right" onClick={handleNext} aria-label="Next deals">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9.5 5.5 16 12l-6.5 6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <button
  type="button"
  className="deal-month-button"
  onClick={() => navigate("/best-deals")}
>
  View All Projects
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 6.5 14.5 12 9 17.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
</button>
    </section>
  );
};

export default DealOfMonth;
