import { useEffect, useState } from "react";
import Seo from "../components/common/Seo";
import "./PrivacyPolicy.css";

const menuItems = [
  { id: "intro", label: "Introduction" },
  { id: "info-collect", label: "Information We Collect" },
  { id: "how-collect", label: "How We Collect" },
  { id: "use-info", label: "Use of Information" },
  { id: "share-third", label: "Sharing Information" },
  { id: "third-party", label: "Third-party Sites" },
  { id: "grievance", label: "Grievance Officer" },
  { id: "updates", label: "Updates to Policy" },
  { id: "jurisdiction", label: "Jurisdiction" },
];

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState("intro");

  useEffect(() => {
    window.scrollTo(0, 0);

    // Setup Intersection Observer to detect scroll and highlight active menu items
    const sections = document.querySelectorAll(".privacy-content-section");
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -50% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const handleScrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 110; // offset for the global sticky navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <Seo
        title="Privacy Policy | Homewala"
        description="Read the Homewala privacy policy to see how we collect, use, protect, and share user information."
        keywords="Homewala privacy policy, user data privacy, property search data security, homewala grievance officer"
        canonical="https://www.homewala.com/privacy-policy"
      />

      <div className="privacy-page-container">
        {/* Hero Section */}
        <header className="privacy-header-hero">
          <div className="privacy-header-hero-content">
            <span className="privacy-hero-tag">Privacy & Trust</span>
            <h1>Privacy Policy</h1>
            <p className="privacy-hero-meta">
              LAST REVISION: <span>01.06.2025</span>
            </p>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="privacy-body-wrapper">
          
          {/* Sticky Sidebar Navigation */}
          <aside className="privacy-sidebar-nav">
            <h3 className="privacy-sidebar-title">Table of Contents</h3>
            <nav className="privacy-nav-list">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleScrollToSection(item.id)}
                  className={`privacy-nav-link ${activeSection === item.id ? "active" : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="privacy-content-card">
            
            {/* Introduction Section */}
            <section id="intro" className="privacy-content-section">
              <h2 className="privacy-section-title">Introduction</h2>
              
              <p className="privacy-text-p">
                This Privacy Policy applies to the website{" "}
                <a href="https://homewala.com" target="_blank" rel="noopener noreferrer">
                  homewala.com
                </a>
                .
              </p>

              <p className="privacy-text-p">
                <a href="https://homewala.com" target="_blank" rel="noopener noreferrer">
                  homewala.com
                </a>{" "}
                recognises the importance of maintaining your privacy. We value your privacy and appreciate your trust in us. This Policy describes how we treat user information we collect on homewala.com and other offline sources. This Privacy Policy applies to current and former visitors to our website and to our online customers. By visiting and/or using our website, you agree to this Privacy Policy.
              </p>
            </section>

            {/* Information We Collect */}
            <section id="info-collect" className="privacy-content-section">
              <h2 className="privacy-section-title">Information We Collect</h2>
              
              <h3 className="privacy-section-subtitle">Contact Information</h3>
              <p className="privacy-text-p">We might collect your name, mail ID and mobile number.</p>

              <h3 className="privacy-section-subtitle">Payment and Billing Information</h3>
              
              <div className="privacy-alert-box privacy-alert-blue">
                <span className="privacy-alert-icon">💳</span>
                <p className="privacy-alert-text">
                  We NEVER collect your credit card number or credit card expiry date or other details pertaining to your credit card on our website. Credit card information will be obtained and processed by our online payment partner CC Avenue.
                </p>
              </div>

              <p className="privacy-text-p">
                We might collect your name and mobile number. All credit card processing details are handled securely off-site.
              </p>

              <h3 className="privacy-section-subtitle">Information You Post</h3>
              <p className="privacy-text-p">
                We collect information you post in a public space on our website or on a third-party social media site belonging to homewala.com.
              </p>
            </section>

            {/* How We Collect Information */}
            <section id="how-collect" className="privacy-content-section">
              <h2 className="privacy-section-title">How We Collect Information</h2>
              
              <h3 className="privacy-section-subtitle">We collect information directly from you</h3>
              <p className="privacy-text-p">
                We collect information directly from you when you post a listing / contact owners. We also collect information if you post a comment on our website or ask us a question through phone or email.
              </p>

              <h3 className="privacy-section-subtitle">We collect information from you passively</h3>
              <p className="privacy-text-p">
                We use tracking tools like Google Analytics, Google Webmaster for collecting information about your usage of our website.
              </p>

              <h3 className="privacy-section-subtitle">We get information about you from third parties</h3>
              <p className="privacy-text-p">
                For example, if you use an integrated social media feature on our websites. The third-party social media site will give us certain information about you. This could include your name and email address.
              </p>
            </section>

            {/* Use of Your Personal Information */}
            <section id="use-info" className="privacy-content-section">
              <h2 className="privacy-section-title">Use of Your Personal Information</h2>
              
              <ul className="privacy-custom-list">
                <li className="privacy-custom-list-item">
                  <span className="privacy-list-bullet">●</span>
                  <span>
                    <strong>We use information to contact you:</strong> We might use the information you provide to contact you for confirmation of a purchase on our website or for other promotional purposes.
                  </span>
                </li>
                <li className="privacy-custom-list-item">
                  <span className="privacy-list-bullet">●</span>
                  <span>
                    <strong>We use information to respond to your requests or questions:</strong> We might use your information to confirm your registration for an event or contest.
                  </span>
                </li>
                <li className="privacy-custom-list-item">
                  <span className="privacy-list-bullet">●</span>
                  <span>
                    <strong>We use information to improve our products and services:</strong> We might use your information to customize your experience with us. This could include displaying content based upon your preferences.
                  </span>
                </li>
                <li className="privacy-custom-list-item">
                  <span className="privacy-list-bullet">●</span>
                  <span>
                    <strong>We use information to look at site trends and customer interests:</strong> We may use your information to make our website and products better. We may combine information we get from you with information about you we get from third parties.
                  </span>
                </li>
                <li className="privacy-custom-list-item">
                  <span className="privacy-list-bullet">●</span>
                  <span>
                    <strong>We use information for security purposes:</strong> We may use information to protect our company, our customers, or our websites.
                  </span>
                </li>
                <li className="privacy-custom-list-item">
                  <span className="privacy-list-bullet">●</span>
                  <span>
                    <strong>We use information for marketing purposes:</strong> We might send you information about special promotions or offers. We might also tell you about new features or products. These might be our own offers or products, or third-party offers or products we think you might find interesting. Or, for example, if you buy tickets from us we'll enroll you in our newsletter.
                  </span>
                </li>
                <li className="privacy-custom-list-item">
                  <span className="privacy-list-bullet">●</span>
                  <span>
                    <strong>We use information to send you transactional communications:</strong> We might send you emails or SMS about your account or a ticket purchase.
                  </span>
                </li>
                <li className="privacy-custom-list-item">
                  <span className="privacy-list-bullet">●</span>
                  <span>
                    <strong>We use information as otherwise permitted by law.</strong>
                  </span>
                </li>
              </ul>
            </section>

            {/* Sharing of Information with Third Parties */}
            <section id="share-third" className="privacy-content-section">
              <h2 className="privacy-section-title">Sharing of Information with Third Parties</h2>
              
              <ul className="privacy-custom-list">
                <li className="privacy-custom-list-item">
                  <span className="privacy-list-bullet">●</span>
                  <span>
                    <strong>We may share information if we think we have to in order to comply with the law or to protect ourselves:</strong> We will share information to respond to a court order or subpoena. We may also share it if a government agency or investigatory body requests. Or, we might also share information when we are investigating potential fraud.
                  </span>
                </li>
                <li className="privacy-custom-list-item">
                  <span className="privacy-list-bullet">●</span>
                  <span>
                    <strong>We may share information with any successor to all or part of our business:</strong> For example, if part of our business is sold we may give our customer list as part of that transaction.
                  </span>
                </li>
                <li className="privacy-custom-list-item">
                  <span className="privacy-list-bullet">●</span>
                  <span>
                    <strong>We may share information with prospective tenants and house owners:</strong> For example, if the tenant is interested in your property we will help him to connect with you by sharing your contact number submitted to us. We charge a little premium for this service.
                  </span>
                </li>
              </ul>
            </section>

            {/* Third-party Sites */}
            <section id="third-party" className="privacy-content-section">
              <h2 className="privacy-section-title">Third-party Sites</h2>
              <p className="privacy-text-p">
                If you click on one of the links to third-party websites, you may be taken to websites we do not control. This policy does not apply to the privacy practices of those websites. Read the privacy policy of other websites carefully. We are not responsible for these third-party sites.
              </p>
            </section>

            {/* Grievance Officer */}
            <section id="grievance" className="privacy-content-section">
              <h2 className="privacy-section-title">Grievance Officer</h2>
              <p className="privacy-text-p">
                In accordance with Information Technology Act 2000 and rules made thereunder, the name and contact details of the Grievance Officer are provided below:
              </p>
              
              <div className="privacy-alert-box privacy-alert-blue">
                <span className="privacy-alert-icon">⚖️</span>
                <div className="privacy-alert-text">
                  <strong>Mr. Balaji Adarsh</strong>
                  <br />
                  No.78/10, Old State Bank colony, West Tambaram, Chennai, Tamil Nadu 600045
                  <br />
                  Email:{" "}
                  <a href="mailto:info@homewala.com" className="text-blue-600 underline">
                    info@homewala.com
                  </a>
                </div>
              </div>
            </section>

            {/* Updates to This Policy */}
            <section id="updates" className="privacy-content-section">
              <h2 className="privacy-section-title">Updates to This Policy</h2>
              <p className="privacy-text-p">
                This Privacy Policy was last updated on <strong>01.06.2025</strong>. From time to time we may change our privacy practices. We will notify you of any material changes to this policy as required by law. We will also post an updated copy on our website. Please check our site periodically for updates.
              </p>
            </section>

            {/* Jurisdiction */}
            <section id="jurisdiction" className="privacy-content-section">
              <h2 className="privacy-section-title">Jurisdiction</h2>
              <p className="privacy-text-p">
                If you choose to visit the website, your visit and any dispute over privacy is subject to this Policy and the website's terms of use. In addition to the foregoing, any disputes arising under this Policy shall be governed by the laws of India.
              </p>
            </section>

          </main>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
