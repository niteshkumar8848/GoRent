function Contact() {
  return (
    <div className="contact-page">

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }

        .contact-page {
          font-family: 'Inter', sans-serif;
          color: #111;
        }

        /* HERO */
        .contact-hero {
          position: relative;
          height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #fff;
        }

        .contact-hero img {
          position: absolute;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .overlay {
          position: absolute;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.6);
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 700px;
        }

        .hero-content h1 {
          font-size: 50px;
          margin-bottom: 15px;
        }

        .hero-content p {
          color: #ddd;
          font-size: 18px;
        }

        /* SECTION */
        .section {
          padding: 80px 20px;
          max-width: 1100px;
          margin: auto;
        }

        /* GRID */
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        /* CARD */
        .card {
          background: #fff;
          padding: 30px;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          transition: 0.3s;
        }

        .card:hover {
          transform: translateY(-5px);
        }

        .card h2 {
          margin-bottom: 10px;
        }

        .card p {
          color: #555;
          margin-bottom: 8px;
        }

        .card a {
          color: #000;
          text-decoration: none;
          font-weight: 500;
        }

        /* DARK */
        .dark {
          background: #000;
          color: #fff;
          text-align: center;
        }

        .dark p { color: #ccc; }

        /* LIST */
        .list {
          margin-top: 10px;
          padding-left: 20px;
        }

        .list li {
          margin-bottom: 6px;
          color: #555;
        }

        /* FOOTER */
        .footer {
          text-align: center;
          padding: 40px;
          color: #777;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
          }

          .hero-content h1 {
            font-size: 36px;
          }
        }
      `}</style>

      {/* HERO */}
      <section className="contact-hero">
        <img src="https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1600&q=80" />
        <div className="overlay"></div>
        <div className="hero-content">
          <h1>Contact GoRent</h1>
          <p>
            We're here to help you with bookings, support, partnerships, and everything in between.
          </p>
        </div>
      </section>

      {/* SUPPORT */}
      <section className="section grid">
        <div className="card">
          <h2>Customer Support</h2>
          <p>Booking issues, cancellations, payments, and trip help</p>
          <p><strong>Phone:</strong> <a href="tel:+9779801234567">+977 980-123-4567</a></p>
          <p><strong>Email:</strong> <a href="mailto:support@gorent.np">support@gorent.np</a></p>
          <p><strong>WhatsApp:</strong> <a href="https://wa.me/9779801234567">Chat Now</a></p>
          <p><strong>Response:</strong> Within 2 hours</p>
        </div>

        <div className="card">
          <h2>Corporate & Partnerships</h2>
          <p>Fleet onboarding, business rentals, collaborations</p>
          <p><strong>Email:</strong> <a href="mailto:partners@gorent.np">partners@gorent.np</a></p>
          <p><strong>Phone:</strong> <a href="tel:+97714451234">+977-1-445-1234</a></p>
          <p><strong>Response:</strong> 1-2 business days</p>
        </div>
      </section>

      {/* LEGAL */}
      <section className="section">
        <div className="card">
          <h2>Legal & Privacy</h2>
          <p>Data requests, compliance, and legal communication</p>
          <p><strong>Privacy:</strong> <a href="mailto:privacy@gorent.np">privacy@gorent.np</a></p>
          <p><strong>Legal:</strong> <a href="mailto:legal@gorent.np">legal@gorent.np</a></p>
          <p><strong>Address:</strong> Lalitpur, Kathmandu, Nepal</p>
        </div>
      </section>

      {/* OFFICE */}
      <section className="section dark">
        <h2>Our Offices</h2>
        <p>Kumaripati, Lalitpur, Nepal</p>
        <p>Support Hours: 7:00 AM – 10:00 PM (Daily)</p>
        <p>Emergency support available during active bookings</p>
      </section>

      {/* HELP */}
      <section className="section">
        <div className="card">
          <h2>Before You Contact Us</h2>
          <ul className="list">
            <li>Keep your booking ID ready</li>
            <li>Include payment screenshots if needed</li>
            <li>Provide trip details for faster support</li>
            <li>Use registered email for account issues</li>
          </ul>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>Feedback: feedback@gorent.np</p>
        <p>General: hello@gorent.np</p>
      </footer>

    </div>
  );
}

export default Contact;