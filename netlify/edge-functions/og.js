export default async (request, context) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');

  if (!q) return context.next();

  try {
    const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQsX_fc7ypz3mVNMQcI8boTIzligB9QblZP6pcnVrvKciX2xCl3XYpejlHOa3vz4AgmIXOEzkG1TjQZ/pub?gid=0&single=true&output=csv';

    const res = await fetch(SHEET_URL);
    const csv = await res.text();

    function parseCSVRow(row) {
      const cols = [];
      let col = '';
      let inQuotes = false;
      for (let i = 0; i < row.length; i++) {
        const c = row[i];
        if (c === '"') { inQuotes = !inQuotes; continue; }
        if (c === ',' && !inQuotes) { cols.push(col.trim()); col = ''; continue; }
        col += c;
      }
      cols.push(col.trim());
      return cols;
    }

    const rows = csv.split('\n').slice(1);
    const busqueda = q.replace(/-/g, ' ').toLowerCase();

    let producto = null;
    for (const row of rows) {
      if (!row.trim()) continue;
      const cols = parseCSVRow(row);
      const nombre = (cols[2] || '').toLowerCase();
      if (busqueda.split(' ').every(w => nombre.includes(w))) {
        producto = {
          nombre: cols[2] || '',
          foto: cols[3] || '',
          precio: (cols[15] || '').replace(/[$\s]/g, ''),
        };
        break;
      }
    }

    if (!producto) return context.next();

   let imgUrl = 'https://blinkymdq.com/logo.png';
   if (producto.foto) {
   if (producto.foto.includes('id=')) {
    // Google Drive
    const id = producto.foto.split('id=')[1].split('&')[0];
    imgUrl = `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;
    } else if (producto.foto.trim() !== '') {
    // GitHub/Netlify
    imgUrl = `https://blinkymdq.com/Productos/${producto.foto}.jpg`;
  }
}

    const precioNum = parseFloat(producto.precio) || 0;
    const precioTxt = `$${precioNum.toLocaleString('es-AR')}`;
    const pageUrl = `https://blinkymdq.com/?q=${q}`;

    const response = await context.next();
    const html = await response.text();

    const metaTags = `<meta property="og:title" content="${producto.nombre}" />
<meta property="og:description" content="Precio: ${precioTxt} — Blinky Mar del Plata" />
<meta property="og:image" content="${imgUrl}" />
<meta property="og:url" content="${pageUrl}" />
<meta property="og:type" content="product" />
<meta name="twitter:card" content="summary_large_image" />`;

    const newHtml = html.replace('<head>', `<head>\n${metaTags}`);
    return new Response(newHtml, {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });

  } catch (e) {
    return context.next();
  }
};