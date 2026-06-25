// import { useRef, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "../axiosConfig";
// import "./interiorShowcase.css";

// const InteriorShowcase = () => {
//   const navigate = useNavigate();
//   const scrollContainerRef = useRef(null);
//   const isDown = useRef(false);
//   const startX = useRef(0);
//   const scrollLeftPos = useRef(0);
//   const [showcaseData, setShowcaseData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const curatedInteriorImages = [
//     "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
//     "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
//     "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80",
//     "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
//     "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
//     "https://images.unsplash.com/photo-1549187774-b4e9f0a205a8?auto=format&fit=crop&w=1200&q=80",
//   ];

//   const fallbackInteriorImage = "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80";

//   const handleImageError = (event) => {
//     event.currentTarget.onerror = null;
//     event.currentTarget.src = fallbackInteriorImage;
//   };

//   useEffect(() => {
//     const fetchShowcaseData = async () => {
//       try {
//         const response = await api.post("/interior/home", { pagenation: 1 });
//         const data = response?.data?.data || [];
//         // Transform the data to match the required structure
//         const transformedData = data.slice(0, 6).map((item, index) => {
//           const mainImage = curatedInteriorImages[index % curatedInteriorImages.length];
//           const bottomRightImage = curatedInteriorImages[(index + 1) % curatedInteriorImages.length];
//           return {
//             id: index + 1,
//             tagLabel: item.name || "Interior Design",
//             mainTitle: item.name || "Modern Design",
//             mainImage,
//             topRightTag: "Aesthetic",
//             topRightDesc: "Aesthetic furniture where every piece tells a story of style",
//             topRightTitle: "Coming Soon",
//             bottomRightTag: "Best Furniture",
//             bottomRightDesc: "Indulge in the artistry of everyday living",
//             bottomRightImage,
//           };
//         });
//         setShowcaseData(transformedData);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching showcase data:", error);
//         setLoading(false);
//       }
//     };

//     fetchShowcaseData();
//   }, []);

//   const extendedData = [
//     ...showcaseData,
//     ...showcaseData,
//     ...showcaseData,
//     ...showcaseData,
//     ...showcaseData
//   ];

//   useEffect(() => {
//     if (showcaseData.length === 0) return;

//     const container = scrollContainerRef.current;
//     if (!container) return;

//     const setupInfiniteScroll = () => {
//       if (container.children.length === 0) return;
//       const singleSetWidth =
//         container.children[showcaseData.length].offsetLeft -
//         container.children[0].offsetLeft;
      
//       container.style.scrollBehavior = "auto";
//       container.scrollLeft = singleSetWidth * 2;

//       requestAnimationFrame(() => {
//         container.style.scrollBehavior = "smooth";
//       });
//     };

//     setupInfiniteScroll();
//     setTimeout(setupInfiniteScroll, 100);

//     let isScrolling;
//     const handleScrollEvent = () => {
//       window.clearTimeout(isScrolling);
//       isScrolling = setTimeout(() => {
//         if (!container || isDown.current) return;

//         const singleSetWidth =
//           container.children[showcaseData.length].offsetLeft -
//           container.children[0].offsetLeft;

//         // Jump forward
//         if (container.scrollLeft < singleSetWidth * 0.5) {
//           container.style.scrollBehavior = "auto";
//           container.scrollLeft += singleSetWidth * 2;
//         } 
//         // Jump backward
//         else if (container.scrollLeft > singleSetWidth * 3.5) {
//           container.style.scrollBehavior = "auto";
//           container.scrollLeft -= singleSetWidth * 2;
//         }

//         requestAnimationFrame(() => {
//           container.style.scrollBehavior = "smooth";
//         });
//       }, 150);
//     };

//     container.addEventListener("scroll", handleScrollEvent);
//     return () => container.removeEventListener("scroll", handleScrollEvent);
//   }, [showcaseData]);

//   // Automatic scrolling every 10 seconds
//   useEffect(() => {
//     const container = scrollContainerRef.current;
//     if (!container) return;
    
//     const interval = setInterval(() => {
//       // Only scroll automatically if the user isn't currently dragging
//       if (!isDown.current && container) {
//         container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
//       }
//     }, 10000);
    
