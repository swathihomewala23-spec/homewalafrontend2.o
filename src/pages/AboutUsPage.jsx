// import { useEffect, useMemo, useState } from "react";
// import Seo from "../components/common/Seo";
// import Testimonials from "../components/Testimonials";
// import { api } from "../axiosConfig";
// import "./about.css";

// const getDeveloperName = (item) =>
//   item?.developer_name ||
//   item?.developerName ||
//   item?.builder_name ||
//   item?.builderName ||
//   item?.vendor_name ||
//   item?.vendorName ||
//   item?.company_name ||
//   item?.companyName ||
//   item?.aboutDeveloper?.developerTitle ||
//   item?.aboutDeveloper?.name ||
//   item?.details?.developer_name ||
//   item?.details?.developerName ||
//   item?.details?.builder_name ||
//   item?.details?.builderName ||
//   "";

// const getDeveloperLogo = (item) =>
//   item?.developer_logo ||
//   item?.developerLogo ||
//   item?.vendor_logo ||
//   item?.client_logo ||
//   item?.logo ||
//   item?.logo_url ||
//   item?.logoUrl ||
//   item?.image ||
//   item?.image_url ||
//   item?.aboutDeveloper?.developerLogo ||
//   item?.aboutDeveloper?.logo ||
//   item?.details?.developer_logo ||
//   item?.details?.developerLogo ||
//   "";

// const toAssetUrl = (url) => {
//   if (!url) return "";
//   if (/^https?:\/\//i.test(url)) return url;

//   const cleanUrl = String(url).replace(/^\/+/, "");
//   return `https://www.homewala.com/homewala/${cleanUrl}`;
// };

// const getResponseList = (payload) => {
//   if (Array.isArray(payload?.data?.data)) return payload.data.data;
//   if (Array.isArray(payload?.data)) return payload.data;
//   if (Array.isArray(payload)) return payload;
//   return [];
// };

// const buildPartners = (properties) => {
//   const partnerMap = new Map();

//   properties.forEach((item) => {
//     const name = String(getDeveloperName(item)).trim();
//     if (!name) return;

//     const key = name.toLowerCase();
//     const existing = partnerMap.get(key);
//     const logo = toAssetUrl(getDeveloperLogo(item));

//     if (existing) {
//       existing.projectCount += 1;
//       if (!existing.logo && logo) {
//         existing.logo = logo;
//       }
//       return;
//     }

//     partnerMap.set(key, {
//       name,
//       logo,
//       projectCount: 1,
//     });
//   });

//   return [...partnerMap.values()].sort((a, b) => b.projectCount - a.projectCount);
// };

// const AboutUsPage = () => {
//   const [properties, setProperties] = useState([]);

//   useEffect(() => {
//     let isMounted = true;

//     const fetchPartners = async () => {
//       try {
//         const response = await api.post("get-filtered-listview-properties", {
//           paginate: 1,
//           per_page: 5000,
//         });

//         if (!isMounted) return;

//         setProperties(getResponseList(response.data));
//       } catch (error) {
//         console.error("Failed to fetch partners:", error);
//       }
//     };

//     fetchPartners();

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   const partners = useMemo(() => buildPartners(properties), [properties]);

//   return (
//     <>
//       <Seo />
//       <main className="about-page">
//         <section className="about-hero">
//           <div className="about-hero-copy">
//             <span className="about-hero-eyebrow">About us</span>
//             <h1>About Our Real Estate Company</h1>
//             <p>
//               Homewala helps Chennai buyers, sellers and investors navigate property decisions
//               with local expertise, clear guidance, and fast support.
//             </p>
//           </div>

//           <div className="about-hero-visual">
//             <div className="visual-card visual-card--tall">
//               <div className="visual-shape visual-shape--building" />
//             </div>
//             <div className="visual-card visual-card--small">
//               <div className="visual-shape visual-shape--house" />
//             </div>
//             <div className="about-hero-badge">
//             </div>
//           </div>
//         </section>

//         <section className="about-company-section">
//           <div className="about-section-heading">
//             <span>About Company</span>
//             <h2>Built to make property search simple, transparent, and fast.</h2>
//           </div>

//           <div className="about-company-grid">
//             <div className="overview-panel">
//               <h3>Our Story</h3>
//               <p>
//                 Homewala.com was founded with a simple vision: to make property buying in Chennai easier, more transparent, and stress-free. We recognized that many homebuyers struggle with duplicate listings, outdated information, and uncertainty when searching for the right property. To solve these challenges, we created a platform that connects buyers with verified residential properties from trusted builders and developers. With a deep understanding of Chennai's real estate market, we help homebuyers, investors, and NRIs discover the right property with confidence.
//               </p>
//             </div>

//             <div className="overview-panel overview-panel--soft">
//               <h3>Our Mission</h3>
//               <p>
//                Our mission is to simplify the property buying journey through trust, transparency, and expert guidance. We are committed to helping homebuyers make informed decisions by providing verified property listings, reliable information, and personalized support. By leveraging technology and local market expertise, we aim to create a seamless experience for every customer looking to invest in Chennai real estate.
//               </p>
//             </div>

