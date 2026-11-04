import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';

const HomePage = lazy(() => import('../pages/HomePage'));
const CatalogPage = lazy(() => import('../pages/CatalogPage'));
const ProductPage = lazy(() => import('../pages/ProductPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

export function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteHeader />
      <Suspense fallback={<main id="main-content" className="page-loading" aria-live="polite">Preparing the studio…</main>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collection" element={<CatalogPage />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <SiteFooter />
    </div>
  );
}
