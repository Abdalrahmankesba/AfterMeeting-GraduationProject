import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Trash2, AlertTriangle, Play, Eye, 
  Users, ClipboardList, MessageSquare, Save, Edit3, Plus, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function MeetingDetails() {
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [isEditingParticipants, setIsEditingParticipants] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [isEditingTasks, setIsEditingTasks] = useState(false);
  
  const [tempParticipants, setTempParticipants] = useState("");
  const [tempSummary, setTempSummary] = useState("");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchMeetingDetails = async () => {
      const data = localStorage.getItem('currentMeetingView');
      if (!data) return;

      const parsedData = JSON.parse(data);
      const meetingId = parsedData.id;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5129/api/meetings/${meetingId}`,  {
          headers: { Authorization: `Bearer ${token}` }
        });

        const freshData = response.data;
        setMeeting(freshData);

        const participantsString = Array.isArray(freshData.participants) 
          ? freshData.participants.map(p => p.name).join(', ') 
          : "";
        setTempParticipants(participantsString.replace(/, /g, '\n'));
        
        setTempSummary(freshData.summary || "");
        setTasks(freshData.tasks || []);

      } catch (error) {
        console.error(error);
        setMeeting(parsedData);
        setTempParticipants(parsedData.participants?.replace(/, /g, '\n') || "");
        setTempSummary(parsedData.summary || "");
        setTasks(parsedData.tasks || []);
      }
    };

    fetchMeetingDetails();
  }, []);

  const saveChanges = (updatedData) => {
    const updatedMeeting = { ...meeting, ...updatedData };
    setMeeting(updatedMeeting);
    
    const savedMeetings = JSON.parse(localStorage.getItem('userMeetings') || "[]");
    const updatedList = savedMeetings.map(m => (m.id === meeting.id) ? updatedMeeting : m);
    localStorage.setItem('userMeetings', JSON.stringify(updatedList));

    localStorage.setItem('currentMeetingView', JSON.stringify(updatedMeeting));
  };

  const handleSaveParticipants = () => {
    const formattedNames = tempParticipants.split('\n').filter(n => n.trim() !== "").join(', ');
    saveChanges({ participants: formattedNames });
    setIsEditingParticipants(false);
  };

  const handleSaveSummary = () => {
    saveChanges({ summary: tempSummary });
    setIsEditingSummary(false);
  };

  const addTaskRow = () => setTasks([...tasks, { person: '', task: '' }]);
  const removeTaskRow = (index) => setTasks(tasks.filter((_, i) => i !== index));
  const updateTask = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };
  const handleSaveTasks = () => {
    saveChanges({ tasks: tasks });
    setIsEditingTasks(false);
  };

  const confirmDelete = () => {
    const savedMeetings = JSON.parse(localStorage.getItem('userMeetings') || "[]");
    const updatedMeetings = savedMeetings.filter(m => m.id !== meeting.id);
    localStorage.setItem('userMeetings', JSON.stringify(updatedMeetings));
    localStorage.removeItem('currentMeetingView');
    navigate('/meeting');
  };

  if (!meeting) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold">Loading...</div>;

  const participantList = Array.isArray(meeting.participants)
    ? meeting.participants.map(p => p.name)
    : (typeof meeting.participants === 'string' ? meeting.participants.split(',').map(n => n.trim()) : []);

  return (
    <div className="min-h-screen bg-[#F8FBFB] p-4 md:p-12 font-sans">
      
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <button onClick={() => navigate('/meeting')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm">
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={() => setShowDeleteModal(true)} className="p-2.5 bg-white text-red-500 rounded-xl border border-red-50 shadow-sm hover:bg-red-50"><Trash2 size={18} /></button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
          <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-[10px] font-black uppercase tracking-widest">{meeting.type || 'MEETING'}</span>
          <h1 className="text-3xl font-black text-slate-900 mt-3 leading-tight">{meeting.title || 'Untitled Meeting'}</h1>
          <div className="flex gap-6 mt-6 pt-6 border-t border-slate-50 text-sm font-bold text-slate-700">
            <div><p className="text-[10px] text-slate-400 uppercase mb-1">Date</p>{meeting.date || new Date().toLocaleDateString()}</div>
            <div><p className="text-[10px] text-slate-400 uppercase mb-1">Status</p>{meeting.status || 'Completed'}</div>
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="flex items-center gap-2 text-lg font-black text-slate-800 uppercase tracking-tighter"><Users className="text-purple-500" size={20} /> Attendees</h3>
            <button onClick={() => setIsEditingParticipants(!isEditingParticipants)} className="text-[10px] font-bold text-purple-600 bg-purple-50 px-4 py-2 rounded-xl">
              {isEditingParticipants ? "CANCEL" : "EDIT LIST"}
            </button>
          </div>
          {isEditingParticipants ? (
            <div className="space-y-4">
              <textarea value={tempParticipants} onChange={(e)=>setTempParticipants(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-purple-100 rounded-2xl h-32 text-sm font-bold" placeholder="One name per line..." />
              <button onClick={handleSaveParticipants} className="w-full py-3 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-100">SAVE NAMES</button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {participantList.map((name, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full">
                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-[8px] text-white font-black">{name ? name.charAt(0).toUpperCase() : '?'}</div>
                  <span className="text-xs font-bold text-slate-600">{name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="flex items-center gap-2 text-lg font-black text-slate-800 uppercase tracking-tighter"><MessageSquare className="text-sky-500" size={20} /> Summary</h3>
            <button onClick={() => setIsEditingSummary(!isEditingSummary)} className="text-[10px] font-bold text-sky-600 bg-sky-50 px-4 py-2 rounded-xl">
              {isEditingSummary ? "CANCEL" : "EDIT SUMMARY"}
            </button>
          </div>
          {isEditingSummary ? (
            <div className="space-y-4">
              <textarea value={tempSummary} onChange={(e)=>setTempSummary(e.target.value)} className="w-full p-6 bg-slate-50 border-2 border-sky-100 rounded-2xl h-48 text-sm font-medium" />
              <button onClick={handleSaveSummary} className="w-full py-3 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-100">SAVE SUMMARY</button>
            </div>
          ) : (
            <div className="bg-sky-50/30 p-6 rounded-2xl border border-sky-50/50 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{meeting.summary || "No summary added."}</div>
          )}
        </div>

        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="flex items-center gap-2 text-lg font-black text-slate-800 uppercase tracking-tighter">
              <ClipboardList className="text-emerald-500" size={20} /> Action Items
            </h3>
            {!isEditingTasks ? (
              <button onClick={() => setIsEditingTasks(true)} className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">EDIT TASKS</button>
            ) : (
              <button onClick={handleSaveTasks} className="text-[10px] font-bold text-white bg-emerald-500 px-4 py-2 rounded-xl">SAVE TASKS</button>
            )}
          </div>
          {isEditingTasks ? (
            <div className="space-y-3">
              {tasks.map((item, index) => (
                <div key={index} className="flex gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
                  <div className="flex-1">
                    <select value={item.person} onChange={(e) => updateTask(index, 'person', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold">
                      <option value="">Select person...</option>
                      {participantList.map((p, i) => <option key={i} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="flex-[2]">
                    <input type="text" value={item.task || item.title || ''} onChange={(e) => updateTask(index, 'task', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs" placeholder="Task description..." />
                  </div>
                  <button onClick={() => removeTaskRow(index)} className="text-red-400"><XCircle size={20} /></button>
                </div>
              ))}
              <button onClick={addTaskRow} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold">+ ADD TASK</button>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.length > 0 ? tasks.map((item, i) => (
  <div 
    key={i} 
    onClick={() => navigate('/tasks')}
    className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100 hover:shadow-md transition-all"
  >
    <div className="flex-1">
      <p className="text-[10px] font-black text-slate-400 uppercase">
        {item.assignedTo || item.person || "Unassigned"}
      </p>
      <p className="text-sm font-bold text-slate-700">
        {item.title || item.task}
      </p>
      {item.description && (
        <p className="text-xs text-slate-400 mt-1">{item.description}</p>
      )}
    </div>
    <div className="flex items-center gap-2">
      <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase
        ${item.priority === 'High' ? 'bg-red-50 text-red-500' : 
          item.priority === 'Medium' ? 'bg-amber-50 text-amber-500' : 
          'bg-slate-100 text-slate-400'}`}>
        {item.priority || 'Medium'}
      </span>
      <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase
        ${item.status === 'Todo' ? 'bg-blue-50 text-blue-500' :
          item.status === 'InProgress' ? 'bg-amber-50 text-amber-500' :
          'bg-emerald-50 text-emerald-500'}`}>
        {item.status || 'Todo'}
      </span>
    </div>
  </div>
)) : <p className="text-center text-slate-400 text-xs font-bold py-4">No tasks.</p>}
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/20">
          <div className="bg-white rounded-[24px] shadow-2xl max-w-sm w-full p-8 text-center">
             <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Meeting?</h3>
             <div className="flex gap-3 mt-8">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-xs">Delete</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}