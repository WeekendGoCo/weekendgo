// src/routes/auth.ts
import { Router, Request, Response } from 'express';
import { isAuthenticated } from '@middleware/auth';
import { catchAsync } from '@utils/errors';

const router = Router();

/**
 * GET /api/user
 * Get current user info
 */
router.get(
  '/user',
  catchAsync(async (req: Request, res: Response) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.json({
        loggedIn: false,
      });
    }

    return res.json({
      loggedIn: true,
      user: req.user,
    });
  })
);

/**
 * POST /auth/logout
 * Logout user
 */
router.post(
  '/logout',
  isAuthenticated,
  catchAsync(async (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Logout failed',
        });
      }
      return res.redirect('/');
    });
  })
);

export default router;