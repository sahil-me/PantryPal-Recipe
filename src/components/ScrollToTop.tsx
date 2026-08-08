import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';

/**
 * ScrollToTop component automatically resets the window scroll position to 0,0
 * whenever the user navigates to a new route or updates route parameters.
 * Ensures users always start at the page header and hero section.
 */
export const ScrollToTop: React.FC = () => {
  const { currentRoute, routeParams } = useApp();

  useEffect(() => {
    // Immediate scroll reset to ensure header/hero is visible first
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentRoute, routeParams]);

  return null;
};
