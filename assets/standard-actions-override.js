/**
 * Horizon overrides for Shopify.actions:
 * - updateCart: emit events from the cart drawer scope.
 * - openCart: open the cart drawer (fall back to /cart when absent).
 */

function init() {
  const actions = window.Shopify?.actions;
  if (!actions) return;

  actions.updateCart.configure({
    eventTarget: () => document.querySelector('theme-drawer#cart-drawer') ?? document,
  });

  actions.openCart.configure({
    async handler() {
      /** @type {HTMLElement & {open?: () => void} | null} */
      const drawer = document.querySelector('theme-drawer#cart-drawer');

      if (drawer?.open) {
        drawer.open();
      } else {
        window.location.href = Theme.routes.cart_url || '/cart';
      }
    },
  });
}

/**
 * These mobile rules need to win over Friday section-level stylesheets that
 * are emitted later in the document than the global CSS bundle. Injecting one
 * final runtime sheet keeps desktop untouched and makes the mobile handoff
 * deterministic in both storefront preview and Theme Editor navigation.
 */
function installFridayMobilePolish() {
  if (document.getElementById('friday-mobile-polish-runtime')) return;

  const style = document.createElement('style');
  style.id = 'friday-mobile-polish-runtime';
  style.textContent = `
    @media (max-width: 749px) {
      .fp-site-header .fp-nav {
        height: 58px !important;
        min-height: 58px !important;
        padding-top: 6px !important;
        padding-bottom: 2px !important;
        align-items: center !important;
      }

      .fp-footer .fp-footer__grid {
        border-right: 0 !important;
      }
      .fp-footer .fp-footer__col {
        border-right: 0 !important;
      }
      .fp-footer .fp-footer__col:nth-of-type(2n) {
        border-left: 1px solid var(--fp-line) !important;
        padding-left: 12px !important;
      }

      .fp-pdp .fp-pdp__gallery {
        padding-left: 20px !important;
        padding-right: 0 !important;
      }
      .fp-pdp .fp-pdp__back {
        margin-left: 0 !important;
      }
      .fp-pdp .fp-pdp__media-list {
        justify-content: flex-start !important;
        margin-left: 0 !important;
        padding-left: 0 !important;
        scroll-padding-left: 0 !important;
      }
      .fp-pdp .fp-pdp__media {
        justify-items: start !important;
        place-items: start !important;
        scroll-snap-align: start !important;
        margin-left: 0 !important;
      }
      .fp-pdp .fp-pdp__media-button {
        place-items: start !important;
      }
      .fp-pdp .fp-pdp__media img,
      .fp-pdp .fp-pdp__media svg {
        object-position: left center !important;
        margin-left: 0 !important;
        margin-right: auto !important;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Small runtime hardening for the custom Friday PDP.
 * The section owns the main interaction logic; this layer only makes the
 * initial lightbox image and the mobile post-CTA buy bar deterministic after
 * Shopify section re-renders / editor navigation.
 */
function initFridayPdpRuntime(scope = document) {
  const roots = scope.querySelectorAll?.('.fp-pdp') ?? [];

  roots.forEach((root) => {
    if (root.dataset.fpRuntimeReady === 'true') return;
    root.dataset.fpRuntimeReady = 'true';

    const lightboxImage = root.querySelector('[data-fp-lightbox-image]');
    const firstTrigger = root.querySelector('[data-fp-lightbox-trigger]');
    if (lightboxImage && firstTrigger && !lightboxImage.getAttribute('src')) {
      lightboxImage.src = firstTrigger.dataset.src || '';
      lightboxImage.alt = firstTrigger.dataset.alt || '';
    }

    const mainButton = root.querySelector('.fp-pdp__add');
    const bar = root.querySelector('[data-fp-mobile-buybar]');
    if (!mainButton || !bar) return;

    let hasReachedMainCta = false;

    const update = () => {
      if (window.innerWidth > 749) {
        bar.classList.remove('is-visible');
        bar.setAttribute('aria-hidden', 'true');
        return;
      }

      const rect = mainButton.getBoundingClientRect();
      // Once the CTA has reached/passed the viewport, remember that state.
      // This also handles large programmatic scroll jumps that skip the exact
      // intersection frame.
      if (rect.top < window.innerHeight) hasReachedMainCta = true;

      const visible = hasReachedMainCta && rect.bottom < 0;
      bar.classList.toggle('is-visible', visible);
      bar.setAttribute('aria-hidden', visible ? 'false' : 'true');
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) hasReachedMainCta = true;
      update();
    }, { threshold: 0.01 });

    observer.observe(mainButton);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
}

// Run immediately if the standard-actions bundle has already attached
// `Shopify.actions`; otherwise wait for DOMContentLoaded, which fires after
// all module scripts have executed regardless of document order.
if (window.Shopify?.actions) {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init, { once: true });
}

installFridayMobilePolish();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initFridayPdpRuntime(document), { once: true });
} else {
  initFridayPdpRuntime(document);
}

document.addEventListener('shopify:section:load', (event) => {
  installFridayMobilePolish();
  initFridayPdpRuntime(event.target instanceof Element ? event.target : document);
});
