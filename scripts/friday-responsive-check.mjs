import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'qa-artifacts');
fs.mkdirSync(out, { recursive: true });

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const sectionCss = (file, sectionId) => [...read(file).matchAll(/<style>([\s\S]*?)<\/style>/g)]
  .map((match) => match[1])
  .join('\n')
  .replaceAll('{{ section.id }}', sectionId)
  .replace(/{%[\s\S]*?%}/g, '')
  .replace(/{{[\s\S]*?}}/g, '48');

const css = [
  ':root{--fp-cream:#FBF1E4;--fp-pink:#F2BDC5;--fp-red:#E53F36;--fp-yellow:#F3CF78;--fp-green:#2F8869;--fp-ink:#17120F;--fp-line:rgba(23,18,15,.18)}',
  '*{box-sizing:border-box}html,body{margin:0;max-width:100%;overflow-x:clip}body{background:var(--fp-cream);color:var(--fp-ink)}',
  read('assets/friday-production.css'),
  read('assets/friday-patches.css'),
  sectionCss('sections/friday-header.liquid', 'header-test'),
  sectionCss('sections/friday-hero.liquid', 'hero-test'),
  sectionCss('sections/friday-product.liquid', 'product-test'),
  sectionCss('sections/friday-contact.liquid', 'contact-test'),
  sectionCss('sections/friday-footer.liquid', 'footer-test')
].join('\n');

