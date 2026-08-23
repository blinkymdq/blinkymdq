(function(){try{if(!window.__COD__)return;var g=URLSearchParams.prototype.get;URLSearchParams.prototype.get=function(k){var v=g.call(this,k);if((v==null||v==='')&&(k==='cod'||k==='codigo'))return window.__COD__;return v;};}catch(e){}})();

const SUPA_URL = 'https://fcaytkwcypktvrmerexp.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjYXl0a3djeXBrdHZybWVyZXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MDU1OTYsImV4cCI6MjA5NzM4MTU5Nn0.7GiUl0o_B3dAnpE2x98sBqtC0eY9HoM6p67fOBghoJY';
const NRO_WSP = '5492235910492';

function getImgUrl(foto, sz) {
  if (!foto || foto.trim() === '') return '';
  if (foto.startsWith('http')) return foto;
  if (foto.includes('id=')) return `https://drive.google.com/thumbnail?id=${foto.split('id=')[1].split('&')[0]}&sz=${sz || 1200}`;
  return `https://blinkymdq.com/Productos/${foto}.jpg`;
}

function formatPrecio(v) {
  const n = parseFloat(String(v).replace(/[^0-9.]/g,''));
  if (isNaN(n)) return '$0';
  return '$' + Math.round(n).toLocaleString('es-AR');
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(20px)'; }, 2500);
}

function irABuscar() {
  const val = document.getElementById('headerBusqueda').value.trim();
  window.location.href = val
    ? `/index.html?q=${encodeURIComponent(val.toLowerCase().replace(/\s+/g,'-'))}`
    : '/index.html';
}

// ── Funciones del header completo (igual a index.html) ──
function irABuscarHeader() {
  const val = (document.getElementById('inputBusqueda').value || '').trim();
  window.location.href = val
    ? `/index.html?q=${encodeURIComponent(val.toLowerCase().replace(/\s+/g,'-'))}`
    : '/index.html';
}

function irAFiltrarHeader(valor, tipo) {
  if (!valor) return;
  window.location.href = `/index.html?${tipo}=${encodeURIComponent(valor)}`;
}

function mostrarLogin() {
  window.location.href = '/index.html';
}

function abrirCarrito() {
  window.location.href = '/index.html';
}

function toggleUserMenu() {
  const dd = document.getElementById('userDropdown');
  if (dd) dd.classList.toggle('hidden');
}

// ════════════════════════════════════════
// AUTH (misma lógica que index.html): Supabase Auth + tabla "usuarios".rol
// ════════════════════════════════════════
const supabaseClient = supabase.createClient(SUPA_URL, SUPA_KEY);

async function cerrarSesion() {
  await supabaseClient.auth.signOut();
  window._userRol = null;
  document.body.classList.remove('is-logged-in', 'es-mayorista');
  if (productoActual) renderProducto(productoActual);
}

async function initAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) await aplicarSesion(session.user);

  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (session) {
      await aplicarSesion(session.user);
    } else {
      window._userRol = null;
      document.body.classList.remove('is-logged-in', 'es-mayorista');
      if (productoActual) renderProducto(productoActual);
    }
  });
}

async function aplicarSesion(user) {
  const { data } = await supabaseClient
    .from('usuarios')
    .select('rol, nombre')
    .eq('id', user.id)
    .single();

  const rol = data?.rol || 'minorista';
  const nombre = data?.nombre || user.user_metadata?.full_name || user.email;
  const esMayorista = rol === 'mayorista';

  window._userRol = rol;

  document.body.classList.add('is-logged-in');
  if (esMayorista) document.body.classList.add('es-mayorista');
  else document.body.classList.remove('es-mayorista');

  // Mercadería que el vendedor tiene en su poder (badge "Tenés N") — solo mayoristas
  window._miMercaderia = {};
  if (esMayorista) {
    try {
      const { data: ev } = await supabaseClient.from('entregas_vendedor').select('codigo,entregado,vendido,devuelto').eq('usuario_id', user.id);
      (ev||[]).forEach(e=>{ const pend = Math.max(0, Number(e.entregado||0)-Number(e.vendido||0)-Number(e.devuelto||0)); if(pend>0) window._miMercaderia[e.codigo]=(window._miMercaderia[e.codigo]||0)+pend; });
    } catch(e){}
  }

  const nombreCorto = (nombre || '').split(' ')[0].toUpperCase();
  const nameEl = document.getElementById('user-badge-name');
  const nameElM = document.getElementById('user-badge-name-mobile');
  if (nameEl) nameEl.innerText = `HOLA, ${nombreCorto}`;
  if (nameElM) nameElM.innerText = `HOLA, ${nombreCorto}`;

  if (productoActual) renderProducto(productoActual);
}

