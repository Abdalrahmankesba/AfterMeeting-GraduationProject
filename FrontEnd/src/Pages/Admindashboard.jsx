import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance'; 
import { 
  Users, Briefcase, Mic, CheckSquare, ShieldAlert, Trash2, ShieldBan, 
  Activity, Server, HardDrive, Clock, Search, UserX, UserCheck, 
  Building2, User, CalendarDays, Flag, AlertCircle
} from 'lucide-react';

export default function Admindashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // States للبيانات
  const [stats, setStats] = useState({ totalUsers: 0, totalWorkspaces: 0, totalMeetings: 0, totalTasks: 0 });
  const [users, setUsers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  
  // States للبحث
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [workspaceSearchQuery, setWorkspaceSearchQuery] = useState('');
  const [meetingSearchQuery, setMeetingSearchQuery] = useState('');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        // ملاحظة للباك إند: هنحتاج نعمل Endpoints للـ meetings والـ tasks جوه الـ SuperAdmin
        const [statsRes, usersRes, workspacesRes, meetingsRes, tasksRes] = await Promise.all([
          axios.get('/api/SuperAdmin/stats'),
          axios.get('/api/SuperAdmin/users'),
          axios.get('/api/SuperAdmin/workspaces'),
          axios.get('/api/SuperAdmin/meetings').catch(() => ({ data: [] })), // Fallback until API is ready
          axios.get('/api/SuperAdmin/tasks').catch(() => ({ data: [] }))     // Fallback until API is ready
        ]);

        setStats(statsRes.data);
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setWorkspaces(Array.isArray(workspacesRes.data) ? workspacesRes.data : []);
        setMeetings(Array.isArray(meetingsRes.data) ? meetingsRes.data : []);
        setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 401) {
          setApiError("Access Denied: Admin access required.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // ---------------- دوال التحكم ----------------
  const handleToggleAdmin = async (userId) => {
    try {
      await axios.put(`/api/SuperAdmin/users/${userId}/toggle-admin`);
      setUsers(users.map(user => user.id === userId ? { ...user, isAdmin: !user.isAdmin } : user));
    } catch (error) {
      alert("Failed to update role");
    }
  };

  const handleToggleSuspend = async (userId) => {
    try {
      // await axios.put(`/api/SuperAdmin/users/${userId}/toggle-suspend`);
      setUsers(users.map(user => user.id === userId ? { ...user, isSuspended: !user.isSuspended } : user));
    } catch (error) {
      alert("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("⚠️ هل أنت متأكد من مسح هذا المستخدم نهائياً؟")) {
      try {
        await axios.delete(`/api/SuperAdmin/users/${userId}`);
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        alert("Failed to delete user");
      }
    }
  };

  const handleDeleteWorkspace = async (workspaceId) => {
    if (window.confirm("⚠️ هل أنت متأكد من حذف مساحة العمل وكل بياناتها؟")) {
      try {
        await axios.delete(`/api/SuperAdmin/workspaces/${workspaceId}`);
        setWorkspaces(workspaces.filter(ws => ws.id !== workspaceId));
      } catch (error) {
        alert("Failed to delete workspace");
      }
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (window.confirm("⚠️ هل أنت متأكد من حذف هذا الاجتماع نهائياً من النظام؟")) {
      try {
        await axios.delete(`/api/SuperAdmin/meetings/${meetingId}`);
        setMeetings(meetings.filter(m => m.id !== meetingId));
      } catch (error) {
        alert("Failed to delete meeting");
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("⚠️ هل أنت متأكد من حذف هذه المهمة؟")) {
      try {
        await axios.delete(`/api/SuperAdmin/tasks/${taskId}`);
        setTasks(tasks.filter(t => t.id !== taskId));
      } catch (error) {
        alert("Failed to delete task");
      }
    }
  };

  // ---------------- دوال الفلترة والبحث ----------------
  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const filteredWorkspaces = workspaces.filter(ws => 
    ws.name?.toLowerCase().includes(workspaceSearchQuery.toLowerCase()) || 
    ws.ownerEmail?.toLowerCase().includes(workspaceSearchQuery.toLowerCase())
  );

  const filteredMeetings = meetings.filter(m => 
    m.title?.toLowerCase().includes(meetingSearchQuery.toLowerCase()) ||
    m.inputType?.toLowerCase().includes(meetingSearchQuery.toLowerCase())
  );

  const filteredTasks = tasks.filter(t => 
    t.title?.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
    t.assignedTo?.toLowerCase().includes(taskSearchQuery.toLowerCase())
  );

  // ---------------- Helpers للتصميم ----------------
  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#0EA5E9]"></div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-4">
        <div className="w-24 h-24 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6"><ShieldAlert size={48} /></div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">{apiError}</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      
      {/* 🛠️ Top Navigation Bar */}
      <div className="max-w-7xl mx-auto mb-8 bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Activity className="text-[#0EA5E9]" /> Command Center
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">SuperAdmin Privileges</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-xl overflow-x-auto w-full md:w-auto shadow-inner">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'workspaces', label: 'Workspaces', icon: Briefcase },
            { id: 'meetings', label: 'Meetings', icon: Mic },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-[#0EA5E9] shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        
        {/* ==================== 1️⃣ OVERVIEW VIEW ==================== */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Users size={80} /></div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Users</p>
                <h3 className="text-4xl font-black text-slate-800">{stats.totalUsers}</h3>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Briefcase size={80} /></div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Workspaces</p>
                <h3 className="text-4xl font-black text-slate-800">{stats.totalWorkspaces}</h3>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Mic size={80} /></div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Processed Meetings</p>
                <h3 className="text-4xl font-black text-slate-800">{stats.totalMeetings}</h3>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><CheckSquare size={80} /></div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Generated Tasks</p>
                <h3 className="text-4xl font-black text-slate-800">{stats.totalTasks}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-1">
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2"><Server size={20} className="text-[#0EA5E9]" /> System Health</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                      <span className="flex items-center gap-2"><HardDrive size={16} /> Database Capacity</span>
                      <span>32%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5"><div className="bg-[#0EA5E9] h-2.5 rounded-full" style={{ width: '32%' }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                      <span className="flex items-center gap-2"><Activity size={16} /> AI Server Load</span>
                      <span className="text-emerald-600">Optimal</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5"><div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '15%' }}></div></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
                <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2"><Clock size={20} className="text-[#0EA5E9]" /> Recent Activity</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Workspace Name</th>
                        <th className="py-3 px-4 text-center">Type</th>
                        <th className="py-3 px-4">Owner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {workspaces.slice(0, 4).map(ws => (
                        <tr key={ws.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800">{ws.name}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-1 rounded text-[10px] font-bold uppercase">{ws.type}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">{ws.ownerEmail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2️⃣ USERS CONTROL VIEW ==================== */}
        {activeTab === 'users' && (
          <div className="animate-fade-in space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-800">Users Directory</h2>
              </div>
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search size={18} className="text-slate-400" /></div>
                <input 
                  type="text" placeholder="Search by name or email..." value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-all"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="py-4 px-6">User Details</th>
                      <th className="py-4 px-6">Email Address</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6 text-center">Role</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length > 0 ? filteredUsers.map(user => (
                      <tr key={user.id} className={`hover:bg-slate-50/80 transition-colors ${user.isSuspended ? 'bg-rose-50/30' : ''}`}>
                        <td className="py-4 px-6 font-bold text-slate-800">
                          {user.fullName}
                          {user.isSuspended && <span className="ml-2 text-[10px] bg-rose-100 border border-rose-200 text-rose-700 px-2 py-0.5 rounded uppercase font-bold">Suspended</span>}
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-medium">{user.email}</td>
                        <td className="py-4 px-6 text-center">
                           <button onClick={() => handleToggleSuspend(user.id)} className={`px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider transition-colors border ${user.isSuspended ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}>
                             {user.isSuspended ? 'Suspended' : 'Active'}
                           </button>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider border ${user.isAdmin ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                            {user.isAdmin ? 'SuperAdmin' : 'Standard'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center flex justify-center gap-2">
                          <button onClick={() => handleToggleAdmin(user.id)} className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-all text-slate-500" title="Toggle Admin"><ShieldBan size={16} /></button>
                          <button onClick={() => handleToggleSuspend(user.id)} className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-amber-50 hover:text-amber-700 transition-all text-slate-500" title="Suspend User">{user.isSuspended ? <UserCheck size={16} /> : <UserX size={16} />}</button>
                          <button onClick={() => handleDeleteUser(user.id)} className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-rose-50 hover:text-rose-700 transition-all text-slate-500" title="Delete User"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" className="py-12 text-center text-slate-500 font-medium">No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 3️⃣ WORKSPACES CONTROL VIEW ==================== */}
        {activeTab === 'workspaces' && (
          <div className="animate-fade-in space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div><h2 className="text-xl font-black text-slate-800">Workspaces Control</h2></div>
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search size={18} className="text-slate-400" /></div>
                <input 
                  type="text" placeholder="Search workspaces..." value={workspaceSearchQuery} onChange={(e) => setWorkspaceSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-all"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="py-4 px-6">Workspace Name</th>
                      <th className="py-4 px-6 text-center">Type</th>
                      <th className="py-4 px-6">Owner</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWorkspaces.length > 0 ? filteredWorkspaces.map(ws => (
                      <tr key={ws.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-800">{ws.name}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${ws.type === 'Personal' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                            {ws.type}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-medium text-xs">{ws.ownerEmail}</td>
                        <td className="py-4 px-6 text-center">
                          <button onClick={() => handleDeleteWorkspace(ws.id)} className="flex items-center justify-center gap-2 w-full px-3 py-2 border border-rose-200 text-rose-600 bg-white hover:bg-rose-50 rounded-lg transition-all text-xs font-black uppercase tracking-wider">
                            <Trash2 size={14} /> Force Delete
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="py-12 text-center text-slate-500 font-medium">No workspaces found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 4️⃣ MEETINGS CONTROL VIEW ==================== */}
        {activeTab === 'meetings' && (
          <div className="animate-fade-in space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-800">Meetings Repository</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Audit and manage all processed sessions across workspaces.</p>
              </div>
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search size={18} className="text-slate-400" /></div>
                <input 
                  type="text" placeholder="Search meetings by title or type..." value={meetingSearchQuery} onChange={(e) => setMeetingSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-all"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="py-4 px-6">Meeting Title</th>
                      <th className="py-4 px-6 text-center">Input Type</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6 text-center">Details</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMeetings.length > 0 ? filteredMeetings.map(meeting => (
                      <tr key={meeting.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-800">
                          {meeting.title}
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-semibold"><CalendarDays size={10} /> {new Date(meeting.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">{meeting.inputType}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                           <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${meeting.status?.toLowerCase() === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                             {meeting.status}
                           </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{meeting.tasksCount} Tasks</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button onClick={() => handleDeleteMeeting(meeting.id)} className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-rose-50 hover:text-rose-700 transition-all text-slate-500" title="Delete Meeting">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" className="py-12 text-center text-slate-500 font-medium">No meetings found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 5️⃣ TASKS CONTROL VIEW ==================== */}
        {activeTab === 'tasks' && (
          <div className="animate-fade-in space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-800">Global Tasks Monitor</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Supervise AI-extracted action items.</p>
              </div>
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search size={18} className="text-slate-400" /></div>
                <input 
                  type="text" placeholder="Search tasks by title or assignee..." value={taskSearchQuery} onChange={(e) => setTaskSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-all"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="py-4 px-6">Task Subject</th>
                      <th className="py-4 px-6">Assigned To</th>
                      <th className="py-4 px-6 text-center">Priority</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTasks.length > 0 ? filteredTasks.map(task => (
                      <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-800">
                          {task.title}
                          {task.dueDate && <div className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 font-semibold"><AlertCircle size={10} /> Due: {new Date(task.dueDate).toLocaleDateString()}</div>}
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-medium text-xs">{task.assignedTo || 'Unassigned'}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border flex items-center justify-center gap-1 w-fit mx-auto ${getPriorityColor(task.priority)}`}>
                            <Flag size={10} /> {task.priority}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">{task.status}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button onClick={() => handleDeleteTask(task.id)} className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-rose-50 hover:text-rose-700 transition-all text-slate-500" title="Delete Task">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" className="py-12 text-center text-slate-500 font-medium">No tasks found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}