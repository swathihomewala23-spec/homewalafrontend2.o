import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Seo from "../components/common/Seo";
import { api } from "../axiosConfig";
import propertyImage from "../assets/postpropertypage.jpg";
import "./postproperty.css";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  message: "",
  terms: false,
};

const PostPropertyPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (form.firstName.trim().length < 2) nextErrors.firstName = "First name must be at least 2 characters";
    if (form.lastName.trim().length < 2) nextErrors.lastName = "Last name must be at least 2 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Invalid email address";
    if (!/^[0-9]{10}$/.test(form.phoneNumber)) nextErrors.phoneNumber = "Phone number must be exactly 10 digits";
    if (form.message.trim().length < 10) nextErrors.message = "Message must be at least 10 characters";
    if (!form.terms) nextErrors.terms = "You must accept the terms and privacy policy";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field) => (event) => {
    const value = field === "terms" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const payload = {
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      phone: form.phoneNumber,
      details: form.message,
    };

    setSubmitting(true);
    try {
      const response = await api.post("/register-vendor", payload);
      // Trigger the beautiful inline success UI
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting form:", error.response?.data || error.message);
      if (error.response?.data?.errors?.email) {
        toast.error(error.response.data.errors.email[0]);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Seo />
      <div className="post-prop-wrapper">
        {/* Left Side: Beautiful Image & Text overlay (hidden on mobile) */}
        <div className="post-prop-left">
          <img src={propertyImage} alt="Modern building" className="post-prop-image" />
          <div className="post-prop-overlay">
            <h1>Elevate Your Sales</h1>
            <p>Join Chennai's fastest-growing builder network. Reach more buyers, get verified leads, and sell faster with our premium partner tools.</p>
          </div>
        </div>

        {/* Right Side: The Form */}
        <div className="post-prop-right">
          <div className="post-prop-form-container">
            {isSuccess ? (
              <div className="post-prop-success">
                <div className="success-icon-wrapper">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="success-title">Application Submitted!</h2>
                <p className="success-desc">
                  Thank you for applying to be a partner. Our team will review your details and get back to you shortly.
                </p>
                <button className="success-btn" onClick={() => navigate("/")}>
                  Back to Home
                </button>
              </div>
            ) : (
              <>
                <h2 className="post-prop-title">Become a Partner</h2>
                <p className="post-prop-subtitle">Fill in your details to join our builder group.</p>
                
                <form onSubmit={onSubmit}>
                  <div className="post-prop-input-row">
                    <div className="post-prop-input-group">
                      <input 
                        type="text" 
                        placeholder="First Name" 
                        className={`post-prop-input ${errors.firstName ? 'error' : ''}`}
                        value={form.firstName}
                        onChange={handleChange("firstName")}
                      />
                      {errors.firstName && <span className="post-prop-error">{errors.firstName}</span>}
                    </div>

                    <div className="post-prop-input-group">
                      <input 
                        type="text" 
                        placeholder="Last Name" 
                        className={`post-prop-input ${errors.lastName ? 'error' : ''}`}
                        value={form.lastName}
                        onChange={handleChange("lastName")}
                      />
                      {errors.lastName && <span className="post-prop-error">{errors.lastName}</span>}
                    </div>
                  </div>

                  <div className="post-prop-input-group">
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      className={`post-prop-input ${errors.email ? 'error' : ''}`}
                      value={form.email}
                      onChange={handleChange("email")}
                    />
                    {errors.email && <span className="post-prop-error">{errors.email}</span>}
                  </div>

                  <div className="post-prop-input-group">
                    <input 
                      type="tel" 
                      placeholder="Phone Number (10 digits)" 
                      className={`post-prop-input ${errors.phoneNumber ? 'error' : ''}`}
                      value={form.phoneNumber}
                      onChange={handleChange("phoneNumber")}
                    />
                    {errors.phoneNumber && <span className="post-prop-error">{errors.phoneNumber}</span>}
                  </div>

                  <div className="post-prop-input-group">
                    <textarea 
                      placeholder="Why do you want to become a builder partner? Tell us briefly..."
                      className={`post-prop-input post-prop-textarea ${errors.message ? 'error' : ''}`}
                      value={form.message}
                      onChange={handleChange("message")}
                    ></textarea>
                    {errors.message && <span className="post-prop-error">{errors.message}</span>}
                  </div>

                  <div className="post-prop-checkbox-wrapper">
                    <input 
                      type="checkbox" 
                      id="terms"
                      className="post-prop-checkbox"
                      checked={form.terms}
                      onChange={handleChange("terms")}
                    />
                    <div className="post-prop-checkbox-label">
                      <label htmlFor="terms">
                        I agree to all the <Link to="#">Terms and Privacy Policies</Link>
                      </label>
                      {errors.terms && <span className="post-prop-error">{errors.terms}</span>}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="post-prop-submit"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PostPropertyPage;
