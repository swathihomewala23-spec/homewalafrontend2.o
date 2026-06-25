import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoMdClose } from "react-icons/io";
import { FaChevronLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { TextField, Button, InputAdornment, IconButton } from "@mui/material";
import { toast } from "react-toastify";
import { api } from "../../axiosConfig";
import { setIsNavbarModalOpen, setUser } from "../../features/BasicSlice";
import VerifyCodeImage from "../../assets/banner.jpeg";
import { extractVerificationCode, getFirstServerError } from "./authFlowHelpers";
import "../../pages/signin.css";


const VerifyCodeModel = () => {
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const { isNavbarModalOpen, user } = useSelector((store) => store.basic);
  const [loading, setLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [otpCode, setOtpCode] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const shownOtpRef = useRef("");

  const isOpen = isNavbarModalOpen === "verifycode";

  useEffect(() => {
    if (user?.email) setEmail(user.email);

    // Always update the otp input from latest backend value when modal opens or otp changes
    if (isOpen) {
      const nextOtp = user?.otp_test ? String(user.otp_test) : "";
      setOtpCode(nextOtp);

      // If backend provided an otp_test, show it as a success toast when modal opens
      if (nextOtp && shownOtpRef.current !== nextOtp) {
        shownOtpRef.current = nextOtp;
        toast.success(`Verification code: ${nextOtp}`, { autoClose: 5000 });
      }
    }
  }, [isOpen, user?.email, user?.otp_test]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event) => {
      // Prefer composedPath for shadow/portal-safe hit testing
      const path = typeof event.composedPath === "function" ? event.composedPath() : event.path || [];

      if (!modalRef.current) return;

      // if any element in the event path is the modal, treat as inside click
      if (path && path.length) {
        if (path.includes(modalRef.current)) return;
      }

      // fallback to contains
      if (modalRef.current.contains(event.target)) return;

      dispatch(setIsNavbarModalOpen(false));
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") dispatch(setIsNavbarModalOpen(false));
    };

    // Use capturing click handler so we can stop propagation for inside clicks
    const capturingClick = (event) => {
      // If click is inside modal, stop propagation so other global handlers cannot act on it
      try {
        const path = typeof event.composedPath === "function" ? event.composedPath() : event.path || [];
        if (modalRef.current) {
          if ((path && path.length && path.includes(modalRef.current)) || modalRef.current.contains(event.target)) {
            event.stopPropagation();
            return;
          }
        }
      } catch {
        // ignore
      }

      handleOutsideClick(event);
    };

    document.addEventListener("click", capturingClick, true);

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("click", capturingClick, true);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, dispatch]);

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
        shownOtpRef.current = nextOtp;
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

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!otpCode) {
      toast.error("Please enter the verification code");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/verify-otp", { email, otp_code: otpCode });
      if (response.data?.status === "success") {
        toast.success(response.data.message || "Verification successful!");
        dispatch(setUser({ ...user, email, otp_test: "" }));
        // Auto-navigate to set password modal
        dispatch(setIsNavbarModalOpen("setpassword"));
      }
    } catch (error) {
      toast.error(getFirstServerError(error.response?.data, "Invalid verification code"));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;


  return (
    <div className="signin-modal-overlay">
      <div className="signin-modal-backdrop" onClick={() => dispatch(setIsNavbarModalOpen(false))} />
      <div ref={modalRef} className="signin-modal-card signin-modal-card--verify">
        <div className="signin-modal-copy signin-modal-copy--verify">
          <button
            type="button"
            className="signin-modal-back signin-modal-back--verify"
            onClick={() => dispatch(setIsNavbarModalOpen("login"))}
          >
            <FaChevronLeft size={14} />
            <span>Back to login</span>
          </button>

          <h2 className="signin-modal-title signin-modal-title--verify">Verify code</h2>
          <p className="signin-modal-subtitle signin-modal-subtitle--verify">
            An authentication code has been sent to your email.
          </p>

          {user?.otp_test && (
            <div className="signin-otp-preview" aria-live="polite">
              <span>Your verification code</span>
              <strong>{user.otp_test}</strong>
            </div>
          )}

          <form className="signin-form signin-form--verify" onSubmit={onSubmit}>
            <TextField
              label="Enter Code"
              variant="outlined"
              fullWidth
              value={otpCode}
              onChange={(event) => setOtpCode(event.target.value)}
              type={showCode ? "text" : "password"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCode((prev) => !prev)} edge="end">
                      {showCode ? <FaEyeSlash /> : <FaEye />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <div className="signin-resend-row signin-resend-row--verify">
              <span>Didn't receive a code?</span>
              {resendDisabled ? (
                <span className="signin-resend-muted">Resend in {countdown}s</span>
              ) : (
                <button type="button" className="signin-resend-link" onClick={resendOTP}>
                  Resend
                </button>
              )}
            </div>

            <Button type="submit" variant="contained" fullWidth disabled={loading}>
              {loading ? "Verifying..." : "VERIFY"}
            </Button>
          </form>
        </div>

        <div className="signin-modal-visual signin-modal-visual--verify">
          <img src={VerifyCodeImage} alt="Verify Code" className="signin-modal-image" />
        </div>

        <button
          type="button"
          className="signin-modal-close"
          onClick={closeModal}
          aria-label="Close"
        >
          <IoMdClose />
        </button>
      </div>
    </div>
  );
};

export default VerifyCodeModel;
