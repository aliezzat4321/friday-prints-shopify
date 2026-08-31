import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const errors = [];
const notes = [];

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const stripJsonComments = (source) => source.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '');
const fail = (message) => errors.push(message);

const jsonFiles = [];
for (const directory of ['templates', 'sections', 'config']) {
  for (const name of fs.readdirSync(path.join(root, directory))) {
    if (!name.endsWith('.json')) continue;
    if (directory === 'sections' && !name.endsWith('-group.json')) continue;
    jsonFiles.push(`${directory}/${name}`);
  }
}

for (const file of jsonFiles) {
  try {
    JSON.parse(stripJsonComments(read(file)));
  } catch (error) {
    fail(`${file}: invalid JSON (${error.message})`);
  }
}

const liquidFiles = [];
for (const directory of ['sections', 'snippets', 'layout', 'templates']) {
  const absolute = path.join(root, directory);
  if (!fs.existsSync(absolute)) continue;
  for (const name of fs.readdirSync(absolute)) {
    if (name.endsWith('.liquid')) liquidFiles.push(`${directory}/${name}`);
  }
}

const balanceFiles = new Set([
  'sections/friday-at-home.liquid',
  'sections/friday-contact.liquid',
  'sections/friday-footer.liquid',
  'sections/friday-header.liquid',
  'sections/friday-hero.liquid',
  'sections/friday-newsletter.liquid',
  'sections/friday-page.liquid',
  'sections/friday-product.liquid',
  'sections/friday-video-stories.liquid'
]);

for (const file of liquidFiles) {
  const source = read(file);
  const schemaMatches = [...source.matchAll(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/g)];
  for (const [, schema] of schemaMatches) {
    try {
      JSON.parse(schema.trim());
    } catch (error) {
      fail(`${file}: invalid section schema (${error.message})`);
    }
  }

  if (!balanceFiles.has(file)) continue;
  const stack = [];
  const openers = new Set(['if', 'unless', 'case', 'for', 'form', 'capture', 'paginate', 'tablerow', 'comment', 'raw']);
  for (const match of source.matchAll(/{%\s*([^%]+?)\s*%}/g)) {
    const tag = match[1].trim().split(/\s+/)[0];
    if (openers.has(tag)) stack.push(tag);
    if (tag.startsWith('end') && openers.has(tag.slice(3))) {
      const expected = tag.slice(3);
      const actual = stack.pop();
      if (actual !== expected) fail(`${file}: Liquid block mismatch, expected end${actual || 'unknown'} but found ${tag}`);
    }
  }
  if (stack.length) fail(`${file}: unclosed Liquid block(s): ${stack.join(', ')}`);
}

const allText = [...jsonFiles, ...liquidFiles, 'assets/friday-cart-open.js'].map(read).join('\n');
if (/3[–-]5\s+working\s+days/i.test(allText)) fail('Old 3–5 working-day promise is still present.');

const indexSource = read('templates/index.json');
if (/"friday_films"|"type":\s*"friday-video-stories"/.test(indexSource)) {
  fail('templates/index.json: homepage unboxing/video story must remain removed.');
}

