function AboutUs() {
  return (
    <div className="about">

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }

        .about {
          font-family: 'Inter', sans-serif;
          color: #111;
        }

        /* HERO */
        .hero {
          position: relative;
          height: 90vh;
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
          background: rgba(0,0,0,0.6);
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
        }

        .hero h1 {
          font-size: 60px;
          font-weight: 800;
          margin-bottom: 20px;
        }

        .hero p {
          font-size: 20px;
          color: #ddd;
        }

        /* SECTION */
        .section {
          padding: 100px 20px;
          max-width: 1100px;
          margin: auto;
        }

        .section.center { text-align: center; }

        .section h2 {
          font-size: 38px;
          margin-bottom: 20px;
        }

        .section p {
          color: #555;
          line-height: 1.8;
          margin-bottom: 15px;
        }

        /* GRID */
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
        }

        /* IMAGE FIX */
        .img-box {
          width: 100%;
          height: 350px;
          border-radius: 16px;
          overflow: hidden;
        }

        .img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: 0.4s;
        }

        .img-box img:hover {
          transform: scale(1.05);
        }

        /* DARK */
        .dark {
          // background: #797979;
          // background: linear-gradient(135deg, #797979 0%, #000 100%);
          background:linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ), url('https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
          background-size: cover;
          background-position: center;
          background-filter: brightness(0.1);
          color: #e8e8e8;
          text-align: center;
        }

        /* STEPS */
        .steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          margin-top: 40px;
          gap: 20px;
        }

        .steps div {
          padding: 20px;
          background: #f5f5f5;
          border-radius: 10px;
        }

        .steps div:hover {
          background: #757575;
          color: #fff;
        }

        /* CTA */
        .cta {
          padding: 100px 20px;
          text-align: center;
        }

        .cta button {
          padding: 12px 30px;
          background: #000000;
          color: #ffffff;
          border-radius: 30px;
          border: none;
        }
        .cta button:hover {
          background: #2853ff;
          color: #ffffff;
          cursor: pointer;
          animation: infinite pulse 1.5s;
        }

        /* FOOTER */
        .footer {
          padding: 40px;
          text-align: center;
          color: #777;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .hero h1 { font-size: 40px; }

          .grid {
            grid-template-columns: 1fr;
          }

          .img-box {
            height: 250px;
          }

          .steps {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      {/* HERO */}
      <section className="hero">
        <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70" />
        <div className="overlay"></div>
        <div className="hero-content">
          <h1>We move people forward</h1>
          <p>Smart, safe, and transparent vehicle rentals.</p>
        </div>
      </section>

      {/* GRID SECTION */}
      <section className="section grid">
        <div>
          <h2>Mobility made simple</h2>
          <p>
            We simplify rentals with clear pricing and seamless booking.
          </p>
        </div>

        <div className="img-box">
          <img src="https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80" />
        </div>
      </section>

      {/* DARK */}
      <section className="section dark">
        <h2>Safety First</h2>
        <p style={{ color: 'whitesmoke' }}>All vehicles are verified for reliability.</p>
      </section>

      {/* HOW */}
      <section className="section center">
        <h2>How it works</h2>
        <div className="steps">
          <div>Search</div>
          <div>Compare</div>
          <div>Book</div>
          <div>Drive</div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Start your journey</h2>
        <a href="/"><button>Get Started → </button></a>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>GoRent Pvt. Ltd.</p>
      </footer>

    </div>
  );
}

export default AboutUs;