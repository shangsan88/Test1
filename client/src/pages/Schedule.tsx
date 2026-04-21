import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import api from '../api';
import { type TimetableEntry, TYPE_LABELS, TYPE_COLORS } from '../types';
import EntryModal from '../components/EntryModal';
import toast from 'react-hot-toast';

export default function Schedule() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<TimetableEntry | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const from = format(new Date(Date.now() - 30 * 86400000), 'yyyy-MM-dd');
      const to = format(new Date(Date.now() + 90 * 86400000), 'yyyy-MM-dd');
      const { data } = await api.get<TimetableEntry[]>('/timetable', { params: { from, to } });
      setEntries(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = entries.filter(e => {
    if (filter !== 'all' && e.type !== filter) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) &&
        !(e.description || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by date
  const grouped: Record<string, TimetableEntry[]> = {};
  filtered.forEach(e => {
    if (!grouped[e.date]) grouped[e.date] = [];
    grouped[e.date].push(e);
  });

  const openCreate = () => { setEditEntry(null); setModalOpen(true); };
  const openEdit = (entry: TimetableEntry) => { setEditEntry(entry); setModalOpen(true); };

  const handleSave = async (data: Partial<TimetableEntry>) => {
    if (editEntry) {
      await api.put(`/timetable/${editEntry.id}`, data);
      toast.success('Updated');
    } else {
      await api.post('/timetable', data);
      toast.success('Event added');
    }
    setModalOpen(false);
    fetchAll();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this event?')) return;
    await api.delete(`/timetable/${id}`);
    toast.success('Deleted');
    setModalOpen(false);
    fetchAll();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Schedule</h1>
          <p className="text-gray-500 text-sm">Manage all your in-school and out-of-school events</p>
        </div>
        <button onClick={openCreate}
          className="ml-auto flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search events..."
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none flex-1 min-w-40" />
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm flex-wrap">
          <button onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === 'all' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            All
          </button>
          {Object.entries(TYPE_LABELS).map(([type, label]) => (
            <button key={type} onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === type ? 'text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              style={filter === type ? { backgroundColor: TYPE_COLORS[type as keyof typeof TYPE_COLORS] } : {}}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-600 font-medium">No events found</p>
          <p className="text-gray-400 text-sm mt-1">Add your first event to get started</p>
          <button onClick={openCreate} className="mt-4 bg-primary-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition">
            Add Event
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, dayEntries]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-sm font-semibold text-gray-600">
                  {format(new Date(date + 'T00:00:00'), 'EEEE, MMMM do, yyyy')}
                </div>
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">{dayEntries.length} event{dayEntries.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-2">
                {dayEntries.map(entry => (
                  <div key={entry.id}
                    onClick={() => openEdit(entry)}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-4 cursor-pointer hover:shadow-md transition group">
                    <div className="w-1 self-stretch rounded-full" style={{ backgroundColor: entry.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-800">{entry.title}</p>
                          {entry.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{entry.description}</p>}
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full font-medium flex-shrink-0"
                          style={{ backgroundColor: entry.color + '20', color: entry.color }}>
                          {TYPE_LABELS[entry.type]}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-400">
                        <span>🕐 {entry.start_time} – {entry.end_time}</span>
                        {entry.location && <span>📍 {entry.location}</span>}
                        {entry.is_recurring === 1 && <span>🔄 {entry.recurrence}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <EntryModal
          entry={editEntry}
          defaultDate={format(new Date(), 'yyyy-MM-dd')}
          onSave={handleSave}
          onDelete={editEntry ? () => handleDelete(editEntry!.id) : undefined}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