//             <div className="feature-card">
//               <h3>Trusted Experience</h3>
//               <p>With a dedicated focus on Chennai's real estate market, Homewala.com offers valuable local insights into emerging locations, infrastructure developments, and investment opportunities. We collaborate with leading builders and developers to provide genuine property options that meet diverse buyer needs. Our commitment to transparency, reliability, and customer satisfaction has made us a trusted partner for homebuyers, investors, and NRIs seeking quality real estate opportunities.</p>
//             </div>

//             <div className="feature-card">
//               <h3>Dedicated Service</h3>
//               <p>At Homewala.com, we believe every property search represents a dream, an investment, or a new beginning. Our team is dedicated to providing personalized assistance at every stage of the buying process. From property recommendations and project information to site visit support and NRI guidance, we ensure our customers receive expert help and professional service tailored to their unique requirements.</p>
//             </div>
//           </div>
//         </section>

//         <section className="about-team-section">
//           <div className="about-section-heading">
//             <span>Our Partners</span>
//             <h2>Trusted builders and developers powering verified property choices.</h2>
//           </div>

//           <div className="about-partners-grid">
//             {partners.map((partner) => (
//               <article key={partner.name} className="partner-card">
//                 <div className="partner-logo-wrap">
//                   {partner.logo ? (
//                     <img src={partner.logo} alt={partner.name} />
//                   ) : (
//                     <span>{partner.name.slice(0, 2).toUpperCase()}</span>
//                   )}
//                 </div>
//                 <p>{partner.projectCount}+ Projects</p>
//               </article>
//             ))}
//           </div>
//         </section>
//       </main>
//       <Testimonials />
//     </>
//   );
// };

// export default AboutUsPage;


import Seo from "../components/common/Seo";
import OurPartners from "../components/OurPartners";
import Testimonials from "../components/Testimonials";
import "./about.css";

const teamMembers = [
  {
    name: "Aarav Kumar",
    role: "Founder & Strategy Lead",
    description: "Guides company direction, partnerships, and the overall client experience.",
  },
  {
    name: "Meera Iyer",
    role: "Property Consultant",
    description: "Helps buyers find the right match with fast, practical property guidance.",
  },
  {
    name: "Sanjay Prabhu",
    role: "Customer Success",
    description: "Keeps every enquiry moving smoothly from first call to final follow-up.",
  },
];

const AboutUsPage = () => {
  return (
    <>
      <Seo />
      <main className="about-page">
        <section className="about-hero">
          <div className="about-hero-copy">
            <span className="about-hero-eyebrow">About us</span>
            <h1>About Our Real Estate Company</h1>
            <p>
              Homewala helps Chennai buyers, sellers and investors navigate property decisions
              with local expertise, clear guidance, and fast support.
            </p>
          </div>

          <div className="about-hero-visual">
            <div className="visual-card visual-card--tall">
              <div className="visual-shape visual-shape--building" />
            </div>
            <div className="visual-card visual-card--small">
              <div className="visual-shape visual-shape--house" />
            </div>
            <div className="about-hero-badge" />
          </div>
        </section>

        <section className="about-company-section">
          <div className="about-section-heading">
            <span>About Company</span>
            <h2>Built to make property search simple, transparent, and fast.</h2>
          </div>

          <div className="about-company-grid">
            <div className="overview-panel">
              <h3>Our Story</h3>
              <p>
                Homewala.com was created to simplify property buying in Chennai.
We connect homebuyers with verified properties from trusted builders.
Our platform provides transparent information and reliable property options.
We help buyers, investors, and NRIs find the right property with confidence.
              </p>
            </div>

            <div className="overview-panel overview-panel--soft">
              <h3>Our Mission</h3>
              <p>
              Our mission is to make property buying simple and hassle-free.
We provide verified listings, transparent information, and expert guidance.
We help homebuyers make informed and confident decisions.
Our goal is to deliver a seamless real estate experience across Chennai.
              </p>
            </div>

            <div className="feature-card">
              <h3>Trusted Experience</h3>
              <p>With deep knowledge of Chennai's real estate market, we provide valuable local insights.
We partner with trusted builders and developers to offer verified properties.
Our focus on transparency and reliability helps buyers make confident decisions.
We are a trusted real estate partner for homebuyers, investors, and NRIs.</p>
            </div>

            <div className="feature-card">
              <h3>Dedicated Service</h3>
              <p>We provide personalized support throughout your property buying journey.
Our team offers expert guidance tailored to your needs and goals.
From property recommendations to site visit assistance, we are here to help.
We are committed to delivering a smooth and hassle-free experience for every customer.</p>
            </div>
          </div>
        </section>

        <section className="about-partners-section">
          <div className="about-section-heading">
            <span>Our Partners</span>
            <h2>Trusted builders and developers we showcase across the Homewala experience.</h2>
          </div>
          <OurPartners />
        </section>

        <section className="about-team-section">
          <div className="about-section-heading">
            <span>About Our Team</span>
            <h2>The people behind the guidance, support, and follow-through.</h2>
          </div>

          <div className="about-team-grid">
            {teamMembers.map((member) => (
              <article key={member.name} className="team-card">
                <div className="team-avatar" aria-hidden="true">
                  {member.name
                    .split(" ")
                    .map((part) => part.charAt(0))
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <h3>{member.name}</h3>
                  <p className="team-role">{member.role}</p>
                  <p className="team-description">{member.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Testimonials />
    </>
  );
};

export default AboutUsPage;