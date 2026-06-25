import { useEffect, useState } from "react";
import Seo from "../components/common/Seo";
import "./RefundPolicy.css";

const menuItems = [
  { id: "overview", label: "Overview" },
  { id: "listings", label: "Listing Cancellations" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "fees", label: "Transaction Fees" },
  { id: "disputes", label: "Disputes & Resolutions" },
  { id: "exceptions", label: "Policy Exceptions" },
  { id: "changes", label: "Policy Changes" },
];

const supportContacts = [
  {
    label: "Support Email",
    value: "info@homewala.com",
    href: "mailto:info@homewala.com",
  },
  {
    label: "Billing Email",
    value: "Digital@homewala.com",
    href: "mailto:Digital@homewala.com",
  },
  {
    label: "Website",
    value: "homewala.com",
    href: "https://homewala.com",
  },
];

const RefundPolicy = () => {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    window.scrollTo(0, 0);

    // Setup Intersection Observer to detect scroll and highlight active menu items
    const sections = document.querySelectorAll(".refund-content-section");
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
        title="Refund Policy | Homewala"
        description="Read the Homewala refund policy for listings, subscriptions, transaction fees, support contact details, and policy exceptions."
        keywords="Homewala refund policy, listing refund, subscription refund, refund terms, property refund support"
        canonical="https://www.homewala.com/refund-policy"
      />

      <div className="refund-page-container">
        {/* Hero Section */}
        <header className="refund-header-hero">
          <div className="refund-header-hero-content">
            <span className="refund-hero-tag">Refund Policy</span>
            <h1>Cancellations & Refunds</h1>
            <p className="refund-hero-meta">
              Clear, simple terms for <span>listing cancellations</span> and <span>support requests</span>.
            </p>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="refund-body-wrapper">
          
          {/* Sticky Sidebar Navigation */}
          <aside className="refund-sidebar-nav">
            <h3 className="refund-sidebar-title">Table of Contents</h3>
            <nav className="refund-nav-list">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleScrollToSection(item.id)}
                  className={`refund-nav-link ${activeSection === item.id ? "active" : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="refund-content-card">
            
            {/* Overview Section */}
            <section id="overview" className="refund-content-section">
              <h2 className="refund-section-title">Overview</h2>
              
              <p className="refund-text-p">
                At{" "}
                <a href="https://homewala.com" target="_blank" rel="noopener noreferrer">
                  Homewala.com
                </a>
                , we strive to provide our users with the best experience when it comes to finding their dream homes. However, we understand that there may be instances where you might need to request a refund. Please read our refund policy carefully to understand your rights and responsibilities.
              </p>

              <div className="refund-alert-box refund-alert-blue">
                <span className="refund-alert-icon">💡</span>
                <div className="refund-alert-text">
                  <strong>Need assistance with billing or listings?</strong>
                  <br />
                  Our support lines are open to help resolve transaction issues or listing queries. Please review the support options listed under the disputes section below.
                </div>
              </div>
            </section>

            {/* Listing Cancellations */}
            <section id="listings" className="refund-content-section">
              <h2 className="refund-section-title">Return Policy for Listings</h2>
              
              <ul className="refund-custom-list">
                <li className="refund-custom-list-item">
                  <span className="refund-list-bullet">●</span>
                  <span>Property listings purchased by agents or builders can be cancelled within 24 hours of purchase for a full refund. Request via your account manager or email <a href="mailto:Digital@homewala.com">Digital@homewala.com</a>.</span>
                </li>
                <li className="refund-custom-list-item">
                  <span className="refund-list-bullet">●</span>
                  <span>Refunds may not be applicable beyond the 24-hour window.</span>
                </li>
                <li className="refund-custom-list-item">
                  <span className="refund-list-bullet">●</span>
                  <span>If Homewala.com removes a listing due to Terms & Conditions violation, a refund may be granted depending on the case.</span>
                </li>
              </ul>
            </section>

            {/* Subscription Services */}
            <section id="subscriptions" className="refund-content-section">
              <h2 className="refund-section-title">Subscription Services</h2>
              
              <ul className="refund-custom-list">
                <li className="refund-custom-list-item">
                  <span className="refund-list-bullet">●</span>
                  <span>Premium services like featured listings or ads are eligible for a full refund within 7 days of subscription start if unsatisfied.</span>
                </li>
                <li className="refund-custom-list-item">
                  <span className="refund-list-bullet">●</span>
                  <span>Requests after 7 days are reviewed case-by-case and may receive a prorated refund.</span>
                </li>
              </ul>
            </section>

            {/* Transaction Fees */}
            <section id="fees" className="refund-content-section">
              <h2 className="refund-section-title">Transaction Fees</h2>
              
              <ul className="refund-custom-list">
                <li className="refund-custom-list-item">
                  <span className="refund-list-bullet">●</span>
                  <span>Transaction fees such as payment gateway charges may apply for some services.</span>
                </li>
                <li className="refund-custom-list-item">
                  <span className="refund-list-bullet">●</span>
                  <span>These fees are non-refundable unless there was an error on Homewala.com's part.</span>
                </li>
              </ul>
            </section>

            {/* Disputes and Resolutions */}
            <section id="disputes" className="refund-content-section">
              <h2 className="refund-section-title">Disputes and Resolutions</h2>
              
              <p className="refund-text-p">
                Think you're entitled to a refund? Contact support at <a href="mailto:info@homewala.com">info@homewala.com</a>. Our team may ask for additional info to process your request. Refunds are issued using the original payment method when possible.
              </p>

              <div className="refund-alert-box refund-alert-blue">
                <span className="refund-alert-icon">✉️</span>
                <div className="refund-alert-text">
                  <strong>Homewala Support Contact Channels:</strong>
                  <br />
                  <div className="flex flex-col space-y-1 mt-2">
                    {supportContacts.map((contact) => (
                      <span key={contact.label}>
                        <strong>{contact.label}:</strong> <a href={contact.href} className="underline text-blue-800">{contact.value}</a>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Exceptions */}
            <section id="exceptions" className="refund-content-section">
              <h2 className="refund-section-title">Exceptions</h2>
              
              <div className="refund-alert-box refund-alert-yellow">
                <span className="refund-alert-icon">⚠️</span>
                <div className="refund-alert-text">
                  Refunds may be refused in cases of abuse, fraud, or misuse. Refund policies may differ for special promotions or partnerships, so always check their specific terms.
                </div>
              </div>
            </section>

            {/* Changes to Policy */}
            <section id="changes" className="refund-content-section">
              <h2 className="refund-section-title">Changes to the Refund Policy</h2>
              
              <p className="refund-text-p">
                Homewala.com reserves the right to update this refund policy anytime without prior notice. Changes take effect immediately upon posting on our website.
              </p>
              
              <div className="refund-alert-box refund-alert-blue mt-8">
                <span className="refund-alert-icon font-semibold">✓</span>
                <p className="refund-alert-text text-center w-full">
                  By using the services of Homewala.com, you agree to this refund policy. For questions or assistance, contact us at <a href="mailto:info@homewala.com">info@homewala.com</a>.
                </p>
              </div>
            </section>

          </main>
        </div>
      </div>
    </>
  );
};

export default RefundPolicy;
