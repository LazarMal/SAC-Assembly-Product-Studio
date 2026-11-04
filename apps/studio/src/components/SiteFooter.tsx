import { Link } from 'react-router-dom';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand"><strong>S.A.C.</strong> Assembly <span>Designed for the way you live.</span></div>
        <div className="footer-links"><Link to="/collection">Explore collection</Link><span>Product visualizations are conceptual. No online checkout.</span></div>
      </div>
    </footer>
  );
}
