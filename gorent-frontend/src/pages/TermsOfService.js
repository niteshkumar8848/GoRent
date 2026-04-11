function TermsOfService() {
  return (
    <div className="terms-page">

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }

        .terms-page {
          font-family: 'Inter', sans-serif;
          background: #f9fafb;
          color: #111;
        }

        /* HERO */
        .hero {
          position: relative;
          height: 55vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #fff;
          overflow: hidden;
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
          background: linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.8));
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 750px;
          padding: 0 20px;
        }

        .hero h1 {
          font-size: 48px;
          font-weight: 800;
          margin-bottom: 12px;
          letter-spacing: -1px;
        }

        .hero p {
          color: #ddd;
          font-size: 17px;
          line-height: 1.6;
        }

        /* SECTION */
        .section {
          max-width: 1100px;
          margin: auto;
          padding: 70px 20px;
        }

        /* CARD */
        .card {
          background: #fff;
          padding: 28px;
          border-radius: 14px;
          margin-bottom: 20px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.05);
          transition: 0.3s ease;
        }

        .card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }

        .card h2 {
          font-size: 20px;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .card p {
          color: #555;
          line-height: 1.7;
          font-size: 15px;
        }

        .card ul {
          padding-left: 18px;
          margin-top: 8px;
        }

        .card li {
          margin-bottom: 6px;
          color: #555;
          font-size: 15px;
        }

        /* HIGHLIGHT */
        .highlight {
          border-left: 4px solid #111;
          background: #f3f4f6;
        }

        /* FOOTER */
        .footer {
          text-align: center;
          padding: 40px;
          color: #777;
          font-size: 14px;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .hero h1 {
            font-size: 32px;
          }
        }
      `}</style>

      {/* HERO */}
      <section className="hero">
        <img src="https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1600&q=80" />
        <div className="overlay"></div>
        <div className="hero-content">
          <h1>Terms of Service</h1>
          <p>
            These Terms define your rights, responsibilities, and obligations while using the GoRent platform.
          </p>
        </div>
      </section>

      <section className="section">

        <div className="card">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using GoRent, you agree to comply with these Terms and all applicable policies.
            Continued use of the platform constitutes acceptance of any updates or modifications.
          </p>
        </div>

        <div className="card">
          <h2>2. Eligibility and Account Responsibility</h2>
          <p>
            Users must meet legal driving and contractual requirements. You are responsible for maintaining
            the confidentiality of your account and all activities under it.
          </p>
        </div>

        <div className="card">
          <h2>3. Booking and Confirmation</h2>
          <ul>
            <li>Bookings are subject to availability and verification</li>
            <li>Confirmation is completed after successful payment</li>
            <li>GoRent may cancel bookings in case of risk or violation</li>
            <li>Users must provide accurate information</li>
          </ul>
        </div>

        <div className="card">
          <h2>4. Pricing and Payments</h2>
          <ul>
            <li>All charges are displayed before confirmation</li>
            <li>Additional costs may apply based on usage</li>
            <li>Refunds depend on processing timelines</li>
            <li>Security deposits may be adjusted if needed</li>
          </ul>
        </div>

        <div className="card">
          <h2>5. Cancellations and Refunds</h2>
          <ul>
            <li>Cancellation rules apply as shown during booking</li>
            <li>Refund eligibility depends on timing and conditions</li>
            <li>No-shows may result in charges</li>
            <li>Platform cancellations will be compensated</li>
          </ul>
        </div>

        <div className="card">
          <h2>6. Vehicle Use and Responsibilities</h2>
          <ul>
            <li>Follow all traffic and safety regulations</li>
            <li>No unauthorized drivers</li>
            <li>Return vehicle in agreed condition</li>
            <li>Report incidents immediately</li>
            <li>Responsible for fines and violations</li>
          </ul>
        </div>

        <div className="card">
          <h2>7. Prohibited Activities</h2>
          <ul>
            <li>Fraud or identity misuse</li>
            <li>Driving under influence</li>
            <li>Illegal or unsafe activities</li>
            <li>Vehicle misuse or tampering</li>
          </ul>
        </div>

        <div className="card">
          <h2>8. Liability and Damages</h2>
          <p>
            Users may be responsible for damages, penalties, and insurance-related costs.
            GoRent is not liable for personal belongings left in vehicles.
          </p>
        </div>

        <div className="card">
          <h2>9. Suspension and Termination</h2>
          <p>
            Accounts may be suspended or terminated for violations, misuse, or legal risks.
            Outstanding obligations remain enforceable.
          </p>
        </div>

        <div className="card highlight">
          <h2>10. Disclaimers and Legal</h2>
          <p>
            Services are provided on an “as available” basis. Liability is limited to the booking amount.
          </p>
          <p>
            These Terms are governed by the laws of Nepal. Disputes will be resolved in Kathmandu jurisdiction.
          </p>
        </div>

      </section>

      <footer className="footer">
        <p>Last Updated: April 11, 2026</p>
        <p>Legal Contact: legal@gorent.np</p>
      </footer>

    </div>
  );
}

export default TermsOfService;