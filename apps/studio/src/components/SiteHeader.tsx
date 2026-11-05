import { NavLink } from 'react-router-dom';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-content">
        <NavLink className="brand" to="/" aria-label="S.A.C. Assembly — home">
          <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
          <span className="brand-name"><strong>S.A.C.</strong> Assembly</span>
        </NavLink>
        <nav className="primary-nav" aria-label="Main navigation">
          <NavLink to="/" end className={({isActive}) => isActive ? 'nav-active' : ''}>Home</NavLink>
          <NavLink to="/collection" className={({isActive}) => isActive ? 'nav-active' : ''}>Products</NavLink>
        </nav>
      </div>
    </header>
  );
}
