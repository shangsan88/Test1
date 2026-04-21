import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { INTEREST_ICONS } from '../types';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'technology','science','sports','arts','music','gaming',
  'environment','history','math','literature','health','space',
  'animals','movies','travel','food','fashion','business',
];

const CATEGORY_LABELS: Record<string, string> = {
  technology: 'Technology', science: 'Science', sports: 'Sports', arts: 'Arts',
  music: 'Music', gaming: 'Gaming', environment: 'Environment', history: 'History',
  math: 'Mathematics', literature: 'Literature', health: 'Health & Fitness', space: 'Space',
  animals: 'Animals', movies: 'Movies & Film', travel: 'Travel', food: 'Food',
  fashion: 'Fashion', business: 'Business',
};

export default function Interests() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const isSetup = window.location.pathname === '/interests' && document.referrer.includes('/register');

  useEffect(() => {
    api.get('/interests').then(({ data }) => setSelected(data.interests));
  }, []);

  const toggle = (cat: string) => {
    setSelected(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const save = async () => {
    if (selected.length === 0) {
      toast.error('Pick at least one interest');
      return;
    }
    setSaving(true);
    try {
      await api.put('/interests', { interests: selected });
      toast.success('Interests saved!');
      navigate('/news');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {isSetup ? '🌟 Choose Your Interests' : '⭐ My Interests'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isSetup
            ? 'Pick the topics you love — we\'ll personalise your daily news and emails just for you!'
            : 'Update your interests to customise your news feed and daily digest emails.'}
        </p>
      </div>

      {selected.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 text-sm text-primary-700">
          ✓ {selected.length} interest{selected.length !== 1 ? 's' : ''} selected
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {CATEGORIES.map(cat => {
          const active = selected.includes(cat);
          return (
            <button key={cat} type="button" onClick={() => toggle(cat)}
              className={`p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${
                active
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
              <div className="text-3xl mb-2">{INTEREST_ICONS[cat]}</div>
              <div className={`font-medium text-sm ${active ? 'text-primary-700' : 'text-gray-700'}`}>
                {CATEGORY_LABELS[cat]}
              </div>
              {active && <div className="text-xs text-primary-500 mt-0.5">✓ Selected</div>}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-2">
        {!isSetup && (
          <button onClick={() => navigate(-1)}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
        )}
        <button onClick={save} disabled={saving || selected.length === 0}
          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl text-sm font-semibold transition disabled:opacity-60 shadow-sm">
          {saving ? 'Saving...' : (isSetup ? 'Continue to News Feed →' : 'Save Interests')}
        </button>
      </div>
    </div>
  );
}
