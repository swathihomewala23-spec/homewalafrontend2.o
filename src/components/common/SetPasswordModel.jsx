import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoMdClose } from "react-icons/io";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { TextField, Button, IconButton, InputAdornment } from "@mui/material";
import { toast } from "react-toastify";
import { api } from "../../axiosConfig";
import { setIsNavbarModalOpen } from "../../features/BasicSlice";
import PasswordImage from "../../assets/banner.jpeg";
import "../../pages/signin.css";

const initialState = {
  email: "",
  password: "",
  confirm_password: "",
};

const SetPasswordModel = () => {
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const { isNavbarModalOpen, user } = useSelector((store) => store.basic);
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isOpen = isNavbarModalOpen === "setpassword";

  useEffect(() => {
    if (isOpen) {
      setForm({
        email: user?.email || "",
        password: "",
        confirm_password: "",
      });
      setErrors({});
    }
  }, [isOpen, user?.email]);

  const validate = () => {
    const nextErrors = {};
    const accountEmail = form.email || user?.email || "";

    if (!accountEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountEmail)) {
      nextErrors.email = "Please enter a valid email address";
    }
    if (!form.password || form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters long";
    }
    if (form.confirm_password !== form.password) {
      nextErrors.confirm_password = "Passwords do not match";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const closeModal = () => dispatch(setIsNavbarModalOpen(false));

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        email: form.email || user?.email,
        password: form.password,
        confirm_password: form.confirm_password,
      };
      const response = await api.post("/reset-password", payload);

      if (response.data?.status === "success" || response.data?.success === true) {
        toast.success(response.data.message || "Password saved successfully");
        dispatch(setIsNavbarModalOpen("login"));
      } else {
        toast.error(response.data?.message || "Failed to set password. Please try again.");
      }
    } catch (error) {
      const serverData = error.response?.data;
      if (serverData?.errors && Array.isArray(serverData.errors)) {
        toast.error(serverData.errors[0]);
      } else {
        toast.error(serverData?.message || "Failed to set password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        dispatch(setIsNavbarModalOpen(false));
      }
    }; 

    const handleKeyDown = (event) => {
      if (event.key === "Escape") dispatch(setIsNavbarModalOpen(false));
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [dispatch, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="signin-modal-overlay">
      <div className="signin-modal-backdrop" onClick={closeModal} />

      <div ref={modalRef} className="signin-modal-card">
        <button
          type="button"
          className="signin-modal-close"
          onClick={closeModal}
          aria-label="Close set password modal"
        >
          <IoMdClose size={24} />
        </button>

        <div className="signin-modal-copy">
          <h2>Set password</h2>
          <p>Choose a password and confirm it to complete your account setup.</p>

          <form onSubmit={onSubmit} className="signin-form">
            {errors.email && <p className="signin-error">{errors.email}</p>}

            <TextField
              label="Set Password"
              variant="outlined"
              fullWidth
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange("password")}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirm Password"
              variant="outlined"
              fullWidth
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirm_password}
              onChange={handleChange("confirm_password")}
              error={!!errors.confirm_password}
              helperText={errors.confirm_password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword((prev) => !prev)} edge="end">
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
              {loading ? "Saving password..." : "Submit"}
            </Button>
          </form>
        </div>

        <div className="signin-modal-visual">
          <img src={PasswordImage} alt="Set Password" />
        </div>
      </div>
    </div>
  );
};

export default SetPasswordModel;
