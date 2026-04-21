export type EntryType = 'class' | 'study' | 'activity' | 'meeting' | 'personal' | 'other';

export interface TimetableEntry {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  date: string;
  type: EntryType;
  location?: string;
  is_recurring: number;
  recurrence?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
  category?: string;
}

export const TYPE_COLORS: Record<EntryType, string> = {
  class: '#4F46E5',
  study: '#0891B2',
  activity: '#059669',
  meeting: '#D97706',
  personal: '#DB2777',
  other: '#6B7280',
};

export const TYPE_LABELS: Record<EntryType, string> = {
  class: 'Class',
  study: 'Study',
  activity: 'Activity',
  meeting: 'Meeting',
  personal: 'Personal',
  other: 'Other',
};

export const INTEREST_ICONS: Record<string, string> = {
  technology: '💻', science: '🔬', sports: '⚽', arts: '🎨',
  music: '🎵', gaming: '🎮', environment: '🌿', history: '📜',
  math: '📐', literature: '📚', health: '💪', space: '🚀',
  animals: '🐾', movies: '🎬', travel: '✈️', food: '🍕',
  fashion: '👗', business: '💼',
};
