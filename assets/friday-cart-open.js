/* Friday Prints — bridge the custom PDP to Shopify's native cart drawer.
   The native product form updates cart drawer markup successfully, but the
   custom Friday header does not participate in Pitch's standard auto-open
   trigger. Observe the native drawer content and open the existing drawer
   only after Shopify has actually refreshed it. */

(() => {
  const ARM_TIMEOUT = 6000;

  const armDrawerOpen = (button) => {
    if (!button || button.disabled) return;

    const drawer = document.querySelector('theme-drawer#cart-drawer');
    if (!drawer) return;

    const target = drawer.querySelector('cart-items-component') || drawer;
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      clearTimeout(timeout);
      customElements.whenDefined('theme-drawer').then(() => {
        if (typeof drawer.open === 'function') drawer.open();
      });
    };

    const observer = new MutationObserver((mutations) => {
      const meaningful = mutations.some((mutation) =>
        mutation.type === 'childList' || mutation.type === 'characterData'
      );
      if (meaningful) finish();
    });

    observer.observe(target, {
      subtree: true,
      childList: true,
      characterData: true,
    });

    const timeout = setTimeout(() => {
      observer.disconnect();
      settled = true;
    }, ARM_TIMEOUT);
  };

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.fp-pdp [ref="addToCartButton"]');
    if (!button) return;
    armDrawerOpen(button);
  }, true);
})();
