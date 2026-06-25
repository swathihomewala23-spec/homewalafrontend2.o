import { Link } from "react-router-dom";

const SiteLayout = ({ eyebrow, title, description, highlights = [], children }) => {
  return (
    <div className="site-shell">
      <main className="page-main">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="hero-eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>

            <div className="hero-actions">
              <Link className="primary-btn" to="/post-property">
                Post Property
              </Link>
              <Link className="secondary-btn" to="/buy-property">
                Explore Listings
              </Link>
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-stat">
              <strong>100%</strong>
              <span>Mobile-first experience</span>
            </div>
            <div className="hero-stat">
              <strong>SEO Ready</strong>
              <span>Each route has dedicated metadata</span>
            </div>
            <div className="hero-stat">
              <strong>Fast Routes</strong>
              <span>Separate pages for each navbar destination</span>
            </div>
          </div>
        </section>

        {highlights.length > 0 && (
          <section className="highlights-grid">
            {highlights.map((item) => (
              <article className="highlight-card" key={item.title}>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </article>
            ))}
          </section>
        )}

        {children}
      </main>
    </div>
  );
};

export default SiteLayout;
