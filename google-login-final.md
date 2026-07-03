# Google Sign-In — Final code (Client ID already inserted)

Client ID used below: `703577695935-u744a533o8d3ci3m1drnun9s70a2aels.apps.googleusercontent.com`

---

## 1. Frontend — index.html

### A. Add in <head> (near your other <link>/<script> tags)
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### B. Replace the placeholder Google button (around line 577)
Find:
```html
<button class="google-btn" onclick="closeLogin();window.location.href='login.html'">
  <img src="https://www.google.com/favicon.ico" width="16" alt="G"> Continue with Google
</button>
```
Replace with:
```html
<div id="googleSignInBtn"></div>
```

### C. Add this JS (near your other script logic, after `var API = ...` is defined)
```javascript
google.accounts.id.initialize({
  client_id: '703577695935-u744a533o8d3ci3m1drnun9s70a2aels.apps.googleusercontent.com',
  callback: handleGoogleLogin
});
google.accounts.id.renderButton(
  document.getElementById('googleSignInBtn'),
  { theme: 'outline', size: 'large', width: 280, text: 'continue_with' }
);

async function handleGoogleLogin(response) {
  try {
    const res = await fetch(API + '/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Google sign-in failed');

    localStorage.setItem('mr_token', data.token);
    localStorage.setItem('mr_user', JSON.stringify(data.user));
    closeLogin();
    showToast('Welcome, ' + data.user.name + '!');
    location.reload();
  } catch (err) {
    showToast(err.message || 'Google sign-in failed', true);
  }
}
```
NOTE: if your page currently calls `google.accounts.id.renderButton` /
`initialize` inside `window.onload`, put this block there instead of loose —
just make sure it runs after the page (and the Google script) has loaded.
Also double check `localStorage`/`showToast` calls match what your existing
`doLogin()` already uses, so both login paths behave identically.

---

## 2. Backend — Railway/Express

### A. Install
```bash
npm install google-auth-library
```

### B. Add route (same file as your existing /api/auth/login)
```javascript
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client('703577695935-u744a533o8d3ci3m1drnun9s70a2aels.apps.googleusercontent.com');

router.post('/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Missing credential' });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: '703577695935-u744a533o8d3ci3m1drnun9s70a2aels.apps.googleusercontent.com'
    });
    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();
    const name = payload.name;

    let { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = rows[0];

    if (!user) {
      const insert = await pool.query(
        `INSERT INTO users (email, name, password_hash, auth_provider)
         VALUES ($1, $2, $3, 'google') RETURNING *`,
        [email, name, null]
      );
      user = insert.rows[0];
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});
```

### C. Database — run once on Railway Postgres
```sql
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'email';
```

---

## 3. Checklist
- [ ] Paste frontend script tag + button + JS into index.html
- [ ] Paste backend route into your auth routes file, `npm install google-auth-library`
- [ ] Run the 2 SQL statements on Railway Postgres
- [ ] Push frontend via GitHub web editor, redeploy backend on Railway
- [ ] Test on majorrangas.in — click "Continue with Google", confirm you're logged in
