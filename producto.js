(function(){try{if(!window.__COD__)return;var g=URLSearchParams.prototype.get;URLSearchParams.prototype.get=function(k){var v=g.call(this,k);if((v==null||v==='')&&(k==='cod'||k==='codigo'))return window.__COD__;return v;};}catch(e){}})();

const SUPA_URL = 'https://fcaytkwcypktvrmerexp.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjYXl0a3djeXBrdHZybWVyZXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MDU1OTYsImV4cCI6MjA5NzM4MTU5Nn0.7GiUl0o_B3dAnpE2x98sBqtC0eY9HoM6p67fOBghoJY';
const NRO_WSP = '5492235910492';
// Clave pública de Mercado Pago (producción, empieza con APP_USR-). Vacía = no se muestran cuotas.
const MP_PUBLIC_KEY = 'APP_USR-40d12cd5-c81a-47cf-b381-8f73a3f3b937';
window._mpCuotas = null;
async function cargarCuotasMP(){
  try{
    const r = await fetch(`${SUPA_URL}/functions/v1/mp-cuotas?amount=100000`, { headers:{ 'apikey':SUPA_KEY, 'Authorization':'Bearer '+SUPA_KEY } });
    const j = await r.json();
    if(!j || !j.ok) return;
    window._mpCuotas = { c3: (j.c3!=null?Number(j.c3):null), c6: (j.c6!=null?Number(j.c6):null) };
    const el = document.getElementById('cuotas-mp');
    if(el && productoActual){
      const _d = Number(productoActual.descuento||0);
      const _p = _d>0 ? Math.round(Number(productoActual.precio_publico||0)*(1-_d/100)) : Number(productoActual.precio_publico||0);
      const t = cuotasFullHTML(_p); if(t){ el.innerHTML = t; el.style.display='block'; }
    }
  }catch(e){}
}
function _cuota2(n){ return '$' + Number(n).toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function _cuotaLine(precio, n, coef){ if(!coef || !precio) return ''; return `${n} cuotas de ${_cuota2(Number(precio)*coef/n)}`; }
function cuotasFullHTML(precio){
  if(!window._mpCuotas) return '';
  const c = window._mpCuotas;
  const l3 = c.c3 ? _cuotaLine(precio,3,c.c3) : '';
  const l6 = c.c6 ? _cuotaLine(precio,6,c.c6) : '';
  const arr = [l3, l6].filter(Boolean);
  if(!arr.length) return '';
  return arr.join('<br>') + '<img src="/MERCADOPAGO.jpg" alt="Mercado Pago" style="height:22px;width:auto;margin-top:5px;display:block;" onerror="this.outerHTML=\'<span style=&quot;font-weight:400;opacity:.8;&quot;>con Mercado Pago</span>\'">';
}

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
  renderPanelCarrito();
  document.getElementById('ov-carrito').style.display = 'block';
  document.getElementById('panel-carrito').style.transform = 'translateX(0)';
  document.body.style.overflow = 'hidden';
}
function cerrarCarrito() {
  document.getElementById('ov-carrito').style.display = 'none';
  document.getElementById('panel-carrito').style.transform = 'translateX(100%)';
  document.body.style.overflow = '';
}
function renderPanelCarrito() {
  var carrito = leerCarrito();
  var lista = document.getElementById('pc-lista');
  var footer = document.getElementById('pc-footer');
  var vacio = document.getElementById('pc-vacio');
  document.getElementById('pc-count').textContent = carrito.reduce(function(s,i){return s+Number(i.cantidad||0);},0) + ' items';
  if (!carrito.length) { lista.style.display='none'; footer.style.display='none'; vacio.style.display='flex'; return; }
  lista.style.display='block'; footer.style.display='block'; vacio.style.display='none';
  var total = 0;
  lista.innerHTML = carrito.map(function(i, idx){
    total += Number(i.precio) * Number(i.cantidad);
    return `<div style="display:flex;gap:10px;align-items:center;padding:11px 0;border-bottom:1px solid #f8fafc;">
      <img src="${i.img}" onerror="this.src='https://blinkymdq.com/blinkysinfondo.png'" style="width:48px;height:48px;object-fit:cover;border-radius:10px;background:#f8fafc;flex-shrink:0;">
      <div style="flex:1;min-width:0;">
        <p style="font-size:11px;font-weight:800;color:#1e293b;text-transform:uppercase;line-height:1.2;margin:0;">${i.nombre}</p>
        ${i.variante?`<p style="font-size:10px;color:#7c3aed;font-weight:700;margin:1px 0 0;">🎨 ${i.variante}</p>`:''}
        <p style="font-size:12px;font-weight:900;color:#7c3aed;margin:3px 0 0;">${formatPrecio(i.precio * i.cantidad)}</p>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;">
        <button onclick="pcQuitar(${idx})" style="background:none;border:none;color:#cbd5e1;cursor:pointer;font-size:13px;line-height:1;">✕</button>
        <div style="display:flex;align-items:center;gap:6px;">
          <button onclick="pcCant(${idx},-1)" style="width:24px;height:24px;border-radius:7px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;font-weight:900;color:#475569;line-height:1;">−</button>
          <span style="font-size:12px;font-weight:900;width:16px;text-align:center;color:#1e293b;">${i.cantidad}</span>
          <button onclick="pcCant(${idx},1)" style="width:24px;height:24px;border-radius:7px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;font-weight:900;color:#475569;line-height:1;">+</button>
        </div>
      </div>
    </div>`;
  }).join('');
  document.getElementById('pc-total').textContent = formatPrecio(total);
}
function pcCant(idx, d) {
  var c = leerCarrito(); var it = c[idx]; if (!it) return;
  if (d > 0 && Number(it.stock||0) > 0 && it.cantidad >= Number(it.stock||0)) {
    toast('Solo hay ' + it.stock + ' unidad' + (Number(it.stock)===1?'':'es') + ' disponible' + (Number(it.stock)===1?'':'s')); return;
  }
  it.cantidad += d;
  if (it.cantidad <= 0) c.splice(idx, 1);
  try { localStorage.setItem('blinky_carrito', JSON.stringify(c)); } catch(e){}
  actualizarBadgeCarrito(); renderPanelCarrito();
}
function pcQuitar(idx) {
  var c = leerCarrito(); c.splice(idx, 1);
  try { localStorage.setItem('blinky_carrito', JSON.stringify(c)); } catch(e){}
  actualizarBadgeCarrito(); renderPanelCarrito();
}
function irACheckout() {
  window.location.href = '/index.html?checkout=1';
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
    cargarCuotasMP();
  } catch(e) {
    mostrarError('Error al cargar el producto.');
  }
}

