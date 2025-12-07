// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const axios = require('axios');
const crypto = require('crypto');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- middlewares ---
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
}));

// ===== DEMO USER STORE =====
let users = []; // { id, email, password }

// Home
app.get('/', (req, res) => {
  res.send('Backend is running. Use /auth/register, /auth/login, /auth/x/start, /api/x/me');
});

// ----- Local auth -----
app.post('/auth/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'email already registered' });
  }
  const user = { id: users.length + 1, email, password }; // plain text for demo only
  users.push(user);
  req.session.userId = user.id;
  res.json({ message: 'registered', user: { id: user.id, email: user.email } });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'invalid credentials' });
  }
  req.session.userId = user.id;
  res.json({ message: 'logged in', user: { id: user.id, email: user.email } });
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'logged out' });
  });
});

app.get('/me', (req, res) => {
  const user = users.find(u => u.id === req.session.userId);
  if (!user) return res.status(401).json({ error: 'not logged in' });
  res.json({ id: user.id, email: user.email });
});

// ===== X OAuth 2.0 (PKCE) =====
const xPendingAuth = {}; // state -> { codeVerifier }
let xTokens = null;      // last tokens (demo)

function createCodeVerifier() {
  return crypto.randomBytes(32).toString('hex');
}

function createCodeChallenge(verifier) {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return hash
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// 1) Start login with X
app.get('/auth/x/start', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const codeVerifier = createCodeVerifier();
  const codeChallenge = createCodeChallenge(codeVerifier);

  xPendingAuth[state] = { codeVerifier };

  const authUrl = new URL('https://x.com/i/oauth2/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', process.env.X_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', process.env.X_REDIRECT_URI);
  authUrl.searchParams.set('scope', process.env.X_SCOPES);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  res.redirect(authUrl.toString());
});

// 2) Callback from X
app.get('/auth/x/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).send('Missing code or state');
  }

  const saved = xPendingAuth[state];
  if (!saved) {
    return res.status(400).send('Unknown or expired state');
  }
  delete xPendingAuth[state];

  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code.toString(),
      redirect_uri: process.env.X_REDIRECT_URI,
      client_id: process.env.X_CLIENT_ID,
      code_verifier: saved.codeVerifier,
    });

    const tokenResp = await axios.post(
      'https://api.x.com/2/oauth2/token',
      body.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' +
            Buffer.from(
              `${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`
            ).toString('base64'),
        },
      }
    );

    xTokens = tokenResp.data;

    res.send(
      `<h2>X login successful ✅</h2>
       <p>Now call <code>/api/x/me</code> from Thunder Client.</p>`
    );
  } catch (err) {
    console.error('Error exchanging code:', err.response?.data || err.message);
    res.status(500).send('Error getting X access token. Check server logs.');
  }
});

// 3) Test route to get current X user
app.get('/api/x/me', async (req, res) => {
  if (!xTokens || !xTokens.access_token) {
    return res.status(401).json({ error: 'Not connected to X yet' });
  }

  try {
    const resp = await axios.get('https://api.x.com/2/users/me', {
      headers: { Authorization: `Bearer ${xTokens.access_token}` },
    });
    res.json(resp.data);
  } catch (err) {
    console.error('Error calling X API:', err.response?.data || err.message);
    res.status(500).json({ error: 'Error calling X API' });
  }
});

// 4) Get recent posts (tweets) from the connected X user
app.get('/api/x/posts', async (req, res) => {
  // Make sure we actually have tokens from X login
  if (!xTokens || !xTokens.access_token) {
    return res.status(401).json({ error: 'Not connected to X yet' });
  }

  try {
    // 1st call: get current user to know their id
    const meResp = await axios.get('https://api.x.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${xTokens.access_token}`,
      },
    });

    const userId = meResp.data?.data?.id;
    if (!userId) {
      return res.status(500).json({ error: 'Could not find X user id' });
    }

    // 2nd call: get that user's recent tweets/posts
    const postsResp = await axios.get(
      `https://api.x.com/2/users/${userId}/tweets`,
      {
        headers: {
          Authorization: `Bearer ${xTokens.access_token}`,
        },
        params: {
          max_results: 10, // how many posts you want
          'tweet.fields': 'created_at,text,public_metrics',
        },
      }
    );

    // Send posts back to frontend
    res.json(postsResp.data);
  } catch (err) {
    console.error(
      'Error fetching X posts:',
      err.response?.status,
      err.response?.data || err.message
    );
    res.status(500).json({
      error: 'Error fetching X posts from X API',
      details: err.response?.data || err.message, // TEMP: helpful for debugging
    });
  }
});



// ---- start server ----
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
