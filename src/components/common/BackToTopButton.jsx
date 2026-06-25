import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa6";
import "./BackToTopButton.css";

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(window.scrollY > 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="backtop-float"
      aria-label="Back to top"
      type="button"
    >
      <FaArrowUp className="backtop-float__icon" />
    </button>
  );
};

export default BackToTopButton;
