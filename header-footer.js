// ════════════════════════════════════════════════════════
// HEADER Y FOOTER MAESTROS — Blinky MDQ
// Este archivo es la única fuente de verdad para el diseño
// del header y footer usados en páginas secundarias (como
// producto.html). Cambiá acá y se actualiza en todas.
//
// NOTA: index.html tiene su propio header/footer inline
// (no usa este archivo todavía) porque ahí el buscador y los
// filtros de categoría/marca están enganchados en vivo con el
// catálogo completo de productos. En páginas secundarias, esos
// mismos controles simplemente te llevan de vuelta a la tienda.
// ════════════════════════════════════════════════════════

function renderBlinkyHeader() {
    return `
    <div style="background:#f3f0ff;border-bottom:1px solid #e5e0fa;width:100%;overflow:hidden;">
        <div style="height:26px;display:flex;align-items:center;justify-content:center;gap:14px;padding:0 12px;">
            <span style="display:inline-flex;align-items:center;gap:4px;font-size:9px;font-weight:700;color:#5b21b6;flex-shrink:0;white-space:nowrap;">
                <svg style="width:13px;height:13px;fill:none;stroke:#7c3aed;stroke-width:2" viewBox="0 0 24 24"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/></svg>Productos originales
            </span>
            <span style="color:#c4b5fd;flex-shrink:0;">•</span>
            <span style="display:inline-flex;align-items:center;gap:4px;font-size:9px;font-weight:700;color:#5b21b6;flex-shrink:0;white-space:nowrap;">
                <svg style="width:13px;height:13px;fill:none;stroke:#7c3aed;stroke-width:2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Compra 100% segura
            </span>
            <span style="color:#c4b5fd;flex-shrink:0;">•</span>
            <span style="display:inline-flex;align-items:center;gap:4px;font-size:9px;font-weight:700;color:#5b21b6;flex-shrink:0;white-space:nowrap;">
                <svg style="width:13px;height:13px;fill:none;stroke:#7c3aed;stroke-width:2" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>Envíos a todo el país
            </span>
        </div>
    </div>

    <header class="bg-white sticky top-0 z-40 border-b border-slate-100 shadow-sm w-full">
        <div class="max-w-7xl mx-auto px-4 md:px-6 flex items-center gap-4" style="height:64px;">
            <a href="https://blinkymdq.com" class="flex-shrink-0" style="filter:drop-shadow(0 0 10px rgba(124,58,237,0.5)) drop-shadow(0 0 20px rgba(124,58,237,0.25));">
                <img src="https://blinkymdq.com/blinkysinfondo.png" alt="Blinky MDQ" style="height:52px;width:auto;object-fit:contain;">
            </a>

            <div class="flex-1 relative">
                <input type="text" id="bkHeaderBusqueda" placeholder="Buscar producto..." autocomplete="off"
                    onkeydown="if(event.key==='Enter') bkIrABuscar()"
                    style="width:100%;height:42px;padding:0 3rem 0 1.25rem;background:white;border:2px solid #7c3aed;border-radius:999px;font-size:13px;font-weight:500;outline:none;color:#1e293b;">
                <button onclick="bkIrABuscar()" style="position:absolute;right:4px;top:50%;transform:translateY(-50%);width:34px;height:34px;border-radius:50%;background:#7c3aed;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;">
                    <svg style="width:15px;height:15px;" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </button>
            </div>

            <a href="https://blinkymdq.com/tienda.html" title="Iniciar sesión" class="flex-shrink-0 hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors" style="text-decoration:none;">
                <svg style="width:20px;height:20px;flex-shrink:0;" fill="none" stroke="#7c3aed" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <div style="text-align:left;">
                    <div style="font-size:9px;color:#94a3b8;font-weight:600;line-height:1;">Hola,</div>
                    <div style="font-size:11px;font-weight:900;color:#1e293b;text-transform:uppercase;line-height:1.2;">Acceso</div>
                </div>
            </a>

            <a href="https://blinkymdq.com/tienda.html" title="Ver carrito" class="flex-shrink-0" style="padding:8px;">
                <svg style="width:24px;height:24px;" fill="none" stroke="#1e293b" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
            </a>
        </div>

        <div class="border-t border-slate-100">
            <div class="max-w-7xl mx-auto px-4 md:px-6 flex items-center gap-3 overflow-x-auto" style="height:40px;">
                <a href="https://blinkymdq.com/tienda.html" style="flex-shrink:0;display:inline-flex;align-items:center;gap:6px;height:32px;background:#7c3aed;color:white;border-radius:999px;padding:0 1rem;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em;text-decoration:none;white-space:nowrap;">
                    <svg style="width:13px;height:13px;" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                    Ver todos los productos
                </a>
            </div>
        </div>
    </header>
    `;
}

