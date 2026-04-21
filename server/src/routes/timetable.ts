import { Router, Request, Response } from 'express';
import { db } from '../db';
import { requireAuth, AuthPayload } from '../auth';

const router = Router();
router.use(requireAuth);

// Get entries for a date range
router.get('/', (req: Request, res: Response) => {
  const u = (req as any).user as AuthPayload;
  const { from, to } = req.query as { from?: string; to?: string };
  let query = 'SELECT * FROM timetable_entries WHERE user_id = ?';
  const params: any[] = [u.id];
  if (from) { query += ' AND date >= ?'; params.push(from); }
  if (to) { query += ' AND date <= ?'; params.push(to); }
  query += ' ORDER BY date ASC, start_time ASC';
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

// Create entry
router.post('/', (req: Request, res: Response) => {
  const u = (req as any).user as AuthPayload;
  const { title, description, start_time, end_time, date, type, location, is_recurring, recurrence, color } = req.body;
  if (!title || !start_time || !end_time || !date || !type) {
    res.status(400).json({ error: 'title, start_time, end_time, date, type required' });
    return;
  }
  const result = db.prepare(
    `INSERT INTO timetable_entries (user_id, title, description, start_time, end_time, date, type, location, is_recurring, recurrence, color)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`
  ).run(u.id, title, description || null, start_time, end_time, date, type, location || null, is_recurring ? 1 : 0, recurrence || null, color || '#4F46E5');
  const entry = db.prepare('SELECT * FROM timetable_entries WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(entry);
});

// Update entry
router.put('/:id', (req: Request, res: Response) => {
  const u = (req as any).user as AuthPayload;
  const { id } = req.params;
  const entry = db.prepare('SELECT * FROM timetable_entries WHERE id = ? AND user_id = ?').get(id, u.id) as any;
  if (!entry) { res.status(404).json({ error: 'Not found' }); return; }
  const { title, description, start_time, end_time, date, type, location, is_recurring, recurrence, color } = req.body;
  db.prepare(
    `UPDATE timetable_entries SET title=?, description=?, start_time=?, end_time=?, date=?, type=?, location=?, is_recurring=?, recurrence=?, color=?, updated_at=datetime('now')
     WHERE id=?`
  ).run(
    title ?? entry.title, description ?? entry.description, start_time ?? entry.start_time,
    end_time ?? entry.end_time, date ?? entry.date, type ?? entry.type,
    location ?? entry.location, is_recurring !== undefined ? (is_recurring ? 1 : 0) : entry.is_recurring,
    recurrence ?? entry.recurrence, color ?? entry.color, id
  );
  res.json(db.prepare('SELECT * FROM timetable_entries WHERE id = ?').get(id));
});

// Delete entry
router.delete('/:id', (req: Request, res: Response) => {
  const u = (req as any).user as AuthPayload;
  const result = db.prepare('DELETE FROM timetable_entries WHERE id = ? AND user_id = ?').run(req.params.id, u.id);
  if (result.changes === 0) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ success: true });
});

// Get upcoming entries (next 7 days)
router.get('/upcoming', (req: Request, res: Response) => {
  const u = (req as any).user as AuthPayload;
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const rows = db.prepare(
    'SELECT * FROM timetable_entries WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date ASC, start_time ASC LIMIT 20'
  ).all(u.id, today, nextWeek);
  res.json(rows);
});

export default router;
