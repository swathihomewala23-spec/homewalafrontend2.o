import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";
import { TextField, Button, Checkbox, FormControlLabel } from "@mui/material";
import SignupImage from "../../assets/banner.jpeg";
import { api } from "../../axiosConfig";
import { setIsNavbarModalOpen, setUser } from "../../features/BasicSlice";
import { extractVerificationCode, getFirstServerError } from "./authFlowHelpers";

const initialState = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  terms: false,
};

const SignupModel = () => {
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const { isNavbarModalOpen, user } = useSelector((store) => store.basic);
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  const isOpen = isNavbarModalOpen === "signup";

  const validate = () => {
    const nextErrors = {};
    setFormMessage("");
    if (form.first_name.trim().length < 2) nextErrors.first_name = "First name must be at least 2 characters";
    if (form.last_name.trim().length < 2) nextErrors.last_name = "Last name must be at least 2 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Invalid email address";
    if (!/^[0-9]{10}$/.test(form.phone)) nextErrors.phone = "Phone number must be exactly 10 digits";
    if (!form.terms) nextErrors.terms = "You must accept terms and privacy policies";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field) => (event) => {
    const value = field === "terms" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await api.post("/register-user", form);
      const otpTest = extractVerificationCode(response.data);
      const message = response.data?.message || "";

      if (message.toLowerCase().includes("already verified")) {
        setFormMessage("This email is already verified. Please login instead.");
        return;
      }

      if (response.data?.status === "success") {
        dispatch(setUser({ ...user, email: form.email, otp_test: otpTest }));
        dispatch(setIsNavbarModalOpen("verifycode"));
        if (!otpTest) toast.success(message || "Registration successful");
        setForm(initialState);
      }
    } catch (error) {
      const serverData = error.response?.data;
      const message = (serverData?.message || serverData?.error || "").toLowerCase();

      if (message.includes("already verified")) {
        setFormMessage("This email is already verified. Please login instead.");
        return;
      }

      toast.error(getFirstServerError(serverData, "An error occurred during registration. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        dispatch(setIsNavbarModalOpen(false));
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [dispatch, isOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        dispatch(setIsNavbarModalOpen(false));
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="signin-modal-overlay">
      <div className="signin-modal-backdrop" onClick={() => dispatch(setIsNavbarModalOpen(false))} />

      <div ref={modalRef} className="signin-modal-card">
        <button
          className="signin-modal-close"
          type="button"
          onClick={() => dispatch(setIsNavbarModalOpen(false))}
          aria-label="Close signup modal"
        >
          <IoMdClose />
        </button>

        <div className="signin-modal-copy">
          <h2>Sign up</h2>
          <p>Let's get you all set up so you can access your personal account.</p>

          <form onSubmit={onSubmit} className="signin-form">
            <div className="signin-grid-two">
              <TextField
                label="First Name"
                variant="outlined"
                fullWidth
                value={form.first_name}
                onChange={handleChange("first_name")}
                error={!!errors.first_name}
                helperText={errors.first_name}
              />
              <TextField
                label="Last Name"
                variant="outlined"
                fullWidth
                value={form.last_name}
                onChange={handleChange("last_name")}
                error={!!errors.last_name}
                helperText={errors.last_name}
              />
            </div>

            <div className="signin-grid-two">
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                value={form.email}
                onChange={handleChange("email")}
                error={!!errors.email}
                helperText={errors.email}
              />
              <TextField
                label="Phone Number"
                variant="outlined"
                fullWidth
                value={form.phone}
                onChange={handleChange("phone")}
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </div>

            <FormControlLabel
              className="signin-terms"
              control={<Checkbox checked={form.terms} onChange={handleChange("terms")} />}
              label={
                <span>
                  I agree to all the <button type="button">Terms</button> and{" "}
                  <button type="button">Privacy Policies</button>
                </span>
              }
            />
            {errors.terms && <p className="signin-error">{errors.terms}</p>}
            {formMessage && <p className="signin-error">{formMessage}</p>}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              className="signin-submit-btn"
            >
              {loading ? "Creating Account..." : "Create account"}
            </Button>
          </form>

          <p className="signin-footer-text">
            Already have an account?{" "}
            <button type="button" onClick={() => dispatch(setIsNavbarModalOpen("login"))}>
              Login
            </button>
          </p>
        </div>

        <div className="signin-modal-visual">
          <img src={SignupImage} alt="Signup" />
        </div>
      </div>
    </div>
  );
};

export default SignupModel;
