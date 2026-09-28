/** Config del CSS de Blinky MDQ.
 *  El robot SEO recompila tw.css a partir de estos archivos.
 *  Si en el futuro agregás un HTML público nuevo con clases de Tailwind,
 *  sumalo a la lista "content" para que sus estilos se incluyan. */
module.exports = {
  content: [
    './index.html',
    './producto.html',
    './checkout.html',
  ],
  theme: { extend: {} },
  plugins: [],
}
