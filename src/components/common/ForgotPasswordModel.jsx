import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoMdClose } from "react-icons/io";
import { FaChevronLeft } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { TextField, Button, IconButton, InputAdornment } from "@mui/material";
import { toast } from "react-toastify";
import { api } from "../../axiosConfig";
import { setIsNavbarModalOpen, setUser } from "../../features/BasicSlice";
import VerifyCodeImage from "../../assets/banner.jpeg";
import { extractVerificationCode, getFirstServerError } from "./authFlowHelpers";
import "../../pages/signin.css";

const ForgotPasswordModel = () => {
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const { isNavbarModalOpen, user } = useSelector((store) => store.basic);
  const [loading, setLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [email, setEmail] = useState(user?.email || "");
  const [otpCode, setOtpCode] = useState("");

  const isOpen = isNavbarModalOpen === "forgotpassword" || isNavbarModalOpen === "forgotpasswordverify";

  useEffect(() => {
    if (isNavbarModalOpen === "forgotpassword") {
      setEmail(user?.email || "");
      setOtpCode("");
    }
    if (isNavbarModalOpen === "forgotpasswordverify" && user?.email) {
      setEmail(user.email);
      setOtpCode(user?.otp_test ? String(user.otp_test) : "");
    }
  }, [isNavbarModalOpen, user?.email, user?.otp_test]);

  const closeModal = () => dispatch(setIsNavbarModalOpen(false));

  const startResendTimer = () => {
    setResendDisabled(true);
    setCountdown(30);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resendOTP = async () => {
    if (resendDisabled || !email) return;

    try {
      const response = await api.post("/resend-otp", { email });
      const nextOtp = extractVerificationCode(response.data);
      if (nextOtp) {
        setOtpCode(nextOtp);
        dispatch(setUser({ ...user, email, otp_test: nextOtp }));
        toast.success(`Verification code: ${nextOtp}`, { autoClose: 5000 });
      } else {
        toast.success(response.data?.message || "Verification code sent");
      }
      startResendTimer();
    } catch (error) {
      toast.error(getFirstServerError(error.response?.data, "Failed to resend code. Please try again."));
    }
  };

  const handleSendCode = async (event) => {
    event.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/forgot-password", { email });
      if (response.data?.status === "success") {
        const nextOtp = extractVerificationCode(response.data);
        dispatch(setUser({ ...user, email, otp_test: nextOtp }));
        setOtpCode(nextOtp);
        if (nextOtp) {
          toast.success(`Verification code: ${nextOtp}`, { autoClose: 5000 });
        } else {
          toast.success(response.data.message || "Verification code sent");
        }
        dispatch(setIsNavbarModalOpen("forgotpasswordverify"));
        startResendTimer();
      }
    } catch (error) {
      toast.error(getFirstServerError(error.response?.data, "Could not send verification code"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();
    if (!otpCode) {
      toast.error("Please enter the verification code");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/verify-otp-password-reset", { email, otp_code: otpCode, code: otpCode });
      if (response.data?.status === "success" || response.data?.success === true) {
        toast.success(response.data.message || "Verification successful!");
        dispatch(setUser({ ...user, email, otp_test: "" }));
        dispatch(setIsNavbarModalOpen("setpassword"));
      }
    } catch (error) {
      toast.error(getFirstServerError(error.response?.data, "Invalid verification code"));
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

    if (isOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [dispatch, isOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") dispatch(setIsNavbarModalOpen(false));
    };

    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isVerifyStep = isNavbarModalOpen === "forgotpasswordverify";

  return (
    <div className="signin-modal-overlay">
      <div className="signin-modal-backdrop" onClick={closeModal} />

      <div ref={modalRef} className="signin-modal-card">
        <button type="button" className="signin-modal-close" onClick={closeModal} aria-label="Close verify modal">
          <IoMdClose size={24} />
        </button>

        <div className="signin-modal-copy">
          <button
            type="button"
            className="text-sm text-gray-500 mb-4 cursor-pointer flex gap-2 bg-transparent border-0 p-0"
            onClick={() => dispatch(setIsNavbarModalOpen("login"))}
          >
            <FaChevronLeft size={15} />
            Back to login
          </button>

          <h2>{isVerifyStep ? "Verify code" : "Forgot Password"}</h2>
          <p>
            {isVerifyStep
              ? "An authentication code has been sent to your email."
              : "Enter your email address and we will send a verification code."}
          </p>

          {isVerifyStep ? (
            <form onSubmit={handleVerifyCode} className="signin-form">
              <TextField
                label="Enter Code"
                variant="outlined"
                fullWidth
                type={showCode ? "text" : "password"}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowCode((current) => !current)}>
                        {showCode ? <FaEyeSlash /> : <FaEye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <div className="text-left text-sm">
                <span>Didn't receive a code? </span>
                {resendDisabled ? (
                  <span className="text-gray-400">Resend in {countdown}s</span>
                ) : (
                  <span onClick={resendOTP} className="text-red-500 cursor-pointer">
                    Resend
                  </span>
                )}
              </div>

              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                {loading ? "Verifying..." : "Verify"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSendCode} className="signin-form">
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                {loading ? "Sending..." : "Send Code"}
              </Button>
            </form>
          )}
        </div>

        <div className="signin-modal-visual">
          <img src={VerifyCodeImage} alt="Verify Code" />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModel;
