import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoMdClose } from "react-icons/io";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { api, setAccessToken } from "../../axiosConfig";
import { setIsNavbarModalOpen } from "../../features/BasicSlice";
import LoginImage from "../../assets/banner.jpeg";
import "../../pages/signin.css";

const initialState = {
  email: "",
  password: "",
  remember: false,
};

const LoginModel = () => {
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const { isNavbarModalOpen } = useSelector((store) => store.basic);
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isOpen = isNavbarModalOpen === "login";

  const validate = () => {
    const nextErrors = {};
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Invalid email address";
    }
    if (!form.password || form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters long";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field) => (event) => {
    const value = field === "remember" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await api.post("/login", form);
      if (response.data?.status === "success") {
        toast.success(response.data.message || "Successfully signed in", {
          position: "top-right",
          autoClose: 2200,
          hideProgressBar: false,
          pauseOnHover: true,
        });
        localStorage.setItem("access_token", response.data.data.token);
        setAccessToken(response.data.data.token);
        dispatch(setIsNavbarModalOpen(false));
        setForm(initialState);
        setErrors({});
      }
    } catch (error) {
      const serverData = error.response?.data;
      if (serverData?.errors && Array.isArray(serverData.errors)) {
        toast.error(serverData.errors[0]);
      } else if (serverData?.error) {
        toast.error(serverData.error);
      } else if (serverData?.message) {
        toast.error(serverData.message);
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
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
          type="button"
          className="signin-modal-close"
          onClick={() => dispatch(setIsNavbarModalOpen(false))}
          aria-label="Close login modal"
        >
          <IoMdClose size={24} />
        </button>

        <div className="signin-modal-copy">
          <h2>Login</h2>
          <p>Login to access your travelwise account</p>

          <form onSubmit={onSubmit} className="signin-form">
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange("email")}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <span className="signin-error">{errors.email}</span>}

            <div className="signin-password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={handleChange("password")}
                aria-invalid={Boolean(errors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            {errors.password && <span className="signin-error">{errors.password}</span>}

            <div className="signin-row">
              <label className="signin-remember">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={handleChange("remember")}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="signin-forgot"
                onClick={() => dispatch(setIsNavbarModalOpen("forgotpassword"))}
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="signin-submit-btn" disabled={loading}>
              {loading ? "Signing..." : "LOGIN"}
            </button>
          </form>

          <p className="signin-footer-text">
            Don't have an account?{" "}
            <button type="button" onClick={() => dispatch(setIsNavbarModalOpen("signup"))}>
              Sign up
            </button>
          </p>
        </div>

        <div className="signin-modal-visual">
          <img src={LoginImage} alt="Interior showcase" />
        </div>
      </div>
    </div>
  );
};

export default LoginModel;
