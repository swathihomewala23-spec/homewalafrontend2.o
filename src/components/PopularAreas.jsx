import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { api } from "../axiosConfig";
import { setFilterdData } from "../features/BasicSlice";
import { buildPropertyUrl } from "../utils/propertyUrl";
import "./popularAreas.css";

const getAreaName = (area) => area?.name || area?.location || area?.property_area || area?.city || "Location";

const getAreaImage = (area) =>
  area?.image || area?.mainImage || area?.image_url || "https://via.placeholder.com/400x400?text=Chennai+Area";

const getPropertyCount = (area) => area?.properties ?? area?.property_count ?? area?.count ?? 0;

const PopularAreas = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const scrollContainerRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { filter } = useSelector((store) => store.basic);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const response = await api.get("/get-property-places-count");
        const fetchedLocations = response.data?.data ?? [];
        setLocations(Array.isArray(fetchedLocations) ? fetchedLocations : []);
      } catch (error) {
        console.error("Failed to fetch property areas:", error);
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const extendedAreas = useMemo(() => {
    if (!locations.length) return [];
    return [...locations, ...locations, ...locations, ...locations, ...locations];
  }, [locations]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || locations.length === 0) return;

    const setupInfiniteScroll = () => {
      if (container.children.length === 0 || container.children.length <= locations.length) return;
      const singleSetWidth =
        container.children[locations.length].offsetLeft - container.children[0].offsetLeft;

      container.style.scrollBehavior = "auto";
      container.scrollLeft = singleSetWidth * 2;

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
          container.children[locations.length].offsetLeft - container.children[0].offsetLeft;

        if (container.scrollLeft < singleSetWidth) {
          container.style.scrollBehavior = "auto";
          container.scrollLeft += singleSetWidth * 2;
        } else if (container.scrollLeft > singleSetWidth * 3) {
          container.style.scrollBehavior = "auto";
          container.scrollLeft -= singleSetWidth * 2;
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
  }, [locations]);

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

  const handleAreaClick = (area) => {
    const areaName = getAreaName(area);
    if (!areaName) return;

    const updatedFilter = {
      ...filter,
      property_area: Array.isArray(filter?.property_area) ? [areaName] : [areaName],
      search: Array.isArray(filter?.search) ? [areaName] : [areaName],
      paginate: 1,
    };

    dispatch(setFilterdData(updatedFilter));

    navigate(
      {
        pathname: buildPropertyUrl("/properties", { location: areaName }),
      },
      {
        state: {
          heading: `${areaName} Properties`,
          subtitle: "Explore live properties from this popular area.",
        },
         replace: true,
      }
    );
  };

  return (
    <section className="popular-areas-section">
      <div className="popular-areas-wrapper">
        <div className="popular-header-area">
          <div className="popular-title-container">
            <h2 className="popular-title">
              Popular <span>Areas in Chennai</span>
            </h2>
          </div>
        </div>

        <div className="popular-carousel-container">
          <button type="button" className="popular-arrow-btn left" onClick={handlePrev} aria-label="Previous Areas">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14.5 5.5 8 12l6.5 6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div
            className="popular-grid"
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={resetDragState}
            onMouseUp={resetDragState}
            onMouseMove={handleMouseMove}
          >
            {loading ? (
              <p>Loading popular areas...</p>
            ) : extendedAreas.length > 0 ? (
              extendedAreas.map((area, index) => (
                <article
                  className="popular-card"
                  key={`${area.id || index}-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleAreaClick(area)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleAreaClick(area);
                    }
                  }}
                >
                  <div className="popular-image-wrapper">
                    <div className="popular-image-circle">
                      <img src={getAreaImage(area)} alt={getAreaName(area)} draggable="false" />
                    </div>
                  </div>

                  <div className="popular-card-body">
                    <h3>{getAreaName(area)}</h3>
                    <p className="property-count">{getPropertyCount(area)} Properties</p>
                  </div>
                </article>
              ))
            ) : (
              <p>No popular areas found</p>
            )}
          </div>

          <button type="button" className="popular-arrow-btn right" onClick={handleNext} aria-label="Next Areas">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9.5 5.5 16 12l-6.5 6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularAreas;
