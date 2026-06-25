import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";
import PropertiesPage from "../pages/PropertiesPage";
import InteriorPage from "../pages/InteriorPage";
import BlogsPage from "../pages/BlogsPage";
import AboutUsPage from "../pages/AboutUsPage";
import ContactUsPage from "../pages/ContactUsPage";
import RefundPolicy from "../pages/RefundPolicy";
import TermsAndConditions from "../pages/TermsAndConditions";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import PostPropertyPage from "../pages/PostPropertyPage";
import SignInPage from "../pages/SignInPage";
import ProfilePage from "../pages/ProfilePage";
import WishlistPage from "../pages/WishlistPage";
import ChangePassword from "../pages/ChangePassword";
import DetailsPage from "../pages/DetailsPage";
import PropertyManagementPage from "../pages/PropertyManagementPage";
import Navbar from "../components/common/navbar";
import Footer from "../components/common/Footer";
import ScrollToTop from "../components/common/ScrollToTop";
import LoginModel from "../components/common/LoginModel";
import SignupModel from "../components/common/SignupModel";
import ForgotPasswordModel from "../components/common/ForgotPasswordModel";
import CallFloatingButton from "../components/common/CallFloatingButton";
import WhatsAppFloatingButton from "../components/common/WhatsAppFloatingButton";
import BackToTopButton from "../components/common/BackToTopButton";
import MapView from "../components/MapView";
import VerifyCodeModel from "../components/common/VerifyCodeModel";
import SetPasswordModel from "../components/common/SetPasswordModel";
import SingleBlog from "../pages/SingleBlog";
import Aisearch from "../components/Aisearch";

const sharedPropertyPaths = [
  "/properties",
  "/buy-property",
  "/new-projects",
  "/resale-homes",
  "/best-deals",
  "/best-location-picks",
  "/luxury-homes",
  "/luxury-homes-in-chennai",
  "/apartments",
  "/apartments-in-chennai",
  "/villas",
  "/villas-in-chennai",
  "/plots",
  "/plots-in-chennai",
  "/individual-house-in-chennai",
  "/budget-15-35-lakhs",
  "/budget-35-50-lakhs",
  "/budget-50-75-lakhs",
  "/budget-75-lakhs-plus",
  "/for-nri",
  "/nri-investment",
  "/nri-home-search",
  "/nri-legal-support",
  "/builder-deals",
  "/builder-offering",
  "/brochure",
  "/dashboard",
  "/builder-plans",
];

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("access_token");
  if (!token) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <LoginModel />
      <SignupModel />
      <VerifyCodeModel />
      <SetPasswordModel />
      <ForgotPasswordModel />
      <CallFloatingButton />
      <WhatsAppFloatingButton />
      <BackToTopButton />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interior" element={<InteriorPage />} />
        <Route path="/blogs" element={<BlogsPage />} />
        <Route path="/blog/:slug" element={<SingleBlog />} />
        <Route path="/aisearch" element={<Aisearch />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/contact-us" element={<ContactUsPage />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/post-property" element={<PostPropertyPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/wish-list" element={<WishlistPage />} />
        <Route
          path="/change-password"
          element={<RequireAuth><ChangePassword /></RequireAuth>}
        />
        <Route path="/details/:id/:title" element={<DetailsPage />} />
        <Route path="/property-management" element={<PropertyManagementPage />} />
        <Route path="/map" element={<MapView />} />
        {sharedPropertyPaths.map((path) => (
          <Route
            key={path}
            path={path}
            element={<PropertiesPage />}
          />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default AppRoutes;