import React, { useState } from 'react';
import { Search, Loader2, FileText, CheckSquare, Calendar, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const workspaceId = localStorage.getItem('workspaceId');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await axios.get(`/api/search?workspaceId=${workspaceId}&q=${encodeURIComponent(query)}`);
      setResults(response.data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalResults = (results?.meetings?.length || 0) + (results?.tasks?.length || 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 pt-10 md:pt-16">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Search size={24} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Semantic Search
          </h1>
          <p className="text-slate-400 font-medium">
            ابحث بالمعنى في اجتماعاتك ومهامك
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-10">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-300" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-16 pr-36 py-5 bg-white border border-slate-100 rounded-[25px] text-sm font-bold text-slate-700 shadow-sm focus:ring-4 ring-indigo-500/10 focus:border-indigo-200 outline-none transition-all"
              placeholder="ابحث عن أي حاجة... مثال: اجتماع المشروع، مهام محمد"
            />
            <div className="absolute inset-y-2 right-2">
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="h-full px-8 bg-indigo-600 text-white rounded-[18px] text-xs font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </form>

        {/* Results */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={40} className="animate-spin text-indigo-500" />
            <p className="text-slate-400 font-bold">AI بيبحث...</p>
          </div>
        )}

        {!loading && searched && results && (
          <div className="space-y-8">

            {/* Stats */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-slate-500">
                {totalResults} نتيجة لـ
              </span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-black">
                "{query}"
              </span>
            </div>

            {/* Meetings Results */}
            {results.meetings?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={18} className="text-indigo-500" />
                  <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">
                    Meetings ({results.meetings.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {results.meetings.map((item, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-[24px] border border-slate-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                      onClick={() => navigate('/meeting')}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">
                              Meeting
                            </span>
                            {item.score && (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black">
                                {Math.round(item.score * 100)}% match
                              </span>
                            )}
                          </div>
                          <h3 className="font-black text-slate-800 text-base mb-2 group-hover:text-indigo-600 transition-colors">
                            {item.title || item.meeting_title}
                          </h3>
                          {item.snippet && (
                            <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                              {item.snippet}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-3">
                            {item.date || item.meeting_date ? (
                              <div className="flex items-center gap-1 text-xs text-slate-400 font-bold">
                                <Calendar size={12} />
                                {item.date || item.meeting_date}
                              </div>
                            ) : null}
                            {item.speakers?.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-slate-400 font-bold">
                                <Users size={12} />
                                {item.speakers.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks Results */}
            {results.tasks?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckSquare size={18} className="text-emerald-500" />
                  <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">
                    Tasks ({results.tasks.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {results.tasks.map((task, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-[24px] border border-slate-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                      onClick={() => navigate('/tasks')}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase">
                              Task
                            </span>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase
                              ${task.status === 'Todo' ? 'bg-blue-50 text-blue-500' :
                                task.status === 'InProgress' ? 'bg-amber-50 text-amber-500' :
                                'bg-emerald-50 text-emerald-500'}`}>
                              {task.status}
                            </span>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase
                              ${task.priority === 'High' ? 'bg-red-50 text-red-500' :
                                task.priority === 'Medium' ? 'bg-amber-50 text-amber-500' :
                                'bg-slate-100 text-slate-400'}`}>
                              {task.priority}
                            </span>
                          </div>
                          <h3 className="font-black text-slate-800 text-base mb-1 group-hover:text-emerald-600 transition-colors">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-slate-400 line-clamp-1">{task.description}</p>
                          )}
                          {task.assignedTo && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-slate-400 font-bold">
                              <Users size={12} />
                              {task.assignedTo}
                            </div>
                          )}
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {totalResults === 0 && (
              <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                <Search size={48} className="text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">مفيش نتايج</h3>
                <p className="text-slate-400 text-sm">جرب كلمة تانية</p>
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!searched && (
          <div className="text-center py-20">
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
              {['اجتماع المشروع', 'مهام محمد', 'ملخص الاجتماع'].map((hint, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(hint)}
                  className="px-4 py-2 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-500 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm"
                >
                  {hint}
                </button>
              ))}
            </div>
            <p className="text-slate-300 font-bold text-sm">اكتب كلمة للبحث بالمعنى</p>
          </div>
        )}
      </div>
    </div>
  );
}