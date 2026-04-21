import { Router, Request, Response } from 'express';
import { db } from '../db';
import { requireAuth, AuthPayload } from '../auth';

const router = Router();
router.use(requireAuth);

export const NEWS_CATEGORIES = [
  'technology', 'science', 'sports', 'arts', 'music', 'gaming',
  'environment', 'history', 'math', 'literature', 'health', 'space',
  'animals', 'movies', 'travel', 'food', 'fashion', 'business'
];

router.get('/', (req: Request, res: Response) => {
  const u = (req as any).user as AuthPayload;
  const rows = db.prepare('SELECT category FROM interests WHERE user_id = ?').all(u.id) as any[];
  res.json({ interests: rows.map(r => r.category), available: NEWS_CATEGORIES });
});

router.put('/', (req: Request, res: Response) => {
  const u = (req as any).user as AuthPayload;
  const { interests } = req.body as { interests: string[] };
  if (!Array.isArray(interests)) {
    res.status(400).json({ error: 'interests must be an array' });
    return;
  }
  const valid = interests.filter(i => NEWS_CATEGORIES.includes(i));
  db.prepare('DELETE FROM interests WHERE user_id = ?').run(u.id);
  const insert = db.prepare('INSERT INTO interests (user_id, category) VALUES (?,?)');
  const insertMany = db.transaction((cats: string[]) => {
    for (const cat of cats) insert.run(u.id, cat);
  });
  insertMany(valid);
  res.json({ interests: valid });
});

export default router;
