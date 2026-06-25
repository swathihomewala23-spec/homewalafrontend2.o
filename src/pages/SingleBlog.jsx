import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/common/navbar";
import Footer from "../components/common/Footer";
import "./SingleBlog.css";

const SingleBlog = () => {
  const { slug } = useParams();

  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `https://blog.homewala.com/wp-json/wp/v2/posts?slug=${slug}&_embed`
      );

      if (!response.data.length) return;

      const postData = response.data[0];

      const formattedPost = {
        id: postData.id,
        title: postData.title.rendered,
        content: postData.content.rendered,
        image:
          postData._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
        author:
          postData._embedded?.author?.[0]?.name || "Homewala",
        date: new Date(postData.date).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        ),
        categories:
          postData._embedded?.["wp:term"]?.[0]?.map(
            (cat) => cat.name
          ) || [],
      };

      setPost(formattedPost);

      // recent posts
      const recentResponse = await axios.get(
        `https://blog.homewala.com/wp-json/wp/v2/posts?_embed&per_page=4&exclude=${postData.id}`
      );

      const recentFormatted = recentResponse.data.map(
        (item) => ({
          id: item.id,
          title: item.title.rendered,
          slug: item.slug,
          image:
            item._embedded?.["wp:featuredmedia"]?.[0]
              ?.source_url,
        })
      );

      setRecentPosts(recentFormatted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="single-loader">
        <div className="single-spinner"></div>
      </div>
    );
  }

  return (
    <>
      

      <div className="single-blog-page">
        <div className="single-blog-container">
          <div className="single-blog-layout">
            
            {/* LEFT CONTENT */}
            <div className="single-blog-main">
                     
                <div className="single-blog-back">
                 <Link to="/blogs"  className="back-btn">
                  ← Back to Blogs
                   </Link>
          </div>
              {post?.image && (
                <div className="single-blog-image">
                  <img src={post.image} alt={post.title} />
                </div>
              )}

              <div className="single-blog-content">

                <div className="single-blog-categories">
                  {post?.categories?.map((cat, index) => (
                    <span key={index}>{cat}</span>
                  ))}
                </div>

                <h1
                  dangerouslySetInnerHTML={{
                    __html: post?.title,
                  }}
                />

                <div className="single-blog-meta">
                  <span>{post?.author}</span>
                  <span>{post?.date}</span>
                </div>

                <div
                  className="single-blog-description"
                  dangerouslySetInnerHTML={{
                    __html: post?.content,
                  }}
                />
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="single-blog-sidebar">
              <div className="recent-post-card">
                <h2>Recent Posts</h2>

                <div className="recent-post-list">
                  {recentPosts.map((item) => (
                    <Link
                      to={`/blog/${item.slug}`}
                      key={item.id}
                      className="recent-post-item"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                      />

                      <div>
                        <p
                          dangerouslySetInnerHTML={{
                            __html: item.title,
                          }}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

          </div>

        {/* <div className="single-blog-back">
            <Link to="/blogs">
              ← Back to Blogs
            </Link>
          </div> */}
        </div>
      </div>


    </>
  );
};

export default SingleBlog;