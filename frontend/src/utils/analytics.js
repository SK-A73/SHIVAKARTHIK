/**
 * Web Analytics Utility (Google Analytics 4 & Microsoft Clarity)
 * Shiva Karthik Ganesha Collections
 * 
 * Non-blocking, privacy-respecting analytics layer.
 * Fail-safe: Any analytics failure will NEVER block or break the website.
 */

let isInitialized = false;

/**
 * Initialize Google Analytics 4 & Microsoft Clarity once
 */
export const initializeAnalytics = () => {
  if (isInitialized) return;
  if (typeof window === 'undefined') return;

  try {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    const clarityId = import.meta.env.VITE_CLARITY_PROJECT_ID;

    // --- Google Analytics 4 (GA4) ---
    if (gaId && gaId.trim() && !document.getElementById('ga-gtag-script')) {
      const script = document.createElement('script');
      script.id = 'ga-gtag-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId.trim()}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      window.gtag = gtag;

      gtag('js', new Date());
      // send_page_view: false allows React Router to track accurate SPA route views
      gtag('config', gaId.trim(), {
        send_page_view: false
      });
    }

    // --- Microsoft Clarity ---
    if (clarityId && clarityId.trim() && !window.clarity) {
      (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r);
        t.async = 1;
        t.src = 'https://www.clarity.ms/tag/' + i;
        y = l.getElementsByTagName(r)[0];
        if (y && y.parentNode) {
          y.parentNode.insertBefore(t, y);
        } else {
          document.head.appendChild(t);
        }
      })(window, document, 'clarity', 'script', clarityId.trim());
    }

    isInitialized = true;
  } catch (error) {
    // Fail silently so website is never affected
    console.warn('Analytics initialization skipped:', error);
  }
};

/**
 * Track SPA Page Views on route changes
 */
export const trackPageView = (path, title) => {
  try {
    const pagePath = path || window.location.pathname + window.location.search;
    const pageTitle = title || document.title;

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: pageTitle,
        page_location: window.location.href
      });
    }
  } catch (error) {
    // Non-blocking
  }
};

/**
 * Generic event tracker
 */
export const trackEvent = (eventName, params = {}) => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
    if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
      window.clarity('event', eventName);
    }
  } catch (error) {
    // Non-blocking
  }
};

// ================================================================
// Custom Interaction Events
// ================================================================

/**
 * 1. Product View (when customer views product details)
 */
export const trackViewProduct = ({ product_id, product_name, category, price }) => {
  trackEvent('view_product', {
    product_id,
    product_name,
    category,
    price: Number(price) || undefined
  });
};

/**
 * 2. Product Details Click (when customer clicks 'Details' button)
 */
export const trackProductDetailsClick = ({ product_id, product_name, category }) => {
  trackEvent('product_details_click', {
    product_id,
    product_name,
    category
  });
};

/**
 * 3. Order Now Click (when customer clicks 'Order Now' button)
 */
export const trackOrderNowClick = ({ product_id, product_name, category, price }) => {
  trackEvent('order_now_click', {
    product_id,
    product_name,
    category,
    price: Number(price) || undefined
  });
};

/**
 * 4. WhatsApp Order Click (when customer confirms order to open WhatsApp)
 * Note: Customer PII (name, phone, address) is NEVER sent.
 */
export const trackWhatsAppOrderClick = ({ product_id, product_name, category, quantity, total_amount }) => {
  trackEvent('whatsapp_order_click', {
    product_id,
    product_name,
    category,
    quantity: Number(quantity) || 1,
    total_amount: Number(total_amount) || undefined
  });
};

/**
 * 5. Product Search (when customer searches for idols)
 */
export const trackProductSearch = (searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) return;
  trackEvent('product_search', {
    search_term: searchTerm.trim()
  });
};

/**
 * 6. Category Selected (when customer clicks a category filter)
 */
export const trackCategorySelected = (categoryName) => {
  if (!categoryName) return;
  trackEvent('category_selected', {
    category_name: categoryName
  });
};

/**
 * 7. Product Card Click (when customer clicks the product image/card)
 */
export const trackProductCardClick = ({ product_id, product_name, category }) => {
  trackEvent('product_card_click', {
    product_id,
    product_name,
    category
  });
};
