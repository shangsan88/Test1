import nodemailer from 'nodemailer';
import { db } from './db';
import { MOCK_NEWS } from './routes/news';

// In development, uses Ethereal (fake SMTP). In production, configure SMTP via env vars.
async function createTransport() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  // Create a test account for development
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
}

function buildEmailHtml(userName: string, articles: any[], upcoming: any[]): string {
  const articleHtml = articles.slice(0, 6).map(a => `
    <div style="margin-bottom:16px;padding:12px;background:#f8fafc;border-radius:8px;border-left:4px solid #4F46E5;">
      <h3 style="margin:0 0 4px;font-size:15px;color:#1e293b;">${a.title}</h3>
      <p style="margin:0 0 6px;font-size:13px;color:#64748b;">${a.description}</p>
      <span style="font-size:12px;color:#94a3b8;">${a.source}</span>
    </div>
  `).join('');

  const scheduleHtml = upcoming.slice(0, 5).map((e: any) => `
    <div style="margin-bottom:8px;padding:8px 12px;background:#f0f9ff;border-radius:6px;">
      <strong style="color:#0369a1;">${e.date} ${e.start_time}–${e.end_time}</strong>
      <span style="margin-left:8px;color:#1e293b;">${e.title}</span>
      ${e.location ? `<span style="margin-left:8px;color:#64748b;font-size:12px;">📍 ${e.location}</span>` : ''}
    </div>
  `).join('');

  return `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:24px;border-radius:12px;color:white;margin-bottom:24px;">
        <h1 style="margin:0 0 4px;font-size:22px;">Good Morning, ${userName}! 🌟</h1>
        <p style="margin:0;opacity:0.9;">Your personalised daily digest — ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      ${upcoming.length > 0 ? `
        <h2 style="font-size:16px;color:#1e293b;margin-bottom:12px;">📅 Today's & Upcoming Schedule</h2>
        ${scheduleHtml}
        <div style="margin-bottom:24px;"></div>
      ` : ''}
      ${articles.length > 0 ? `
        <h2 style="font-size:16px;color:#1e293b;margin-bottom:12px;">📰 News Based on Your Interests</h2>
        ${articleHtml}
      ` : ''}
      <p style="font-size:12px;color:#94a3b8;margin-top:24px;text-align:center;">
        You're receiving this because you have daily digest enabled on School Timetable.
        <a href="#" style="color:#4F46E5;">Manage preferences</a>
      </p>
    </div>
  `;
}

export async function sendDailyDigest(userId: number, userEmail: string, userName: string) {
  const interests = db.prepare('SELECT category FROM interests WHERE user_id = ?').all(userId) as any[];
  const categories = interests.map((i: any) => i.category);
  const articles = (categories.length > 0 ? categories : ['technology', 'science', 'sports'])
    .flatMap((cat: string) => (MOCK_NEWS[cat] || []).slice(0, 2));

  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const upcoming = db.prepare(
    'SELECT * FROM timetable_entries WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date ASC, start_time ASC LIMIT 10'
  ).all(userId, today, nextWeek) as any[];

  const transport = await createTransport();
  const info = await transport.sendMail({
    from: '"School Timetable" <noreply@schooltimetable.app>',
    to: userEmail,
    subject: `Your Daily Digest — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`,
    html: buildEmailHtml(userName, articles, upcoming),
  });

  // Update last_sent
  db.prepare('UPDATE email_preferences SET last_sent = datetime(\'now\') WHERE user_id = ?').run(userId);

  return info;
}

export async function runDailyDigests() {
  const prefs = db.prepare(
    'SELECT ep.*, u.email, u.name FROM email_preferences ep JOIN users u ON u.id = ep.user_id WHERE ep.email_enabled = 1'
  ).all() as any[];

  for (const p of prefs) {
    try {
      await sendDailyDigest(p.user_id, p.email, p.name);
      console.log(`Daily digest sent to ${p.email}`);
    } catch (e) {
      console.error(`Failed to send digest to ${p.email}:`, e);
    }
  }
}
