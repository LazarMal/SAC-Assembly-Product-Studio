import { Link } from 'react-router-dom';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand"><strong>S.A.C.</strong> Assembly <span>Venetian blinds, roller blinds and insect door systems.</span></div>
        <div className="footer-links"><Link to="/collection">Products</Link><span>Visual configurations are illustrative, not approved production specifications.</span></div>
      </div>
    </footer>
  );
}