// Trae solo categoría y marca de cada producto (consulta liviana) para
// poblar los desplegables del header con opciones reales.
async function poblarFiltrosHeader() {
  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/productos?select=categoria,marca&estado=neq.inactivo`, {
      headers: { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY }
    });
    const data = await res.json();
    const categorias = [...new Set(data.map(p => p.categoria).filter(Boolean))].sort();
    const marcas = [...new Set(data.map(p => p.marca).filter(Boolean))].sort();

    ['selectCat', 'selectCatMobile'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '<option value="">Categorías</option>' + categorias.map(c => `<option value="${c}">${c}</option>`).join('');
    });
    ['selectMarca', 'selectMarcaMobile'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '<option value="">Marcas</option>' + marcas.map(m => `<option value="${m}">${m}</option>`).join('');
    });
  } catch(e) { console.error('Error cargando filtros del header', e); }
}
poblarFiltrosHeader();

let fotos = [];
let medios = [];      // [{tipo:'video'|'img', src}]
let fotoActual = 0;
let productoActual = null;
const FOTO_FALLBACK = 'https://blinkymdq.com/blinkysinfondo.png';

function mostrarFoto(idx) {
  fotoActual = idx;
  const m = medios[idx] || { tipo:'img', src:'' };
  const img = document.getElementById('foto-principal');
  const vid = document.getElementById('video-principal');
  if (m.tipo === 'video') {
    if (img) img.style.display = 'none';
    if (vid) { vid.style.display = 'block'; try { vid.currentTime = 0; vid.play().catch(()=>{}); } catch(e){} }
  } else {
    if (vid) { try { vid.pause(); } catch(e){} vid.style.display = 'none'; }
    if (img) { img.style.display = 'block'; img.src = getImgUrl(m.src, 1600) || FOTO_FALLBACK; }
  }
  document.querySelectorAll('.thumb').forEach((t,i) => t.classList.toggle('active', i===idx));
}

function fotoAnterior() { if (fotoActual > 0) mostrarFoto(fotoActual - 1); }
function fotoSiguiente() { if (fotoActual < medios.length - 1) mostrarFoto(fotoActual + 1); }

function abrirZoom() {
  const m = medios[fotoActual];
  if (!m || m.tipo !== 'img') return; // el video no hace zoom
  document.getElementById('lightbox-img').src = getImgUrl(m.src, 1600) || FOTO_FALLBACK;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function cerrarZoom() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') cerrarZoom();
});

async function cargarProducto() {
  const params = new URLSearchParams(window.location.search);
  const cod = params.get('cod');
  if (!cod) { mostrarError('No se especificó un producto.'); return; }

  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/productos?codigo=eq.${encodeURIComponent(cod)}&limit=1`, {
      headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY }
    });
    const data = await res.json();
    if (!data.length) { mostrarError('Producto no encontrado.'); return; }
    renderProducto(data[0]);
  } catch(e) {
    mostrarError('Error al cargar el producto.');
  }
}

