from pathlib import Path

header_path = Path('sections/friday-header.liquid')
s = header_path.read_text()

old = '''  @media (max-width: 360px){
    #FridayHeader-{{ section.id }} .fp-mobile-menu{padding:16px 18px 20px!important}
    #FridayHeader-{{ section.id }} .fp-mobile-menu__links>a{font-size:30px!important;padding:10px 0!important}
  }'''
new = '''  @media (max-width: 360px){
    #FridayHeader-{{ section.id }} .fp-mobile-menu{padding:112px 18px 20px!important}
    #FridayHeader-{{ section.id }} .fp-mobile-menu__links>a{font-size:30px!important;padding:10px 0!important}
  }'''

if old not in s:
    raise SystemExit('Expected 360px menu block not found; refusing partial edit')

header_path.write_text(s.replace(old, new, 1))
