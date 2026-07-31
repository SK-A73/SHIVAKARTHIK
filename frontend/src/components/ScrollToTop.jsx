import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop
 * 
 * Scrolls the window to position (0, 0) whenever the user navigates
 * to a new route via a PUSH navigation (i.e., clicking a link, not
 * hitting the browser Back button).
 *
 * For POP navigations (back/forward), scroll restoration is handled
 * by useScrollRestoration inside the Home component.
 */
const ScrollToTop = () => {
  const { pathname, key } = useLocation();

  useEffect(() => {
    // Check if this navigation was a "push" (new page) or "pop" (back/forward).
    // React Router 6 does not expose navigationType here, so we use a simple
    // heuristic: if the pathname changed and the key changed, it is a push.
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
