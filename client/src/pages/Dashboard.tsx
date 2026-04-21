import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { type TimetableEntry, TYPE_LABELS } from '../types';
import { format, isToday, isTomorrow } from 'date-fns';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function dayLabel(date: string) {
  const d = new Date(date + 'T00:00:00');
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'EEE, MMM d');
}

export default function Dashboard() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState<TimetableEntry[]>([]);
  const [todayEntries, setTodayEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    Promise.all([
      api.get<TimetableEntry[]>('/timetable/upcoming'),
      api.get<TimetableEntry[]>('/timetable', { params: { from: today, to: today } }),
    ]).then(([up, td]) => {
      setUpcoming(up.data.slice(0, 8));
      setTodayEntries(td.data);
    }).finally(() => setLoading(false));
  }, []);

  const stats = {
    today: todayEntries.length,
    thisWeek: upcoming.length,
    classes: todayEntries.filter(e => e.type === 'class').length,
    activities: todayEntries.filter(e => e.type === 'activity').length,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">{getGreeting()}, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-primary-100 mt-1">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
        {user?.role === 'student' && user.grade && (
          <p className="text-primary-200 text-sm mt-1">{user.grade}</p>
        )}
        {user?.role === 'teacher' && user.subject && (
          <p className="text-primary-200 text-sm mt-1">{user.subject} Teacher</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Events", value: stats.today, icon: '📅', color: 'bg-blue-50 text-blue-700' },
          { label: 'Upcoming (7 days)', value: stats.thisWeek, icon: '🗓️', color: 'bg-purple-50 text-purple-700' },
          { label: 'Classes Today', value: stats.classes, icon: '📚', color: 'bg-green-50 text-green-700' },
          { label: 'Activities Today', value: stats.activities, icon: '⚽', color: 'bg-orange-50 text-orange-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl mb-2 ${s.color}`}>
              {s.icon}
            </div>
            <div className="text-2xl font-bold text-gray-800">{loading ? '—' : s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-semibold text-gray-800">Today's Schedule</h2>
            <Link to="/timetable" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="p-4 space-y-2 min-h-32">
            {loading ? (
              <div className="text-center text-gray-400 py-8">Loading...</div>
            ) : todayEntries.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-gray-500 text-sm">No events today</p>
                <Link to="/schedule" className="text-primary-600 text-sm hover:underline mt-1 inline-block">Add something</Link>
              </div>
            ) : todayEntries.map(entry => (
              <div key={entry.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition group">
                <div className="w-1 self-stretch rounded-full mt-0.5" style={{ backgroundColor: entry.color }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{entry.title}</p>
                  <p className="text-xs text-gray-500">{entry.start_time} – {entry.end_time}{entry.location ? ` · ${entry.location}` : ''}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: entry.color + '20', color: entry.color }}>
                  {TYPE_LABELS[entry.type]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-semibold text-gray-800">Upcoming Events</h2>
            <Link to="/timetable" className="text-sm text-primary-600 hover:underline">Full view</Link>
          </div>
          <div className="p-4 space-y-2 min-h-32">
            {loading ? (
              <div className="text-center text-gray-400 py-8">Loading...</div>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">✨</div>
                <p className="text-gray-500 text-sm">No upcoming events</p>
                <Link to="/schedule" className="text-primary-600 text-sm hover:underline mt-1 inline-block">Plan your week</Link>
              </div>
            ) : upcoming.map(entry => (
              <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
                <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: entry.color + '20', color: entry.color }}>
                  <span>{format(new Date(entry.date + 'T00:00:00'), 'd')}</span>
                  <span className="uppercase">{format(new Date(entry.date + 'T00:00:00'), 'MMM')}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{entry.title}</p>
                  <p className="text-xs text-gray-500">{dayLabel(entry.date)} · {entry.start_time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to: '/schedule', icon: '➕', label: 'Add Event', desc: 'Schedule something new', color: 'from-primary-500 to-primary-600' },
          { to: '/timetable', icon: '📅', label: 'View Timetable', desc: 'Daily, weekly & more', color: 'from-purple-500 to-purple-600' },
          { to: '/news', icon: '📰', label: 'News Feed', desc: 'Your personalised news', color: 'from-emerald-500 to-emerald-600' },
          { to: '/interests', icon: '⭐', label: 'My Interests', desc: 'Customise your feed', color: 'from-amber-500 to-amber-600' },
        ].map(a => (
          <Link key={a.to} to={a.to}
            className={`bg-gradient-to-br ${a.color} rounded-2xl p-5 text-white hover:opacity-90 transition shadow-sm`}>
            <div className="text-3xl mb-2">{a.icon}</div>
            <p className="font-semibold text-sm">{a.label}</p>
            <p className="text-xs opacity-80 mt-0.5">{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
