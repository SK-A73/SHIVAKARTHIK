/**
 * useScrollRestoration
 *
 * Saves the current scroll position before navigating away,
 * and restores it when returning to the same route via the
 * browser's history / React Router "pop" events.
 *
 * Usage: call this hook once inside the component you want to
 * preserve scroll for (e.g., Home).
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// In-memory map: pathname -> scrollY
const scrollPositions = new Map();

const useScrollRestoration = () => {
  const { key, pathname } = useLocation();
  const isMounted = useRef(false);

  // On every path change, save the PREVIOUS page's scroll before unmounting
  useEffect(() => {
    const saveScroll = () => {
      scrollPositions.set(pathname, window.scrollY);
    };

    // Save on popstate (back/forward) and before unload
    window.addEventListener('popstate', saveScroll);

    return () => {
      window.removeEventListener('popstate', saveScroll);
      // Save current scroll when this component unmounts (navigating away)
      scrollPositions.set(pathname, window.scrollY);
    };
  }, [pathname]);

  // Restore scroll when this pathname is revisited
  useEffect(() => {
    if (isMounted.current) {
      const savedY = scrollPositions.get(pathname);
      if (savedY !== undefined) {
        // Use smooth scroll for a natural feel
        window.scrollTo({ top: savedY, behavior: 'instant' });
      }
    }
    isMounted.current = true;
  }, [key]);
};

export default useScrollRestoration;
