from pathlib import Path

header_path = Path('sections/friday-header.liquid')
s = header_path.read_text()

replacements = [
    (
'''    html.fp-mobile-menu-open,
    body.fp-mobile-menu-open{overflow:hidden!important;overscroll-behavior:none}
''',
'''    html.fp-mobile-menu-open,
    body.fp-mobile-menu-open{overflow:hidden!important;overscroll-behavior:none}
    body.fp-mobile-menu-open #MainContent,
    body.fp-mobile-menu-open .fp-footer{visibility:hidden!important}
    #FridayHeader-{{ section.id }}.fp-menu-is-open{
      z-index:2147483000!important;
      isolation:isolate!important;
    }
'''
    ),
    (
'''      z-index:1004!important;
    }
    #FridayHeader-{{ section.id }}.fp-menu-is-open .fp-logo{''',
'''      z-index:2147483002!important;
    }
    #FridayHeader-{{ section.id }}.fp-menu-is-open .fp-logo{'''
    ),
    (
'''      z-index:1004!important;
    }
    #FridayHeader-{{ section.id }} .fp-menu[open]>summary i:first-child''',
'''      z-index:2147483002!important;
    }
    #FridayHeader-{{ section.id }} .fp-menu[open]>summary i:first-child'''
    ),
    (
'''      z-index:1002!important;
      opacity:0;''',
'''      z-index:2147483001!important;
      opacity:0;'''
    ),
    (
'''    #FridayHeader-{{ section.id }} .fp-mobile-menu__links{
      display:flex;
      flex:0 0 auto;
      flex-direction:column;
      justify-content:flex-start;
      padding:24px 0 18px;
      counter-reset:fpMenuLink;
    }''',
'''    #FridayHeader-{{ section.id }} .fp-mobile-menu__links{
      display:flex;
      flex:0 0 auto!important;
      flex-direction:column;
      justify-content:flex-start!important;
      margin:0!important;
      padding:18px 0 14px!important;
      counter-reset:fpMenuLink;
    }'''
    ),
    (
'''    #FridayHeader-{{ section.id }} .fp-mobile-menu__bottom{
      display:block;
      margin-top:auto;
      padding-top:18px;
      border-top:0;
    }''',
'''    #FridayHeader-{{ section.id }} .fp-mobile-menu__bottom{
      display:block;
      margin-top:auto;
      padding-top:10px;
      border-top:0;
    }'''
    ),
    (
'''    #FridayHeader-{{ section.id }} .fp-mobile-menu__links{padding-top:20px}
''',
'''    #FridayHeader-{{ section.id }} .fp-mobile-menu__links{padding-top:12px!important}
'''
    ),
    (
'''    document.addEventListener('shopify:section:unload', (event) => { if (event.target?.contains(root)) { document.documentElement.classList.remove('fp-mobile-menu-open'); document.body.classList.remove('fp-mobile-menu-open'); } });''',
'''    document.addEventListener('shopify:section:unload', (event) => { if (event.target?.contains(root)) { document.documentElement.classList.remove('fp-mobile-menu-open'); document.body.classList.remove('fp-mobile-menu-open'); root.classList.remove('fp-menu-is-open'); } });'''
    ),
]

for old, new in replacements:
    if old not in s:
        raise SystemExit('Expected current menu block not found; refusing partial edit: ' + old[:180])
    s = s.replace(old, new, 1)

header_path.write_text(s)
