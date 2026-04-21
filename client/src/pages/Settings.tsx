import { useEffect, useState, type FormEvent } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GRADES = ['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6',
  'Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'];
const SUBJECTS = ['Mathematics','English','Science','History','Geography',
  'Art','Music','Physical Education','Technology','Languages','Other'];

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', grade: user?.grade || '', subject: user?.subject || '' });
  const [emailPrefs, setEmailPrefs] = useState({ email_enabled: true, email_time: '07:00' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    api.get('/email/preferences').then(({ data }) => {
      if (data) setEmailPrefs({ email_enabled: !!data.email_enabled, email_time: data.email_time || '07:00' });
    });
  }, []);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateUser(profile);
      toast.success('Profile updated');
    } finally { setSavingProfile(false); }
  };

  const saveEmail = async (e: FormEvent) => {
    e.preventDefault();
    setSavingEmail(true);
    try {
      await api.put('/email/preferences', emailPrefs);
      toast.success('Email preferences saved');
    } finally { setSavingEmail(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">⚙️ Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-semibold text-gray-800">Profile</h2>
          <p className="text-sm text-gray-500 mt-0.5">Update your personal information</p>
        </div>
        <form onSubmit={saveProfile} className="p-5 space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{user?.name}</p>
              <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          {user?.role === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
              <select value={profile.grade} onChange={e => setProfile(p => ({ ...p, grade: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">Select grade</option>
                {GRADES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          )}
          {user?.role === 'teacher' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select value={profile.subject} onChange={e => setProfile(p => ({ ...p, subject: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">Select subject</option>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          )}
          <button type="submit" disabled={savingProfile}
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60">
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Email Preferences */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-semibold text-gray-800">Daily Digest Email</h2>
          <p className="text-sm text-gray-500 mt-0.5">Get your schedule and personalised news delivered every morning</p>
        </div>
        <form onSubmit={saveEmail} className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 text-sm">Enable Daily Digest</p>
              <p className="text-xs text-gray-500 mt-0.5">Receive a morning email with your schedule and top news</p>
            </div>
            <button type="button"
              onClick={() => setEmailPrefs(p => ({ ...p, email_enabled: !p.email_enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${emailPrefs.email_enabled ? 'bg-primary-600' : 'bg-gray-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${emailPrefs.email_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {emailPrefs.email_enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Send email at</label>
              <input type="time" value={emailPrefs.email_time}
                onChange={e => setEmailPrefs(p => ({ ...p, email_time: e.target.value }))}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              <p className="text-xs text-gray-400 mt-1">Your local time</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <p className="font-medium mb-1">📧 What's included in your digest:</p>
            <ul className="space-y-1 text-xs text-gray-500">
              <li>✓ Today's and upcoming schedule (next 7 days)</li>
              <li>✓ Top news from your selected interests</li>
              <li>✓ Motivational message to start your day</li>
            </ul>
          </div>

          <button type="submit" disabled={savingEmail}
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60">
            {savingEmail ? 'Saving...' : 'Save Email Preferences'}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-3">Account</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-0.5">Email</p>
            <p className="font-medium text-gray-700">{user?.email}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-0.5">Role</p>
            <p className="font-medium text-gray-700 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