//     return () => clearInterval(interval);
//   }, []);

//   const handleMouseDown = (e) => {
//     isDown.current = true;
//     startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
//     scrollLeftPos.current = scrollContainerRef.current.scrollLeft;
//     scrollContainerRef.current.style.scrollSnapType = "none";
//     scrollContainerRef.current.style.scrollBehavior = "auto";
//     scrollContainerRef.current.style.cursor = "grabbing";
//   };

//   const handleMouseLeave = () => {
//     isDown.current = false;
//     if (scrollContainerRef.current) {
//       scrollContainerRef.current.style.scrollSnapType = "x mandatory";
//       scrollContainerRef.current.style.scrollBehavior = "smooth";
//       scrollContainerRef.current.style.cursor = "grab";
//       scrollContainerRef.current.dispatchEvent(new Event("scroll"));
//     }
//   };

//   const handleMouseUp = () => {
//     isDown.current = false;
//     if (scrollContainerRef.current) {
//       scrollContainerRef.current.style.scrollSnapType = "x mandatory";
//       scrollContainerRef.current.style.scrollBehavior = "smooth";
//       scrollContainerRef.current.style.cursor = "grab";
//       scrollContainerRef.current.dispatchEvent(new Event("scroll"));
//     }
//   };

//   const handleMouseMove = (e) => {
//     if (!isDown.current) return;
//     e.preventDefault();
//     const x = e.pageX - scrollContainerRef.current.offsetLeft;
//     const walk = (x - startX.current) * 1.5;
//     scrollContainerRef.current.scrollLeft = scrollLeftPos.current - walk;
//   };

//   const handlePrev = () => {
//     if (scrollContainerRef.current) {
//       const scrollAmount = scrollContainerRef.current.clientWidth;
//       scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
//     }
//   };

//   const handleNext = () => {
//     if (scrollContainerRef.current) {
//       const scrollAmount = scrollContainerRef.current.clientWidth;
//       scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
//     }
//   };

//   if (loading) {
//     return (
//       <section className="interior-showcase-wrapper">
//         <div className="interior-month-header-row">
//           <div className="interior-month-heading">
//             <span className="interior-month-eyebrow">Interiors</span>
//           </div>
//         </div>
//         <div className="flex justify-center items-center h-64">
//           <p>Loading interiors...</p>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section className="interior-showcase-wrapper">
      
//       {/* Newly added header that mirrors Deal of the Month */}
//       <div className="interior-month-header-row">
//         <div className="interior-month-heading">
//           <span className="interior-month-eyebrow">Interiors</span>
          
//         </div>
//       </div>

//       <div className="interior-showcase-container">
//         <button type="button" className="interior-month-arrow-btn left" onClick={handlePrev} aria-label="Previous interiors">
//           <svg viewBox="0 0 24 24" aria-hidden="true">
//             <path d="M14.5 5.5 8 12l6.5 6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
//           </svg>
//         </button>
        
//         {/* We use a drag scroll wrapper */}
//         <div 
//           className="interior-slides-wrapper"
//           ref={scrollContainerRef}
//           onMouseDown={handleMouseDown}
//           onMouseLeave={handleMouseLeave}
//           onMouseUp={handleMouseUp}
//           onMouseMove={handleMouseMove}
//         >
//           {extendedData.map((item, index) => (
//            <div 
//   key={`${item.id}-${index}`} 
//   className="interior-slide"
//   onClick={() => navigate("/interior")}
// >
              
//               {/* LEFT HUGE BOARD */}
//               <div
//   className="interior-left-board"
//   onClick={() => navigate("/interior")}
// >
//                 <img src={item.mainImage} alt={item.mainTitle} className="interior-bg-img" draggable="false" onError={handleImageError} />
                
//                 {/* The bottom left cutout area */}
//                 <div className="interior-cutout-bl">
//                   <h2 className="interior-main-title">{item.mainTitle || item.tagLabel}</h2>
//                 </div>
//               </div>

//               {/* RIGHT SIDE (Split into top/bottom) */}
//               <div className="interior-right-board">
                
