require('dotenv').config();
const express  = require('express');
const https    = require('https');
const path     = require('path');
const session  = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// ── Providers ────────────────────────────────────────────────────────────────
const aggregator = require('./lib/providers/aggregator');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ── Static Assets ─────────────────────────────────────────────────────────────
app.use('/logo', express.static(path.join(__dirname, 'logo')));

// ── Database ──────────────────────────────────────────────────────────────────
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      google_id TEXT UNIQUE,
      name TEXT,
      email TEXT,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// ── Session & Passport ────────────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_weekend_go',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done)   => done(null, user.id));
passport.deserializeUser((id, done)   =>
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => done(err, row))
);

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id') {
  passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  '/auth/google/callback',
  }, (accessToken, refreshToken, profile, done) => {
    db.get('SELECT * FROM users WHERE google_id = ?', [profile.id], (err, row) => {
      if (err) return done(err);
      if (row) return done(null, row);

      const name   = profile.displayName;
      const email  = profile.emails?.[0]?.value  ?? null;
      const avatar = profile.photos?.[0]?.value  ?? null;

      db.run(
        'INSERT INTO users (google_id, name, email, avatar) VALUES (?, ?, ?, ?)',
        [profile.id, name, email, avatar],
        function (err) {
          if (err) return done(err);
          done(null, { id: this.lastID, google_id: profile.id, name, email, avatar });
        }
      );
    });
  }));
}

// ── Auth Routes ───────────────────────────────────────────────────────────────
app.get('/auth/google',
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your_google_client_id')
      return res.send('يرجى إضافة GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET في ملف .env أولاً');
    next();
  },
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => res.redirect('/profile/')
);

app.get('/api/user', (req, res) =>
  req.isAuthenticated()
    ? res.json({ loggedIn: true,  user: req.user })
    : res.json({ loggedIn: false })
);

app.post('/auth/logout', (req, res, next) =>
  req.logout(err => err ? next(err) : res.redirect('/'))
);

// ── Autocomplete (قائمة ثابتة — لا تستهلك API quota) ─────────────────────────
app.get('/api/autocomplete', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q || q.length < 2) return res.json([]);

  // استخدم قاموس HBX الداخلي مباشرة — لا API call
  const { getCityMap } = require('./lib/providers/hotelbeds');
  const cities = getCityMap();

  const results = cities
    .filter(c => c.nameAr.includes(q) || c.nameEn.toLowerCase().includes(q))
    .slice(0, 6)
    .map(c => ({ name: c.nameAr, nameEn: c.nameEn, type: 'مدينة', country: c.country }));

  res.json(results);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── Hotels API — المسارات الجديدة ─────────────────────────────────────────────
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/locations/search?query=دبي
 * يُحوّل اسم المدينة إلى destination IDs لكل المزودين
 */
