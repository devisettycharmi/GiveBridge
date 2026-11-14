import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h3>GiveBridge</h3>
          <p>Connecting Needs. Bridging Giving.</p>
        </div>

        <div>
          <h4>Navigation</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/donations">Find Donations</Link></li>
            <li><Link to="/how-it-works">How It Works</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </div>

        <div>
          <h4>Support</h4>
          <ul>
            <li><a href="mailto:contact@givebridge.org">Contact</a></li>
            <li><a href="mailto:help@givebridge.org">Help</a></li>
            <li><a href="mailto:report@givebridge.org">Report an Issue</a></li>
          </ul>
        </div>

        <div>
          <h4>Legal</h4>
          <p className="footer-note">Privacy and terms information will be published here soon.</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© GiveBridge. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
