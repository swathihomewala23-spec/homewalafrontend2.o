import { useCallback } from "react";
import Seo from "../components/common/Seo";
import "./contact.css";

const ContactUsPage = () => {
  const handleSubmit = useCallback((event) => {
  event.preventDefault();

  const form = new FormData(event.target);

  const firstName = form.get("firstName") || "";
  const lastName = form.get("lastName") || "";
  const location = form.get("location") || "";
  const phone = form.get("phone") || "";
  const subject = form.get("subject") || "";
  const message = form.get("message") || "";

  const fullName = `${firstName} ${lastName}`.trim();

  const whatsappMessage = `
New Contact Enquiry:

Name: ${fullName}
Phone: ${phone}
Location: ${location}
Subject: ${subject}

Message:
${message}
  `.trim();

  const whatsappNumber = "918925997080"; // 👈 your number here

  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  window.open(url, "_blank");
}, []); 

  return (
    <>
      <Seo />
      <main className="contact-page">
        <section className="contact-hero">
          <div className="contact-hero-inner">
            <h1 style={{ fontSize: '72px', marginBottom: '10px' }}>Contact Us</h1>
            <p className="contact-hero-text" style={{ fontSize: '24px', color: '#cbd5e1' }}>Get the Call In 10Mins</p>
          </div>
        </section>

        <section className="contact-grid">
          <div className="contact-card contact-info-card">
            <h2>Contact Information</h2>
            <div className="contact-detail" style={{ marginTop: '2rem' }}>
              <span className="contact-detail-icon">✉️</span>
              <div>
                <p>Homewala@.com</p>
              </div>
            </div>
            <div className="contact-detail" style={{ marginTop: '2rem' }}>
              <span className="contact-detail-icon">📍</span>
              <div>
                <p>GTK Foundations 1rd Floor, Homewala.com,<br/>Tambaram,Chennai, Tamil Nadu,India.</p>
              </div>
            </div>
            <div className="contact-social-icons" style={{ display: 'flex', gap: '15px', marginTop: 'auto', paddingTop: '6rem' }}>
              <div style={{ width: '30px', height: '30px', background: '#1DA1F2', borderRadius: '50%' }}></div>
              <div style={{ width: '30px', height: '30px', background: '#E1306C', borderRadius: '50%' }}></div>
              <div style={{ width: '30px', height: '30px', background: '#0077B5', borderRadius: '50%' }}></div>
            </div>
          </div>

          <form className="contact-card contact-form-card" onSubmit={handleSubmit}>
            <div className="contact-form-row">
              <label>
                First Name
                <input type="text" name="firstName" placeholder="First Name" />
              </label>
              <label>
                Last Name
                <input type="text" name="lastName" placeholder="Last Name" />
              </label>
            </div>

            <div className="contact-form-row">
              <label>
                Location
                <input type="text" name="location" placeholder="Location" />
              </label>
              <label>
                Phone Number
                <input type="tel" name="phone" placeholder="+91" />
              </label>
            </div>

            <fieldset className="contact-fieldset">
              <legend style={{ marginBottom: '10px' }}>Select Subject?</legend>
              <label>
                <input type="radio" name="subject" value="buy" defaultChecked /> Buy
              </label>
              <label>
                <input type="radio" name="subject" value="plot" /> Plot/ Land
              </label>
              <label>
                <input type="radio" name="subject" value="interior" /> Interior Design
              </label>
              <label>
                <input type="radio" name="subject" value="nri" /> NRI Investment
              </label>
            </fieldset>

            <label className="contact-message-label">
              Message
              <textarea name="message" rows="1" placeholder="Write your message.." style={{ resize: 'none' }} />
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="submit" className="contact-submit" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ marginBottom: '10px' }}>Send Message</span>
                <span style={{ fontSize: '32px' }}>✈️</span>
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
};

export default ContactUsPage;
