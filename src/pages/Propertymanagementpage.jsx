import { useCallback } from "react";
import { FaSearch, FaWrench, FaUsers, FaClipboardCheck, FaMoneyBillWave, FaHeadset, FaHome, FaKey } from "react-icons/fa";
import Seo from "../components/common/Seo";
import "./PropertyManagement.css";

const services = [
  { icon: <FaSearch />, title: "Property Inspection" },
  { icon: <FaWrench />, title: "Property Maintenance" },
  { icon: <FaUsers />, title: "Finding Tenants" },
  { icon: <FaClipboardCheck />, title: "Tenant Verification" },
  { icon: <FaHeadset />, title: "Tenant Support" },
  { icon: <FaHome />, title: "Exit Inspection" },
  { icon: <FaKey />, title: "Exit Management" },
];

const PropertyManagementPage = () => {
  const handleSubmit = useCallback((event) => {
    event.preventDefault();

    const form = new FormData(event.target);
    const name = form.get("name") || "";
    const email = form.get("email") || "";
    const phone = form.get("phone") || "";
    const location = form.get("location") || "";
    const message = form.get("message") || "";

    const whatsappMessage = `New NRI Property Management Enquiry:%0A%0AName: ${name}%0AEmail: ${email}%0APhone: ${phone}%0ALocation: ${location}%0AMessage: ${message}`;
    const whatsappNumber = "918925997080";
    window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, "_blank");
  }, []);

  return (
    <>
      <Seo />
      <main className="property-management-page">
        <section className="pm-hero">
          <div className="pm-left">
            <div className="pm-left-content">
              <span className="pm-badge">NRI Property Management Company</span>
              {/* <h1>Book Your FREE Consultation NOW!</h1> */}
              <p>A peek at our NRI property management services</p>
              <div className="pm-services-grid">
                {services.map((service) => (
                  <div key={service.title} className="pm-service-card">
                    <div className="pm-service-icon">{service.icon}</div>
                    <span>{service.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pm-right">
            <div className="pm-form-card">
              <div className="pm-form-header">
                <h2>Book Your FREE Consultation NOW!</h2>
                <p>Give us a few basic details and a property manager in India will contact you ASAP!</p>
              </div>
              <form className="pm-form" onSubmit={handleSubmit}>
                <div className="pm-form-row">
                  <input type="text" name="name" placeholder="Name*" required />
                  <input type="email" name="email" placeholder="Email*" required />
                </div>
                <div className="pm-form-row">
                  <input type="tel" name="phone" placeholder="Number*" required />
                  <input type="text" name="location" placeholder="Property Location*" required />
                </div>
                <textarea name="message" rows="5" placeholder="Message*" required />
                <button type="submit" className="pm-submit-button">Send</button>
              </form>
            </div>
          </div>
        </section>
        <section className="pm-benefits">
          <div className="pm-benefits-content">
            <h2>The Benefits of Professional Property Management</h2>
            <p>Owning a rental property can be a rewarding investment, but managing it effectively requires time, expertise, and attention to detail. Property management can be a complex and time-consuming process, involving everything from tenant screening to maintenance and accounting. By hiring a professional property management company, such as Homewala.com Property Management Services , property owners can simplify their responsibilities and maximize the value of their investment.</p>
            <h3>Key Services Provided by Property Management Companies</h3>
            <ol>
              <li><strong>Tenant Screening</strong> A crucial aspect of successful property management is ensuring that tenants are financially stable and responsible. Property management companies screen potential tenants thoroughly, checking credit history, employment status, and rental references to minimize the risk of late payments or property damage.</li>
              <li><strong>Property Maintenance</strong> Regular maintenance and prompt repairs are vital for preserving property value and tenant satisfaction. Property management companies coordinate all repairs and maintenance, handling everything from routine inspections to emergency fixes.</li>
              <li><strong>Tenant Relations</strong> Maintaining a positive relationship with tenants is key to reducing turnover and resolving issues quickly. Property managers handle tenant complaints and disputes professionally, ensuring a harmonious living environment.</li>
              <li><strong>Accounting</strong> Accurate financial tracking is essential for any investment. Property management companies keep detailed records of all income and expenses, providing property owners with clear, organized accounting statements.</li>
              <li><strong>Tax Assistance</strong> Property managers can assist in following up and paying property and other related taxes, ensuring compliance and avoiding costly penalties.</li>
            </ol>
            <h3>Why Hire a Property Management Company?</h3>
            <ul>
              <li><strong>Peace of Mind:</strong> Property management companies handle all day-to-day tasks, giving property owners peace of mind knowing their investment is well cared for.</li>
              <li><strong>Increased Income:</strong> By finding qualified tenants, collecting rent promptly, and maintaining the property, property managers can help maximize rental income.</li>
              <li><strong>Increased Property Value:</strong> Regular upkeep and timely repairs help maintain and even increase the value of your rental property over time.</li>
            </ul>
            <h3>Choosing the Right Property Management Company</h3>
            <p>If you are considering hiring Homewala.com Property Management Services or any other property management company, it’s important to do your research. Compare different companies, ask for references, and review the terms of the management agreement carefully before signing. This ensures you find a partner that aligns with your needs and expectations.</p>
            <p><strong>In summary:</strong> Hiring a property management company can free up your time, reduce stress, and help you achieve better returns on your rental property. With the right partner, you can enjoy the benefits of property ownership without the day-to-day headaches.</p>
          </div>
        </section>
      </main>
    </>
  );
};

export default PropertyManagementPage;