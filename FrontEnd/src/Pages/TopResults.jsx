import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, FileText, File, ArrowRight, Trophy } from 'lucide-react';

export default function TopResults() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // الحصول على كلمة البحث من الرابط ?q=word
  const query = new URLSearchParams(location.search).get("q") || "";

  const topMeetings = useMemo(() => {
    const saved = JSON.parse(localStorage.getItem('userMeetings') || "[]");
    
    return saved
      .map(m => {
        let score = 0;
        const q = query.toLowerCase();
        // نظام النقاط (Score)
        if (m.title.toLowerCase().includes(q)) score += 70;
        if (m.team.toLowerCase().includes(q)) score += 30;
        return { ...m, score };
      })
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [query]);

  return (
    <div className="min-h-screen bg-[#F8FBFB] p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/meeting')} 
          className="flex items-center gap-2 text-slate-500 hover:text-sky-600 transition-colors mb-8 font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm w-fit cursor-pointer"
        >
          <ArrowLeft size={18} /> Back to Meetings
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Search Analysis</h1>
            <p className="text-slate-500 mt-1">Best matches for: <span className="text-sky-500 font-bold">"{query}"</span></p>
          </div>
          <div className="hidden md:block bg-sky-50 text-sky-600 px-4 py-2 rounded-2xl border border-sky-100 font-bold text-sm">
            {topMeetings.length} Results Found
          </div>
        </div>

        <div className="grid gap-4">
          {topMeetings.length > 0 ? (
            topMeetings.map((meeting, index) => (
              <div 
                key={index}
                onClick={() => {
                  localStorage.setItem('currentMeetingView', JSON.stringify(meeting));
                  navigate('/meeting-details');
                }}
                className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      index === 0 ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400'
                    }`}>
                      {meeting.type === 'PDF' ? <FileText size={24} /> : meeting.type === 'Text' ? <File size={24} /> : <Mic size={24} />}
                    </div>
                    {index === 0 && (
                      <div className="absolute -top-2 -right-2 bg-amber-400 text-white p-1 rounded-lg shadow-lg">
                        <Trophy size={12} fill="white" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-sky-600 transition-colors">{meeting.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{meeting.team}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="text-xs font-black text-emerald-500">Relevance: {meeting.score}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                   <div className="hidden sm:block text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Duration</p>
                      <p className="text-sm font-bold text-slate-600">{meeting.duration}</p>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-sky-500 group-hover:text-white transition-all">
                      <ArrowRight size={20} />
                   </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[32px] p-20 text-center border-2 border-dashed border-slate-100">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Search size={40} />
               </div>
               <h3 className="text-xl font-bold text-slate-800">No high-score matches</h3>
               <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm">We couldn't find any meetings that closely match your search criteria. Try different keywords.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}