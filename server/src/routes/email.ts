import { Router, Request, Response } from 'express';
import { db } from '../db';
import { requireAuth, AuthPayload } from '../auth';

const router = Router();
router.use(requireAuth);

router.get('/preferences', (req: Request, res: Response) => {
  const u = (req as any).user as AuthPayload;
  const prefs = db.prepare('SELECT * FROM email_preferences WHERE user_id = ?').get(u.id);
  res.json(prefs);
});

router.put('/preferences', (req: Request, res: Response) => {
  const u = (req as any).user as AuthPayload;
  const { email_enabled, email_time } = req.body;
  db.prepare(
    'UPDATE email_preferences SET email_enabled=?, email_time=? WHERE user_id=?'
  ).run(email_enabled ? 1 : 0, email_time || '07:00', u.id);
  res.json(db.prepare('SELECT * FROM email_preferences WHERE user_id = ?').get(u.id));
});

export default router;
