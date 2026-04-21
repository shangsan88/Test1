import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { initDb } from './db';
import usersRouter from './routes/users';
import timetableRouter from './routes/timetable';
import interestsRouter from './routes/interests';
import newsRouter from './routes/news';
import emailRouter from './routes/email';
import { runDailyDigests } from './mailer';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/users', usersRouter);
app.use('/api/timetable', timetableRouter);
app.use('/api/interests', interestsRouter);
app.use('/api/news', newsRouter);
app.use('/api/email', emailRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Daily digest — runs every day at 7:00 AM
cron.schedule('0 7 * * *', () => {
  console.log('Running daily digest...');
  runDailyDigests().catch(console.error);
});

initDb();
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
