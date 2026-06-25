import { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { api } from "../axiosConfig";

const normalizeProjects = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return "0+";

  const stripped = text.replace(/projects?/i, "").trim();
  return stripped.endsWith("+") ? stripped : `${stripped}+`;
};

const resolveImageUrl = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  const siteBase = String(api.defaults.baseURL ?? "").replace(/\/api\/?$/i, "");
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${siteBase}${path}`;
};

const normalizePartner = (partner, index) => {
  const image = resolveImageUrl(
    partner?.image ??
      partner?.logo ??
      partner?.logo_url ??
      partner?.partner_logo ??
      partner?.partner_image ??
      partner?.url
  );

  return {
    id: partner?.id ?? partner?._id ?? partner?.partner_id ?? `${partner?.name ?? "partner"}-${index}`,
    name: partner?.name ?? partner?.partner_name ?? partner?.title ?? `Partner ${index + 1}`,
    image,
    projects:
      partner?.projects ??
      partner?.project_count ??
      partner?.projectCount ??
      partner?.no_of_projects ??
      partner?.total_projects ??
      partner?.noOfProjects ??
      partner?.project_no ??
      "",
  };
};

const OurPartners = () => {
  const trackRef = useRef(null);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchPartners = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/get-our-partners");
        const payload = response?.data;
        const records = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.partners)
            ? payload.partners
            : Array.isArray(payload)
              ? payload
              : [];

        if (!isMounted) return;

        setPartners(records.map(normalizePartner).filter((partner) => partner.image));
      } catch (fetchError) {
        if (!isMounted) return;

        console.error("Error fetching partners:", fetchError);
        setError("Unable to load partners right now.");
        setPartners([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPartners();

    return () => {
      isMounted = false;
    };
  }, []);

  const scrollTrack = (direction) => {
    trackRef.current?.scrollBy({
      left: direction * 360,
      behavior: "smooth",
    });
  };

  const renderCard = (partner) => (
    <article key={partner.id} className="partner-card">
      <div className="partner-logo-tile">
        <img className="partner-logo-image" src={partner.image} alt={partner.name} />
      </div>
      <p className="partner-projects">{normalizeProjects(partner.projects)} Projects</p>
    </article>
  );

  return (
    <div className="about-partners-carousel">
      {partners.length > 1 ? (
        <button
          type="button"
          className="about-partners-arrow about-partners-arrow--left"
          onClick={() => scrollTrack(-1)}
          aria-label="Scroll partners left"
        >
          <FaArrowLeft />
        </button>
      ) : null}

      <div className="about-partners-track" ref={trackRef}>
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <article key={`partner-skeleton-${index}`} className="partner-card partner-card--loading">
              <div className="partner-logo-tile partner-logo-tile--loading">
                <div className="partner-logo-skeleton" />
              </div>
              <p className="partner-projects partner-projects--loading">Loading...</p>
            </article>
          ))
        ) : error ? (
          <div className="about-partners-empty">{error}</div>
        ) : partners.length ? (
          partners.map(renderCard)
        ) : (
          <div className="about-partners-empty">No partners found.</div>
        )}
      </div>

      {partners.length > 1 ? (
        <button
          type="button"
          className="about-partners-arrow about-partners-arrow--right"
          onClick={() => scrollTrack(1)}
          aria-label="Scroll partners right"
        >
          <FaArrowRight />
        </button>
      ) : null}
    </div>
  );
};

export default OurPartners;