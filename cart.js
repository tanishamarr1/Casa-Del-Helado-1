/**
 * La Casa Del Helado — Cart Module
 * Maneja el carrito de compras, el modal de pedido
 * y el envío por WhatsApp + guardado en Supabase.
 */

// ─── Cart state
let cart = JSON.parse(localStorage.getItem('lcdh_cart') || '[]');

// ─── Persist
function saveCart() {
  localStorage.setItem('lcdh_cart', JSON.stringify(cart));
}

// ─── Add item
function addToCart(product) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  updateCartUI();
  showCartToast(product.nombre);
  openCart();
}

// ─── Remove item
function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartUI();
}

// ─── Update quantity
function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else { saveCart(); updateCartUI(); }
}

// ─── Total
function cartTotal() {
  return cart.reduce((sum, i) => sum + i.precio * i.qty, 0);
}

// ─── UI update
function updateCartUI() {
  const badge   = document.getElementById('cartBadge');
  const total   = document.getElementById('cartTotal');
  const footer  = document.getElementById('cartFooter');
  const empty   = document.getElementById('cartEmpty');
  const items   = document.getElementById('cartItems');

  const count = cart.reduce((s, i) => s + i.qty, 0);

  // Badge
  if (badge) {
    if (count > 0) {
      badge.classList.remove('hidden');
      badge.classList.add('flex');
      badge.textContent = count;
    } else {
      badge.classList.add('hidden');
      badge.classList.remove('flex');
    }
  }

  // Total
  if (total) total.textContent = `RD$ ${cartTotal().toLocaleString('es-DO')}`;

  // Footer
  if (footer) {
    cart.length > 0 ? footer.classList.remove('hidden') : footer.classList.add('hidden');
  }

  // Empty state
  if (empty) {
    empty.style.display = cart.length === 0 ? 'flex' : 'none';
  }

  // Items list
  if (items) {
    const existing = items.querySelectorAll('.cart-item');
    existing.forEach(el => el.remove());

    cart.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item flex items-start gap-3 p-3 rounded-xl bg-gray-50';
      div.innerHTML = `
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style="background:#F9E8EE">
          <i data-lucide="ice-cream-bowl" class="w-5 h-5" style="color:#C97A94"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium truncate" style="color:#2D2D2D">${item.nombre}</div>
          <div class="text-xs text-gray-400">RD$ ${Number(item.precio).toLocaleString('es-DO')} c/u</div>
          <div class="flex items-center gap-2 mt-2">
            <button onclick="updateQty(${item.id}, -1)" class="w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors text-sm font-bold">-</button>
            <span class="text-sm font-medium w-4 text-center">${item.qty}</span>
            <button onclick="updateQty(${item.id}, 1)"  class="w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors text-sm font-bold">+</button>
          </div>
        </div>
        <div class="text-right flex-shrink-0">
          <div class="text-sm font-bold" style="color:#C97A94">RD$ ${(item.precio * item.qty).toLocaleString('es-DO')}</div>
          <button onclick="removeFromCart(${item.id})" class="text-xs text-gray-400 hover:text-red-400 transition-colors mt-1 flex items-center gap-0.5">
            <i data-lucide="trash-2" class="w-3 h-3"></i> Quitar
          </button>
        </div>`;
      items.appendChild(div);
    });

    lucide.createIcons();
  }
}

// ─── Cart drawer
function openCart() {
  const overlay = document.getElementById('cartOverlay');
  const drawer  = document.getElementById('cartDrawer');
  overlay.classList.remove('hidden');
  overlay.style.opacity = '0';
  setTimeout(() => { overlay.style.opacity = '1'; }, 10);
  drawer.classList.remove('closed');
  drawer.classList.add('open');
}

function closeCart() {
  const overlay = document.getElementById('cartOverlay');
  const drawer  = document.getElementById('cartDrawer');
  overlay.style.opacity = '0';
  drawer.classList.remove('open');
  drawer.classList.add('closed');
  setTimeout(() => overlay.classList.add('hidden'), 350);
}

// ─── Toast
function showCartToast(name) {
  const existing = document.getElementById('cartToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'cartToast';
  toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-sm font-medium shadow-lg';
  toast.style.background = '#C97A94';
  toast.style.transform  = 'translateX(-50%) translateY(10px)';
  toast.style.opacity    = '0';
  toast.style.transition = 'all 0.3s ease';
  toast.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4"></i> ${name} agregado`;
  document.body.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity   = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  }, 10);
  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}

