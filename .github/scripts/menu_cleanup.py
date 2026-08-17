from pathlib import Path

header_path = Path('sections/friday-header.liquid')
s = header_path.read_text()

replacements = [
    (
'''    #FridayHeader-{{ section.id }}:has(.fp-menu[open]) .fp-logo{
      visibility:hidden!important;
    }''',
'''    #FridayHeader-{{ section.id }}.fp-menu-is-open .fp-logo{
      position:fixed!important;
      left:var(--fp-menu-logo-left)!important;
      top:var(--fp-menu-logo-top)!important;
      width:var(--fp-menu-logo-width)!important;
      height:var(--fp-menu-logo-height)!important;
      z-index:1004!important;
    }'''
    ),
    (
'''    #FridayHeader-{{ section.id }} .fp-mobile-menu{
      padding-top:108px!important;
    }
    #FridayHeader-{{ section.id }} .fp-mobile-menu__brand{
      position:absolute;
      top:24px;
      left:22px;
      display:flex;
      flex-direction:column;
      width:max-content;
      color:var(--fp-ink)!important;
      text-decoration:none!important;
      font:700 46px/.72 "Courier New",Courier,monospace;
      letter-spacing:-.075em;
      text-transform:lowercase;
      z-index:1;
    }
    #FridayHeader-{{ section.id }} .fp-mobile-menu__brand small{
      margin-top:8px;
      font-size:10px;
      line-height:1;
      letter-spacing:-.01em;
    }
    #FridayHeader-{{ section.id }} .fp-mobile-menu__links{
      display:flex;
      flex:0 0 auto;
      flex-direction:column;
      justify-content:flex-start;
      padding:52px 0 18px;
      counter-reset:fpMenuLink;
    }''',
'''    #FridayHeader-{{ section.id }} .fp-mobile-menu{
      padding-top:112px!important;
    }
    #FridayHeader-{{ section.id }} .fp-mobile-menu__links{
      display:flex;
      flex:0 0 auto;
      flex-direction:column;
      justify-content:flex-start;
      padding:24px 0 18px;
      counter-reset:fpMenuLink;
    }'''
    ),
    (
'''      text-transform:lowercase!important;''',
'''      text-transform:none!important;'''
    ),
    (
'''  @media (max-width: 360px){
    #FridayHeader-{{ section.id }} .fp-mobile-menu{padding:102px 18px 20px!important}
    #FridayHeader-{{ section.id }} .fp-mobile-menu__brand{top:20px;left:18px;font-size:40px}
    #FridayHeader-{{ section.id }} .fp-mobile-menu__links{padding-top:42px}
    #FridayHeader-{{ section.id }} .fp-mobile-menu__links>a{font-size:30px!important;padding:10px 0!important}
  }''',
'''  @media (max-width: 360px){
    #FridayHeader-{{ section.id }} .fp-mobile-menu{padding:102px 18px 20px!important}
    #FridayHeader-{{ section.id }} .fp-mobile-menu__links{padding-top:20px}
    #FridayHeader-{{ section.id }} .fp-mobile-menu__links>a{font-size:30px!important;padding:10px 0!important}
  }'''
    ),
    (
'''          <nav class="fp-mobile-menu" aria-label="{{ section.settings.mobile_navigation_label | escape }}">
            <a class="fp-mobile-menu__brand" href="{{ routes.root_url }}" aria-label="{{ section.settings.logo_alt | escape }}">
              <span>{{ section.settings.logo_text }}</span>
              {% if section.settings.logo_subtext != blank %}<small>{{ section.settings.logo_subtext }}</small>{% endif %}
            </a>
            <div class="fp-mobile-menu__links">''',
'''          <nav class="fp-mobile-menu" aria-label="{{ section.settings.mobile_navigation_label | escape }}">
            <div class="fp-mobile-menu__links">'''
    ),
    (
'''{% for link in section.settings.main_menu.links %}<a href="{{ link.url }}">{{ link.title }}</a>{% endfor %}''',
'''{% for link in section.settings.main_menu.links %}<a href="{{ link.url }}">{{ link.title | replace: 'world of gigi', 'World of GiGi' }}</a>{% endfor %}'''
    ),
    (
'''            <div class="fp-mobile-menu__bottom">
              <p>limited-edition prints · made to order in Egypt</p>
            </div>''',
'''            {% if section.settings.mobile_menu_note != blank %}
              <div class="fp-mobile-menu__bottom">
                <p>{{ section.settings.mobile_menu_note }}</p>
              </div>
            {% endif %}'''
    ),
    (
'''    const summary = menu.querySelector('summary');
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
    pinMenuButton();''',
'''    const summary = menu.querySelector('summary');
    const logo = root.querySelector('.fp-logo');
    const pinMenuChrome = () => {
      if (!summary || menu.open) return;
      const rect = summary.getBoundingClientRect();
      root.style.setProperty('--fp-menu-button-left', `${rect.left}px`);
      root.style.setProperty('--fp-menu-button-top', `${rect.top}px`);
      root.style.setProperty('--fp-menu-button-width', `${rect.width}px`);
      root.style.setProperty('--fp-menu-button-height', `${rect.height}px`);
      if (logo) {
        const logoRect = logo.getBoundingClientRect();
        root.style.setProperty('--fp-menu-logo-left', `${logoRect.left}px`);
        root.style.setProperty('--fp-menu-logo-top', `${logoRect.top}px`);
        root.style.setProperty('--fp-menu-logo-width', `${logoRect.width}px`);
        root.style.setProperty('--fp-menu-logo-height', `${logoRect.height}px`);
      }
    };
    summary?.addEventListener('pointerdown', pinMenuChrome);
    summary?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') pinMenuChrome();
    });
    window.addEventListener('resize', pinMenuChrome, { passive: true });
    pinMenuChrome();'''
    ),
    (
'''      document.documentElement.classList.toggle('fp-mobile-menu-open', menu.open);
      document.body.classList.toggle('fp-mobile-menu-open', menu.open);
      if (summary) summary.setAttribute('aria-label', menu.open ? 'Close menu' : {{ section.settings.menu_open_label | json }});''',
'''      document.documentElement.classList.toggle('fp-mobile-menu-open', menu.open);
      document.body.classList.toggle('fp-mobile-menu-open', menu.open);
      root.classList.toggle('fp-menu-is-open', menu.open);
      if (summary) summary.setAttribute('aria-label', menu.open ? 'Close menu' : {{ section.settings.menu_open_label | json }});'''
    ),
    (
'''    { "type": "text", "id": "menu_open_label", "label": "Menu button accessibility label", "default": "Open menu" },''',
'''    { "type": "text", "id": "menu_open_label", "label": "Menu button accessibility label", "default": "Open menu" },
    { "type": "text", "id": "mobile_menu_note", "label": "Mobile menu footer note", "default": "LIMITED-EDITION PRINTS · MADE TO ORDER IN EGYPT" },'''
    ),
]

for old, new in replacements:
    if old not in s:
        raise SystemExit('Expected menu block not found; refusing partial edit: ' + old[:180])
    s = s.replace(old, new, 1)

# Apply the same GiGi casing correction to the desktop Shopify-menu loop while preserving editability.
desktop_old = '''            <a href="{{ link.url }}"{% if link.current %} class="is-active" aria-current="page"{% endif %}>{{ link.title }}</a>'''
desktop_new = '''            <a href="{{ link.url }}"{% if link.current %} class="is-active" aria-current="page"{% endif %}>{{ link.title | replace: 'world of gigi', 'World of GiGi' }}</a>'''
if desktop_old not in s:
    raise SystemExit('Desktop menu loop not found; refusing partial edit')
s = s.replace(desktop_old, desktop_new, 1)

header_path.write_text(s)
