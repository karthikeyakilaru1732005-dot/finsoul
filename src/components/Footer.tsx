import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => (
  <footer className="site-footer">
    <div className="site-footer-inner">
      <Link to="/" className="footer-wordmark">FIN<span>SOUL</span></Link>
      <p>Master finance. Find your edge.</p>
      <nav aria-label="Footer navigation">
        <Link to="/toolkit">Toolkit</Link>
        <Link to="/arena">Arena</Link>
        <Link to="/boardroom">Boardroom</Link>
      </nav>
    </div>
  </footer>
);
