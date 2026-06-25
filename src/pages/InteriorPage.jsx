import { useState, useEffect, useRef } from "react";
import { api } from "../axiosConfig";
import Seo from "../components/common/Seo";
import InteriorShowcase from "../components/InteriorShowcase";
import "./InteriorPage.css";

// const collections = [
//   { title: "Mondrian", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80" },
//   { title: "Nirnia", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=901&q=80" },
//   { title: "Artex", image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=902&q=80" },
//   { title: "Brera", image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=903&q=80" },
//   { title: "Alea Pro", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=904&q=80" },
//   { title: "Nirnio", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=905&q=80" },
// ];



const InteriorPage = () => {
const [collections, setCollections] = useState([]);
const [selectedInterior, setSelectedInterior] = useState(null);
const [showEnquiryModal, setShowEnquiryModal] = useState(false);
const showcaseRef = useRef(null);
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    email: "",
    phone: "", 
    message: "",
  });

  
  const [submitStatus, setSubmitStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

const handleInteriorClick = (item) => {
  setSelectedInterior(item);
  setShowEnquiryModal(true);
};

const handleFormChange = (event) => {
  const { name, value } = event.target;

  setEnquiryForm((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const handleFormSubmit = async (event) => {
  event.preventDefault();

  if (!enquiryForm.name || !enquiryForm.email || !enquiryForm.phone) {
    setSubmitStatus("Please fill all required fields");
    return;
  }

  setIsSubmitting(true);
  setSubmitStatus("Submitting enquiry...");

  try {
const payload = {
  name: enquiryForm.name.trim(),
  email: enquiryForm.email.trim(),

  mobilenumber: enquiryForm.phone.trim(),

  propertyname: selectedInterior?.name,

  message: enquiryForm.message.trim(),

  description: enquiryForm.message.trim(),

  source: "interior-page",
};
    const response = await api.post("/interior-enquiries", payload);

    if (response.status === 200 || response.status === 201) {
      setSubmitStatus("Enquiry submitted successfully!");

      setEnquiryForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } else {
      setSubmitStatus("Submission failed");
    }
  } catch (error) {
  console.error("FULL ERROR:", error.response?.data);

  setSubmitStatus(
    JSON.stringify(error.response?.data) ||
    "Something went wrong"
  );
} finally {
    setIsSubmitting(false);

    setTimeout(() => {
      setSubmitStatus("");
    }, 4000);
  }
};

useEffect(() => {
  fetchInteriorData();
}, []);

const fetchInteriorData = async () => {
  try {
    const response = await api.post("/interior/home", {
      pagenation: 1,
    });

    const data = response?.data?.data || [];
    console.log(data);

    setCollections(data.slice(0, 6));
  } catch (error) {
    console.error("Interior fetch failed", error);
  }
};

  return (
    <>
      <Seo />
      <main className="interior-page-shell">
        <section className="interior-editorial-page">
          <section className="interior-hero-card">
            <img
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80"
              alt="Modern living room"
            />
            <div className="interior-hero-overlay">
              <div className="interior-hero-badge">Popular Interior Design</div>
              <div className="interior-hero-copy">
                <p>Discover a calm, elevated interior language with warm materials and timeless shapes.</p>
                <a href="#collection" className="interior-button-link">View More</a>
              </div>
            </div>
          </section>

          <section
  ref={showcaseRef}
  id="interior-showcase-anchor"
  style={{ scrollMarginTop: "20px" }}
>
  <InteriorShowcase />
</section>

          <button
  type="button"
  className="interior-enquiry-scroll-btn"
  onClick={() =>
    document.getElementById("collection")?.scrollIntoView({
  behavior: "smooth",
  block: "start",
})
  }
  aria-label="For enquiry"
>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 5H20V15H6L4 17V5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>

  <span>For Enquiry</span>
</button>

{showEnquiryModal && (
  <div className="interior-modal-overlay">
    <div className="interior-modal-box">

      <button
        className="interior-modal-close"
        onClick={() => setShowEnquiryModal(false)}
      >
        ×
      </button>

      <img
        src={selectedInterior?.image}
        alt={selectedInterior?.name}
        className="interior-modal-image"
      />

      <h2>{selectedInterior?.name}</h2>

      <form
        className="interior-enquiry-form"
        onSubmit={handleFormSubmit}
      >
        {submitStatus && (
          <div className="interior-enquiry-status">
            {submitStatus}
          </div>
        )}

        <input
          type="text"
          name="name"
          value={enquiryForm.name}
          onChange={handleFormChange}
          placeholder="Your Name"
        />

        <input
          type="email"
          name="email"
          value={enquiryForm.email}
          onChange={handleFormChange}
          placeholder="Your Email"
        />

        <input
          type="tel"
          name="phone"
          value={enquiryForm.phone}
          onChange={handleFormChange}
          placeholder="Phone Number"
        />

        <textarea
          name="message"
          value={enquiryForm.message}
          onChange={handleFormChange}
          placeholder="Tell us about your interior project"
        />

        <button
          type="submit"
          className="interior-enquiry-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Submit Enquiry"}
        </button>
      </form>
    </div>
  </div>
)}
          {/* <section className="interior-enquiry-section">
            <div className="interior-enquiry-grid">
              <div className="interior-enquiry-copy">
                <span className="interior-section-kicker">Interior Enquiry</span>
                <h2>Book a free consultation for your home interior</h2>
                <p>
                  Share your project details and our design team will connect with you
                  to build a tailored interior solution.
                </p>
              </div>

              <form className="interior-enquiry-form" onSubmit={handleFormSubmit}>
                {submitStatus && (
                  <div className="interior-enquiry-status">{submitStatus}</div>
                )}

              <input
  type="text"
  name="name"
  value={enquiryForm.name}
  onChange={handleFormChange}
  placeholder="Your Name"
/>
<input
  type="email"
  name="email"
  value={enquiryForm.email}
  onChange={handleFormChange}
  placeholder="Your Email"
/>
                <input
                  type="tel"
                  name="phone"
                  value={enquiryForm.phone}
                  onChange={handleFormChange}
                  placeholder="Phone Number"
                />
              <textarea
  name="message"
  value={enquiryForm.message}
  onChange={handleFormChange}
  placeholder="Tell us about your interior project (optional)"
/>

                <button type="submit" className="interior-enquiry-submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Submit Enquiry"}
                </button>
              </form>
            </div>
          </section> */}

          {/* <section className="interior-feature-grid">
            <article className="interior-feature-large">
              <img
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80"
                alt="Luxury living room"
              />
              <div className="interior-feature-large-copy">
                <span className="interior-chip">Georgeous Interior</span>
                <h1>Modern Minimalist</h1>
              </div>
            </article>

            <div className="interior-side-stack">
              <article className="interior-side-card light-card">
                <span className="interior-chip">Aesthetic</span>
                <p>Furniture where every piece tells a story of style.</p>
                <h2>Into a gallery of elegance</h2>
              </article>

              <article className="interior-side-card image-card">
                <img
                  src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
                  alt="Decor interior"
                />
                <div className="interior-side-card-overlay">
                  <span className="interior-chip white-chip">Best Furniture</span>
                  <p>Indulge in the artistry of everyday living</p>
                  <button type="button" className="interior-arrow-btn" aria-label="Open collection">
                    ↗
                  </button>
                </div>
              </article>
            </div>
          </section> */}

          <section className="interior-stats-row" aria-label="Interior stats">
            <div><strong>500+</strong><span>Products</span></div>
            <div><strong>20+</strong><span>Projects</span></div>
            <div><strong>50+</strong><span>Satisfied Customers</span></div>
            <div><strong>1st</strong><span>Top 1 in Chennai</span></div>
          </section>
<section className="interior-collection-head" id="collection">
          
            <div>
              <h2>Explore Our Proudly Collection</h2>
            </div>
            
          </section>

          <section className="interior-collection-grid" id="projects">
            {collections.map((item, index) => (
  <article
    className="interior-collection-card"
    key={index}
    onClick={() => handleInteriorClick(item)}
  >
                <img src={item.image} alt={item.name} />
                <div className="interior-collection-card-footer">
                  <span>{item.name}</span>
                  <span className="interior-small-arrow">↗</span>
                </div>
              </article>
            ))}
          </section>
        </section>
      </main>
    </>
  );
};

export default InteriorPage;
