// Load environment variables from .env
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Allow frontend (later) to call the backend from another port (e.g. Vite/React)
app.use(cors({
  origin: 'http://localhost:5173', // change later if your frontend runs on another port
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Session setup (to remember logged-in users)
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-fallback',
  resave: false,
  saveUninitialized: false
}));

// ---------- TEST ROUTE ----------
app.get('/', (req, res) => {
  res.send('<h1>Backend is running ✅</h1><p>Try <a href="/auth/pinterest">Login with Pinterest</a></p>');
});

// ---------- AUTH STEP 1: Redirect to Pinterest ----------
app.get('/auth/pinterest', (req, res) => {
  const state = Math.random().toString(36).substring(2);
  req.session.oauthState = state;

  const params = new URLSearchParams({
    client_id: process.env.PINTEREST_CLIENT_ID || '',
    redirect_uri: process.env.PINTEREST_REDIRECT_URI || '',
    response_type: 'code',
    scope: 'boards:read,pins:read,user_accounts:read',
    state
  });

  const authUrl = `https://www.pinterest.com/oauth/?${params.toString()}`;
  res.redirect(authUrl);
});

// ---------- AUTH STEP 2: Callback from Pinterest ----------
app.get('/auth/pinterest/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || state !== req.session.oauthState) {
      return res.status(400).send('Invalid state or missing code');
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code.toString(),
      redirect_uri: process.env.PINTEREST_REDIRECT_URI || '',
      client_id: process.env.PINTEREST_CLIENT_ID || '',
      client_secret: process.env.PINTEREST_CLIENT_SECRET || ''
    });

    const tokenRes = await fetch('https://api.pinterest.com/v5/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error('Token error:', tokenData);
      return res.status(500).send('Error getting Pinterest token');
    }

    // Store token in session
    req.session.pinterest = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in
    };

    res.send('<h2>Logged in with Pinterest ✅</h2><p>You can now call <code>/api/me</code> or <code>/api/pinterest/feed</code>.</p>');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error during Pinterest callback');
  }
});

// ---------- SMALL APIS FOR YOUR TEAM ----------

// Is the user authenticated?
app.get('/api/me', (req, res) => {
  if (!req.session.pinterest) {
    return res.json({ authenticated: false });
  }
  res.json({ authenticated: true });
});

// Example Pinterest data endpoint
app.get('/api/pinterest/feed', async (req, res) => {
  if (!req.session.pinterest?.accessToken) {
    return res.status(401).json({ error: 'Not logged in with Pinterest' });
  }

  try {
    const userRes = await fetch('https://api.pinterest.com/v5/user_account', {
      headers: {
        Authorization: `Bearer ${req.session.pinterest.accessToken}`
      }
    });

    const userData = await userRes.json();

    res.json({
      user: userData
      // later: boards, pins, combined feed
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch Pinterest data' });
  }
});

// Logout
app.get('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.send('Logged out ✅');
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