function renderProducto(p) {
  productoActual = p;
  if (typeof actualizarBadgeCarrito === 'function') actualizarBadgeCarrito();
  const precio = formatPrecio(p.precio_publico);
  const sinStock = !p.stock || p.stock <= 0;
  const esMayoristaLogueado = document.body.classList.contains('is-logged-in') && window._userRol === 'mayorista';
  const mostrarPrecio = !sinStock || esMayoristaLogueado;
  const miCantMerc = (esMayoristaLogueado && window._miMercaderia) ? Number(window._miMercaderia[p.codigo] || 0) : 0;
  const badgeMercMobile  = miCantMerc > 0 ? `<div class="badge-merc badge-merc-mobile">📦 Tenés ${miCantMerc}</div>` : '';
  const badgeMercDesktop = miCantMerc > 0 ? `<div class="badge-merc badge-merc-desktop">📦 Tenés ${miCantMerc}</div>` : '';

  fotos = (p.foto || '').split(',').map(f => f.trim()).filter(Boolean);
  if (!fotos.length) fotos = [''];
  // Medios: video primero (si hay), después las fotos
  medios = [];
  if (p.video) medios.push({ tipo:'video', src:p.video });
  fotos.forEach(f => { if (f) medios.push({ tipo:'img', src:f }); });
  if (!medios.length) medios.push({ tipo:'img', src:'' });

  document.title = `${p.nombre} — Blinky MDQ`;
  document.getElementById('og-title').content = p.nombre;
  document.getElementById('og-description').content = `${precio} · Blinky MDQ`;
  if (fotos[0]) document.getElementById('og-image').content = getImgUrl(fotos[0]);
  document.getElementById('og-url').content = window.location.href;

  document.getElementById('breadcrumb').innerHTML = `
    <a href="/index.html">Home</a>
    ${p.categoria ? `<span>›</span><a href="/index.html?cat=${encodeURIComponent(p.categoria)}">${p.categoria}</a>` : ''}
    ${p.marca ? `<span>›</span><a href="/index.html?marca=${encodeURIComponent(p.marca)}">${p.marca}</a>` : ''}
    <span>›</span><span class="actual">${p.nombre}</span>
  `;

  const mostrarNav = medios.length > 1;
  const primero = medios[0];

  document.getElementById('contenido').innerHTML = `
    <div class="layout">
      <div class="galeria-wrap">
        <div class="galeria">
          <video id="video-principal" src="${p.video || ''}" style="display:${primero.tipo==='video'?'block':'none'};width:100%;height:100%;object-fit:contain;background:#000;" muted loop playsinline autoplay preload="metadata"></video>
          <img id="foto-principal" src="${primero.tipo==='img' ? (getImgUrl(primero.src, 1600) || 'https://blinkymdq.com/blinkysinfondo.png') : 'https://blinkymdq.com/blinkysinfondo.png'}" style="display:${primero.tipo==='img'?'block':'none'};" alt="${p.nombre}" onclick="abrirZoom()" onerror="this.src='https://blinkymdq.com/blinkysinfondo.png'">
          <div class="galeria-iconos">
            <button class="icono-flotante" onclick="compartir()" title="Compartir">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            </button>
          </div>
          ${mostrarNav ? `
            <button class="btn-nav btn-prev" onclick="fotoAnterior()">‹</button>
            <button class="btn-nav btn-next" onclick="fotoSiguiente()">›</button>
          ` : ''}
        </div>
        ${mostrarNav ? `
          <div class="thumbs">
            ${medios.map((m,i) => m.tipo==='video'
              ? `<div class="thumb ${i===0?'active':''}" onclick="mostrarFoto(${i})" style="position:relative;background:#000;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-size:1.1rem;">▶</span></div>`
              : `<div class="thumb ${i===0?'active':''}" onclick="mostrarFoto(${i})"><img src="${getImgUrl(m.src)}" onerror="this.style.opacity='0.2'"></div>`
            ).join('')}
          </div>
        ` : ''}
      </div>

      <div class="info-card">
        ${badgeMercMobile}
        ${p.marca ? `<div class="marca">${p.marca}</div>` : ''}
        <h1 class="nombre">${p.nombre}</h1>
        ${p.codigo ? `
          <div class="codigo-row" onclick="copiarCodigo('${p.codigo}')" title="Copiar código">
            Cód. ${p.codigo}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </div>
        ` : ''}
        <br>
        ${mostrarPrecio ? `
        <div class="precio">${precio}</div>
        ${esMayoristaLogueado ? `<div class="precio-mayorista" style="display:block;">Precio mayorista: ${formatPrecio(p.precio_mayorista)}</div>` : '<div class="desc-transf">💸 5% OFF pagando por transferencia o efectivo</div>'}
        ` : ''}
        ${sinStock ? '<div class="reposicion-aviso">⚠️ El precio de reposición del producto puede sufrir variaciones</div>' : ''}
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <div class="${sinStock ? 'sin-stock' : 'en-stock'}">${sinStock ? 'Sin stock' : '✓ Disponible'}</div>
          ${badgeMercDesktop}
        </div>

        <div class="btns">
          <button class="btn-comprar" onclick="agregarYVerCarrito('${p.codigo}')" ${sinStock ? 'disabled' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            ${sinStock ? 'Sin stock' : 'Agregar al carrito'}
          </button>
          <button class="btn-wsp" onclick="consultarWsp()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.09.536 4.05 1.475 5.757L0 24l6.435-1.438A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.374l-.36-.213-3.717.831.888-3.618-.234-.372A9.818 9.818 0 1112 21.818z"/></svg>
            Consultar por WhatsApp
          </button>
        </div>
        <div id="recibir-wrap"></div>
        <div style="font-size:0.72rem;color:#64748b;font-family:Arial,sans-serif;margin-top:12px;">Los precios están sujetos a modificaciones sin previo aviso.</div>
      </div>
    </div>

    ${p.descripcion ? `
      <div class="descripcion-card">
        <div class="descripcion-titulo">Descripción</div>
        <div class="descripcion-texto">${p.descripcion}</div>
      </div>
    ` : ''}
  `;
  cargarPuntosRetiro(p.codigo, esMayoristaLogueado);
}

