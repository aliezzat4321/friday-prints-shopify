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

const required = [
  ['templates/index.json', /"title_top":\s*"friday"/i, 'brand-first home title'],
  ['templates/index.json', /"use_curated_scene":\s*true/, 'clean hero artwork switch'],
  ['templates/index.json', /"show_section":\s*true/, 'homepage unboxing enabled'],
  ['templates/index.json', /"heading":\s*"meet GiGi"/, 'correct GiGi story casing'],
  ['templates/index.json', /"heading":\s*"postcards from GiGi"/, 'correct GiGi newsletter casing'],
  ['sections/header-group.json', /"nav_2_label":\s*"GiGi"/, 'GiGi desktop navigation label'],
  ['sections/footer-group.json', /"link_1_label":\s*"GiGi"/, 'GiGi footer navigation label'],
  ['sections/friday-hero.liquid', /aspect-ratio:\s*6\/5/, 'tight mobile hero artwork crop'],
  ['sections/friday-hero.liquid', /object-fit:\s*cover/, 'mobile hero artwork fill'],
  ['sections/friday-product.liquid', /data-fp-next-edition/, 'next-edition product display'],
  ['sections/friday-product.liquid', /custom\.edition_total/, 'editable edition metafield support'],
  ['sections/friday-product.liquid', /fp_description_intro contains 'size: a3'/, 'single-size A3 description fallback'],
  ['sections/friday-product.liquid', /fp_description_intro contains 'size: a4'/, 'single-size A4 description fallback'],
  ['sections/friday-product.liquid', /product\.options_with_values/, 'Shopify Size option detection'],
  ['sections/friday-product.liquid', /fp_size_option_value_count\s*>\s*1/, 'multi-size-only selector rule'],
  ['sections/friday-product.liquid', /data-edition-total="\{\{\s*variant_edition_total/, 'variant-specific edition totals'],
  ['sections/friday-product.liquid', /data-next-edition="\{\{\s*variant_next_edition/, 'variant-specific next edition numbers'],
  ['sections/friday-product.liquid', /fp-pdp__edition-preview\[hidden\]\{display:none\}/, 'edition preview hidden state'],
  ['sections/friday-product.liquid', /fp-pdp__unbox/, 'product unboxing film'],
  ['sections/friday-video-stories.liquid', /"max_blocks":\s*3/, 'three-film homepage editor limit'],
  ['sections/friday-video-stories.liquid', /IntersectionObserver/, 'in-view video playback'],
  ['sections/friday-at-home.liquid', /fp-at-home__shop-label/, 'shoppable Friday at Home scenes'],
  ['sections/friday-at-home.liquid', /font-family:var\(--fp-display-font/, 'Friday at Home display typography'],
  ['templates/index.json', /"friday_films"/, 'homepage video story placement'],
  ['sections/friday-contact.liquid', /form\s+'contact'/, 'Shopify contact form'],
  ['sections/footer-group.json', /"link_2_url":\s*"\/pages\/contact"/, 'footer contact route'],
  ['sections/friday-header.liquid', /fp-menu[\s\S]*fp-logo/, 'mobile menu before centred logo'],
  ['sections/friday-header.liquid', /fp-logo--mark/, 'centred GiGi brand mark'],
  ['assets/friday-production.css', /--fp-display-font:/, 'display typography token'],
  ['assets/friday-production.css', /--fp-ui-font:/, 'utility typography token'],
  ['assets/friday-production.css', /\.fp-nav__links,[\s\S]*text-transform:none!important/, 'authored casing preservation'],
  ['snippets/stylesheets.liquid', /friday-production\.css/, 'authoritative Friday production stylesheet']
];

for (const [file, pattern, label] of required) {
  if (!pattern.test(read(file))) fail(`${file}: missing ${label}.`);
}

const stylesheetLoader = read('snippets/stylesheets.liquid');
for (const legacy of ['friday-home-compression.css','friday-responsive-consistency.css','friday-hero-viewport-cap.css']) {
  if (stylesheetLoader.includes(legacy)) fail(`snippets/stylesheets.liquid: legacy conflicting layer ${legacy} is still loaded.`);
}

const casingFiles = [
  'templates/index.json',
  'sections/header-group.json',
  'sections/footer-group.json',
  'sections/friday-hero.liquid',
  'sections/friday-story.liquid',
  'sections/friday-newsletter.liquid',
  'sections/friday-page.liquid'
];
for (const file of casingFiles) {
  const source = read(file).replaceAll('GiGi','');
  const bad = source.match(/(^|[^A-Za-z])(?:Gigi|gigi)(?=[^A-Za-z]|$)/);
  if (bad) fail(`${file}: non-standard GiGi casing remains.`);
}

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