//                 {/* Top Small Card (Text) */}
//                 <div
//   className="interior-top-card"
//   onClick={() => navigate("/interior")}
// >
//                   {/* <div className="interior-coming-soon">
//                     <span className="interior-coming-soon-text">Coming Soon</span>
//                   </div> */}

//                   <div className="interior-top-content">
//                     <div className="interior-badge-outline">{item.topRightTag}</div>
//                     <p className="interior-desc">{item.topRightDesc}</p>
//                     <h3 className="interior-sub-title">{item.topRightTitle}</h3>
//                   </div>
//                 </div>

//                 {/* Bottom Small Card (Image overlay) */}
//                 <div
//   className="interior-bottom-card"
//   onClick={() => navigate("/interior")}
// >
//                   <img src={item.bottomRightImage} alt="Furniture" className="interior-bg-img" draggable="false" onError={handleImageError} />
                  
//                   <div className="interior-bottom-overlay">
//                     <div className="interior-badge-outline white-variant">{item.bottomRightTag}</div>
//                     <p className="interior-desc-overlay">{item.bottomRightDesc}</p>
//                   </div>
//                 </div>

//               </div>
//             </div>
//           ))}
//         </div>

//         <button type="button" className="interior-month-arrow-btn right" onClick={handleNext} aria-label="Next interiors">
//           <svg viewBox="0 0 24 24" aria-hidden="true">
//             <path d="M9.5 5.5 16 12l-6.5 6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
//           </svg>
//         </button>

//       </div>
//     </section>
//   );
// };

// export default InteriorShowcase;
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../axiosConfig";
import "./interiorShowcase.css";

