import { useEffect, useState, useCallback } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isSameMonth, addWeeks, addMonths,
  subWeeks, subMonths, startOfYear, endOfYear,
  eachMonthOfInterval, addYears, subYears } from 'date-fns';
import api from '../api';
import { type TimetableEntry, TYPE_LABELS, TYPE_COLORS } from '../types';
import EntryModal from '../components/EntryModal';
import toast from 'react-hot-toast';

type View = 'day' | 'week' | 'month' | 'year';

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7am–10pm

export default function Timetable() {
  const [view, setView] = useState<View>('week');
  const [current, setCurrent] = useState(new Date());
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<TimetableEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    let from: string, to: string;
    if (view === 'day') {
      from = to = format(current, 'yyyy-MM-dd');
    } else if (view === 'week') {
      const start = startOfWeek(current, { weekStartsOn: 1 });
      from = format(start, 'yyyy-MM-dd');
      to = format(addDays(start, 6), 'yyyy-MM-dd');
    } else if (view === 'month') {
      from = format(startOfMonth(current), 'yyyy-MM-dd');
      to = format(endOfMonth(current), 'yyyy-MM-dd');
    } else {
      from = format(startOfYear(current), 'yyyy-MM-dd');
      to = format(endOfYear(current), 'yyyy-MM-dd');
    }
    try {
      const { data } = await api.get<TimetableEntry[]>('/timetable', { params: { from, to } });
      setEntries(data);
    } finally { setLoading(false); }
  }, [view, current]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const navigate = (dir: 1 | -1) => {
    setCurrent(prev => {
      if (view === 'day') return addDays(prev, dir);
      if (view === 'week') return dir === 1 ? addWeeks(prev, 1) : subWeeks(prev, 1);
      if (view === 'month') return dir === 1 ? addMonths(prev, 1) : subMonths(prev, 1);
      return dir === 1 ? addYears(prev, 1) : subYears(prev, 1);
    });
  };

  const openCreate = (date?: string) => {
    setEditEntry(null);
    setSelectedDate(date || format(current, 'yyyy-MM-dd'));
    setModalOpen(true);
  };

  const openEdit = (entry: TimetableEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditEntry(entry);
    setSelectedDate(entry.date);
    setModalOpen(true);
  };

  const handleSave = async (data: Partial<TimetableEntry>) => {
    if (editEntry) {
      await api.put(`/timetable/${editEntry.id}`, data);
      toast.success('Event updated');
    } else {
      await api.post('/timetable', data);
      toast.success('Event added');
    }
    setModalOpen(false);
    fetchEntries();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this event?')) return;
    await api.delete(`/timetable/${id}`);
    toast.success('Event deleted');
    setModalOpen(false);
    fetchEntries();
  };

  const headerLabel = () => {
    if (view === 'day') return format(current, 'EEEE, MMMM do, yyyy');
    if (view === 'week') {
      const s = startOfWeek(current, { weekStartsOn: 1 });
      return `${format(s, 'MMM d')} – ${format(addDays(s, 6), 'MMM d, yyyy')}`;
    }
    if (view === 'month') return format(current, 'MMMM yyyy');
    return format(current, 'yyyy');
  };

  const entriesOn = (date: Date) =>
    entries.filter(e => isSameDay(new Date(e.date + 'T00:00:00'), date));

  // ── Day View ──────────────────────────────────────────────────────
  const DayView = () => {
    const dayEntries = entriesOn(current);
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="relative">
          {HOURS.map(h => (
            <div key={h} className="flex border-b border-gray-100 min-h-16">
              <div className="w-16 text-xs text-gray-400 p-2 text-right flex-shrink-0 pt-1">
                {h}:00
              </div>
              <div className="flex-1 relative p-1 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => openCreate(format(current, 'yyyy-MM-dd'))}>
                {dayEntries
                  .filter(e => parseInt(e.start_time.split(':')[0]) === h)
                  .map(e => (
                    <div key={e.id}
                      onClick={ev => openEdit(e, ev)}
                      className="rounded-lg px-2 py-1 text-white text-xs mb-1 cursor-pointer hover:opacity-90 shadow-sm"
                      style={{ backgroundColor: e.color }}>
                      <span className="font-semibold">{e.title}</span>
                      <span className="ml-1 opacity-80">{e.start_time}–{e.end_time}</span>
                      {e.location && <span className="ml-1 opacity-70">· {e.location}</span>}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Week View ─────────────────────────────────────────────────────
  const WeekView = () => {
    const weekStart = startOfWeek(current, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const today = new Date();
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
        <div className="grid grid-cols-8 min-w-[600px]">
          <div className="p-3 border-b border-r border-gray-100" />
          {days.map(d => (
            <div key={d.toISOString()}
              className={`p-3 border-b border-r border-gray-100 text-center cursor-pointer hover:bg-gray-50 ${isSameDay(d, today) ? 'bg-primary-50' : ''}`}
              onClick={() => openCreate(format(d, 'yyyy-MM-dd'))}>
              <div className="text-xs text-gray-500 uppercase">{format(d, 'EEE')}</div>
              <div className={`text-lg font-bold mt-0.5 w-8 h-8 rounded-full flex items-center justify-center mx-auto ${isSameDay(d, today) ? 'bg-primary-600 text-white' : 'text-gray-700'}`}>
                {format(d, 'd')}
              </div>
            </div>
          ))}
          {HOURS.map(h => (
            <>
              <div key={`h-${h}`} className="p-2 border-b border-r border-gray-100 text-xs text-gray-400 text-right pr-3">{h}:00</div>
              {days.map(d => {
                const dayH = entriesOn(d).filter(e => parseInt(e.start_time.split(':')[0]) === h);
                return (
                  <div key={`${d}-${h}`}
                    className={`border-b border-r border-gray-100 p-0.5 min-h-12 cursor-pointer hover:bg-gray-50 ${isSameDay(d, today) ? 'bg-primary-50/50' : ''}`}
                    onClick={() => openCreate(format(d, 'yyyy-MM-dd'))}>
                    {dayH.map(e => (
                      <div key={e.id} onClick={ev => openEdit(e, ev)}
                        className="rounded px-1 py-0.5 text-white text-xs mb-0.5 cursor-pointer hover:opacity-90 truncate"
                        style={{ backgroundColor: e.color }}>
                        {e.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    );
  };

  // ── Month View ────────────────────────────────────────────────────
  const MonthView = () => {
    const monthStart = startOfMonth(current);
    const monthEnd = endOfMonth(current);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 1 }), 6);
    const days = eachDayOfInterval({ start: calStart, end: calEnd });
    const today = new Date();
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {dayNames.map(d => (
            <div key={d} className="p-3 text-center text-xs font-semibold text-gray-500 uppercase">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map(d => {
            const dayEntries = entriesOn(d);
            const isCurrentMonth = isSameMonth(d, current);
            const isToday = isSameDay(d, today);
            return (
              <div key={d.toISOString()}
                className={`border-b border-r border-gray-100 p-1.5 min-h-24 cursor-pointer hover:bg-gray-50 transition ${!isCurrentMonth ? 'opacity-40' : ''}`}
                onClick={() => openCreate(format(d, 'yyyy-MM-dd'))}>
                <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1 ${isToday ? 'bg-primary-600 text-white' : 'text-gray-700'}`}>
                  {format(d, 'd')}
                </div>
                <div className="space-y-0.5">
                  {dayEntries.slice(0, 3).map(e => (
                    <div key={e.id} onClick={ev => openEdit(e, ev)}
                      className="rounded px-1.5 py-0.5 text-white text-xs truncate cursor-pointer hover:opacity-90"
                      style={{ backgroundColor: e.color }}>
                      {e.title}
                    </div>
                  ))}
                  {dayEntries.length > 3 && (
                    <div className="text-xs text-gray-400 pl-1">+{dayEntries.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Year View ─────────────────────────────────────────────────────
  const YearView = () => {
    const yearStart = startOfYear(current);
    const yearEnd = endOfYear(current);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {months.map(month => {
          const mStart = startOfMonth(month);
          const mEnd = endOfMonth(month);
          const calStart = startOfWeek(mStart, { weekStartsOn: 1 });
          const days = eachDayOfInterval({ start: calStart, end: addDays(startOfWeek(mEnd, { weekStartsOn: 1 }), 6) });
          const today = new Date();
          const monthEntries = entries.filter(e => {
            const d = new Date(e.date + 'T00:00:00');
            return isSameMonth(d, month);
          });

          return (
            <div key={month.toISOString()} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800 text-sm">{format(month, 'MMMM')}</h3>
                {monthEntries.length > 0 && (
                  <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full font-medium">
                    {monthEntries.length}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {['M','T','W','T','F','S','S'].map((d,i) => (
                  <div key={i} className="text-xs text-gray-400 pb-1">{d}</div>
                ))}
                {days.map(d => {
                  const dayEntries = entriesOn(d);
                  const isCurrentMonth = isSameMonth(d, month);
                  const isToday = isSameDay(d, today);
                  return (
                    <div key={d.toISOString()}
                      onClick={() => { setCurrent(d); setView('day'); }}
                      className={`aspect-square flex items-center justify-center text-xs rounded cursor-pointer transition ${
                        !isCurrentMonth ? 'opacity-30' :
                        isToday ? 'bg-primary-600 text-white font-bold' :
                        dayEntries.length > 0 ? 'bg-primary-100 text-primary-700 font-semibold hover:bg-primary-200' :
                        'text-gray-600 hover:bg-gray-100'
                      }`}>
                      {format(d, 'd')}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
          {(['day','week','month','year'] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition ${view === v ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
              {v}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-lg transition hover:shadow-sm">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-semibold text-gray-700 min-w-48 text-center text-sm">{headerLabel()}</span>
          <button onClick={() => navigate(1)} className="p-2 hover:bg-white rounded-lg transition hover:shadow-sm">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button onClick={() => setCurrent(new Date())}
            className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 shadow-sm">
            Today
          </button>
        </div>

        <button onClick={() => openCreate()}
          className="ml-auto flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Event
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(TYPE_LABELS).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-gray-600">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[type as keyof typeof TYPE_COLORS] }} />
            {label}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading timetable...</div>
      ) : (
        <>
          {view === 'day' && <DayView />}
          {view === 'week' && <WeekView />}
          {view === 'month' && <MonthView />}
          {view === 'year' && <YearView />}
        </>
      )}

      {modalOpen && (
        <EntryModal
          entry={editEntry}
          defaultDate={selectedDate || format(current, 'yyyy-MM-dd')}
          onSave={handleSave}
          onDelete={editEntry ? () => handleDelete(editEntry!.id) : undefined}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