function renderProducto(p) {
  productoActual = p;
  if (typeof actualizarBadgeCarrito === 'function') actualizarBadgeCarrito();
  const _dPct = Number(p.descuento || 0);
  const _pubCon = _dPct > 0 ? Math.round(Number(p.precio_publico||0) * (1 - _dPct/100)) : Number(p.precio_publico||0);
  const precio = formatPrecio(_pubCon);
  const variantes = Array.isArray(p.variantes) ? p.variantes.map(v=>({nombre:v.nombre||'',foto:v.foto||'',stock:Number(v.stock||0)})) : [];
  window._prodVariantes = variantes; window._prodVarSel = null;
  const stockEfectivo = variantes.length ? variantes.reduce((s,v)=>s+Math.max(0,v.stock),0) : Number(p.stock||0);
  const sinStock = stockEfectivo <= 0;
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
          ${_dPct>0 ? `<div style="position:absolute;top:10px;left:10px;z-index:5;background:linear-gradient(135deg,#f97316,#ef4444);color:#fff;font-size:13px;font-weight:900;padding:5px 12px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.25);">🔥 -${_dPct}% OFF</div>` : ''}
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
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          ${p.marca ? `<span class="marca" style="color:#1a1a1a;">${p.marca}</span>` : ''}
          ${p.codigo ? `<span onclick="copiarCodigo('${p.codigo}')" title="Copiar código" style="display:inline-flex;align-items:center;gap:4px;color:#7c3aed;font-size:12px;font-weight:700;cursor:pointer;">${p.codigo}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </span>` : ''}
        </div>
        <h1 class="nombre">${p.nombre}</h1>
        <br>
        ${mostrarPrecio ? `
        <div class="precio">${precio}${_dPct>0 ? ` <span style="text-decoration:line-through;color:#94a3b8;font-size:0.55em;font-weight:700;">${formatPrecio(p.precio_publico)}</span> <span style="background:linear-gradient(135deg,#f97316,#ef4444);color:#fff;font-size:0.42em;font-weight:900;padding:3px 9px;border-radius:999px;vertical-align:middle;white-space:nowrap;">🔥 -${_dPct}%</span>` : ''}</div>
        ${esMayoristaLogueado ? `<div class="precio-mayorista" style="display:block;">Precio mayorista: ${formatPrecio(p.precio_mayorista)}</div>` : '<div class="desc-transf">💸 5% OFF pagando por transferencia o efectivo</div>'}
        <div id="cuotas-mp" style="display:${cuotasFullHTML(_pubCon)?'block':'none'};font-size:12px;font-weight:700;color:#059669;margin-top:5px;font-family:Arial,sans-serif;line-height:1.35;">${cuotasFullHTML(_pubCon)}</div>
        ` : ''}
        ${sinStock ? '<div class="reposicion-aviso">⚠️ El precio de reposición del producto puede sufrir variaciones</div>' : ''}
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          ${sinStock ? `<div class="sin-stock">Sin stock</div>` : ''}
          ${badgeMercDesktop}
        </div>

        ${variantes.length ? `
        <div style="margin:12px 0 2px;">
          <div style="font-size:11px;font-weight:900;color:#64748b;text-transform:uppercase;margin-bottom:7px;font-family:Arial,sans-serif;">Elegí una opción</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${variantes.map((v,i)=>{
              const sin = v.stock <= 0;
              return `<button ${sin?'disabled':''} data-vi="${i}" onclick="seleccionarVarianteProd(${i})" class="var-chip" style="display:flex;align-items:center;gap:7px;padding:4px 11px 4px 4px;border-radius:12px;border:2px solid #e2e8f0;background:#fff;cursor:${sin?'not-allowed':'pointer'};opacity:${sin?'0.45':'1'};font-size:13px;font-weight:400;color:#1e293b;font-family:Arial,sans-serif;">
                <img src="${getImgUrl(v.foto,'200')}" style="width:30px;height:30px;object-fit:cover;border-radius:8px;" onerror="this.style.opacity='0.2'">
                <span style="${sin?'text-decoration:line-through;':''}">${v.nombre}</span>${sin?' <span style="font-size:9px;color:#94a3b8;">sin stock</span>':''}
              </button>`;
            }).join('')}
          </div>
        </div>
        ` : ''}

        <div class="btns" style="flex-direction:column;gap:10px;">
          <button class="btn-comprar" onclick="comprarAhora('${p.codigo}')" ${sinStock ? 'disabled' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 2 13 10 20 10"/><path d="M20 10L8 22l1-8H4L16 2z"/></svg>
            ${sinStock ? 'Sin stock' : 'Comprar ahora'}
          </button>
          <button class="btn-wsp" onclick="agregarYVerCarrito('${p.codigo}')" ${sinStock ? 'disabled' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Agregar al carrito
          </button>
        </div>
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

  if (variantes.length) {
    const firstOk = variantes.findIndex(v => v.stock > 0);
    if (firstOk >= 0) seleccionarVarianteProd(firstOk);
  }
}

function seleccionarVarianteProd(i){
  const vs = window._prodVariantes || [];
  const v = vs[i]; if(!v || v.stock <= 0) return;
  window._prodVarSel = v.nombre;
  const fp = document.getElementById('foto-principal');
  const vid = document.getElementById('video-principal');
  if(vid) vid.style.display='none';
  if(fp){ fp.style.display='block'; fp.src = getImgUrl(v.foto, 1600); }
  document.querySelectorAll('.var-chip').forEach(b=>{
    const on = Number(b.getAttribute('data-vi')) === i;
    b.style.borderColor = on ? '#7c3aed' : '#e2e8f0';
    b.style.background  = on ? '#f5f3ff' : '#fff';
  });
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
function comprarAhora(cod){
  if (agregarYVerCarrito(cod, true)) window.location.href = '/index.html?checkout=1';
}
function agregarYVerCarrito(cod, paraComprar) {
  const p = productoActual;
  if (!p) return false;
  const vs = window._prodVariantes || [];
  let vObj = null;
  if (vs.length) {
    if (!window._prodVarSel) { toast('Elegí una opción'); return false; }
    vObj = vs.find(v => v.nombre === window._prodVarSel);
    if (!vObj || vObj.stock <= 0) { toast('Sin stock en esa opción'); return false; }
  } else {
    if (!p.stock || p.stock <= 0) return false;
  }
  const esMay = document.body.classList.contains('is-logged-in') && window._userRol === 'mayorista';
  const _d = Number(p.descuento||0);
  const _pubCon = _d>0 ? Math.round(Number(p.precio_publico||0)*(1-_d/100)) : Number(p.precio_publico||0);
  const precio = (esMay && Number(p.precio_mayorista) > 0) ? Number(p.precio_mayorista) : _pubCon;
  const img = vObj ? getImgUrl(vObj.foto, '200') : getImgUrl((p.foto || '').split(',')[0].trim(), '200');
  const stock = vObj ? Number(vObj.stock || 0) : Number(p.stock || 0);
  const lineId = vObj ? (p.codigo + '::' + vObj.nombre) : p.codigo;
  const carrito = leerCarrito();
  const existente = carrito.find(i => String(i.id) === String(lineId));
  if (existente) {
    if (existente.cantidad >= stock) { toast(`Solo hay ${stock} unidad${stock===1?'':'es'} disponible${stock===1?'':'s'}`); return; }
    existente.cantidad++;
  } else {
    carrito.push({ id: lineId, codigo: p.codigo || '', nombre: p.nombre, variante: vObj ? vObj.nombre : null, precio: precio, img: img, stock: stock, cantidad: 1 });
  }
  try { localStorage.setItem('blinky_carrito', JSON.stringify(carrito)); } catch(e){}
  actualizarBadgeCarrito();
  if (!paraComprar) toastAgregado();
  return true;
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
  const _d = Number(p.descuento||0);
  const _pubCon = _d>0 ? Math.round(Number(p.precio_publico||0)*(1-_d/100)) : Number(p.precio_publico||0);
  const precio = formatPrecio(esMayoristaLogueado ? p.precio_publico : _pubCon);
  const msg = (sinStock && !esMayoristaLogueado)
    ? `Hola! Me interesa el producto: *${p.nombre}*. ¿Está disponible?\n\n${window.location.href}`
    : `Hola! Me interesa el producto: *${p.nombre}* (${precio}). ¿Está disponible?\n\n${window.location.href}`;
  window.open(`https://wa.me/${NRO_WSP}?text=${encodeURIComponent(msg)}`, '_blank');
}

async function compartir() {
  const p = productoActual;
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title: p.nombre, text: p.nombre, url });
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
