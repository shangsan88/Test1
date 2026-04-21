import cron from 'node-cron';
import app from './app';
import { runDailyDigests } from './mailer';

const PORT = process.env.PORT || 3001;

// Daily digest cron — runs every day at 7:00 AM
cron.schedule('0 7 * * *', () => {
  console.log('Running daily digest...');
  runDailyDigests().catch(console.error);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
