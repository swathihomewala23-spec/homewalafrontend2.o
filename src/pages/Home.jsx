import { useEffect, useState } from "react";
import "./home.css";
import Seo from "../components/common/Seo";
import Searchbox from "../components/Searchbox";
import Aisearch from "../components/Aisearch";
import DealOfMonth from "../components/DealOfMonth";
import PlotOfMonth from "../components/PlotOfMonth";
import InteriorShowcase from "../components/InteriorShowcase";
import PopularAreas from "../components/PopularAreas";
import { api } from "../axiosConfig";


const Home = () => {
  const [bannerData, setBannerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await api.get("/banner-images?type=home"); // Updated endpoint to match backend API
        if (res.data?.status === "success" && res.data?.data?.length > 0) {
          // Use the first banner from the array
          setBannerData({
            image_url: res.data.data[0].url,
            redirection_link: res.data.data[0].redirection_link,
            title: "Easy Way to Find a Perfect Property", // Default title since backend doesn't provide
            subtitle: "UP TO 5% Off and Top-rated plots in prime locations" // Default subtitle
          });
        }
      } catch (error) {
        console.error("Error fetching banner:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, []);

  const handleBannerClick = async () => {
    const redirectLink = bannerData?.redirection_link;

    if (redirectLink) {
      if (/^https?:\/\//i.test(redirectLink)) {
        window.open(redirectLink, "_blank", "noopener,noreferrer");
        return;
      }

      window.open(`${window.location.origin}${redirectLink}`, "_blank", "noopener,noreferrer");
      return;
    }

    try {
      const response = await api.post("get-filtered-listview-properties", {
        paginate: 1,
        per_page: 1,
        top_pick: "Best Deals",
      });

      const list = response.data?.data ?? response.data ?? [];
      const firstProject = Array.isArray(list) ? list[0] : null;

      if (firstProject?.id) {
        const slug = (firstProject.title || firstProject.property_name || "property")
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "");

        window.open(`${window.location.origin}/details/${firstProject.id}/${slug}`, "_blank", "noopener,noreferrer");
        return;
      }
    } catch (error) {
      console.error("Failed to open banner project:", error);
    }

    window.open(`${window.location.origin}/best-deals`, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Seo />
      <div className="home-page-inline">
        <main className="home-main-inline">
          <section 
            className="hero-banner-inline"
            role="button"
            tabIndex={0}
            onClick={handleBannerClick}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleBannerClick();
              }
            }}
            aria-label="Open featured project"
            style={{
  backgroundImage: bannerData?.image_url
    ? `url("${bannerData.image_url}")`
    : "none",
}}
          >
            <div className="hero-overlay">
              <div className="hero-content">
              <br/>
              <span/>

                {/* Moved search-wrapper outside */}
              </div>
            </div>
          </section>

          <div
            className="search-wrapper"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <Searchbox />
          </div>
          <Aisearch />
          <DealOfMonth />
          <PlotOfMonth />
          <InteriorShowcase />
          <PopularAreas />
          
        </main>
      </div>
    </>
  );
};

export default Home;
