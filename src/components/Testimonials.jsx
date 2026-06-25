import "./testimonials.css";

const testimonials = [
  {
    name: "Vijay Kumar",
    role: "Home buyer",
    quote:
      "The property suggestions were spot on, and the whole process felt simple from search to final shortlisting.",
    rating: "5.0",
  },
  {
    name: "Priya S",
    role: "Interior client",
    quote:
      "We got quick responses, clear guidance, and a very smooth experience. The mobile view works perfectly too.",
    rating: "4.9",
  },
  {
    name: "Madhan R",
    role: "Investor",
    quote:
      "Excellent support and a clean interface. I could review listings comfortably on both desktop and phone.",
    rating: "5.0",
  },
];

const Testimonials = () => {
  return (
    <section className="testimonials-section" aria-labelledby="testimonials-title">
      <div className="testimonials-shell">
        <div className="testimonials-header">
          <h2 id="testimonials-title">What our customers say</h2>
          <p className="testimonials-subtitle">
            Real feedback from people who found homes, interiors, and investment options with ease.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((item) => (
            <article className="testimonial-card" key={item.name}>
              <div className="testimonial-top">
                <div>
                  <h3>{item.name}</h3>
                  <span>{item.role}</span>
                </div>
                <div className="testimonial-rating">{item.rating}</div>
              </div>
              <p className="testimonial-quote">"{item.quote}"</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
