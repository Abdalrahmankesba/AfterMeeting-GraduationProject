import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Ghost } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FBFB] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        
        <div className="relative">
          <div className="absolute inset-0 bg-sky-200 blur-3xl opacity-20 rounded-full animate-pulse"></div>
          <Ghost size={120} className="mx-auto text-slate-200 relative z-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h1 className="text-8xl font-black text-slate-900 tracking-tighter">404</h1>
          <h2 className="text-2xl font-bold text-slate-800">أوه! هذه الصفحة مفقودة</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            يبدو أنك سلكت طريقاً خاطئاً، أو أن الصفحة التي تبحث عنها قد تم نقلها أو حذفها. لا تقلق، الذكاء الاصطناعي لا يزال هنا!
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft size={16} /> العودة للخلف
          </button>
          
          <button 
            onClick={() => navigate('/home')} 
            className="flex items-center justify-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold shadow-xl hover:shadow-slate-200 transition-all active:scale-95"
          >
            <Home size={16} /> الصفحة الرئيسية
          </button>
        </div>

        <div className="pt-8 border-t border-slate-100">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            After Meeting AI • Intelligence System
          </p>
        </div>
      </div>
    </div>
  );
}