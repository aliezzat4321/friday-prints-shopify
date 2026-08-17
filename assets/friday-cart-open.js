/* Friday Prints — product-page finishing layer.
   1) Restore Pitch's native AJAX product-form submit path for the custom PDP.
   2) Bridge successful cart updates to Shopify's native cart drawer.
   3) Pull the exact edition count from Amina's existing product description
      when a print is a standalone A3/A4 product rather than a size variant. */

(() => {
  const ARM_TIMEOUT = 6000;

  const syncEditionFromProductCopy = () => {
    const edition = document.querySelector('.fp-pdp [data-fp-edition]');
    const description = document.querySelector('.fp-pdp__description');
    if (!edition || !description) return;

    const match = description.textContent.match(/\b1\s*\/\s*\d+\s+editions?\b/i);
    if (match) edition.textContent = match[0].replace(/\s+/g, ' ').replace(/\s*\/\s*/, '/');
  };

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
        mutation.type === 'childList' || mutation.type === 'characterData' || mutation.type === 'attributes'
      );
      if (meaningful) finish();
    });

    observer.observe(target, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    });

    const timeout = setTimeout(() => {
      observer.disconnect();
      settled = true;
    }, ARM_TIMEOUT);
  };

  syncEditionFromProductCopy();

  /* The custom Liquid form intentionally keeps Shopify's native
     product-form-component. Pitch normally wires this method through an
     `on:submit` attribute; bind the same public handler here so the form
     stays AJAX-based instead of navigating to /cart. */
  document.addEventListener('submit', (event) => {
    const form = event.target.closest?.('.fp-pdp__form');
    if (!form) return;

    const component = form.closest('product-form-component');
    if (!component || typeof component.handleSubmit !== 'function') return;

    event.stopImmediatePropagation();
    component.handleSubmit(event);
  }, true);

  document.addEventListener('click', (event) => {
    const button = event.target.closest?.('.fp-pdp [ref="addToCartButton"]');
    if (!button) return;
    armDrawerOpen(button);
  }, true);
})();
