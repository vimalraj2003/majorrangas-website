// Major Rangas — Shared Navbar Account Button
(function() {
  function initAccountBtn() {
    var btn = document.getElementById('accountNavBtn');
    if (!btn) {
      // Create button if not exists
      var navLinks = document.getElementById('navLinks') || document.querySelector('.nav-right-links');
      if (!navLinks) return;
      var li = document.createElement('li');
      btn = document.createElement('a');
      btn.id = 'accountNavBtn';
      btn.style.cssText = 'color:var(--gold);font-size:0.72rem;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border:1px solid rgba(201,168,76,0.3);padding:7px 14px;border-radius:2px;transition:all 0.2s;white-space:nowrap';
      li.appendChild(btn);
      // Insert before last item (cart)
      var items = navLinks.querySelectorAll('li');
      var lastItem = items[items.length - 1];
      navLinks.insertBefore(li, lastItem);
    }

    var token = localStorage.getItem('mr_customer_token');
    var cust = JSON.parse(localStorage.getItem('mr_customer') || '{}');

    if (token && cust.email) {
      var firstName = (cust.name || cust.email).split(' ')[0];
      btn.innerHTML = '👤 ' + firstName;
      btn.href = 'account.html';
      btn.title = 'My Account';
    } else {
      btn.innerHTML = 'Login';
      btn.href = 'login.html';
      btn.title = 'Login / Register';
    }

    btn.onmouseenter = function() { this.style.background = 'rgba(201,168,76,0.1)'; };
    btn.onmouseleave = function() { this.style.background = 'none'; };
  }

  // Run after DOM loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccountBtn);
  } else {
    initAccountBtn();
  }
})();
