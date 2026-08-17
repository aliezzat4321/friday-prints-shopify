from pathlib import Path

header_path = Path('sections/friday-header.liquid')
s = header_path.read_text()

old = '''    body.fp-mobile-menu-open #MainContent,
    body.fp-mobile-menu-open .fp-footer{visibility:hidden!important}
'''
new = '''    body.fp-mobile-menu-open #MainContent,
    body.fp-mobile-menu-open .fp-footer,
    body.fp-mobile-menu-open .shopify-section-group-footer-group,
    body:has(#FridayHeader-{{ section.id }} .fp-menu[open]) #MainContent,
    body:has(#FridayHeader-{{ section.id }} .fp-menu[open]) .fp-footer,
    body:has(#FridayHeader-{{ section.id }} .fp-menu[open]) .shopify-section-group-footer-group{
      display:none!important;
    }
'''

if old not in s:
    raise SystemExit('Expected visibility bleed-through rule not found; refusing partial edit')

s = s.replace(old, new, 1)
header_path.write_text(s)
