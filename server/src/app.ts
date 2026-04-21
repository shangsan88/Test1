import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './db';
import usersRouter from './routes/users';
import timetableRouter from './routes/timetable';
import interestsRouter from './routes/interests';
import newsRouter from './routes/news';
import emailRouter from './routes/email';

initDb();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/timetable', timetableRouter);
app.use('/api/interests', interestsRouter);
app.use('/api/news', newsRouter);
app.use('/api/email', emailRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

export default app;
