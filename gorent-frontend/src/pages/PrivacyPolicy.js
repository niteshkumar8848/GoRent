function PrivacyPolicy() {
  return (
    <div className="privacy-page">

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }

        .privacy-page {
          font-family: 'Inter', sans-serif;
          color: #111;
        }

        /* HERO */
        .hero {
          position: relative;
          height: 50vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #fff;
        }

        .hero img {
          position: absolute;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .overlay {
          position: absolute;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.7);
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
        }

        .hero-content h1 {
          font-size: 42px;
          margin-bottom: 10px;
        }

        .hero-content p {
          color: #ddd;
          font-size: 16px;
        }

        /* SECTION */
        .section {
          padding: 60px 20px;
          max-width: 1100px;
          margin: auto;
        }

        /* CARD */
        .card {
          background: #fff;
          padding: 30px;
          border-radius: 14px;
          margin-bottom: 25px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
          transition: 0.3s;
        }

        .card:hover {
          transform: translateY(-4px);
        }

        .card h2 {
          margin-bottom: 12px;
          font-size: 22px;
        }

        .card p {
          color: #555;
          margin-bottom: 10px;
          line-height: 1.7;
        }

        .card ul {
          padding-left: 20px;
        }

        .card li {
          margin-bottom: 8px;
          color: #555;
        }

        /* HIGHLIGHT */
        .highlight {
          border-left: 5px solid black;
          background: #fafafa;
        }

        /* FOOTER */
        .footer {
          text-align: center;
          padding: 40px;
          color: #777;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 30px;
          }
        }
      `}</style>

      {/* HERO */}
      <section className="hero">
        <img src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=80" />
        <div className="overlay"></div>
        <div className="hero-content">
          <h1>Privacy Policy</h1>
          <p>
            Learn how GoRent collects, uses, and protects your personal information.
          </p>
        </div>
      </section>

      <section className="section">

        {/* 1 */}
        <div className="card">
          <h2>1. Information We Collect</h2>
          <ul>
            <li>Account details such as name, email, phone</li>
            <li>Identity verification documents</li>
            <li>Booking and rental history</li>
            <li>Payment and transaction data</li>
            <li>Device and usage information</li>
            <li>Location data during active trips</li>
          </ul>
        </div>

        {/* 2 */}
        <div className="card">
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>Manage accounts and bookings</li>
            <li>Process payments and refunds</li>
            <li>Provide customer support</li>
            <li>Improve platform performance</li>
            <li>Ensure safety and prevent fraud</li>
          </ul>
        </div>

        {/* 3 */}
        <div className="card">
          <h2>3. Legal Basis</h2>
          <p>
            We process your data based on consent, contractual necessity, legitimate interests,
            and legal obligations.
          </p>
        </div>

        {/* 4 */}
        <div className="card">
          <h2>4. Sharing Information</h2>
          <p>We do not sell your data. We only share with:</p>
          <ul>
            <li>Payment processors</li>
            <li>Vehicle partners</li>
            <li>Cloud service providers</li>
            <li>Legal authorities when required</li>
          </ul>
        </div>

        {/* 5 */}
        <div className="card">
          <h2>5. Data Security</h2>
          <p>
            We use encryption, secure systems, and access controls to protect your data.
            However, no system is completely secure.
          </p>
        </div>

        {/* 6 */}
        <div className="card">
          <h2>6. Cookies</h2>
          <p>
            Cookies help us improve performance, security, and user experience.
          </p>
        </div>

        {/* 7 */}
        <div className="card">
          <h2>7. International Transfers</h2>
          <p>
            Data may be processed outside your country with proper safeguards.
          </p>
        </div>

        {/* 8 */}
        <div className="card highlight">
          <h2>8. Your Rights</h2>
          <ul>
            <li>Access your data</li>
            <li>Request corrections</li>
            <li>Request deletion</li>
            <li>Opt-out of marketing</li>
          </ul>
          <p>Email: privacy@gorent.np</p>
        </div>

        {/* 9 */}
        <div className="card">
          <h2>9. Children's Privacy</h2>
          <p>
            Our services are not intended for minors. We do not knowingly collect such data.
          </p>
        </div>

        {/* 10 */}
        <div className="card">
          <h2>10. Updates</h2>
          <p>
            We may update this policy from time to time. Changes will be reflected on this page.
          </p>
        </div>

      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>Last Updated: April 11, 2026</p>
        <p>Contact: privacy@gorent.np</p>
      </footer>

    </div>
  );
}

export default PrivacyPolicy;