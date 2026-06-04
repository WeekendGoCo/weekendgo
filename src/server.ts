// src/server.ts
import 'dotenv/config';
import express, { Express } from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import path from 'path';

import config from '@config/env';
import logger from '@utils/logger';
import {
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
  requestLoggerMiddleware,
} from '@middleware/errorHandler';
import hotelsRouter from '@routes/hotels';
import authRouter from '@routes/auth';

const app: Express = express();

// ═══════════════════════════════════════════════════════════════════════════
// Middleware Setup
// ═══════════════════════════════════════════════════════════════════════════

app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

// Session Configuration
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport Authentication
app.use(passport.initialize());
app.use(passport.session());

// ═══════════════════════════════════════════════════════════════════════════
// Passport Configuration
// ═══════════════════════════════════════════════════════════════════════════

if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.OAUTH_CALLBACK_URL,
      },
      (accessToken, refreshToken, profile, done) => {
        // TODO: Implement database user lookup/creation
        logger.debug('Google OAuth profile:', { id: profile.id, email: profile.emails?.[0]?.value });
        
        const user = {
          id: profile.id,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value,
          avatar: profile.photos?.[0]?.value,
        };

        return done(null, user);
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: string, done) => {
    // TODO: Implement database user lookup
    const user = { id };
    done(null, user);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Static Assets
// ═══════════════════════════════════════════════════════════════════════════

app.use('/logo', express.static(path.join(__dirname, '../logo')));
app.use('/app', express.static(path.join(__dirname, '../public/app')));
app.use(express.static(path.join(__dirname, '../public')));

// ═══════════════════════════════════════════════════════════════════════════
// API Routes
// ═══════════════════════════════════════════════════════════════════════════

// Auth Routes
app.get('/auth/google', (req, res, next) => {
  if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
    return res.send('Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env');
  }
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => res.redirect('/profile/')
);

// Hotel & Location Routes
app.get('/api/locations/search', (req, res, next) => {
  hotelsRouter.handle(req, res, next);
});

app.post('/api/hotels/search', (req, res, next) => {
  hotelsRouter.handle(req, res, next);
});

app.get('/api/providers/status', (req, res, next) => {
  hotelsRouter.handle(req, res, next);
});

// User & Auth Routes
app.get('/api/user', (req, res, next) => {
  authRouter.handle(req, res, next);
});

app.post('/auth/logout', (req, res, next) => {
  authRouter.handle(req, res, next);
});

// ═══════════════════════════════════════════════════════════════════════════
// Error Handling
// ═══════════════════════════════════════════════════════════════════════════

app.use(notFoundHandler);
app.use(errorHandler);

// ═══════════════════════════════════════════════════════════════════════════
// Server Startup
// ═══════════════════════════════════════════════════════════════════════════

const PORT = config.PORT;

app.listen(PORT, () => {
  logger.info(`✅ ويكند جو يعمل على: http://localhost:${PORT}`);
  logger.info('📡 Provider Status:');

  const providers = [
    { name: 'HBX/Hotelbeds', key: 'HOTELBEDS_API_KEY', status: '🟢 Active (Sandbox)' },
    { name: 'Hotels.nl', key: 'HOTELSNL_API_KEY', status: '🟢 Active' },
    { name: 'Booking.com', status: '🟡 Pending approval' },
    { name: 'WebBeds', status: '🟡 Pending approval' },
    { name: 'RateHawk', key: 'RATEHAWK_API_KEY', status: '🟡 Pending approval' },
    { name: 'TBO', key: 'TBO_API_KEY', status: '🟡 Pending approval' },
    { name: 'SerpAPI', key: 'SERPAPI_KEY', status: config.SERPAPI_KEY ? '🟢 Active (250/mo)' : '🔴 Missing key' },
  ];

  for (const provider of providers) {
    logger.info(`   ${provider.name}: ${provider.status}`);
  }
});

export default app;