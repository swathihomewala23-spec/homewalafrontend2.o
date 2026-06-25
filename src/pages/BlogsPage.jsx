import Seo from "../components/common/Seo";
import featuredImg from "../assets/house_real.png";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./BlogsPage.css";
import SingleBlog from "../pages/SingleBlog";

const BlogsPage = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(
        "https://blog.homewala.com/wp-json/wp/v2/posts",
        {
          params: {
            per_page: 20,
            _embed: true,
          },
        }
      );

      const formattedBlogs = response.data.map((post) => {
        let imageUrl = featuredImg;

        if (
          post._embedded &&
          post._embedded["wp:featuredmedia"] &&
          post._embedded["wp:featuredmedia"][0]
        ) {
          imageUrl =
            post._embedded["wp:featuredmedia"][0].source_url;
        }

        return {
          id: post.id,
          title: post.title.rendered,
          category: "Homewala News",
          summary:
            post.excerpt.rendered
              .replace(/<[^>]+>/g, "")
              .substring(0, 120) + "...",
          stats: new Date(post.date).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "short",
            }
          ),
          image: imageUrl,
          slug: post.slug,
        };
      });

      setBlogPosts(formattedBlogs);
    } catch (error) {
      console.error("Blog fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="site-shell">
      <Seo title="Blogs" />

      <main className="page-main">
        <section className="blog-trending">
          <div className="blog-trending-header">
            <div>
              <p className="eyebrow-text">Similar News</p>
              <h2>Chennai Real Estate Stories That Matter</h2>
            </div>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="blog-grid">
              {blogPosts.map((post) => (
                <article className="blog-card" key={post.id}>
                  <Link to={`/blog/${post.slug}`}>
                    <div className="blog-card-image">
                      <img
                        src={post.image}
                        alt={post.title}
                        loading="lazy"
                      />
                    </div>

                    <div className="blog-card-copy">
                      <span className="blog-pill">
                        {post.category}
                      </span>

                      <h3
                        dangerouslySetInnerHTML={{
                          __html: post.title,
                        }}
                      />

                      <p>{post.summary}</p>

                      <div className="blog-meta">
                        {post.stats}
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default BlogsPage;