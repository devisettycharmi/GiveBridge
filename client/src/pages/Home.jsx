import { useEffect, useState } from 'react';
import api from '../services/api';

const trustItems = ['Verified Users', 'Location-Based Matching', 'Transparent Tracking', 'Request Status Updates'];

const steps = [
  { title: 'List', text: 'Donors list items they want to give.' },
  { title: 'Discover', text: 'Receivers discover available donations nearby.' },
  { title: 'Request', text: 'Receivers request what they need.' },
  { title: 'Connect', text: 'Donors review and accept requests.' },
  { title: 'Complete', text: 'The donation is handed over and marked completed.' },
];

const categories = [
  { name: 'Food', text: 'Nutritious items, groceries and meals.', icon: '🍲' },
  { name: 'Clothes', text: 'Warm clothing and everyday essentials.', icon: '👕' },
  { name: 'Books', text: 'Learning material and educational resources.', icon: '📚' },
  { name: 'Electronics', text: 'Functional devices and accessories.', icon: '💻' },
  { name: 'Furniture', text: 'Practical household and living essentials.', icon: '🪑' },
  { name: 'Medicines', text: 'Healthcare and aid items for families.', icon: '💊' },
  { name: 'School Supplies', text: 'Tools that help students learn and grow.', icon: '✏️' },
  { name: 'Household Items', text: 'Useful home essentials for daily life.', icon: '🏠' },
  { name: 'Financial Assistance', text: 'Support toward urgent needs and bills.', icon: '💰' },
  { name: 'Other', text: 'Unique community support items.', icon: '✨' },
];

function Home() {
  const [impactStats, setImpactStats] = useState([
    { label: 'Total Donations', value: '—' },
    { label: 'Receivers Helped', value: '—' },
    { label: 'Active Donors', value: '—' },
    { label: 'Communities Reached', value: '—' },
  ]);
  const [statsError, setStatsError] = useState('');

  useEffect(() => {
    api.get('/donations/stats')
      .then(({ data }) => {
        setImpactStats([
          { label: 'Total Donations', value: data.stats.totalDonations },
          { label: 'Receivers Helped', value: data.stats.receiversHelped },
          { label: 'Active Donors', value: data.stats.activeDonors },
          { label: 'Communities Reached', value: data.stats.communitiesReached },
        ]);
      })
      .catch(() => setStatsError('Live impact numbers are temporarily unavailable.'));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="kicker">Trusted community giving</span>
            <h1>Connecting Needs. Bridging Giving.</h1>
            <p>
              GiveBridge makes it easier to give what you can and find what you need — connecting
              donors and receivers through a trusted, location-based community platform.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="/register">Donate Now</a>
              <a className="btn btn-secondary" href="/donations">Find Donations</a>
            </div>
          </div>

          <div className="hero-visual" aria-label="GiveBridge connection illustration">
            <div className="bridge-diagram">
              <div className="node donor">Donor</div>
              <div className="bridge-line" />
              <div className="node platform">GiveBridge</div>
              <div className="node receiver">Receiver</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="trust-bar">
            {trustItems.map((item) => (
              <div key={item} className="trust-item">✓ {item}</div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section">
        <div className="container">
          <div className="section-header">
            <h2>How GiveBridge Works</h2>
          </div>
          <div className="steps">
            {steps.map((step, index) => (
              <div key={step.title} className="step-card">
                <div className="step-number">0{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>What Can You Give?</h2>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <article key={category.name} className="category-card">
                <div className="category-icon" aria-hidden="true">{category.icon}</div>
                <h3>{category.name}</h3>
                <p>{category.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Find Help. Find It Nearby.</h2>
            <p>Discover available donations around your city or area and connect with people closer to you.</p>
          </div>
          <div className="map-panel">
            <div className="map-preview" aria-label="Nearby donations map preview">
              <div className="map-surface">
                <span className="map-pin pin-a" />
                <span className="map-pin pin-b" />
                <span className="map-pin pin-c" />
              </div>
            </div>
            <div className="feature-list">
              <div className="feature-card">
                <h3>Nearby Donations</h3>
                <p>See items near your area and sort by distance.</p>
              </div>
              <div className="feature-card">
                <h3>City Search</h3>
                <p>Filter by city and local community hubs.</p>
              </div>
              <div className="feature-card">
                <h3>Area Filters</h3>
                <p>Choose your neighborhood or locality.</p>
              </div>
              <div className="feature-card">
                <h3>Distance Matching</h3>
                <p>Find donations within 5, 10, 25, or 50 km.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Built for Trust</h2>
          </div>
          <div className="feature-list">
            <div className="feature-card">
              <h3>Verified Users</h3>
              <p>Accounts can be reviewed and confirmed by staff.</p>
            </div>
            <div className="feature-card">
              <h3>Secure Accounts</h3>
              <p>Protected authentication keeps user activity safe.</p>
            </div>
            <div className="feature-card">
              <h3>Tracked Requests</h3>
              <p>Every request is visible from start to completion.</p>
            </div>
            <div className="feature-card">
              <h3>Donation Status</h3>
              <p>Clear statuses help donors and receivers stay informed.</p>
            </div>
            <div className="feature-card">
              <h3>Admin Oversight</h3>
              <p>Admins review accounts and moderate the community platform.</p>
            </div>
            <div className="feature-card">
              <h3>Location-Based Matching</h3>
              <p>Find available donations by city, area, and distance.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Every Donation Creates an Impact</h2>
          </div>
          <div className="stats-grid">
            {impactStats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
          {statsError && <p className="stats-error">{statsError}</p>}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-box">
            <div>
              <h2>Have Something to Give?</h2>
              <p>Your unused items could become someone’s much-needed resource.</p>
            </div>
            <div className="cta-actions">
              <a className="btn btn-light" href="/register">Start Donating</a>
              <a className="btn btn-secondary" href="/donations">Find Donations</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
