// Major Rangas Cart
let cart = JSON.parse(localStorage.getItem('mr_cart') || '[]');

function saveCart() {
  localStorage.setItem('mr_cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const total = cart.reduce((sum, i) => sum + i.quantity, 0);
  document.querySelectorAll('#cartCount').forEach(el => el.textContent = total);
}

function addToCart(product) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  renderCart();
  showToast(`${product.name} added to cart!`);
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) removeFromCart(id);
  else { saveCart(); renderCart(); }
}

function getCartTotal() {
  return cart.reduce((sum, i) => sum + (parseFloat(i.mrp) * i.quantity), 0);
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Your cart is empty</p>
        <a href="products.html" style="color:var(--gold);font-size:0.9rem;">Browse Products →</a>
      </div>`;
    if (footer) footer.innerHTML = '';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image_primary || ''}" onerror="this.style.display='none'" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${parseFloat(item.mrp).toFixed(2)} × ${item.quantity} = ₹${(parseFloat(item.mrp) * item.quantity).toFixed(2)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateQty(${item.id}, -1)">−</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})">Remove</button>
      </div>
    </div>
  `).join('');

  const subtotal = getCartTotal();
  const shipping = subtotal >= CONFIG.FREE_SHIPPING_ABOVE ? 0 : CONFIG.SHIPPING_CHARGE;
  const total = subtotal + shipping;

  if (footer) footer.innerHTML = `
    <div class="cart-total"><span>Subtotal</span><span>₹${subtotal.toFixed(2)}</span></div>
    <div class="cart-total"><span>Shipping</span><span>${shipping === 0 ? 'FREE' : '₹' + shipping}</span></div>
    <div class="cart-total" style="border-top:1px solid var(--border);padding-top:12px;margin-top:8px;">
      <span style="font-weight:700">Total</span><span>₹${total.toFixed(2)}</span>
    </div>
    <button class="checkout-btn" onclick="window.location.href='checkout.html'" style="margin-top:16px">
      Proceed to Checkout →
    </button>
    <button onclick="closeCart()" style="width:100%;background:none;border:1px solid var(--border);color:var(--gray);padding:10px;border-radius:4px;cursor:pointer;margin-top:8px;font-size:0.85rem;">
      Continue Shopping
    </button>
  `;
}

function openCart() {
  document.getElementById('cartOverlay')?.classList.add('open');
  document.getElementById('cartSidebar')?.classList.add('open');
  renderCart();
}

function closeCart() {
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.getElementById('cartSidebar')?.classList.remove('open');
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Init
updateCartCount();
