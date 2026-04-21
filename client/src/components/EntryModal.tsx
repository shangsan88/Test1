import { useState, type FormEvent } from 'react';
import { type TimetableEntry, type EntryType, TYPE_LABELS } from '../types';

interface Props {
  entry: TimetableEntry | null;
  defaultDate: string;
  onSave: (data: Partial<TimetableEntry>) => Promise<void>;
  onDelete?: () => void;
  onClose: () => void;
}

const PALETTE = ['#4F46E5','#7C3AED','#DB2777','#DC2626','#D97706','#059669','#0891B2','#6B7280'];

export default function EntryModal({ entry, defaultDate, onSave, onDelete, onClose }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: entry?.title || '',
    description: entry?.description || '',
    date: entry?.date || defaultDate,
    start_time: entry?.start_time || '08:00',
    end_time: entry?.end_time || '09:00',
    type: (entry?.type || 'class') as EntryType,
    location: entry?.location || '',
    color: entry?.color || '#4F46E5',
    is_recurring: entry?.is_recurring === 1,
    recurrence: entry?.recurrence || 'daily',
  });

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...form, is_recurring: form.is_recurring ? 1 : 0 } as any);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-gray-800 text-lg">{entry ? 'Edit Event' : 'Add Event'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500">✕</button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
            <input required value={form.title} onChange={e => set('title', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g. Maths Class, Football Practice..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" required value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                {Object.entries(TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
              <input type="time" required value={form.start_time} onChange={e => set('start_time', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
              <input type="time" required value={form.end_time} onChange={e => set('end_time', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input value={form.location} onChange={e => set('location', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g. Room 12, Sports Hall, Home..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              placeholder="Optional notes..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Colour</label>
            <div className="flex gap-2">
              {PALETTE.map(c => (
                <button type="button" key={c} onClick={() => set('color', c)}
                  className={`w-8 h-8 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="recurring" checked={form.is_recurring}
              onChange={e => set('is_recurring', e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded" />
            <label htmlFor="recurring" className="text-sm text-gray-700">Recurring event</label>
            {form.is_recurring && (
              <select value={form.recurrence} onChange={e => set('recurrence', e.target.value)}
                className="ml-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            {onDelete && (
              <button type="button" onClick={onDelete}
                className="px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition font-medium">
                Delete
              </button>
            )}
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium text-gray-600">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60">
              {saving ? 'Saving...' : (entry ? 'Update' : 'Add Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
