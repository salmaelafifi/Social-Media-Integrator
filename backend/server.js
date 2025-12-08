// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const axios = require('axios');
const crypto = require('crypto');

dotenv.config();

require('dotenv').config();

const TUMBLR_CONSUMER_KEY = process.env.TUMBLR_CONSUMER_KEY;
const TUMBLR_CONSUMER_SECRET = process.env.TUMBLR_CONSUMER_SECRET;
const TUMBLR_CALLBACK_URL = process.env.TUMBLR_CALLBACK_URL;


const app = express();
const PORT = process.env.PORT || 3000;

// --- middlewares ---
app.use(cors({
  origin: 'http://localhost:3001',
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

    // Redirect back to frontend (adjust URL if your frontend runs elsewhere)
    res.redirect('http://localhost:3001/dashboard');
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




const OAuth = require('oauth').OAuth;
const tumblr = require('tumblr.js');


// Create OAuth client for Tumblr
const tumblrOAuth = new OAuth(
  'https://www.tumblr.com/oauth/request_token',
  'https://www.tumblr.com/oauth/access_token',
  TUMBLR_CONSUMER_KEY,
  TUMBLR_CONSUMER_SECRET,
  '1.0A',
  TUMBLR_CALLBACK_URL,
  'HMAC-SHA1'
);

// 1) Start Tumblr auth
app.get('/auth/tumblr/start', (req, res) => {
  tumblrOAuth.getOAuthRequestToken((err, oauthToken, oauthTokenSecret) => {
    if (err) {
      console.error('Error getting Tumblr request token:', err);
      return res.status(500).send('Error starting Tumblr auth');
    }

    // Save temporary tokens in session
    req.session.tumblrRequestToken = oauthToken;
    req.session.tumblrRequestTokenSecret = oauthTokenSecret;

    // Redirect user to Tumblr authorization page
    const authUrl = `https://www.tumblr.com/oauth/authorize?oauth_token=${oauthToken}`;
    res.redirect(authUrl);
  });
});

// 2) Tumblr callback
app.get('/auth/tumblr/callback', (req, res) => {
  const { oauth_verifier, oauth_token } = req.query;

  const requestToken = req.session.tumblrRequestToken;
  const requestTokenSecret = req.session.tumblrRequestTokenSecret;

  if (!requestToken || !requestTokenSecret) {
    return res.status(400).send('Missing Tumblr request token in session');
  }

  tumblrOAuth.getOAuthAccessToken(
    oauth_token,
    requestTokenSecret,
    oauth_verifier,
    (err, accessToken, accessTokenSecret) => {
      if (err) {
        console.error('Error getting Tumblr access token:', err);
        return res.status(500).send('Error completing Tumblr auth');
      }

      // Store final access token in session so you can call Tumblr API later
      req.session.tumblr = {
        accessToken,
        accessTokenSecret
      };

      // Redirect back to frontend (adjust URL if your frontend runs elsewhere)
      res.redirect('http://localhost:3001/dashboard');
    }
  );
});

// 3) Get Tumblr posts from the user's primary blog
app.get('/api/tumblr/posts', async (req, res) => {
  const tumblrSession = req.session.tumblr;
  if (!tumblrSession) {
    return res.status(401).json({ error: 'Not connected to Tumblr' });
  }

  // Create Tumblr client with user access token
  const client = tumblr.createClient({
    consumer_key: TUMBLR_CONSUMER_KEY,
    consumer_secret: TUMBLR_CONSUMER_SECRET,
    token: tumblrSession.accessToken,
    token_secret: tumblrSession.accessTokenSecret,
    returnPromises: true, // so we can use async/await
  });

  try {
    // 1) Get info about the authenticated user (their blogs)
    const userInfo = await client.userInfo();
    const blogs = userInfo.user.blogs || [];

    if (blogs.length === 0) {
      return res.status(404).json({ error: 'No blogs found for this Tumblr user' });
    }

    // Pick primary blog if available, otherwise first blog
    const primaryBlog =
      blogs.find((b) => b.primary) || blogs[0];

    const blogName = primaryBlog.name; // e.g. "myblog"

    // 2) Get recent posts from that blog
    const postsResp = await client.blogPosts(blogName, {
      limit: 10, // how many posts you want
    });

    // Send posts to frontend
    res.json({
      blog: {
        name: primaryBlog.name,
        title: primaryBlog.title,
        url: primaryBlog.url,
      },
      posts: postsResp.posts || [],
    });
  } catch (err) {
    console.error('Error fetching Tumblr posts:', err);
    res.status(500).json({ error: 'Error fetching Tumblr posts' });
  }
});


// ---- start server ----
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
