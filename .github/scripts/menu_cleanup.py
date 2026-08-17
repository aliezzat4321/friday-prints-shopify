from pathlib import Path

header_path = Path('sections/friday-header.liquid')
s = header_path.read_text()

replacements = [
    (
'''    #FridayHeader-{{ section.id }} .fp-menu[open]>summary{
      position:relative!important;
      z-index:1004!important;
    }''',
'''    #FridayHeader-{{ section.id }} .fp-menu[open]>summary{
      position:fixed!important;
      left:var(--fp-menu-button-left)!important;
      top:var(--fp-menu-button-top)!important;
      width:var(--fp-menu-button-width)!important;
      height:var(--fp-menu-button-height)!important;
      z-index:1004!important;
    }
    #FridayHeader-{{ section.id }}:has(.fp-menu[open]) .fp-logo{
      position:relative;
      z-index:1004!important;
    }'''
    ),
    (
'''      transform:translateY(-10px);
      transition:opacity .24s ease,transform .3s cubic-bezier(.2,.7,.2,1),visibility 0s linear .3s;''',
'''      transition:opacity .18s ease,visibility 0s linear .18s;'''
    ),
    (
'''      transform:none;
      transition:opacity .24s ease,transform .3s cubic-bezier(.2,.7,.2,1),visibility 0s;''',
'''      transition:opacity .18s ease,visibility 0s;'''
    ),
    (
'''    #FridayHeader-{{ section.id }} .fp-mobile-menu__top{
      min-height:76px;
      display:flex;
      align-items:flex-start;
      justify-content:flex-end;
      padding:5px 54px 18px 0;
      border-bottom:1px solid var(--fp-ink);
    }
    #FridayHeader-{{ section.id }} .fp-mobile-menu__index{
      padding-top:5px;
      color:var(--fp-red);
      font:700 9px/1 "Courier New",monospace;
      letter-spacing:.1em;
      text-transform:uppercase;
    }''',
'''    #FridayHeader-{{ section.id }} .fp-mobile-menu{
      padding-top:112px!important;
    }'''
    ),
    (
'''      border-top:1px solid var(--fp-ink);''',
'''      border-top:1px solid color-mix(in srgb,var(--fp-ink) 16%,transparent);'''
    ),
    (
'''    #FridayHeader-{{ section.id }} .fp-mobile-menu__top{min-height:64px}
''',
''''''
    ),
    (
'''            <div class="fp-mobile-menu__top">
              <span class="fp-mobile-menu__index">menu / 01</span>
            </div>
''',
''''''
    ),
    (
'''    const menu = root.querySelector('.fp-menu');
    if (!menu) return;
    const sync = () => {''',
'''    const menu = root.querySelector('.fp-menu');
    if (!menu) return;
    const summary = menu.querySelector('summary');
    const pinMenuButton = () => {
      if (!summary || menu.open) return;
      const rect = summary.getBoundingClientRect();
      root.style.setProperty('--fp-menu-button-left', `${rect.left}px`);
      root.style.setProperty('--fp-menu-button-top', `${rect.top}px`);
      root.style.setProperty('--fp-menu-button-width', `${rect.width}px`);
      root.style.setProperty('--fp-menu-button-height', `${rect.height}px`);
    };
    summary?.addEventListener('pointerdown', pinMenuButton);
    summary?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') pinMenuButton();
    });
    window.addEventListener('resize', pinMenuButton, { passive: true });
    pinMenuButton();
    const sync = () => {'''
    ),
    (
'''      const summary = menu.querySelector('summary');
      if (summary) summary.setAttribute('aria-label', menu.open ? 'Close menu' : {{ section.settings.menu_open_label | json }});''',
'''      if (summary) summary.setAttribute('aria-label', menu.open ? 'Close menu' : {{ section.settings.menu_open_label | json }});'''
    ),
]

for old, new in replacements:
    if old not in s:
        raise SystemExit('Expected header block not found; refusing partial edit: ' + old[:160])
    s = s.replace(old, new, 1)

header_path.write_text(s)