const required = [
  ['templates/index.json', /"title_top":\s*"friday"/i, 'brand-first home title'],
  ['templates/index.json', /"art_mode":\s*"print_stack"/, 'new layered print-stack hero'],
  ['templates/index.json', /"stack_primary":\s*"the-offering-copy"/, 'Kimono: Not Made for Speed hero primary print'],
  ['templates/index.json', /"stack_left":\s*"gigi-goes-to-the-jimjilbang"/, 'Jimjilbang hero left print'],
  ['templates/index.json', /"stack_right":\s*"small-car-big-plans-a4"/, 'Small Car hero right print'],
  ['templates/index.json', /"use_curated_scene":\s*true/, 'legacy hero retained for rollback'],
  ['templates/index.json', /"heading":\s*"meet GiGi"/, 'correct GiGi story casing'],
  ['templates/index.json', /"heading":\s*"postcards from GiGi"/, 'correct GiGi newsletter casing'],
  ['sections/header-group.json', /"nav_2_label":\s*"world of GiGi"/, 'world of GiGi desktop navigation label'],
  ['sections/footer-group.json', /"link_1_label":\s*"world of GiGi"/, 'world of GiGi footer navigation label'],
  ['sections/friday-hero.liquid', /"world_line"[\s\S]*"default":\s*"FROM THE WORLD OF GiGi"/, 'hero GiGi world-line casing'],
  ['sections/friday-hero.liquid', /fp-hero__scene--stack/, 'responsive layered hero scene'],
  ['sections/friday-hero.liquid', /value":\s*"legacy_curated"/, 'legacy hero editor option'],
  ['sections/friday-hero.liquid', /prefers-reduced-motion:reduce/, 'reduced-motion hero behavior'],
  ['sections/friday-hero.liquid', /fp-hero__scene--curated\{display:flex;align-items:center;justify-content:center;padding:20px 0\}/, 'legacy vertically centred hero artwork'],
  ['sections/friday-hero.liquid', /aspect-ratio:\s*6\/5/, 'legacy mobile hero artwork crop'],
  ['sections/friday-newsletter.liquid', /assign\s+fp_newsletter_heading\s*=\s*'postcards from GiGi'/, 'saved newsletter heading normalization'],
  ['sections/friday-product.liquid', /data-fp-next-edition/, 'next-edition product display'],
  ['sections/friday-product.liquid', /custom\.edition_total/, 'editable edition metafield support'],
  ['sections/friday-product.liquid', /fp_size_option_position\s*==\s*0 and fp_description_intro contains 'size: a3'/, 'safe single-size A3 description fallback'],
  ['sections/friday-product.liquid', /fp_size_option_position\s*==\s*0 and fp_description_intro contains 'size: a4'/, 'safe single-size A4 description fallback'],
  ['sections/friday-product.liquid', /product\.options_with_values/, 'Shopify Size option detection'],
  ['sections/friday-product.liquid', /fp_size_option_value_count\s*>\s*1/, 'multi-size-only selector rule'],
  ['sections/friday-product.liquid', /data-edition-total="\{\{\s*variant_edition_total/, 'variant-specific edition totals'],
  ['sections/friday-product.liquid', /data-next-edition="\{\{\s*variant_next_edition/, 'variant-specific next edition numbers'],
  ['sections/friday-product.liquid', /fp-pdp__edition-preview\[hidden\]\{display:none\}/, 'edition preview hidden state'],
  ['sections/friday-product.liquid', /fp-pdp__unbox/, 'product-page unboxing film'],
  ['sections/friday-video-stories.liquid', /"max_blocks":\s*3/, 'video-story section remains available outside homepage'],
  ['sections/friday-video-stories.liquid', /IntersectionObserver/, 'in-view video playback'],
  ['sections/friday-at-home.liquid', /fp-at-home__shop-label/, 'shoppable Friday at Home scenes'],
  ['sections/friday-at-home.liquid', /font-family:var\(--fp-display-font/, 'Friday at Home display typography'],
  ['sections/friday-contact.liquid', /form\s+'contact'/, 'Shopify contact form'],
  ['sections/footer-group.json', /"link_2_url":\s*"\/pages\/contact"/, 'footer contact route'],
  ['sections/friday-header.liquid', /fp-menu[\s\S]*fp-logo/, 'mobile menu before centred logo'],
  ['sections/friday-header.liquid', /fp-logo--mark/, 'centred GiGi brand mark'],
  ['assets/friday-production.css', /--fp-display-font:/, 'display typography token'],
  ['assets/friday-production.css', /--fp-ui-font:/, 'utility typography token'],
  ['assets/friday-design-contract.css', /\.fp-site-header \.fp-gigi-editor-placeholder[\s\S]*display:none!important/, 'hidden editor GiGi helper'],
  ['assets/friday-design-contract.css', /\.fp-hero__world[\s\S]*text-transform:none!important/, 'hero GiGi casing protection'],
  ['assets/friday-design-contract.css', /\.fp-newsletter h2::first-letter[\s\S]*text-transform:lowercase!important/, 'newsletter lowercase title guard'],
  ['assets/friday-design-contract.css', /font-size:52px!important/, 'shared desktop section-title scale'],
  ['snippets/stylesheets.liquid', /friday-design-contract\.css/, 'final design contract stylesheet']
];

for (const [file, pattern, label] of required) {
  if (!pattern.test(read(file))) fail(`${file}: missing ${label}.`);
}

const stylesheetLoader = read('snippets/stylesheets.liquid');
for (const legacy of ['friday-home-compression.css','friday-responsive-consistency.css','friday-hero-viewport-cap.css']) {
  if (stylesheetLoader.includes(legacy)) fail(`snippets/stylesheets.liquid: legacy conflicting layer ${legacy} is still loaded.`);
}
if (stylesheetLoader.lastIndexOf('friday-design-contract.css') < stylesheetLoader.lastIndexOf('friday-production.css')) {
  fail('snippets/stylesheets.liquid: final design contract must load after production CSS.');
}

// Human-facing GiGi casing is enforced by the explicit content contracts above and
// by browser QA. Do not regex-scan technical identifiers/product handles such as
// `gigi-goes-to-the-jimjilbang`, CSS classes, Liquid variables or schema IDs.

for (const file of ['assets/friday-hero-clean.webp', 'assets/friday-hero-clean-mobile.webp']) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) fail(`${file}: missing optimized hero asset.`);
  else {
    const bytes = fs.statSync(absolute).size;
    if (bytes > 180_000) fail(`${file}: ${bytes} bytes is too large for the hero budget.`);
    else notes.push(`${file}: ${(bytes / 1024).toFixed(1)} KB`);
  }
}

const unboxingVideo = path.join(root, 'assets/friday-unboxing.mp4');
if (!fs.existsSync(unboxingVideo)) fail('Missing optimized unboxing video.');
else if (fs.statSync(unboxingVideo).size > 5 * 1024 * 1024) fail('Unboxing video exceeds the 5 MB performance budget.');

if (errors.length) {
  console.error(`Friday theme check failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Friday theme check passed: ${jsonFiles.length} JSON files and ${liquidFiles.length} Liquid files checked.`);
for (const note of notes) console.log(`- ${note}`);
