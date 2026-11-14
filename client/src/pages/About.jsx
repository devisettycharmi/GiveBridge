function About() {
  return (
    <div className="page-shell">
      <div className="container">
        <div className="section-header">
          <h2>About GiveBridge</h2>
          <p>
            GiveBridge is designed to make resource sharing simpler, more transparent, and more local.
            It helps communities connect donors with people who need support, without relying on scattered social media groups.
          </p>
        </div>

        <div className="feature-list">
          <div className="feature-card">
            <h3>Centralized Platform</h3>
            <p>All donation opportunities can be discovered from one trusted place.</p>
          </div>
          <div className="feature-card">
            <h3>Community Impact</h3>
            <p>Every donation can be tracked from listing through completion.</p>
          </div>
          <div className="feature-card">
            <h3>Location-Based Matching</h3>
            <p>People can discover nearby help based on city, area, and distance.</p>
          </div>
          <div className="feature-card">
            <h3>Admin Oversight</h3>
            <p>Verification, moderation, and reporting help maintain trust.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
