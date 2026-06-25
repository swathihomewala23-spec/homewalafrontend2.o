import { useEffect, useState } from "react";
import Seo from "../components/common/Seo";
import "./TermsAndConditions.css";

const menuItems = [
  { id: "intro", label: "Introduction" },
  { id: "products", label: "I. Products" },
  { id: "website", label: "II. Website" },
  { id: "disclaimer", label: "III. Disclaimers" },
  { id: "liability", label: "IV. Liability" },
  { id: "indemnification", label: "V. Indemnity" },
  { id: "privacy", label: "VI. Privacy" },
  { id: "agreement", label: "VII. Agreement" },
  { id: "general", label: "VIII. General" },
];

const TermsAndConditions = () => {
  const [activeSection, setActiveSection] = useState("intro");

  useEffect(() => {
    window.scrollTo(0, 0);

    // Setup Intersection Observer to detect scroll and highlight active menu items
    const sections = document.querySelectorAll(".terms-content-section");
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
        title="Terms and Conditions | Homewala"
        description="Read the Homewala terms and conditions for platform usage, property listings, user accounts, intellectual property, and liability limitations."
        keywords="Homewala terms and conditions, terms of use, property listings terms, real estate platform terms"
        canonical="https://www.homewala.com/terms"
      />

      <div className="terms-page-container">
        {/* Hero Section */}
        <header className="terms-header-hero">
          <div className="terms-header-hero-content">
            <span className="terms-hero-tag">Legal Document</span>
            <h1>Terms of Service</h1>
            <p className="terms-hero-meta">
              LAST REVISION: <span>01.06.2025</span>
            </p>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="terms-body-wrapper">
          
          {/* Sticky Sidebar Navigation */}
          <aside className="terms-sidebar-nav">
            <h3 className="terms-sidebar-title">Table of Contents</h3>
            <nav className="terms-nav-list">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleScrollToSection(item.id)}
                  className={`terms-nav-link ${activeSection === item.id ? "active" : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="terms-content-card">
            
            {/* Introduction Section */}
            <section id="intro" className="terms-content-section">
              <h2 className="terms-section-title">Introduction</h2>
              
              <div className="terms-alert-box terms-alert-blue">
                <span className="terms-alert-icon">📘</span>
                <p className="terms-alert-text">
                  PLEASE READ THIS TERMS OF SERVICE AGREEMENT CAREFULLY. BY USING THIS WEBSITE OR ORDERING PRODUCTS FROM THIS WEBSITE YOU AGREE TO BE BOUND BY ALL OF THE TERMS AND CONDITIONS OF THIS AGREEMENT.
                </p>
              </div>

              <p className="terms-text-p">
                This Terms of Service Agreement (the "Agreement") governs your use of this website,{" "}
                <a href="https://homewala.com" target="_blank" rel="noopener noreferrer">
                  homewala.com
                </a>{" "}
                (the "Website"), Homewala.com's offer of products for purchase on this Website, or your purchase of products available on this Website. This Agreement includes, and incorporates by this reference, the policies and guidelines referenced below.
              </p>

              <p className="terms-text-p">
                Homewala.com reserves the right to change or revise the terms and conditions of this Agreement at any time by posting any changes or a revised Agreement on this Website. Homewala.com will alert you that changes or revisions have been made by indicating on the top of this Agreement the date it was last revised. The changed or revised Agreement will be effective immediately after it is posted on this Website. Your use of the Website following the posting of any such changes or of a revised Agreement will constitute your acceptance of any such changes or revisions.
              </p>

              <p className="terms-text-p">
                Homewala.com encourages you to review this Agreement whenever you visit the Website to make sure that you understand the terms and conditions governing use of the Website. This Agreement does not alter in any way the terms or conditions of any other written agreement you may have with Homewala.com for other products or services. If you do not agree to this Agreement (including any referenced policies or guidelines), please immediately terminate your use of the Website.
              </p>

              <p className="terms-text-p">
                <em>If you would like to print this Agreement, please click the print button on your browser toolbar.</em>
              </p>
            </section>

            {/* Products Section */}
            <section id="products" className="terms-content-section">
              <h2 className="terms-section-title">I. Products</h2>
              
              <h3 className="terms-section-subtitle">Terms of Offer</h3>
              <p className="terms-text-p">
                This Website offers for sale certain products (the "Products"). By placing an order for Products through this Website, you agree to the terms set forth in this Agreement.
              </p>

              <h3 className="terms-section-subtitle">Customer Solicitation</h3>
              <p className="terms-text-p">
                Unless you notify our third-party call center reps or direct Homewala.com sales reps, while they are calling you, of your desire to opt out from further direct company communications and solicitations, you are agreeing to continue to receive further emails and call solicitations from Homewala.com and its designated in-house or third-party call team(s).
              </p>

              <h3 className="terms-section-subtitle">Opt Out Procedure</h3>
              <p className="terms-text-p">We provide 3 easy ways to opt out from future solicitations:</p>
              
              <ul className="terms-custom-list">
                <li className="terms-custom-list-item">
                  <span className="terms-list-badge">1</span>
                  <span>You may use the opt-out link found in any email solicitation you receive.</span>
                </li>
                <li className="terms-custom-list-item">
                  <span className="terms-list-badge">2</span>
                  <span>
                    You may email your opt-out request to:{" "}
                    <a href="mailto:info@homewala.com" className="text-blue-600 underline">
                      info@homewala.com
                    </a>
                  </span>
                </li>
                <li className="terms-custom-list-item">
                  <span className="terms-list-badge">3</span>
                  <span>
                    You may send a written request to:
                    <br />
                    <strong className="text-slate-700">No.78/10, Old State Bank colony, West Tambaram, Chennai, Tamil Nadu 600045</strong>
                  </span>
                </li>
              </ul>

              <h3 className="terms-section-subtitle">Proprietary Rights</h3>
              <p className="terms-text-p">
                Homewala.com has proprietary rights and trade secrets in the Products. You may not copy, reproduce, resell, or redistribute any Product manufactured and/or distributed by Homewala.com. Homewala.com also has rights to all trademarks and trade dress and specific layouts of this webpage, including calls to action, text placement, images, and other information.
              </p>

              <h3 className="terms-section-subtitle">Sales Tax</h3>
              <p className="terms-text-p">
                If you purchase any Products, you will be responsible for paying any applicable sales tax.
              </p>
            </section>

            {/* Website Section */}
            <section id="website" className="terms-content-section">
              <h2 className="terms-section-title">II. Website</h2>
              
              <h3 className="terms-section-subtitle">Content; Intellectual Property; Third-Party Links</h3>
              <p className="terms-text-p">
                In addition to making Products available, this Website also offers information and marketing materials. This Website may also offer information through links to third-party websites. Homewala.com does not always create or curate the information offered; instead, it may be sourced externally. Any original content is protected by applicable copyright, trademark, and other laws.
              </p>
              <p className="terms-text-p">
                Unauthorized use of the Website content may violate such laws. You agree to use the Website for personal, non-commercial use only. Any links to third-party websites are provided as a convenience. Homewala.com is not responsible for third-party website content.
              </p>

              <h3 className="terms-section-subtitle">Use of Website</h3>
              <p className="terms-text-p">You agree not to:</p>
              <ul className="terms-custom-list">
                <li className="terms-custom-list-item">
                  <span className="terms-list-badge">1</span>
                  <span>Use the Website for unlawful purposes.</span>
                </li>
                <li className="terms-custom-list-item">
                  <span className="terms-list-badge">2</span>
                  <span>Violate intellectual property laws.</span>
                </li>
                <li className="terms-custom-list-item">
                  <span className="terms-list-badge">3</span>
                  <span>Interfere with others' Website use.</span>
                </li>
                <li className="terms-custom-list-item">
                  <span className="terms-list-badge">4</span>
                  <span>Transmit spam or chain letters.</span>
                </li>
                <li className="terms-custom-list-item">
                  <span className="terms-list-badge">5</span>
                  <span>Harass or harm users.</span>
                </li>
              </ul>

              <h3 className="terms-section-subtitle">License</h3>
              <p className="terms-text-p">
                You are granted a limited, non-transferable license to use the Website content for non-commercial use. You may not modify, reproduce, or distribute without permission.
              </p>

              <h3 className="terms-section-subtitle">Posting</h3>
              <p className="terms-text-p">
                By posting content, you grant Homewala.com a worldwide, royalty-free license to use, copy, distribute, and display that content. Homewala.com is not responsible for user-generated content and may remove objectionable content at its discretion.
              </p>
            </section>

            {/* Disclaimer Section */}
            <section id="disclaimer" className="terms-content-section">
              <h2 className="terms-section-title">III. Disclaimer of Warranties</h2>
              
              <div className="terms-alert-box terms-alert-yellow">
                <span className="terms-alert-icon">⚠️</span>
                <p className="terms-alert-text">
                  YOUR USE OF THIS WEBSITE AND/OR PRODUCTS IS AT YOUR OWN RISK. THE WEBSITE AND PRODUCTS ARE PROVIDED "AS IS" AND "AS AVAILABLE".
                </p>
              </div>

              <p className="terms-text-p">
                Homewala.com DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              
              <p className="terms-text-p"><strong>NO GUARANTEE IS GIVEN THAT:</strong></p>
              <ul className="terms-custom-list">
                <li className="terms-custom-list-item">
                  <span className="terms-list-bullet">●</span>
                  <span>WEBSITE INFORMATION IS ACCURATE OR COMPLETE.</span>
                </li>
                <li className="terms-custom-list-item">
                  <span className="terms-list-bullet">●</span>
                  <span>LINKS TO THIRD PARTIES ARE RELIABLE.</span>
                </li>
                <li className="terms-custom-list-item">
                  <span className="terms-list-bullet">●</span>
                  <span>DEFECTS WILL BE CORRECTED.</span>
                </li>
                <li className="terms-custom-list-item">
                  <span className="terms-list-bullet">●</span>
                  <span>PRODUCTS WILL MEET YOUR EXPECTATIONS.</span>
                </li>
              </ul>
              
              <p className="terms-text-p"><em>SOME JURISDICTIONS MAY NOT ALLOW THESE LIMITATIONS.</em></p>
            </section>

            {/* Liability Section */}
            <section id="liability" className="terms-content-section">
              <h2 className="terms-section-title">IV. Limitation of Liability</h2>
              
              <p className="terms-text-p">
                Homewala.com's total liability is limited to the amount you paid, excluding shipping and handling. Homewala.com will not be liable for:
              </p>

              <ul className="terms-custom-list">
                <li className="terms-custom-list-item">
                  <span className="terms-list-bullet">●</span>
                  <span>Any damages from use or inability to use the Website or Products.</span>
                </li>
                <li className="terms-custom-list-item">
                  <span className="terms-list-bullet">●</span>
                  <span>Costs for substitute products.</span>
                </li>
                <li className="terms-custom-list-item">
                  <span className="terms-list-bullet">●</span>
                  <span>Lost profits or data.</span>
                </li>
                <li className="terms-custom-list-item">
                  <span className="terms-list-bullet">●</span>
                  <span>Claims arising from website use or product purchase.</span>
                </li>
              </ul>

              <p className="terms-text-p"><em>Some jurisdictions may limit or not allow exclusion of certain liabilities.</em></p>
            </section>

            {/* Indemnification Section */}
            <section id="indemnification" className="terms-content-section">
              <h2 className="terms-section-title">V. Indemnification</h2>
              
              <p className="terms-text-p">
                You agree to indemnify and hold harmless Homewala.com, its employees, agents, and affiliates from claims arising from:
              </p>

              <ul className="terms-custom-list">
                <li className="terms-custom-list-item">
                  <span className="terms-list-badge">1</span>
                  <span>Breach of this Agreement.</span>
                </li>
                <li className="terms-custom-list-item">
                  <span className="terms-list-badge">2</span>
                  <span>Use or misuse of Website or Products.</span>
                </li>
                <li className="terms-custom-list-item">
                  <span className="terms-list-badge">3</span>
                  <span>Violation of any third-party rights or applicable laws.</span>
                </li>
                <li className="terms-custom-list-item">
                  <span className="terms-list-badge">4</span>
                  <span>Content you provide to the Website.</span>
                </li>
              </ul>

              <p className="terms-text-p">
                Homewala.com may request written assurances from you and may participate in your defense.
              </p>
            </section>

            {/* Privacy Section */}
            <section id="privacy" className="terms-content-section">
              <h2 className="terms-section-title">VI. Privacy</h2>
              <p className="terms-text-p">
                Please refer to Homewala.com's Privacy Policy, incorporated herein by reference, for information on how we collect, use, and protect your data.
              </p>
            </section>

            {/* Agreement Section */}
            <section id="agreement" className="terms-content-section">
              <h2 className="terms-section-title">VII. Agreement to Be Bound</h2>
              
              <p className="terms-text-p">
                By using the Website or purchasing Products, you confirm that you have read, understood, and agreed to all terms in this Agreement.
              </p>
              
              <div className="terms-alert-box terms-alert-blue">
                <span className="terms-alert-icon">📝</span>
                <p className="terms-alert-text font-bold">
                  Note: User-submitted contact details may be used for transactional/promotional communication but will not be sold to third parties.
                </p>
              </div>
            </section>

            {/* General Section */}
            <section id="general" className="terms-content-section">
              <h2 className="terms-section-title">VIII. General</h2>
              
              <h3 className="terms-section-subtitle">Force Majeure</h3>
              <p className="terms-text-p">
                Homewala.com is not liable for delays due to natural disasters, war, terrorism, labor strikes, or other uncontrollable events.
              </p>

              <h3 className="terms-section-subtitle">Cessation of Operation</h3>
              <p className="terms-text-p">
                Homewala.com reserves the right to cease Website operations or product offerings at any time.
              </p>

              <h3 className="terms-section-subtitle">Entire Agreement</h3>
              <p className="terms-text-p">
                This document represents the entire agreement between you and Homewala.com.
              </p>

              <h3 className="terms-section-subtitle">Waiver & Severability</h3>
              <p className="terms-text-p">
                Failure to enforce any right is not a waiver. Invalid clauses will not affect the rest of the Agreement.
              </p>

              <h3 className="terms-section-subtitle">Governing Law</h3>
              <p className="terms-text-p">
                This Agreement is governed by laws of Tamil Nadu. All disputes will be resolved in courts located in Tamil Nadu.
              </p>

              <h3 className="terms-section-subtitle">Statute of Limitations</h3>
              <p className="terms-text-p">
                Claims must be filed within 1 year or be permanently barred.
              </p>

              <h3 className="terms-section-subtitle">No Class Actions</h3>
              <p className="terms-text-p">
                You waive any right to participate in class action lawsuits related to this Agreement.
              </p>

              <h3 className="terms-section-subtitle">Termination</h3>
              <p className="terms-text-p">
                Homewala.com may terminate your access at its discretion for violating this Agreement.
              </p>

              <h3 className="terms-section-subtitle">Domestic Use</h3>
              <p className="terms-text-p">
                The Website is controlled from India. Use outside India is at your own risk.
              </p>

              <h3 className="terms-section-subtitle">Assignment</h3>
              <p className="terms-text-p">
                You may not assign this Agreement; Homewala.com may do so without notice.
              </p>

              <div className="terms-alert-box terms-alert-blue mt-8">
               
                <p className="terms-alert-text text-center w-full font-bold">
                  BY USING THIS WEBSITE OR ORDERING PRODUCTS FROM THIS WEBSITE, YOU AGREE TO BE BOUND BY THESE TERMS AND CONDITIONS.
                </p>
              </div>
            </section>

          </main>
        </div>
      </div>
    </>
  );
};

export default TermsAndConditions;