// ── Cómo recibirlo: envío + puntos de retiro por cercanía ──
let _puntosRetiro = [];
let _miUbic = null; // {lat,lng}
async function cargarPuntosRetiro(codigo, esMayorista){
  const wrap = document.getElementById('recibir-wrap');
  if(!wrap) return;
  _puntosRetiro = [];
  if(!esMayorista && codigo){
    try{
      const r = await fetch(`${SUPA_URL}/rest/v1/rpc/puntos_retiro_producto`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', apikey:SUPA_KEY, Authorization:'Bearer '+SUPA_KEY },
        body: JSON.stringify({ p_codigo: codigo })
      });
      const d = await r.json();
      _puntosRetiro = Array.isArray(d) ? d.filter(p=>p.lat!=null && p.lng!=null) : [];
    }catch(e){ _puntosRetiro = []; }
  }
  renderRecibir();
}
function distanciaKm(a, b){
  const R=6371, toR=x=>x*Math.PI/180;
  const dLat=toR(b.lat-a.lat), dLng=toR(b.lng-a.lng);
  const s=Math.sin(dLat/2)**2 + Math.cos(toR(a.lat))*Math.cos(toR(b.lat))*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(s), Math.sqrt(1-s));
}
function ordenarPuntosPorCercania(){
  if(!navigator.geolocation){ toast('Tu navegador no permite ubicación'); return; }
  if(!window.isSecureContext){ toast('La ubicación necesita abrir la página con https://'); return; }
  toast('Buscando tu ubicación...');
  navigator.geolocation.getCurrentPosition(pos=>{
    _miUbic = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    renderRecibir();
    toast('Puntos ordenados por cercanía ✓');
  }, err=>{
    let m = 'No pudimos obtener tu ubicación';
    if(err.code===1) m='Activá el permiso de ubicación del navegador para ordenar por cercanía';
    else if(err.code===2) m='Tu ubicación no está disponible por ahora';
    else if(err.code===3) m='La ubicación tardó demasiado. Probá de nuevo';
    toast(m);
  }, { enableHighAccuracy:false, timeout:15000, maximumAge:60000 });
}
function renderRecibir(){
  const wrap = document.getElementById('recibir-wrap');
  if(!wrap) return;
  let puntos = _puntosRetiro.slice();
  if(_miUbic){
    puntos.forEach(p=> p._dist = distanciaKm(_miUbic, {lat:Number(p.lat), lng:Number(p.lng)}));
    puntos.sort((a,b)=> (a._dist||0)-(b._dist||0));
  }
  const envio = `<div class="recibir-opt"><span class="recibir-ico">🚚</span><div><div class="recibir-t">Envío a domicilio</div><div class="recibir-s">Coordinás la entrega en el checkout</div></div></div>`;
  let retiro = '';
  if(puntos.length){
    const p0 = puntos[0];
    const filas = puntos.map(p=>{
      const dir = [p.direccion, p.localidad].filter(Boolean).join(', ');
      const dist = (p._dist!=null) ? `<span class="recibir-km">a ${p._dist.toFixed(1)} km</span>` : '';
      const links = [
        p.link ? `<a href="${p.link}" target="_blank" rel="noopener">🌐 Web</a>` : '',
        p.instagram ? `<a href="${p.instagram}" target="_blank" rel="noopener">📷 Instagram</a>` : '',
        `<a href="https://www.google.com/maps?q=${p.lat},${p.lng}" target="_blank" rel="noopener">🗺️ Cómo llegar</a>`
      ].filter(Boolean).join('');
      return `<div class="punto-item">
        <div class="punto-top"><span class="punto-nom">🏪 ${p.nombre_comercio||'Punto de retiro'}</span>${dist}</div>
        <div class="punto-dir">${dir||''}</div>
        <div class="punto-links">${links}</div>
      </div>`;
    }).join('');
    const dir0 = [p0.direccion, p0.localidad].filter(Boolean).join(', ');
    retiro = `
      <div class="recibir-opt destacado">
        <span class="recibir-ico">🏪</span>
        <div style="flex:1;min-width:0;">
          <div class="recibir-t">Podés retirar hoy por <b>${p0.nombre_comercio||'un punto cercano'}</b></div>
          <div class="recibir-s">${dir0||''}</div>
        </div>
      </div>
      ${!_miUbic ? `<button class="btn-cercania" onclick="ordenarPuntosPorCercania()">📍 Ver puntos cerca tuyo</button>` : ''}
      <div class="puntos-lista">${filas}</div>
      <div class="recibir-nota">Elegís el punto en el checkout y vas a retirar con tu número de pedido.</div>`;
  }
  wrap.innerHTML = `<div class="recibir-card"><div class="recibir-title">Cómo recibirlo</div>${envio}${retiro}</div>`;
}

