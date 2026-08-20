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
from urllib.parse import quote

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
    # Navegaciones internas relativas (breadcrumb, menu de marcas/categorias, buscador,
    # login, carrito) deben apuntar a la raiz, no a /p/. Cubrimos las formas usadas:
    #   href="index.html...", 'index.html', `index.html?...`
    js = (js
          .replace('href="index.html', 'href="/index.html')
          .replace("href='index.html", "href='/index.html")
          .replace("'index.html'", "'/index.html'")
          .replace('"index.html"', '"/index.html"')
          .replace('`index.html?', '`/index.html?')
          .replace("'index.html?", "'/index.html?"))

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
    # Como las paginas viven en /p/, todo lo relativo (logo, back.webp, favicon, menu
    # de marcas/categorias, etc.) debe resolver desde la raiz. <base href="/"> lo hace
    # de forma universal, incluidas las navegaciones por JS.
    if re.search(r'<meta charset', shell, re.I):
        shell = re.sub(r'(<meta charset[^>]*>)', r'\1\n<base href="/">', shell, count=1, flags=re.I)
    else:
        shell = re.sub(r'(<head[^>]*>)', r'\1\n<base href="/">', shell, count=1, flags=re.I)

    pdir = os.path.join(ROOT, 'p')
    os.makedirs(pdir, exist_ok=True)
    for old in os.listdir(pdir):
        if old.endswith('.html'):
            os.remove(os.path.join(pdir, old))

    prods = fetch_productos()

    # carpetas de categoria y marca (se limpian y regeneran en cada corrida)
    cats = {}; marcas = {}
    cdir = os.path.join(ROOT, 'categoria'); mdir = os.path.join(ROOT, 'marca')
    for d in (cdir, mdir):
        os.makedirs(d, exist_ok=True)
        for old in os.listdir(d):
            if old.endswith('.html'):
                os.remove(os.path.join(d, old))

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

        # acumular para las paginas de categoria / marca
        _it = {'nombre': nombre, 'precio': precio, 'img': img, 'fname': fname, 'instock': instock}
        _cat = (p.get('categoria') or '').strip()
        if _cat:
            cats.setdefault(slug(_cat), {'name': _cat, 'items': []})['items'].append(_it)
        _mk = (p.get('marca') or '').strip()
        if _mk:
            marcas.setdefault(slug(_mk), {'name': _mk, 'items': []})['items'].append(_it)

    # ---- Paginas de categoria y marca (SEO de busquedas amplias) ----
    def _card(it):
        pr = (f'<span class="lp-precio">{it["precio"]}</span>'
              if (it["instock"] and it["precio"]) else '<span class="lp-sin">Sin stock</span>')
        return (f'<a class="lp-card" href="/p/{it["fname"]}">'
                f'<div class="lp-img"><img src="{esc(it["img"])}" alt="{esc(it["nombre"])}" loading="lazy"></div>'
                f'<div class="lp-nom">{esc(it["nombre"])}</div>{pr}</a>')

    def build_listing(kind, sg, name, items, param_key):
        canonical = f"{SITE}/{kind}/{sg}.html"
        disp = name if kind == 'marca' else name.title()
        titulo = f"{disp} - Blinky MDQ"
        n = len(items)
        desc = (f"Compra {disp} en Blinky MDQ, Mar del Plata. {n} productos con envios a "
                f"todo el pais y retiro en Punto Blinky.")[:160]
        first_img = next((it['img'] for it in items if it['img']), f"{SITE}/blinkysinfondo.png")
        elems = [{"@type": "ListItem", "position": i + 1, "url": f"{SITE}/p/{it['fname']}", "name": it['nombre']}
                 for i, it in enumerate(items)]
        ld = {"@context": "https://schema.org/", "@type": "CollectionPage", "name": disp, "url": canonical,
              "description": desc, "mainEntity": {"@type": "ItemList", "numberOfItems": n, "itemListElement": elems}}
        cards = ''.join(_card(it) for it in items)
        html = f"""<!DOCTYPE html>
<html lang="es"><head>
<meta charset="UTF-8"><base href="/">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(titulo)}</title>
<link rel="canonical" href="{canonical}">
<meta name="description" content="{esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:title" content="{esc(titulo)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:image" content="{esc(first_img)}">
<meta property="og:url" content="{canonical}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(titulo)}">
<meta name="twitter:image" content="{esc(first_img)}">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<link rel="icon" href="/favicon.ico">
<style>
  *{{box-sizing:border-box;margin:0;padding:0}}
  body{{font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f8f8fc;color:#1e293b}}
  a{{color:inherit;text-decoration:none}}
  .lp-header{{background:#0a0a0a;padding:12px 18px;display:flex;align-items:center;justify-content:space-between}}
  .lp-header img{{height:40px}}
  .lp-tienda{{background:#7c3aed;color:#fff;padding:8px 16px;border-radius:10px;font-weight:700;font-size:.82rem}}
  .lp-wrap{{max-width:1180px;margin:0 auto;padding:20px 16px 60px}}
  .lp-bc{{font-size:.78rem;color:#94a3b8;margin-bottom:10px}}
  .lp-bc a:hover{{color:#7c3aed}}
  h1{{font-size:1.6rem;margin-bottom:6px}}
  .lp-intro{{color:#64748b;font-size:.95rem;margin-bottom:16px;max-width:720px;line-height:1.5}}
  .lp-cta{{display:inline-block;background:#7c3aed;color:#fff;padding:10px 20px;border-radius:12px;font-weight:700;font-size:.9rem;margin-bottom:24px}}
  .lp-grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px}}
  .lp-card{{background:#fff;border:1px solid #eef0f5;border-radius:16px;padding:10px;display:flex;flex-direction:column;transition:transform .15s,box-shadow .15s}}
  .lp-card:hover{{transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,.07)}}
  .lp-img{{aspect-ratio:1;background:#fff;border-radius:12px;overflow:hidden;display:flex;align-items:center;justify-content:center}}
  .lp-img img{{width:100%;height:100%;object-fit:contain}}
  .lp-nom{{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#334155;line-height:1.25;margin:8px 0 4px;min-height:2.4em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}}
  .lp-precio{{font-size:1.05rem;font-weight:900;color:#7c3aed}}
  .lp-sin{{font-size:.72rem;font-weight:700;color:#94a3b8;text-transform:uppercase}}
  .lp-foot{{text-align:center;color:#94a3b8;font-size:.75rem;padding:24px}}
</style></head>
<body>
<header class="lp-header"><a href="/"><img src="/blinkysinfondo.png" alt="Blinky MDQ"></a><a class="lp-tienda" href="/">Ir a la tienda</a></header>
<div class="lp-wrap">
  <div class="lp-bc"><a href="/">Inicio</a> &rsaquo; {esc(disp)}</div>
  <h1>{esc(disp)}</h1>
  <p class="lp-intro">Descubri {esc(disp)} en Blinky MDQ. {n} productos disponibles, con envios a todo el pais y retiro en nuestros Puntos Blinky de Mar del Plata.</p>
  <a class="lp-cta" href="/index.html?{param_key}={quote(name)}">Ver y comprar en la tienda &rsaquo;</a>
  <div class="lp-grid">{cards}</div>
</div>
<div class="lp-foot">Blinky MDQ &middot; blinkymdq.com</div>
</body></html>"""
        open(os.path.join(ROOT, kind, f"{sg}.html"), 'w', encoding='utf-8').write(html)
        return canonical

    for sg, info in sorted(cats.items()):
        loc = build_listing('categoria', sg, info['name'], info['items'], 'cat')
        sm.append(f'  <url><loc>{loc}</loc><changefreq>weekly</changefreq></url>')
    for sg, info in sorted(marcas.items()):
        loc = build_listing('marca', sg, info['name'], info['items'], 'marca')
        sm.append(f'  <url><loc>{loc}</loc><changefreq>weekly</changefreq></url>')

    sm.append('</urlset>')
    open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8').write('\n'.join(sm))
    open(os.path.join(ROOT, 'robots.txt'), 'w', encoding='utf-8').write(
        f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")
    print(f"OK - {count} productos, {len(cats)} categorias, {len(marcas)} marcas")

if __name__ == '__main__':
    main()
