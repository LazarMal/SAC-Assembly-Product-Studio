import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** New pages start at their beginning, rather than inheriting the previous route's scroll offset. */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}
