import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { signToken, requireAuth, AuthPayload } from '../auth';

const router = Router();

router.post('/register', (req: Request, res: Response) => {
  const { name, email, password, role, grade, subject } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400).json({ error: 'name, email, password and role are required' });
    return;
  }
  if (!['student', 'teacher'].includes(role)) {
    res.status(400).json({ error: 'role must be student or teacher' });
    return;
  }
  const hash = bcrypt.hashSync(password, 10);
  try {
    const stmt = db.prepare(
      'INSERT INTO users (name, email, password, role, grade, subject) VALUES (?,?,?,?,?,?)'
    );
    const result = stmt.run(name, email, hash, role, grade || null, subject || null);
    const userId = result.lastInsertRowid as number;
    db.prepare('INSERT INTO email_preferences (user_id) VALUES (?)').run(userId);
    const user = db.prepare('SELECT id, name, email, role, grade, subject FROM users WHERE id = ?').get(userId) as any;
    res.status(201).json({ token: signToken({ id: user.id, email: user.email, role: user.role, name: user.name }), user });
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      res.status(409).json({ error: 'Email already registered' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'email and password required' });
    return;
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const { password: _, ...safe } = user;
  res.json({ token: signToken({ id: user.id, email: user.email, role: user.role, name: user.name }), user: safe });
});

router.get('/me', requireAuth, (req: Request, res: Response) => {
  const u = (req as any).user as AuthPayload;
  const user = db.prepare('SELECT id, name, email, role, grade, subject, created_at FROM users WHERE id = ?').get(u.id);
  res.json(user);
});

router.put('/me', requireAuth, (req: Request, res: Response) => {
  const u = (req as any).user as AuthPayload;
  const { name, grade, subject } = req.body;
  db.prepare('UPDATE users SET name=?, grade=?, subject=? WHERE id=?').run(name, grade || null, subject || null, u.id);
  const user = db.prepare('SELECT id, name, email, role, grade, subject FROM users WHERE id = ?').get(u.id);
  res.json(user);
});

export default router;
