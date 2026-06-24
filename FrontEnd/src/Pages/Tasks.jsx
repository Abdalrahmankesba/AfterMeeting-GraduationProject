import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Plus, ChevronLeft, ChevronRight, X, 
  CheckCircle2, Trash2, Search, Calendar,
  Clock, ClipboardList, Edit3, ArrowRight, Play
} from 'lucide-react';
import axios from '../api/axiosInstance';

export default function Tasks() {
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

// 2. المحاولة الأولى يقرأ firstName + lastName، ولو مش موجودين يقرأ name، ولو مفيش خالص يكتب User
const fullName = user.firstName 
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
    : (user.name || "User");

const [userName] = useState(fullName);
  const [userAvatar] = useState(localStorage.getItem('userAvatar') || "");
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 6;

  const [formData, setFormData] = useState({ title: '', date: '', description: '' });
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const workspaceId = localStorage.getItem('workspaceId');
        if (!workspaceId) return;

        const response = await axios.get(`/api/tasks?workspaceId=${workspaceId}`);

        const apiTasks = response.data.map(t => ({
          id: t.id,
          task: t.title,
          description: t.description || "",
          dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No Deadline",
          status: t.status === 'Todo' ? 'To Do'
                : t.status === 'InProgress' ? 'In Progress'
                : 'Done',
          checked: t.status === 'Done',
          priority: t.priority,
          assignedTo: t.assignedTo
        }));

        setTasks(apiTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const newTask = {
        id: Date.now(),
        task: formData.title,
        dueDate: formData.date || "No Deadline",
        status: "To Do",
        checked: false,
        description: formData.description
      };
      setTasks([newTask, ...tasks]);
      setShowAddModal(false);
      setFormData({ title: '', date: '', description: '' });
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const startTask = async (id) => {
    try {
      await axios.put(`/api/tasks/${id}`, { status: 1 });
      setTasks(tasks.map(t =>
        t.id === id ? { ...t, status: 'In Progress', checked: false } : t
      ));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/tasks/${editData.id}`, {
        title: editData.task,
        description: editData.description,
        dueDate: editData.dueDate
      });
      setTasks(tasks.map(t => t.id === editData.id ? editData : t));
      setSelectedTask(editData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`/api/tasks/${id}`);
        setTasks(tasks.filter(t => t.id !== id));
        setSelectedTask(null);
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    const newStatus = task.checked ? 0 : 2;
    try {
      await axios.put(`/api/tasks/${id}`, { status: newStatus });
      setTasks(tasks.map(t =>
        t.id === id ? { ...t, checked: !t.checked, status: !t.checked ? 'Done' : 'To Do' } : t
      ));
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'In Progress': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Done': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-sky-50 text-sky-600 border-sky-100';
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesTab = activeTab === 'All' || t.status === activeTab;
    const matchesSearch = t.task.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const currentTasks = filteredTasks.slice((currentPage - 1) * tasksPerPage, currentPage * tasksPerPage);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  if (loadingTasks) return (
    <div className="min-h-screen flex items-center justify-center text-sky-500 font-bold text-xl">
      Loading Tasks...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-12">
      
      {(showAddModal || selectedTask) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4"
             onClick={() => { setShowAddModal(false); setSelectedTask(null); setIsEditing(false); }}>
          
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden"
               onClick={(e) => e.stopPropagation()}>
            
            {showAddModal ? (
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black tracking-tight">Create Task</h2>
                  <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 rounded-full"><X/></button>
                </div>
                <form onSubmit={handleAddTask} className="space-y-4">
                  <input required placeholder="Task title..." className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
                         onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl text-slate-500">
                    <Calendar size={20} />
                    <input type="date" className="bg-transparent outline-none w-full" 
                           onChange={(e) => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <textarea placeholder="Description (optional)" rows="3" className="w-full p-4 bg-slate-50 rounded-2xl outline-none resize-none"
                            onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  <button type="submit" className="w-full py-4 bg-sky-500 text-white font-bold rounded-2xl shadow-lg shadow-sky-100 hover:bg-sky-600 active:scale-[0.98] transition-all">
                    Save Task
                  </button>
                </form>
              </div>
            ) : selectedTask && (
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${getStatusStyle(selectedTask.status)}`}>
                    {selectedTask.status}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => deleteTask(selectedTask.id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"><Trash2 size={20} /></button>
                    <button onClick={() => { setSelectedTask(null); setIsEditing(false); }} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl"><X size={20} /></button>
                  </div>
                </div>

                {isEditing ? (
                  <form onSubmit={handleUpdateTask} className="space-y-4">
                    <input value={editData.task} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none ring-2 ring-sky-500"
                           onChange={(e) => setEditData({...editData, task: e.target.value})} />
                    <input type="date" value={editData.dueDate} className="w-full p-4 bg-slate-50 rounded-2xl outline-none"
                           onChange={(e) => setEditData({...editData, dueDate: e.target.value})} />
                    <textarea value={editData.description} rows="4" className="w-full p-4 bg-slate-50 rounded-2xl resize-none outline-none"
                              onChange={(e) => setEditData({...editData, description: e.target.value})} />
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl">Cancel</button>
                      <button type="submit" className="flex-1 py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100">Save Changes</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 leading-tight">{selectedTask.task}</h3>
                      {selectedTask.assignedTo && (
                        <p className="text-xs text-slate-400 mt-2 font-bold">Assigned to: {selectedTask.assignedTo}</p>
                      )}
                      <div className="flex items-center gap-2 mt-4 text-rose-500 bg-rose-50 w-fit px-4 py-2 rounded-xl border border-rose-100">
                        <Clock size={16} />
                        <span className="text-xs font-bold uppercase tracking-tight">Deadline: {selectedTask.dueDate}</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[24px]">
                      <p className="text-slate-600 text-sm leading-relaxed">{selectedTask.description || "No description provided."}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => { setEditData({...selectedTask}); setIsEditing(true); }} 
                              className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2">
                        <Edit3 size={18} /> Edit
                      </button>
                      <button onClick={() => { toggleTask(selectedTask.id); setSelectedTask(null); }}
                              className={`flex-1 py-4 font-bold rounded-2xl transition-all ${selectedTask.checked ? 'bg-amber-100 text-amber-600' : 'bg-sky-500 text-white shadow-lg'}`}>
                        {selectedTask.checked ? "Undo Done" : "Complete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-500 rounded-2xl shadow-lg shadow-sky-200 flex items-center justify-center text-white">
              <ClipboardList size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">My Tasks</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Workspace Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-sky-500 transition-all"><Bell size={20}/></button>
            <div className="flex items-center gap-3 border-l pl-4 border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-800 uppercase">{userName}</p>
                <p className="text-[9px] text-emerald-500 font-bold">Online</p>
              </div>
              <img src={userAvatar || `https://ui-avatars.com/api/?name=${userName}&background=0EA5E9&color=fff`}
                   className="w-11 h-11 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100" alt="User" />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 mt-10">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-10">
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 w-full md:w-auto">
            {["All", "To Do", "In Progress", "Done"].map((tab) => (
              <button key={tab} onClick={() => {setActiveTab(tab); setCurrentPage(1);}}
                      className={`px-6 py-2.5 cursor-pointer rounded-xl text-sm font-bold transition-all ${activeTab === tab ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" size={18} />
              <input type="text" placeholder="Search tasks..." value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-[20px] text-sm focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 outline-none transition-all" />
            </div>
            <button onClick={() => setShowAddModal(true)} className="bg-sky-500 cursor-pointer text-white px-8 py-3.5 rounded-[20px] font-black shadow-lg shadow-sky-100 flex items-center gap-2 hover:bg-sky-600 transition-all active:scale-95">
              <Plus size={20} strokeWidth={3} /> <span className="hidden sm:block">NEW TASK</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentTasks.length > 0 ? currentTasks.map((item) => (
            <div key={item.id}
                 onClick={() => { setSelectedTask(item); setEditData({...item}); }}
                 className="group bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col relative">
              
              <div className="p-6 pb-4 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <button onClick={(e) => { e.stopPropagation(); toggleTask(item.id); }}
                          className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${item.checked ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-100" : "border-slate-200 group-hover:border-sky-500 bg-white"}`}>
                    {item.checked && <CheckCircle2 size={16} className="text-white" />}
                  </button>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-wider ${getStatusStyle(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                
                {/* تعديل: إضافة زرار الحذف والبدء بجانب بعضهما */}
                <div className="flex items-center gap-2">
                  {item.status === 'To Do' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); startTask(item.id); }}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 text-white rounded-xl text-[10px] font-black shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all active:scale-90">
                      <Play size={10} fill="currentColor" /> START
                    </button>
                  )}
                  {/* زرار حذف التاسك الجديد */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteTask(item.id); }} 
                    className="p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="px-6 flex-1">
                <h4 className={`text-lg font-bold text-slate-800 mb-2 transition-all ${item.checked ? 'line-through text-slate-300' : ''}`}>
                  {item.task}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-6 italic">
                  {item.description || "No specific details provided..."}
                </p>
              </div>

              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${item.status === 'Done' ? 'bg-slate-100 text-slate-400 border-transparent' : 'bg-white text-rose-500 border-rose-100 shadow-sm'}`}>
                  <Calendar size={14} />
                  <span className="text-[11px] font-bold tracking-tight">{item.dueDate || "No Date"}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-sky-500 transition-colors">
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList size={40} className="text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Clean Slate!</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">No tasks matching your current view.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-14 flex justify-center items-center gap-6">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                    className="p-3 bg-white border border-slate-200 rounded-2xl disabled:opacity-30 hover:shadow-lg transition-all"><ChevronLeft/></button>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                    className="p-3 bg-white border border-slate-200 rounded-2xl disabled:opacity-30 hover:shadow-lg transition-all"><ChevronRight/></button>
          </div>
        )}
      </main>
    </div>
  );
}