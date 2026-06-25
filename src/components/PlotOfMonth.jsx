import "./plotOfMonth.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../axiosConfig";

const getPlotTitle = (plot) => plot?.title || plot?.property_name || "Property";

const getPlotLocation = (plot) =>
  plot?.location || plot?.property_area || plot?.city || "Location not available";

const getPlotPrice = (plot) =>
  plot?.priceRange || plot?.price || plot?.min_price || "Contact for price";

const getPlotImage = (plot) =>
  plot?.mainImage || plot?.image_url || plot?.image || "https://via.placeholder.com/400x250?text=Plot+Image";

const PlotOfMonth = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestLocations = async () => {
      setLoading(true);
      try {
        const response = await api.post("get-filtered-listview-properties", {
          paginate: 1,
          per_page: 8,
          top_pick: "Best Location Picks",
        });

        const list = response.data?.data ?? response.data ?? [];
        setPlots(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Failed to fetch plot of the month:", error);
        setPlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBestLocations();
  }, []);

  const extendedCards = useMemo(() => {
    if (!plots.length) return [];
    return [...plots, ...plots, ...plots];
  }, [plots]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || plots.length === 0) return;

    const setupInfiniteScroll = () => {
      if (container.children.length === 0 || container.children.length <= plots.length) return;
      const singleSetWidth =
        container.children[plots.length].offsetLeft - container.children[0].offsetLeft;

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
          container.children[plots.length].offsetLeft - container.children[0].offsetLeft;

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
  }, [plots]);

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

  const handleCardClick = (plot) => {
    const slug = getPlotTitle(plot).toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
    navigate(`/details/${plot.id}/${slug}`);
  };

  return (
    <section className="plot-month-bg-section">
      <div className="plot-month-wrapper">
        <div className="plot-month-heading-area">
          <h2 className="plot-month-title">Plot of the Month</h2>
        </div>

        <div className="plot-month-carousel-container">
          <button type="button" className="plot-month-arrow-btn left" onClick={handlePrev} aria-label="Previous plots">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14.5 5.5 8 12l6.5 6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div
            className="plot-month-grid"
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={resetDragState}
            onMouseUp={resetDragState}
            onMouseMove={handleMouseMove}
          >
            {loading ? (
              <p>Loading best locations...</p>
            ) : extendedCards.length > 0 ? (
              extendedCards.map((plot, index) => (
                <article
                  className="plot-card"
                  key={`${plot.id || index}-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCardClick(plot)}
                >
                  <div className="plot-card-image">
                    <img
                      src={getPlotImage(plot)}
                      alt={getPlotTitle(plot)}
                      draggable="false"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/400x250?text=Plot+Image";
                      }}
                    />
                    <span className="plot-card-tag plot-card-tag-teal">Best Location</span>
                  </div>
                  <div className="plot-card-body">
                    <h3>{getPlotTitle(plot)}</h3>
                    <p>{getPlotLocation(plot)}</p>
                    <p>{getPlotPrice(plot)}</p>
                  </div>
                </article>
              ))
            ) : (
              <p>No best locations found</p>
            )}
          </div>
          
          <button type="button" className="plot-month-arrow-btn right" onClick={handleNext} aria-label="Next plots">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9.5 5.5 16 12l-6.5 6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="plot-month-action-row">
        <button
  type="button"
  className="plot-month-button"
  onClick={() => navigate("/best-location-picks")}
>
  View All Plots
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 6.5 14.5 12 9 17.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
</button>
        </div>
      </div>
    </section>
  );
};

export default PlotOfMonth;
