import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
  'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

const SUBJECTS = ['Mathematics', 'English', 'Science', 'History', 'Geography',
  'Art', 'Music', 'Physical Education', 'Technology', 'Languages', 'Other'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student' as 'student' | 'teacher', grade: '', subject: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role, grade: form.grade || undefined, subject: form.subject || undefined });
      navigate('/interests');
      toast.success('Account created! Let\'s set up your interests.');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📅</div>
          <h1 className="text-3xl font-bold text-white">School Timetable</h1>
          <p className="text-primary-200 mt-1">Create your free account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Join today</h2>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(['student', 'teacher'] as const).map(role => (
              <button
                key={role} type="button"
                onClick={() => set('role', role)}
                className={`py-3 rounded-xl border-2 font-semibold capitalize transition ${
                  form.role === role
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {role === 'student' ? '🎒 Student' : '👩‍🏫 Teacher'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  required value={form.name} onChange={e => set('name', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  placeholder="Your full name"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  placeholder="you@example.com"
                />
              </div>
              {form.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <select value={form.grade} onChange={e => set('grade', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition">
                    <option value="">Select grade</option>
                    {GRADES.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              )}
              {form.role === 'teacher' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select value={form.subject} onChange={e => set('subject', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition">
                    <option value="">Select subject</option>
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              )}
              <div className={form.role === 'student' || form.role === 'teacher' ? '' : 'col-span-2'}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password" required value={form.password} onChange={e => set('password', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  placeholder="Min 6 characters"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password" required value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  placeholder="Repeat password"
                />
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
