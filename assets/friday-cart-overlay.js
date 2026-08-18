const CART_DRAWER_SELECTOR = '#cart-drawer';
const CART_DIALOG_SELECTOR = '#cart-drawer > .theme-drawer__dialog';
const DESKTOP_QUERY = window.matchMedia('(min-width: 990px)');

function syncFridayCartOverlay() {
  const drawer = document.querySelector(CART_DRAWER_SELECTOR);
  const dialog = document.querySelector(CART_DIALOG_SELECTOR);
  const isOpen = Boolean(drawer && dialog?.hasAttribute('open'));
  const useDesktopOverlay = isOpen && DESKTOP_QUERY.matches;

  document.body.classList.toggle('fp-cart-overlay-open', useDesktopOverlay);

  if (useDesktopOverlay) {
    document.querySelector('.page-wrapper')?.classList.remove('page-wrapper--drawer-open');
  }
}

function scheduleSync() {
  queueMicrotask(syncFridayCartOverlay);
  requestAnimationFrame(syncFridayCartOverlay);
}

function observeCartDrawer() {
  const drawer = document.querySelector(CART_DRAWER_SELECTOR);
  const dialog = document.querySelector(CART_DIALOG_SELECTOR);

  if (!drawer || !dialog) return;

  new MutationObserver(scheduleSync).observe(drawer, {
    attributes: true,
    attributeFilter: ['open'],
  });

  new MutationObserver(scheduleSync).observe(dialog, {
    attributes: true,
    attributeFilter: ['open'],
  });

  scheduleSync();
}

document.addEventListener('theme-drawer:open', (event) => {
  if (event.target?.id === 'cart-drawer') scheduleSync();
});

document.addEventListener('theme-drawer:close', (event) => {
  if (event.target?.id === 'cart-drawer') scheduleSync();
});

DESKTOP_QUERY.addEventListener('change', scheduleSync);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observeCartDrawer, { once: true });
} else {
  observeCartDrawer();
}
