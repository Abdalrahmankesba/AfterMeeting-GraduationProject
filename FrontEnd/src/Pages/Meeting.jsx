import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Filter, X, FileText, File, Plus, 
  Trash2, Mic, Volume2, Calendar as CalendarIcon,
  Clock, ArrowRight, Sparkles, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance'; 

export default function Meeting() {
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [textInputMode, setTextInputMode] = useState(false);
  const [manualSummary, setManualSummary] = useState("");
  
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState(null);
  const fileInputRef = useRef(null);
  const workspaceId = localStorage.getItem('workspaceId');

  // --- متغييرات التسجيل الصوتي المباشر والعداد ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // دالة لتنسيق الوقت (00:00)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchMeetings();
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [workspaceId]);

  const fetchMeetings = async () => {
    try {
      if (!workspaceId) return;
      const response = await axios.get(`/api/meetings?workspaceId=${workspaceId}`);
      setMeetings(response.data);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, typeStr) => {
    const file = e.target.files[0];
    if (!file || !workspaceId) return;

    setUploadingType('Audio');
    const formData = new FormData();
    formData.append('workspaceId', workspaceId);
    formData.append('inputType', 0); // 0 للصوت
    formData.append('uploadedFile', file);

    try {
      await axios.post('/api/meetings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`✅ تم رفع الملف وبدء المعالجة!`);
      fetchMeetings(); 
    } catch (error) {
      alert("❌ فشل الرفع.");
    } finally {
      setUploadingType(null);
      e.target.value = null; 
    }
  };

  const handleManualSubmit = async () => {
    if (!manualSummary.trim()) {
      alert("Please enter the meeting text");
      return;
    }

    setUploadingType('Text'); 
    const formData = new FormData();
    formData.append('workspaceId', workspaceId);
    formData.append('title', 'Manual Entry'); 
    formData.append('inputType', 1); // 1 للنص
    formData.append('text', manualSummary);

    try {
      const token = localStorage.getItem('token'); 
      await axios.post('http://localhost:5129/api/meetings', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` 
        }
      });
      alert('✅ Meeting saved!');
      setTextInputMode(false);
      setManualSummary(""); 
      fetchMeetings(); 
    } catch (error) {
      alert('❌ Failed to save.');
    } finally {
      setUploadingType(null);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
      setRecordingTime(0);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          stream.getTracks().forEach(t => t.stop());
          const file = new window.File([audioBlob], `Live_${Date.now()}.webm`, { type: 'audio/webm' });
          await uploadLiveAudio(file);
        };

        mediaRecorder.start();
        setIsRecording(true);
        timerIntervalRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
      } catch (err) {
        alert("❌ يرجى السماح بالوصول للمايكروفون.");
      }
    }
  };

  const uploadLiveAudio = async (file) => {
    if (!workspaceId) return;
    setUploadingType('Live'); 
    const formData = new FormData();
    formData.append('workspaceId', workspaceId);
    formData.append('inputType', 2); // 2 للتسجيل المباشر
    formData.append('uploadedFile', file);

    try {
      const token = localStorage.getItem('token'); 
      await axios.post('http://localhost:5129/api/meetings', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` 
        }
      });
      fetchMeetings(); 
    } catch (error) {
      alert("❌ فشل الرفع.");
    } finally {
      setUploadingType(null);
    }
  };

  const deleteMeeting = async (id) => {
    if(window.confirm("Delete this?")) {
      try {
        await axios.delete(`/api/meetings/${id}`);
        setMeetings(meetings.filter(m => m.id !== id));
      } catch (error) {
        alert('❌ Failed.');
      }
    }
  };

  const filteredMeetings = meetings.filter(m => 
    m.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 pb-20 font-['Plus_Jakarta_Sans'] px-4 md:px-0">
      <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'Audio')} className="hidden" accept="audio/*,video/*" />

      <div className="max-w-6xl mx-auto pt-8 md:pt-6">
        <header className="flex flex-col sm:mt-10 mt-2 mb-10 md:mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full w-fit">
              <Sparkles size={14} className="fill-indigo-600" />
              <span className="text-[10px] font-black uppercase tracking-wider">AI Powered Archiving</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Meetings</h1>
            <p className="text-slate-400 font-medium text-sm md:text-base">Manage and transform your recordings into insights.</p>
          </div>
        </header>

        <div className="relative mb-8 md:mb-10 group">
          <div className="absolute inset-y-0 left-0 pl-5 md:pl-6 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-all duration-300" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-14 md:pl-16 pr-4 md:pr-32 py-4 md:py-5 bg-white border border-slate-100 rounded-[25px] md:rounded-[30px] text-sm font-bold text-slate-700 shadow-sm focus:ring-4 ring-indigo-500/5 focus:border-indigo-200 outline-none transition-all"
            placeholder="Find a specific meeting..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-10">
          <ActionCard 
            onClick={() => fileInputRef.current.click()}
            icon={uploadingType === 'Audio' ? <Loader2 className="animate-spin" size={24} /> : <Volume2 size={24} />}
            color="emerald"
            title="Audio Clip"
            subtitle={uploadingType === 'Audio' ? "Uploading..." : "Voice to Text"}
          />
          <ActionCard 
            onClick={toggleRecording}
            icon={uploadingType === 'Live' ? <Loader2 className="animate-spin" size={24} /> : (isRecording ? <div className="w-3 h-3 bg-rose-500 rounded-sm" /> : <Mic size={24} />)}
            color={isRecording ? "rose" : "orange"}
            title={uploadingType === 'Live' ? "Saving..." : (isRecording ? "Recording..." : "Live Record")}
            subtitle={uploadingType === 'Live' ? "Please wait" : (isRecording ? formatTime(recordingTime) : "Voice to Text")}
            isActive={isRecording || uploadingType === 'Live'}
            isRecordingCard={true}
          />
          <ActionCard 
            onClick={() => setTextInputMode(!textInputMode)}
            icon={textInputMode ? <X size={24} /> : <Plus size={24} />}
            color={textInputMode ? "rose" : "indigo"}
            title={textInputMode ? "Close Form" : "Manual Input"}
            subtitle={textInputMode ? "Discard" : "Quick Summary"}
            isActive={textInputMode}
          />
        </div>

        {textInputMode && (
          <div className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] mb-10 border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="w-1.5 md:w-2 h-6 md:h-8 bg-indigo-600 rounded-full"></div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 italic">Create New Insight</h2>
            </div>
            <div className="space-y-2 mb-8">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meeting Text</label>
              <textarea 
                value={manualSummary} onChange={(e)=>setManualSummary(e.target.value)}
                className="w-full h-40 md:h-56 p-5 bg-slate-50 rounded-[20px] md:rounded-[25px] border-none outline-none font-medium text-slate-600 focus:ring-2 ring-indigo-500/20 resize-none text-sm" 
                placeholder="Paste your meeting notes here..."
              />
            </div>
            <div className="flex justify-end gap-4">
              <button onClick={()=>setTextInputMode(false)} className="px-6 py-3 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Discard</button>
              <button onClick={handleManualSubmit} disabled={uploadingType === 'Text'} className="bg-slate-900 text-white px-8 py-4 rounded-[18px] text-xs font-black shadow-xl hover:bg-indigo-600 transition-all disabled:opacity-50 flex items-center gap-2">
                {uploadingType === 'Text' && <Loader2 className="animate-spin" size={16} />} SAVE TO ARCHIVE
              </button>
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-100 rounded-[30px] md:rounded-[40px] shadow-sm overflow-hidden ring-1 ring-slate-100">
          <div className="hidden md:grid grid-cols-2 bg-slate-50/50 border-b border-slate-100 px-10 py-6">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Record Details</span>
            <span className="text-right text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Actions</span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-indigo-500 flex justify-center items-center gap-2">
              <Loader2 className="animate-spin" size={24} /> Loading meetings...
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredMeetings.map((m) => (
                <div key={m.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:px-10 md:py-6 hover:bg-slate-50/50 transition-all group gap-4">
                  <div className="flex items-center gap-4 md:gap-5">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:rotate-6 ${
                      m.inputType === 'Text' || m.inputType === '1' ? 'bg-indigo-100 text-indigo-600' : 
                      m.inputType === 'Recording' || m.inputType === '2' ? 'bg-rose-100 text-rose-500' : 
                      m.inputType === 'Audio' || m.inputType === '0' ? 'bg-emerald-100 text-emerald-600' : 
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {
                        m.inputType === 'Text' || m.inputType === '1' ? <FileText size={20}/> : 
                        m.inputType === 'Recording' || m.inputType === '2' ? <Mic size={20}/> : 
                        m.inputType === 'Audio' || m.inputType === '0' ? <Volume2 size={20}/> : 
                        <File size={20}/>
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm md:text-base font-black text-slate-800 italic truncate pr-4">{m.title}</p>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1 text-slate-400">
                        <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold uppercase tracking-tight whitespace-nowrap"><CalendarIcon size={12}/> {new Date(m.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold uppercase tracking-tight whitespace-nowrap"><Clock size={12}/> {m.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2 md:gap-3">
                    <button onClick={()=>deleteMeeting(m.id)} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"><Trash2 size={18} /></button>
                    <button onClick={() => { localStorage.setItem('currentMeetingView', JSON.stringify(m)); navigate('/meeting-details'); }} className="px-6 md:px-8 py-3 rounded-xl bg-slate-900 text-white text-[10px] font-black hover:bg-indigo-600 transition-all shadow-lg flex items-center gap-2 uppercase">
                      View Details <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionCard({ onClick, icon, color, title, subtitle, isActive, isRecordingCard }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-500 hover:border-emerald-200 hover:shadow-emerald-50",
    orange: "bg-orange-50 text-orange-500 hover:border-orange-200 hover:shadow-orange-50",
    indigo: "bg-indigo-50 text-indigo-600 hover:border-indigo-200 hover:shadow-indigo-50",
    rose: "bg-white border-rose-300 shadow-xl shadow-rose-100/50 ring-2 ring-rose-500/20"
  };

  return (
    <div onClick={onClick} className={`group cursor-pointer p-5 md:p-6 border rounded-[25px] md:rounded-[35px] transition-all duration-300 ${isActive ? colors.rose : `bg-white border-slate-100 ${colors[color]}`} hover:shadow-xl`}>
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${isActive ? 'bg-rose-100 text-rose-500 animate-pulse' : colors[color].split(' ')[0]}`}>
        {icon}
      </div>
      <h3 className="font-black text-sm italic text-slate-900">{title}</h3>
      <p className={`text-[10px] md:text-[11px] font-bold mt-1 uppercase tracking-widest ${isActive && isRecordingCard ? 'text-rose-600 font-black' : 'text-slate-400'}`}>{subtitle}</p>
    </div>
  );
}