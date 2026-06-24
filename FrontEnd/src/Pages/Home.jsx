import React, { useState, useEffect } from 'react';
import { 
  Bell, User, FileText, Calendar, ArrowRight, Mic, File, 
  Clock, CheckSquare, Plus, ListTodo, ChevronRight, Cpu, TrendingUp, ShieldCheck
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';

export default function Home() {
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userName = user.name || "User";
  const userAvatar = localStorage.getItem('userAvatar') || "";
  const workspaceId = localStorage.getItem('workspaceId');

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
                console.log("workspaceId:", workspaceId); // هنا

        if (!workspaceId) {
            setLoading(false);
            return;
        }
        // منادات المسار اللي هنبرمجه في الـ C#
const response = await axios.get(`/api/Meetings/dashboard-stats?workspaceId=${workspaceId}`);
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [workspaceId]);

  const meetingsCount = dashboardData?.totalAssets || 0;
const tasksTotal = dashboardData?.tasks?.total || 0;
const completedTasksCount = dashboardData?.tasks?.done || 0;

  
  const progressPercent = tasksTotal > 0 ? Math.round((completedTasksCount / tasksTotal) * 100) : 0;
  const timeSaved = (meetingsCount * 0.5).toFixed(1);

  const recentMeeting = dashboardData?.recentMeetings?.[0] || null;

  const getIcon = (type) => {
    // 1 تعني نص، 0 تعني صوت بناءً على الـ Enum في الباك إند
    if (type === 1 || type === "1") return <File size={22} />;
    return <Mic size={22} />;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-indigo-600 font-bold">Loading AI Workspace...</div>;

  return (
    <div className="min-h-screen mt-0 p-4 md:p-10 font-sans pb-24 text-slate-900 selection:bg-indigo-100">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-white/40 backdrop-blur-xl p-6 rounded-[32px] border border-white/60 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 ring-4 ring-white">
            <Cpu className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Welcome, {userName}</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest opacity-70">AI Workspace Active</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <button className="p-3 bg-white rounded-2xl hover:bg-slate-50 relative transition-all shadow-sm border border-slate-100">
            <Bell size={20} className="text-slate-600" />
            <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          <NavLink to="/settings" className="w-12 h-12 rounded-2xl border-2 border-white overflow-hidden shadow-md hover:scale-110 transition-transform">
            {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" alt="User" /> : <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400"><User size={24} /></div>}
          </NavLink>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* Action Hub */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div onClick={() => navigate('/meeting')} className="bg-white p-8 rounded-[40px] border border-white shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 text-indigo-500/5 group-hover:scale-150 transition-transform duration-700">
                <Plus size={120} />
              </div>
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-100 group-hover:rotate-90 transition-transform duration-500">
                <Plus size={28} />
              </div>
              <h4 className="font-black text-slate-800 text-xl">New Asset</h4>
              <p className="text-xs text-slate-400 font-bold mt-1">Start Recording</p>
            </div>

            <div onClick={() => navigate('/tasks')} className="bg-white p-8 rounded-[40px] border border-white shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
              <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-100">
                <ListTodo size={28} />
              </div>
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-800 text-xl">Tasks</h4>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl shadow-slate-400 flex flex-col justify-center text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[50px]"></div>
               <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Project Health</span>
               </div>
               <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-black">{progressPercent}%</span>
               </div>
               <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
               </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-[40px] border border-white shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-xl border border-slate-50">
                <CheckSquare size={32} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase mb-1">Total Assets</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">{meetingsCount}</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-[40px] border border-white shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-emerald-500 shadow-xl border border-slate-50">
                <Clock size={32} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase mb-1">Hours Saved</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">{timeSaved}</p>
              </div>
            </div>
          </div>

          {/* Recent Stream */}
          <div className='bg-white p-10 rounded-[45px] border border-white shadow-xl shadow-slate-200/40'>
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recent Stream</h3>
              <button onClick={() => navigate('/meeting')} className="text-xs font-black text-indigo-600 hover:tracking-widest transition-all uppercase">Open Archive</button>
            </div>
            {recentMeeting ? (
              <div 
                onClick={() => {
                  localStorage.setItem('currentMeetingView', JSON.stringify(recentMeeting));
                  navigate('/meeting-details');
                }}
                className="group bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex items-center justify-between hover:bg-white hover:shadow-2xl transition-all duration-500 cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 border border-slate-100 group-hover:scale-105 transition-transform">
                    {getIcon(recentMeeting.inputType)}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{recentMeeting.title}</p>
                    <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">
                      {new Date(recentMeeting.createdAt).toLocaleDateString()} • {recentMeeting.status}
                    </p>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                  <ArrowRight size={24} />
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold italic tracking-wide">No stream activity detected.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-indigo-600 p-10 rounded-[45px] text-white shadow-2xl shadow-indigo-300 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/20 shadow-lg">
              <Calendar size={32} />
            </div>
            <h4 className="font-black text-2xl mb-4 leading-tight">Sync Your <br/>Calendar</h4>
            <p className="text-indigo-100/70 text-sm font-medium mb-10 leading-relaxed">Automate meeting captures from your favorite platforms.</p>
            <button className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black text-sm hover:shadow-xl active:scale-95 transition-all uppercase">Activate Now</button>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-white shadow-sm">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">System Health</h4>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-600">AI Processing</span>
                </div>
                <span className="text-xs font-black">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-xs font-bold text-slate-600">Tasks Sync</span>
                </div>
                <span className="text-xs font-black">{tasksTotal} items</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-slate-400" size={16} />
                  <span className="text-xs font-bold text-slate-600">Security</span>
                </div>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg uppercase">Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}