function renderBlinkyFooter() {
    return `
    <footer class="bg-slate-900 text-white mt-10">
        <div class="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-center">

            <div class="flex items-center justify-center col-span-2 md:col-span-1">
                <img src="https://blinkymdq.com/blinky_sin_fdo.svg" alt="Blinky MDQ" class="w-36 h-auto object-contain">
            </div>

            <div class="flex items-start gap-3">
                <div class="mt-0.5 shrink-0 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <svg class="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                </div>
                <div>
                    <div class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Ubicación</div>
                    <div class="text-xs font-bold text-white leading-snug">Buenos Aires<br>Mar del Plata 7600</div>
                </div>
            </div>

            <a href="https://wa.me/5492235910492" target="_blank" rel="noopener" class="flex items-start gap-3 hover:opacity-80 transition-opacity">
                <div class="mt-0.5 shrink-0 w-9 h-9 rounded-xl bg-[#25D366]/20 flex items-center justify-center">
                    <svg class="w-4 h-4 fill-[#25D366]" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </div>
                <div>
                    <div class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">WhatsApp</div>
                    <div class="text-xs font-bold text-white">+54 9 223 5 910492</div>
                </div>
            </a>

            <a href="https://instagram.com/blinkymdq" target="_blank" rel="noopener" class="flex items-start gap-3 hover:opacity-80 transition-opacity">
                <div class="mt-0.5 shrink-0 w-9 h-9 rounded-xl bg-pink-500/20 flex items-center justify-center">
                    <svg class="w-4 h-4 fill-pink-400" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                </div>
                <div>
                    <div class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Instagram</div>
                    <div class="text-xs font-bold text-white">@blinkymdq</div>
                </div>
            </a>

            <div class="flex items-start gap-3">
                <div class="mt-0.5 shrink-0 w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <svg class="w-4 h-4 stroke-violet-400" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                </div>
                <div>
                    <div class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Envíos</div>
                    <div class="text-xs font-bold text-white leading-snug">Envíos en Mar del Plata<br>en el día</div>
                </div>
            </div>

        </div>
        <div class="border-t border-white/10 py-4 text-center text-[9px] font-bold uppercase tracking-widest text-slate-500">
            © 2026 Blinky MDQ — Todos los derechos reservados
        </div>
    </footer>
    `;
}

function bkIrABuscar() {
    const val = document.getElementById('bkHeaderBusqueda').value.trim();
    window.location.href = val
        ? `https://blinkymdq.com/tienda.html?q=${encodeURIComponent(val.toLowerCase().replace(/\s+/g,'-'))}`
        : 'https://blinkymdq.com/tienda.html';
}

// El header se escribe DE INMEDIATO (document.write), apenas el navegador
// llega a este script — así aparece primero, como una página tradicional,
// sin esperar a que cargue el resto del contenido.
// Requisito: el <script src="header-footer.js"> tiene que estar ubicado
// en el HTML exactamente donde querés que aparezca el header.
document.write(renderBlinkyHeader());

// El footer sí puede esperar sin problema, porque va al final de la página.
document.addEventListener('DOMContentLoaded', function () {
    const f = document.getElementById('bk-footer');
    if (f) f.innerHTML = renderBlinkyFooter();
});