const hero = path.join(root, 'assets/friday-hero-clean.webp').replaceAll('\\', '/');
const heroMobile = path.join(root, 'assets/friday-hero-clean-mobile.webp').replaceAll('\\', '/');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
<header class="fp-site-header" id="FridayHeader-header-test"><div class="fp-announcement"><span>✦</span><span>LIMITED EDITION ART PRINTS, MADE TO ORDER IN EGYPT</span><span>✦</span></div><div class="fp-nav-wrap"><div class="fp-shell fp-nav"><details class="fp-menu"><summary><i></i><i></i></summary><nav class="fp-mobile-menu"><div class="fp-mobile-menu__links"><a>shop all</a><a>World of GiGi</a><a>print guide</a><a>faq</a><a>search prints</a><a>contact</a></div></nav></details><a class="fp-logo"><span>friday</span><small>prints.art</small></a><nav class="fp-nav__links"><a>shop all</a><a>world of GiGi</a><a>print guide</a><a>faq</a></nav><div class="fp-nav__actions"><button class="fp-search">⌕</button><span class="fp-gigi-link">G</span><a class="fp-cart">▱<b>0</b></a></div></div></div></header>
<main>
<section class="fp-section fp-hero fp-hero--viewport" id="FridayHero-hero-test" style="--fp-hero-title-desktop:118px;--fp-hero-title-mobile:78px;--fp-hero-kicker-desktop:16px;--fp-hero-kicker-mobile:13px;--fp-hero-sub-desktop:17px;--fp-hero-sub-mobile:13px;--fp-hero-button-desktop:14px;--fp-hero-button-mobile:10px"><div class="fp-shell fp-hero__grid"><div class="fp-hero__copy"><p class="fp-hero__kicker">LIMITED-EDITION ART PRINTS</p><h1>friday<span>prints</span></h1><p class="fp-hero__sub">Art prints made for long weekends & loud lines.</p><p class="fp-hero__world">FROM THE WORLD OF GiGi</p><div class="fp-hero__buttons"><a class="fp-btn fp-btn--solid">shop prints</a><a class="fp-btn">Meet GiGi</a></div></div><div class="fp-hero__scene fp-hero__scene--curated"><picture><source media="(max-width: 749px)" srcset="file://${heroMobile}"><img src="file://${hero}" width="1448" height="1086"></picture></div></div></section>
<section class="fp-pdp" id="FridayProduct-product-test" style="--fp-pdp-bg:#FBF1E4;--fp-pdp-panel:#FBF1E4;--fp-pdp-accent:#E53F36;--fp-pdp-title:68px;--fp-pdp-title-mobile:48px"><div class="fp-pdp__top"><div class="fp-pdp__gallery"><div class="fp-pdp__media-list"><div class="fp-pdp__media"></div></div></div><div class="fp-pdp__details"><p class="fp-pdp__eyebrow">LIMITED EDITION ART PRINT</p><h1 class="fp-pdp__title">a different soul, still her</h1><div class="fp-pdp__price-row"><span class="fp-pdp__price">LE 3,200</span><span class="fp-pdp__edition">EDITION OF 100</span></div><div class="fp-pdp__size-line"><span>A3</span><span>29.7 × 42 CM</span></div><div class="fp-pdp__variants"><div class="fp-pdp__variant-grid"><div class="fp-pdp__variant"><label>A3</label></div><div class="fp-pdp__variant"><label>A4</label></div></div></div><div class="fp-pdp__edition-preview"><span class="fp-pdp__edition-preview-copy"><strong>NEXT AVAILABLE EDITION</strong><small>Your exact number is confirmed when your order is placed.</small></span><span class="fp-pdp__edition-number"><span>003</span><small>/100</small></span></div><button class="fp-pdp__add">add to cart</button></div></div></section>
<section class="fp-contact" id="FridayContact-contact-test"><div class="fp-shell fp-contact__inner"><header class="fp-contact__intro"><div><p class="fp-contact__eyebrow">04 · CONTACT</p><h1>say hello</h1></div><p class="fp-contact__intro-copy">Questions about an artwork, your order, or finding the right print? Send us a note.</p></header><div class="fp-contact__grid"><aside class="fp-contact__aside"><div class="fp-contact__aside-block"><small>email</small><a>Eldemirdsh@gmail.com</a></div><div class="fp-contact__aside-block"><small>instagram</small><a>@fridayprints.art</a></div><p class="fp-contact__note">We usually reply within 1–2 working days from Cairo.</p></aside><form class="fp-contact__form"><div class="fp-contact__field"><label>name</label><input></div><div class="fp-contact__field"><label>email</label><input></div><div class="fp-contact__field fp-contact__field--wide"><label>order number</label><input></div><div class="fp-contact__field fp-contact__field--wide"><label>message</label><textarea></textarea></div><div class="fp-contact__actions"><p>Your details are used only to reply.</p><button>send message →</button></div></form></div></div></section>
</main>
<footer class="fp-footer" id="FridayFooter-footer-test" style="--fp-footer-gigi-desktop:90px;--fp-footer-gigi-mobile:85px;--fp-footer-columns:4;--fp-footer-link-desktop:16px;--fp-footer-link-mobile:13px;--fp-footer-heading-desktop:13px;--fp-footer-heading-mobile:12px"><div class="fp-shell fp-footer__grid"><div class="fp-footer__brand-block"><div class="fp-footer__brand">friday\nprints</div><p>made for long weekends & loud lines.</p><a class="fp-footer__email">questions → send us a note</a><div class="fp-footer__gigi-wrap"><div class="fp-footer__gigi">GiGi</div><span>CAIRO → EVERYWHERE</span></div></div>${['SHOP','FRIDAY','HELP','LEGAL'].map(x=>`<nav class="fp-footer__col"><strong>${x}</strong><a>sample link</a><a>another link</a></nav>`).join('')}</div><div class="fp-footer__bottom"><span>© FRIDAY PRINTS</span><span>MADE IN CAIRO</span><span>WITH ♥ & LOUD LINES</span></div></footer>
</body></html>`;

const viewports = [
  ['phone-320', 320, 700], ['phone-390', 390, 844], ['phone-430', 430, 932],
  ['tablet-768', 768, 1024], ['tablet-820', 820, 1180], ['tablet-1024', 1024, 768],
  ['desktop-1280', 1280, 900], ['desktop-1440', 1440, 1000], ['desktop-1920', 1920, 1080]
];

const browser = await chromium.launch({ headless: true, executablePath: chromium.executablePath() });
const report = [];
let failed = false;

for (const [name, width, height] of viewports) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForTimeout(80);
  const metrics = await page.evaluate(() => {
    const rect = (selector) => {
      const node = document.querySelector(selector);
      if (!node) return null;
      const box = node.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
    };
    const logo = rect('.fp-logo');
    const menu = rect('.fp-menu>summary');
    const actions = rect('.fp-nav__actions');
    const footerColumn = document.querySelector('.fp-footer__col');
    return {
      scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      clientWidth: document.documentElement.clientWidth,
      logo,
      logoCentreDelta: logo ? Math.abs((logo.left + logo.width / 2) - innerWidth / 2) : null,
      menu,
      actions,
      heroTitle: rect('.fp-hero h1'),
      heroCopy: rect('.fp-hero__copy'),
      heroScene: rect('.fp-hero__scene'),
      heroPicture: rect('.fp-hero__scene picture'),
      edition: rect('.fp-pdp__edition-preview'),
      contact: rect('.fp-contact__form'),
      footer: rect('.fp-footer__grid'),
      footerBorderLeft: footerColumn ? getComputedStyle(footerColumn).borderLeftWidth : null
    };
  });
  const errors = [];
  if (metrics.scrollWidth > metrics.clientWidth + 1) errors.push(`horizontal overflow ${metrics.scrollWidth}-${metrics.clientWidth}`);
  for (const key of ['heroTitle', 'heroScene', 'edition', 'contact', 'footer']) if (!metrics[key] || metrics[key].width <= 0) errors.push(`${key} missing`);
  if (width <= 900) {
    if (metrics.logoCentreDelta > 2) errors.push(`mobile logo off-centre by ${metrics.logoCentreDelta.toFixed(1)}px`);
    if ((metrics.menu?.width || 0) < 44 || (metrics.menu?.height || 0) < 44) errors.push('menu touch target below 44px');
    if ((metrics.actions?.right || 0) > width + 1) errors.push('header actions clipped');
  }
  if (width <= 749 && parseFloat(metrics.footerBorderLeft || '0') > 0) errors.push('mobile footer column border present');
  if (width <= 749) {
    const heroGap = metrics.heroScene && metrics.heroCopy ? metrics.heroScene.top - metrics.heroCopy.bottom : Infinity;
    if (heroGap > 4) errors.push(`mobile hero copy/art gap ${heroGap.toFixed(1)}px`);
    if (!metrics.heroPicture || metrics.heroPicture.height > metrics.heroPicture.width) errors.push('mobile hero artwork is not tightly art-directed');
  }
  if (errors.length) failed = true;
  report.push({ name, width, height, metrics, errors });
  await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: false });
  await page.close();
}

await browser.close();
fs.writeFileSync(path.join(out, 'responsive-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.map(({ name, errors }) => ({ name, errors })), null, 2));
if (failed) process.exit(1);