// ─── Order modal
function openOrderModal() {
  closeCart();
  if (cart.length === 0) {
    alert('Agrega productos a tu pedido primero.');
    return;
  }

  // Populate summary
  const summary = document.getElementById('orderSummary');
  if (summary) {
    summary.innerHTML = `
      <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Resumen del pedido</div>
      ${cart.map(i => `
        <div class="flex justify-between text-sm">
          <span>${i.qty}x ${i.nombre}</span>
          <span class="font-medium">RD$ ${(i.precio * i.qty).toLocaleString('es-DO')}</span>
        </div>`).join('')}
      <div class="border-t border-rose-light mt-2 pt-2 flex justify-between text-sm font-bold">
        <span>Total</span>
        <span style="color:#C97A94">RD$ ${cartTotal().toLocaleString('es-DO')}</span>
      </div>`;
  }

  document.getElementById('orderModal').classList.remove('hidden');
}

// ─── Validate form
function validateOrderForm() {
  const name    = document.getElementById('clientName').value.trim();
  const phone   = document.getElementById('clientPhone').value.trim();
  const address = document.getElementById('clientAddress').value.trim();
  const errDiv  = document.getElementById('orderError');
  const errMsg  = errDiv.querySelector('span');

  if (!name)    { showError(errDiv, errMsg, 'Por favor ingresa tu nombre.'); return false; }
  if (!phone)   { showError(errDiv, errMsg, 'Por favor ingresa tu teléfono.'); return false; }
  if (!address) { showError(errDiv, errMsg, 'Por favor ingresa tu dirección de entrega.'); return false; }

  errDiv.classList.add('hidden');
  return { name, phone, address, notes: document.getElementById('clientNotes').value.trim() };
}

function showError(div, span, msg) {
  span.textContent = msg;
  div.classList.remove('hidden');
}

// ─── Send via WhatsApp
function sendOrderWhatsApp() {
  const data = validateOrderForm();
  if (!data) return;

  const WHATSAPP_NUMBER = '18091234567'; // <-- Cambia al número real

  const lines = [
    '*Nuevo pedido - La Casa Del Helado*',
    '',
    `*Cliente:* ${data.name}`,
    `*Telefono:* ${data.phone}`,
    `*Direccion:* ${data.address}`,
    data.notes ? `*Notas:* ${data.notes}` : null,
    '',
    '*Productos:*',
    ...cart.map(i => `  - ${i.qty}x ${i.nombre} — RD$ ${(i.precio * i.qty).toLocaleString('es-DO')}`),
    '',
    `*Total: RD$ ${cartTotal().toLocaleString('es-DO')}*`,
    '',
    `_Pedido realizado desde la web_`,
  ].filter(l => l !== null).join('\n');

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`;
  window.open(url, '_blank');
  finishOrder(data);
}

// ─── Save order to Supabase
async function saveOrderToSupabase() {
  const data = validateOrderForm();
  if (!data) return;

  const orderData = {
    cliente:   data.name,
    telefono:  data.phone,
    direccion: data.address,
    notas:     data.notes,
    productos: JSON.stringify(cart.map(i => ({ id: i.id, nombre: i.nombre, qty: i.qty, precio: i.precio }))),
    total:     cartTotal(),
    estado:    'pendiente',
    fecha:     new Date().toISOString(),
  };

  try {
    const query = await supabase.from('pedidos');
    const { error } = await query.insert(orderData);
    if (error) {
      console.error('Error guardando pedido:', error);
      // Still show success to user — they already sent WhatsApp
    }
  } catch (e) {
    console.warn('No se pudo guardar en Supabase:', e);
  }

  finishOrder(data);
}

// ─── Finish order flow
function finishOrder(data) {
  document.getElementById('orderModal').classList.add('hidden');
  cart = [];
  saveCart();
  updateCartUI();

  // Success toast
  const toast = document.createElement('div');
  toast.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-white text-sm font-medium shadow-xl flex items-center gap-2';
  toast.style.background = '#4CAF50';
  toast.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4"></i> Pedido enviado exitosamente`;
  document.body.appendChild(toast);
  lucide.createIcons();
  setTimeout(() => toast.remove(), 3500);
}

// ─── Init
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();

  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) cartBtn.addEventListener('click', openCart);
});