const InteriorShowcase = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);
  const [showcaseData, setShowcaseData] = useState([]);
  const [loading, setLoading] = useState(true);

  const curatedInteriorImages = [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1549187774-b4e9f0a205a8?auto=format&fit=crop&w=1200&q=80",
  ];

  const fallbackInteriorImage = "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80";

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = fallbackInteriorImage;
  };

  useEffect(() => {
    const fetchShowcaseData = async () => {
      try {
        const response = await api.post("/interior/home", { pagenation: 1 });
        const data = response?.data?.data || [];
        // Transform the data to match the required structure
        const transformedData = data.slice(0, 6).map((item, index) => {
          const mainImage = curatedInteriorImages[index % curatedInteriorImages.length];
          const bottomRightImage = curatedInteriorImages[(index + 1) % curatedInteriorImages.length];
          return {
            id: index + 1,
            tagLabel: item.name || "Interior Design",
            mainTitle: item.name || "Modern Design",
            mainImage,
            topRightTag: "Aesthetic",
            topRightDesc: "Aesthetic furniture where every piece tells a story of style",
            topRightTitle: "Coming Soon",
            bottomRightTag: "Best Furniture",
            bottomRightDesc: "Indulge in the artistry of everyday living",
            bottomRightImage,
          };
        });
        setShowcaseData(transformedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching showcase data:", error);
        setLoading(false);
      }
    };

    fetchShowcaseData();
  }, []);

  const extendedData = [
    ...showcaseData,
    ...showcaseData,
    ...showcaseData,
    ...showcaseData,
    ...showcaseData
  ];

  useEffect(() => {
    if (showcaseData.length === 0) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const setupInfiniteScroll = () => {
      if (container.children.length === 0) return;
      const singleSetWidth =
        container.children[showcaseData.length].offsetLeft -
        container.children[0].offsetLeft;
      
      container.style.scrollBehavior = "auto";
      container.scrollLeft = singleSetWidth * 2;

      requestAnimationFrame(() => {
        container.style.scrollBehavior = "smooth";
      });
    };

    setupInfiniteScroll();
    setTimeout(setupInfiniteScroll, 100);

    let isScrolling;
    const handleScrollEvent = () => {
      window.clearTimeout(isScrolling);
      isScrolling = setTimeout(() => {
        if (!container || isDown.current) return;

        const singleSetWidth =
          container.children[showcaseData.length].offsetLeft -
          container.children[0].offsetLeft;

        // Jump forward
        if (container.scrollLeft < singleSetWidth * 0.5) {
          container.style.scrollBehavior = "auto";
          container.scrollLeft += singleSetWidth * 2;
        } 
        // Jump backward
        else if (container.scrollLeft > singleSetWidth * 3.5) {
          container.style.scrollBehavior = "auto";
          container.scrollLeft -= singleSetWidth * 2;
        }

        requestAnimationFrame(() => {
          container.style.scrollBehavior = "smooth";
        });
      }, 150);
    };

    container.addEventListener("scroll", handleScrollEvent);
    return () => container.removeEventListener("scroll", handleScrollEvent);
  }, [showcaseData]);

  // Automatic scrolling every 10 seconds
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const interval = setInterval(() => {
      // Only scroll automatically if the user isn't currently dragging
      if (!isDown.current && container) {
        container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const handleMouseDown = (e) => {
    isDown.current = true;
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftPos.current = scrollContainerRef.current.scrollLeft;
    scrollContainerRef.current.style.scrollSnapType = "none";
    scrollContainerRef.current.style.scrollBehavior = "auto";
    scrollContainerRef.current.style.cursor = "grabbing";
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.scrollSnapType = "x mandatory";
      scrollContainerRef.current.style.scrollBehavior = "smooth";
      scrollContainerRef.current.style.cursor = "grab";
      scrollContainerRef.current.dispatchEvent(new Event("scroll"));
    }
  };

  const handleMouseUp = () => {
    isDown.current = false;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.scrollSnapType = "x mandatory";
      scrollContainerRef.current.style.scrollBehavior = "smooth";
      scrollContainerRef.current.style.cursor = "grab";
      scrollContainerRef.current.dispatchEvent(new Event("scroll"));
    }
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
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

  if (loading) {
    return (
      <section className="interior-showcase-wrapper">
        <div className="interior-month-header-row">
          <div className="interior-month-heading">
            <span className="interior-month-eyebrow">Interiors</span>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <p>Loading interiors...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="interior-showcase-wrapper">
      
      {/* Newly added header that mirrors Deal of the Month */}
      <div className="interior-month-header-row">
        <div className="interior-month-heading">
          <span className="interior-month-eyebrow">Interiors</span>
          
        </div>
      </div>

      <div className="interior-showcase-container">
        <button type="button" className="interior-month-arrow-btn left" onClick={handlePrev} aria-label="Previous interiors">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14.5 5.5 8 12l6.5 6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        
        {/* We use a drag scroll wrapper */}
        <div 
          className="interior-slides-wrapper"
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {extendedData.map((item, index) => (
           <div 
  key={`${item.id}-${index}`} 
  className="interior-slide"
  onClick={() => navigate("/interior")}
>
              
              {/* LEFT HUGE BOARD */}
              <div
  className="interior-left-board"
  onClick={() => navigate("/interior")}
>
                <img src={item.mainImage} alt={item.mainTitle} className="interior-bg-img" draggable="false" onError={handleImageError} />
                
                {/* The bottom left cutout area */}
                <div className="interior-cutout-bl">
                  <h2 className="interior-main-title">{item.mainTitle || item.tagLabel}</h2>
                </div>
              </div>

              {/* RIGHT SIDE (Split into top/bottom) */}
              <div className="interior-right-board">
                
                {/* Top Small Card (Text) */}
                <div
  className="interior-top-card"
  onClick={() => navigate("/interior")}
>
                  <div className="interior-badge-outline">{item.topRightTag}</div>
                  <p className="interior-desc">{item.topRightDesc}</p>
                  <h3 className="interior-sub-title">{item.topRightTitle}</h3>
                </div>

                {/* Bottom Small Card (Image overlay) */}
                <div
  className="interior-bottom-card"
  onClick={() => navigate("/interior")}
>
                  <img src={item.bottomRightImage} alt="Furniture" className="interior-bg-img" draggable="false" onError={handleImageError} />
                  
                  <div className="interior-bottom-overlay">
                    <div className="interior-badge-outline white-variant">{item.bottomRightTag}</div>
                    <p className="interior-desc-overlay">{item.bottomRightDesc}</p>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        <button type="button" className="interior-month-arrow-btn right" onClick={handleNext} aria-label="Next interiors">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9.5 5.5 16 12l-6.5 6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

      </div>
    </section>
  );
};

export default InteriorShowcase;