function leerCarrito() {
  try { return JSON.parse(localStorage.getItem('blinky_carrito') || '[]') || []; } catch(e) { return []; }
}
function actualizarBadgeCarrito() {
  const carrito = leerCarrito();
  const n = carrito.reduce((s,i)=>s + Number(i.cantidad||0), 0);
  ['carritoContadorHeader','carritoContadorHeaderMobile'].forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.textContent = n;
    el.classList.toggle('hidden', n === 0);
  });
}
function agregarYVerCarrito(cod) {
  const p = productoActual;
  if (!p || !p.stock || p.stock <= 0) return;
  const esMay = document.body.classList.contains('is-logged-in') && window._userRol === 'mayorista';
  const precio = (esMay && Number(p.precio_mayorista) > 0) ? Number(p.precio_mayorista) : Number(p.precio_publico);
  const img = getImgUrl((p.foto || '').split(',')[0].trim(), '200');
  const stock = Number(p.stock || 0);
  const carrito = leerCarrito();
  const existente = carrito.find(i => i.codigo === p.codigo);
  if (existente) {
    if (existente.cantidad >= stock) { toast(`Solo hay ${stock} unidad${stock===1?'':'es'} disponible${stock===1?'':'s'}`); return; }
    existente.cantidad++;
  } else {
    carrito.push({ id: p.codigo, codigo: p.codigo || '', nombre: p.nombre, precio: precio, img: img, stock: stock, cantidad: 1 });
  }
  try { localStorage.setItem('blinky_carrito', JSON.stringify(carrito)); } catch(e){}
  actualizarBadgeCarrito();
  toastAgregado();
}
function toastAgregado() {
  const t = document.getElementById('ok-toast');
  t.innerHTML = '🛒 ¡Agregado al carrito!<br><span style="font-weight:600;color:#86efac;">Seguí chusmeando tranqui 😉</span>';
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(20px)'; }, 2500);
}

function consultarWsp() {
  const p = productoActual;
  const sinStock = !p.stock || p.stock <= 0;
  const esMayoristaLogueado = document.body.classList.contains('is-logged-in') && window._userRol === 'mayorista';
  const precio = formatPrecio(p.precio_publico);
  const msg = (sinStock && !esMayoristaLogueado)
    ? `Hola! Me interesa el producto: *${p.nombre}*. ¿Está disponible?\n\n${window.location.href}`
    : `Hola! Me interesa el producto: *${p.nombre}* (${precio}). ¿Está disponible?\n\n${window.location.href}`;
  window.open(`https://wa.me/${NRO_WSP}?text=${encodeURIComponent(msg)}`, '_blank');
}

async function compartir() {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ url });
    } catch(e) {}
  } else {
    navigator.clipboard.writeText(url);
    toast('Link copiado ✓');
  }
}

function copiarCodigo(cod) {
  navigator.clipboard.writeText(cod);
  toast('Código copiado ✓');
}

function mostrarError(msg) {
  document.getElementById('contenido').innerHTML = `
    <div class="estado">
      <div class="estado-icon">😕</div>
      <h2>Oops</h2>
      <p>${msg}</p>
      <br>
      <a href="/index.html" class="btn-tienda" style="display:inline-block;margin-top:8px;">Ver tienda</a>
    </div>
  `;
}

initAuth();
cargarProducto();
