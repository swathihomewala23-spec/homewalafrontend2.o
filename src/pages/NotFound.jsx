import { Link } from "react-router-dom";
import Seo from "../components/common/Seo";
import SiteLayout from "../components/common/SiteLayout";

const NotFound = () => {
  return (
    <>
      <Seo />
      <SiteLayout
        eyebrow="404"
        title="This page does not exist"
        description="The requested route could not be found, but the rest of the site is available below."
      >
        <section className="feature-strip">
          <article className="feature-card wide-card">
            <h2>Try one of the main sections</h2>
            <div className="inline-links">
              <Link to="/">Home</Link>
              <Link to="/buy-property">Buy Property</Link>
              <Link to="/blogs">Blogs</Link>
            </div>
          </article>
        </section>
      </SiteLayout>
    </>
  );
};

export default NotFound;

