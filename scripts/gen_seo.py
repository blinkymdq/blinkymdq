#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genera una pagina SEO estatica por producto a partir de producto.html
Se ejecuta en GitHub Actions (o localmente). Lee los productos en vivo desde
Supabase (clave anon, solo lectura) y escribe:
  - /p/<slug>-<codigo>.html   (una pagina por producto, con meta/OG/JSON-LD horneado)
  - /producto.css  /producto.js   (estilos y logica compartidos)
  - /sitemap.xml   /robots.txt
No modifica producto.html (lo usa solo como plantilla).
"""
import re, json, os, sys, unicodedata, urllib.request

SITE   = 'https://blinkymdq.com'
SUPA   = 'https://fcaytkwcypktvrmerexp.supabase.co'
ANON   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjYXl0a3djeXBrdHZybWVyZXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MDU1OTYsImV4cCI6MjA5NzM4MTU5Nn0.7GiUl0o_B3dAnpE2x98sBqtC0eY9HoM6p67fOBghoJY'
ROOT   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # raiz del repo
TEMPLATE = os.path.join(ROOT, 'producto.html')

def fetch_productos():
    url = (f"{SUPA}/rest/v1/productos?select=codigo,nombre,marca,categoria,"
           f"precio_publico,stock,descripcion,foto,estado&order=codigo")
    req = urllib.request.Request(url, headers={'apikey': ANON, 'Authorization': 'Bearer ' + ANON})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)

def img_url(foto, sz=1200):
    if not foto or not str(foto).strip(): return ''
    f = str(foto).split(',')[0].strip()
    if f.upper() in ('#N/A', 'N/A', 'NULL'): return ''
    if f.startswith('http'): return f
    if 'id=' in f: return f"https://drive.google.com/thumbnail?id={f.split('id=')[1].split('&')[0]}&sz={sz}"
    return f"https://blinkymdq.com/Productos/{f}.jpg"

def slug(s):
    s = unicodedata.normalize('NFKD', str(s)).encode('ascii', 'ignore').decode()
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s).strip('-').lower()
    return re.sub(r'-+', '-', s)[:60].strip('-') or 'producto'

def esc(s):
    return (str(s if s is not None else '').replace('&', '&amp;').replace('<', '&lt;')
            .replace('>', '&gt;').replace('"', '&quot;'))

def fmt_precio(v):
    try: return '$' + format(int(round(float(v))), ',d').replace(',', '.')
    except Exception: return ''

# Shim: si la pagina define window.__COD__, hacemos que cualquier lectura de
# ?cod= / ?codigo= devuelva ese codigo, SIN modificar la URL (queda limpia).
SHIM = ("(function(){try{if(!window.__COD__)return;var g=URLSearchParams.prototype.get;"
        "URLSearchParams.prototype.get=function(k){var v=g.call(this,k);"
        "if((v==null||v==='')&&(k==='cod'||k==='codigo'))return window.__COD__;return v;};}catch(e){}})();\n")

def main():
    if not os.path.exists(TEMPLATE):
        print("ERROR: no se encontro producto.html en la raiz del repo", file=sys.stderr); sys.exit(1)
    h = open(TEMPLATE, encoding='utf-8').read()

    # extraer estilos y scripts inline (todos, en orden)
    css = '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>', h, re.S))
    inline = re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', h, re.S)
    js = SHIM + '\n;\n'.join(inline)

    open(os.path.join(ROOT, 'producto.css'), 'w', encoding='utf-8').write(css)
    open(os.path.join(ROOT, 'producto.js'), 'w', encoding='utf-8').write(js)

    # armar shell: css -> link, sacar styles restantes, sacar scripts inline, marcar preview
    shell = re.sub(r'<style[^>]*>.*?</style>', '<link rel="stylesheet" href="../producto.css">', h, count=1, flags=re.S)
    shell = re.sub(r'<style[^>]*>.*?</style>', '', shell, flags=re.S)
    shell = re.sub(r'<script(?![^>]*\bsrc=)[^>]*>.*?</script>', '', shell, flags=re.S)
    shell = re.sub(r'(<div id="contenido">).*?(</div>\s*</div>)', r'\1__PREVIEW__</div></div>', shell, count=1, flags=re.S)
    if '__PREVIEW__' not in shell:
        shell = shell.replace('<div id="contenido">', '<div id="contenido">__PREVIEW__', 1)
    # insertar los scripts compartidos antes de </body>
    shell = shell.replace('</body>', '__INLINE_JS__\n</body>', 1)

    pdir = os.path.join(ROOT, 'p')
    os.makedirs(pdir, exist_ok=True)
    for old in os.listdir(pdir):
        if old.endswith('.html'):
            os.remove(os.path.join(pdir, old))

    prods = fetch_productos()
    sm = ['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          f'  <url><loc>{SITE}/</loc><priority>1.0</priority></url>']
    seen = set(); count = 0
    for p in prods:
        if (p.get('estado') or '').lower() == 'inactivo': continue
        if (p.get('nombre') or '').strip().upper() in ('PRUEBA', 'TEST'): continue
        cod = str(p['codigo']); nombre = p['nombre']; marca = p.get('marca') or ''
        precio = fmt_precio(p.get('precio_publico'))
        instock = bool(p.get('stock')) and int(p.get('stock') or 0) > 0
        img = img_url(p.get('foto')) or f"{SITE}/blinkysinfondo.png"
        desc_raw = re.sub(r'\s+', ' ', (p.get('descripcion') or '')).strip()
        meta_desc = (desc_raw[:155] if desc_raw else
                     f"Compra {nombre} en Blinky MDQ. {(precio + '. ') if precio else ''}"
                     f"Envios a todo el pais y retiro en Mar del Plata.")[:160]
        sg = slug(nombre); fname = f"{sg}-{cod}.html"
        if fname in seen: fname = f"{sg}-{cod}-x.html"
        seen.add(fname)
        canonical = f"{SITE}/p/{fname}"; titulo = f"{nombre} - Blinky MDQ"

        ld = {"@context": "https://schema.org/", "@type": "Product", "name": nombre,
              "image": [img], "description": (desc_raw or nombre), "sku": cod, "mpn": cod}
        if marca: ld["brand"] = {"@type": "Brand", "name": marca}
        try: price = str(int(round(float(p.get('precio_publico') or 0))))
        except Exception: price = '0'
        ld["offers"] = {"@type": "Offer", "url": canonical, "priceCurrency": "ARS", "price": price,
                        "availability": "https://schema.org/InStock" if instock else "https://schema.org/OutOfStock",
                        "itemCondition": "https://schema.org/NewCondition",
                        "seller": {"@type": "Organization", "name": "Blinky MDQ"}}
        ldjson = json.dumps(ld, ensure_ascii=False)

        head_extra = (
            f'<link rel="canonical" href="{canonical}">\n'
            f'<meta name="description" content="{esc(meta_desc)}">\n'
            f'<meta property="product:price:amount" content="{price}">\n'
            f'<meta property="product:price:currency" content="ARS">\n'
            f'<meta name="twitter:card" content="summary_large_image">\n'
            f'<meta name="twitter:title" content="{esc(titulo)}">\n'
            f'<meta name="twitter:description" content="{esc(meta_desc)}">\n'
            f'<meta name="twitter:image" content="{esc(img)}">\n'
            f'<script type="application/ld+json">{ldjson}</script>')
        preview = (
            f'<div class="layout"><div class="galeria-wrap"><div class="galeria">'
            f'<img src="{esc(img)}" alt="{esc(nombre)}" style="width:100%;height:100%;object-fit:contain;"></div></div>'
            f'<div class="info-card">'
            + (f'<div class="marca">{esc(marca)}</div>' if marca else '')
            + f'<h1 class="nombre">{esc(nombre)}</h1>'
            + (f'<div class="codigo-row">Cod. {esc(cod)}</div>' if cod else '')
            + (f'<div class="precio">{precio}</div>' if (instock and precio) else '')
            + f'<div class="{ "en-stock" if instock else "sin-stock" }">{"Disponible" if instock else "Sin stock"}</div>'
            + (f'<div class="descripcion-texto" style="margin-top:14px;">{esc(desc_raw)}</div>' if desc_raw else '')
            + '</div></div>')

        page = shell
        page = page.replace('<title>Blinky MDQ</title>', f'<title>{esc(titulo)}</title>\n{head_extra}')
        page = page.replace('content="Blinky MDQ"', f'content="{esc(nombre)}"')
        page = page.replace('content="Perfumes, cosméticos y electrónica en Mar del Plata"', f'content="{esc(meta_desc)}"')
        page = page.replace('content="https://blinkymdq.com/blinkysinfondo.png"', f'content="{esc(img)}"')
        page = page.replace('content="https://blinkymdq.com"', f'content="{canonical}"')
        page = page.replace('__PREVIEW__', preview)
        page = page.replace('__INLINE_JS__', f'<script>window.__COD__="{cod}";</script>\n<script src="../producto.js"></script>')

        open(os.path.join(pdir, fname), 'w', encoding='utf-8').write(page)
        sm.append(f'  <url><loc>{canonical}</loc><changefreq>weekly</changefreq></url>')
        count += 1

    sm.append('</urlset>')
    open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8').write('\n'.join(sm))
    open(os.path.join(ROOT, 'robots.txt'), 'w', encoding='utf-8').write(
        f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")
    print(f"OK - {count} paginas generadas")

if __name__ == '__main__':
    main()
