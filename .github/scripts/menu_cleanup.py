from pathlib import Path

header_path = Path('sections/friday-header.liquid')
s = header_path.read_text()

replacements = [
    (
'''    #FridayHeader-{{ section.id }}:has(.fp-menu[open]) .fp-logo{
      position:relative;
      z-index:1004!important;
    }''',
'''    #FridayHeader-{{ section.id }}:has(.fp-menu[open]) .fp-logo{
      visibility:hidden!important;
    }'''
    ),
    (
'''    #FridayHeader-{{ section.id }} .fp-mobile-menu{
      padding-top:112px!important;
    }
    #FridayHeader-{{ section.id }} .fp-mobile-menu__links{
      display:flex;
      flex:1 0 auto;
      flex-direction:column;
      justify-content:center;
      padding:24px 0 18px;
      counter-reset:fpMenuLink;
    }''',
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
    }'''
    ),
    (
'''    #FridayHeader-{{ section.id }} .fp-mobile-menu__bottom{
      display:block;
      padding-top:14px;
      border-top:1px solid color-mix(in srgb,var(--fp-ink) 16%,transparent);
    }''',
'''    #FridayHeader-{{ section.id }} .fp-mobile-menu__bottom{
      display:block;
      margin-top:auto;
      padding-top:18px;
      border-top:0;
    }'''
    ),
    (
'''  @media (max-width: 360px){
    #FridayHeader-{{ section.id }} .fp-mobile-menu{padding:112px 18px 20px!important}
    #FridayHeader-{{ section.id }} .fp-mobile-menu__links>a{font-size:30px!important;padding:10px 0!important}
  }''',
'''  @media (max-width: 360px){
    #FridayHeader-{{ section.id }} .fp-mobile-menu{padding:102px 18px 20px!important}
    #FridayHeader-{{ section.id }} .fp-mobile-menu__brand{top:20px;left:18px;font-size:40px}
    #FridayHeader-{{ section.id }} .fp-mobile-menu__links{padding-top:42px}
    #FridayHeader-{{ section.id }} .fp-mobile-menu__links>a{font-size:30px!important;padding:10px 0!important}
  }'''
    ),
    (
'''          <nav class="fp-mobile-menu" aria-label="{{ section.settings.mobile_navigation_label | escape }}">
            <div class="fp-mobile-menu__links">''',
'''          <nav class="fp-mobile-menu" aria-label="{{ section.settings.mobile_navigation_label | escape }}">
            <a class="fp-mobile-menu__brand" href="{{ routes.root_url }}" aria-label="{{ section.settings.logo_alt | escape }}">
              <span>{{ section.settings.logo_text }}</span>
              {% if section.settings.logo_subtext != blank %}<small>{{ section.settings.logo_subtext }}</small>{% endif %}
            </a>
            <div class="fp-mobile-menu__links">'''
    ),
]

for old, new in replacements:
    if old not in s:
        raise SystemExit('Expected menu block not found; refusing partial edit: ' + old[:150])
    s = s.replace(old, new, 1)

header_path.write_text(s)
