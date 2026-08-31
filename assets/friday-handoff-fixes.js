(() => {
  const normalizePriceNumber = (value) => {
    const cleaned = String(value || '').replace(/[^0-9.,-]/g, '');
    if (!cleaned) return Number.POSITIVE_INFINITY;
    const normalized = cleaned.includes('.') && cleaned.includes(',')
      ? cleaned.replace(/,/g, '')
      : cleaned.replace(/,/g, '');
    const number = Number.parseFloat(normalized);
    return Number.isFinite(number) ? number : Number.POSITIVE_INFINITY;
  };

  const applyStartingPrice = (root) => {
    if (!root || root.dataset.fpStartingPriceReady === 'true') return;

    const price = root.querySelector('[data-fp-price]');
    const variants = [...root.querySelectorAll('[data-fp-variant][data-price]')];
    if (!price || variants.length < 2) return;

    const uniquePrices = [...new Set(variants.map((variant) => (variant.dataset.price || '').trim()).filter(Boolean))];
    if (uniquePrices.length < 2) return;

    const lowest = uniquePrices
      .map((formatted) => ({ formatted, number: normalizePriceNumber(formatted) }))
      .sort((a, b) => a.number - b.number)[0];

    if (!lowest || !Number.isFinite(lowest.number)) return;

    price.textContent = `from ${lowest.formatted}`;
    root.dataset.fpStartingPriceReady = 'true';

    variants.forEach((variant) => {
      variant.addEventListener('change', () => {
        root.dataset.fpStartingPriceReady = 'selected';
      }, { once: true });
    });
  };

  const run = (scope = document) => {
    scope.querySelectorAll?.('.fp-pdp').forEach(applyStartingPrice);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => run(), { once: true });
  } else {
    run();
  }

  document.addEventListener('shopify:section:load', (event) => {
    window.setTimeout(() => run(event.target || document), 0);
  });
})();
