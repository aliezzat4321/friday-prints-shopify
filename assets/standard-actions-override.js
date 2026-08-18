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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initFridayPdpRuntime(document), { once: true });
} else {
  initFridayPdpRuntime(document);
}

document.addEventListener('shopify:section:load', (event) => {
  initFridayPdpRuntime(event.target instanceof Element ? event.target : document);
});
