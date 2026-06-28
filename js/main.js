// Major Rangas Main JS

function createProductCard(p) {
  const price = parseFloat(p.sale_price || p.mrp);
  const mrp = parseFloat(p.mrp);
  const hasDiscount = p.sale_price && parseFloat(p.sale_price) < mrp;
  const inStock = p.stock_qty > 0;
  const emoji = p.category === 'Sweets' ? '🍬' : p.category === 'Podis' ? '🌶️' : '🥨';

  return `
    <div class="product-card">
      ${p.image_primary
        ? `<img class="product-img" src="${p.image_primary}" alt="${p.name}" loading="lazy" onerror="this.parentNode.querySelector('.product-img-placeholder').style.display='flex';this.style.display='none'">`
        : ''}
      <div class="product-img-placeholder" style="display:${p.image_primary ? 'none' : 'flex'}">${emoji}</div>
      <div class="product-info">
        <div class="product-cat">${p.category} · ${p.sub_category || ''}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-weight">${p.weight ? p.weight + p.unit : ''}</div>
        <div class="product-price">
          <span class="price-mrp">₹${price.toFixed(2)}</span>
          ${hasDiscount ? `<span class="price-compare">₹${mrp.toFixed(2)}</span>` : ''}
          ${hasDiscount ? `<span class="price-save">${Math.round((1 - price/mrp)*100)}% OFF</span>` : ''}
        </div>
        ${inStock
          ? `<button class="add-to-cart" onclick='addToCart(${JSON.stringify({id: p.id, name: p.name, mrp: price, image_primary: p.image_primary, weight: p.weight, unit: p.unit, category: p.category})})'>Add to Cart</button>`
          : `<button class="add-to-cart" disabled>Out of Stock</button><div class="out-of-stock">Currently unavailable</div>`
        }
      </div>
    </div>
  `;
}

// Load featured products on homepage
async function loadFeaturedProducts() {
  const container = document.getElementById('featuredProducts');
  if (!container) return;
  try {
    const res = await fetch(`${CONFIG.API_URL}/api/products?featured=true`);
    const data = await res.json();
    let products = data.products || [];
    // Fallback: show first 8 active products if no featured
    if (products.length === 0) {
      const res2 = await fetch(`${CONFIG.API_URL}/api/products`);
      const data2 = await res2.json();
      products = (data2.products || []).slice(0, 8);
    }
    container.innerHTML = products.length
      ? products.slice(0, 8).map(createProductCard).join('')
      : '<p style="color:var(--gray);text-align:center;grid-column:1/-1">No products found</p>';
  } catch (err) {
    container.innerHTML = '<p style="color:var(--gray);text-align:center;grid-column:1/-1">Unable to load products. Please try again.</p>';
  }
}

function toggleMenu() {
  document.querySelector('.nav-links')?.classList.toggle('open');
}

// Init
loadFeaturedProducts();