app.get('/api/locations/search', async (req, res) => {
  const query = (req.query.query || req.query.q || '').trim();

  if (!query || query.length < 2) {
    return res.status(400).json({ success: false, message: 'query too short' });
  }

  try {
    const { results, source } = await aggregator.searchLocations(query);
    return res.json({ success: true, source, data: results });
  } catch (err) {
    console.error('[/api/locations/search]', err.message);
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
});

/**
 * POST /api/hotels/search
 * Body: { destination?, destId?, checkIn?, checkOut?, guests?, children? }
 *
 * يجمع نتائج كل المزودين المتاحين ويعيد الأرخص لكل فندق
 */
app.post('/api/hotels/search', async (req, res) => {
  try {
    const {
      destination,
      destId,
      checkIn,
      checkOut,
      guests   = 2,
      children = [],
    } = req.body;

    // تواريخ افتراضية إذا لم تُرسل
    const today  = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 7);
    const cin  = checkIn  || today.toISOString().split('T')[0];
    const cout = checkOut || future.toISOString().split('T')[0];

    // حلّ dest ID إذا لم يُرسل
    let resolvedDestId = destId;

    if (!resolvedDestId && destination) {
      const { results } = await aggregator.searchLocations(destination);
      if (results.length > 0) {
        resolvedDestId = results[0].id;
      }
    }

    if (!resolvedDestId) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found. Try a different city name.',
      });
    }

    const { hotels, providersSummary } = await aggregator.searchHotels({
      destId:   resolvedDestId,
      checkIn:  cin,
      checkOut: cout,
      adults:   Number(guests),
      children: Array.isArray(children) ? children : [],
    });

    return res.json({
      success:  true,
      count:    hotels.length,
      providers: providersSummary,
      data:     hotels,
    });

  } catch (err) {
    console.error('[/api/hotels/search]', err.message);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

/**
 * GET /api/providers/status
 * يعرض حالة كل مزود — مفيد للـ Admin Dashboard
 */
app.get('/api/providers/status', (req, res) => {
  const hotelbeds = require('./lib/providers/hotelbeds');
  const booking   = require('./lib/providers/booking');
  const webbeds   = require('./lib/providers/webbeds');
  const ratehawk  = require('./lib/providers/ratehawk');
  const tbo       = require('./lib/providers/tbo');
  const hotelsnl  = require('./lib/providers/hotelsnl');

  res.json({
    hotelbeds:  { available: hotelbeds.isAvailable(),  note: 'Sandbox (PRUEBAS)' },
    booking:    { available: booking.isAvailable(),    note: 'Pending approval' },
    webbeds:    { available: webbeds.isAvailable(),    note: 'Pending approval' },
    ratehawk:   { available: ratehawk.isAvailable(),   note: 'Pending approval' },
    tbo:        { available: tbo.isAvailable(),        note: 'Pending approval' },
    hotelsnl:   { available: hotelsnl.isAvailable(),   note: 'Ready — needs API key' },
    serpapi:    { available: !!process.env.SERPAPI_KEY, note: 'Active (250/month)' },
  });
});

// ── SerpAPI Proxy (للصور والبيانات الثابتة فقط — لا تستخدم في كل بحث) ─────────
app.get('/api/serpapi', (req, res) => {
  if (!process.env.SERPAPI_KEY) {
    return res.status(503).json({ error: 'SerpAPI not configured' });
  }

  const params = new URLSearchParams({ ...req.query, api_key: process.env.SERPAPI_KEY });
  const url    = `https://serpapi.com/search.json?${params}`;

  https.get(url, (serpRes) => {
    let body = '';
    serpRes.on('data', chunk => body += chunk);
    serpRes.on('end', () => {
      try {
        res.setHeader('Content-Type', 'application/json');
        res.status(serpRes.statusCode).json(JSON.parse(body));
      } catch (_) {
        res.status(500).json({ error: 'parse_error' });
      }
    });
  }).on('error', err => res.status(502).json({ error: err.message }));
});

// ── Serve Next.js static build ─────────────────────────────────────────────────
app.use('/app', express.static(path.join(__dirname, 'public', 'app')));
app.use(express.static(path.join(__dirname, 'public')));

// ── Catch-all ──────────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  const fs = require('fs');
  const nextAppPath = path.join(__dirname, 'public', 'app', 'index.html');
  const legacyPath  = path.join(__dirname, 'public', 'index.html');

  if (fs.existsSync(nextAppPath)) {
    res.sendFile(nextAppPath);
  } else if (fs.existsSync(legacyPath)) {
    res.sendFile(legacyPath);
  } else {
    res.status(404).send('Build not found. Run: cd frontend && npm run build');
  }
});

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  ويكند جو يعمل على: http://localhost:${PORT}`);
  console.log(`\n📡  Provider Status:`);

  const hotelbeds = require('./lib/providers/hotelbeds');
  const hotelsnl  = require('./lib/providers/hotelsnl');
  const booking   = require('./lib/providers/booking');

  console.log(`   HBX/Hotelbeds : ${hotelbeds.isAvailable() ? '🟢 Active (Sandbox)' : '🔴 Missing HBX_API_KEY + HBX_SECRET'}`);
  console.log(`   Hotels.nl     : ${hotelsnl.isAvailable()  ? '🟢 Active'           : '🟡 Missing HOTELS_NL_API_KEY'}`);
  console.log(`   Booking.com   : 🟡 Pending approval`);
  console.log(`   WebBeds       : 🟡 Pending approval`);
  console.log(`   RateHawk      : 🟡 Pending approval`);
  console.log(`   TBO           : 🟡 Pending approval`);
  console.log(`   SerpAPI       : ${process.env.SERPAPI_KEY ? '🟢 Active (250/mo)' : '🔴 Missing SERPAPI_KEY'}\n`);
});
