export default async (request, context) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');

  if (!q) return context.next();

  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQsX_fc7ypz3mVNMQcI8boTIzligB9QblZP6pcnVrvKciX2xCl3XYpejlHOa3vz4AgmIXOEzkG1TjQZ/pub?gid=0&single=true&output=csv';

  const res = await fetch(SHEET_URL);
  const csv = await res.text();
  const rows = csv.split('\n').slice(1);

  const busqueda = q.replace(/-/g, ' ').toLowerCase();

  let producto = null;
  for (const row of rows) {
    const cols = row.split(',');
    const nombre = (cols[2] || '').replace(/"/g, '').trim().toLowerCase();
    if (nombre.includes(busqueda) || busqueda.split(' ').every(w => nombre.includes(w))) {
      producto = {
        nombre: (cols[2] || '').replace(/"/g, '').trim(),
        foto: (cols[3] || '').replace(/"/g, '').trim(),
        precio: (cols[15] || '').replace(/[$"\s]/g, '').trim(),
      };
      break;
    }
  }

  if (!producto) return context.next();

  let imgUrl = producto.foto;
  if (imgUrl.includes('id=')) {
    const id = imgUrl.split('id=')[1].split('&')[0];
    imgUrl = `https://drive.google.com/thumbnail?id=${id}&sz=400`;
  }

  const precioTxt = `$${parseFloat(producto.precio).toLocaleString('es-AR')}`;
  const pageUrl = `https://blinkymdq.com/?q=${q}`;

  const response = await context.next();
  const html = await response.text();

  const metaTags = `
    <meta property="og:title" content="${producto.nombre}" />
    <meta property="og:description" content="Precio: ${precioTxt} — Blinky Mar del Plata" />
    <meta property="og:image" content="${imgUrl}" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:type" content="product" />
    <meta name="twitter:card" content="summary_large_image" />
  `;

  const newHtml = html.replace('<head>', `<head>${metaTags}`);
  return new Response(newHtml, {
    headers: { 'content-type': 'text/html' },
  });
};