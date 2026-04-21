import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { type NewsArticle, INTEREST_ICONS } from '../types';
import { format } from 'date-fns';

const CATEGORY_LABELS: Record<string, string> = {
  technology: 'Technology', science: 'Science', sports: 'Sports', arts: 'Arts',
  music: 'Music', gaming: 'Gaming', environment: 'Environment', history: 'History',
  math: 'Mathematics', literature: 'Literature', health: 'Health & Fitness', space: 'Space',
  animals: 'Animals', movies: 'Movies & Film', travel: 'Travel', food: 'Food',
  fashion: 'Fashion', business: 'Business',
};

const CAT_COLORS: Record<string, string> = {
  technology: '#4F46E5', science: '#0891B2', sports: '#059669', arts: '#7C3AED',
  music: '#DB2777', gaming: '#D97706', environment: '#065F46', history: '#92400E',
  math: '#1D4ED8', literature: '#6D28D9', health: '#DC2626', space: '#1E3A5F',
  animals: '#B45309', movies: '#4C1D95', travel: '#0369A1', food: '#B91C1C',
  fashion: '#BE185D', business: '#374151',
};

function ArticleCard({ article, category }: { article: NewsArticle; category: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition group">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: (CAT_COLORS[category] || '#4F46E5') + '15' }}>
          {INTEREST_ICONS[category] || '📰'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: (CAT_COLORS[category] || '#4F46E5') + '15', color: CAT_COLORS[category] || '#4F46E5' }}>
              {CATEGORY_LABELS[category] || category}
            </span>
            <span className="text-xs text-gray-400">{article.source}</span>
          </div>
          <h3 className="font-semibold text-gray-800 text-sm leading-snug group-hover:text-primary-600 transition">{article.title}</h3>
          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{article.description}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-400">{format(new Date(article.published_at), 'MMM d, yyyy')}</span>
            {article.url && article.url !== '#' && (
              <a href={article.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-primary-600 hover:underline font-medium">
                Read more →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewsFeed() {
  const [articles, setArticles] = useState<Array<NewsArticle & { category: string }>>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/news').then(({ data }) => {
      const cats: string[] = data.categories;
      // Tag each article with its category
      const tagged = data.articles.map((a: NewsArticle, i: number) => ({
        ...a,
        category: cats[Math.floor(i / 2) % cats.length] || 'technology',
      }));
      setArticles(tagged);
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = activeFilter === 'all' ? articles : articles.filter(a => a.category === activeFilter);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📰 News Feed</h1>
          <p className="text-gray-500 text-sm mt-1">Personalised stories based on your interests</p>
        </div>
        <Link to="/interests"
          className="flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50 transition shadow-sm">
          ⭐ Edit Interests
        </Link>
      </div>

      {categories.length === 0 && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-700">
          You haven't set any interests yet.{' '}
          <Link to="/interests" className="font-semibold underline">Choose your interests</Link> to get a personalised feed.
        </div>
      )}

      {/* Category filter pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveFilter('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${activeFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            All
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveFilter(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                activeFilter === cat ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              style={activeFilter === cat ? { backgroundColor: CAT_COLORS[cat] || '#4F46E5' } : {}}>
              <span>{INTEREST_ICONS[cat]}</span>
              <span>{CATEGORY_LABELS[cat] || cat}</span>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-full mb-1" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-gray-500">No articles in this category yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((article, i) => (
            <ArticleCard key={i} article={article} category={article.category} />
          ))}
        </div>
      )}

      <div className="text-center text-xs text-gray-400 pb-4">
        Daily digest emails are sent each morning based on your interests and upcoming schedule.{' '}
        <Link to="/settings" className="text-primary-600 hover:underline">Manage email settings</Link>
      </div>
    </div>
  );
}
