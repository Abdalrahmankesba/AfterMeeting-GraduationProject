import React, { useState, useRef, useEffect } from 'react';
import { 
  User, Bell, Link2, ShieldCheck, Mail, Camera, Loader2, 
  Globe, Check, ChevronRight, Settings as SettingsIcon, Key
} from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Alerts', icon: Bell },
  { id: 'integrations', label: 'Apps', icon: Link2 },
  { id: 'privacy', label: 'Security', icon: ShieldCheck },
];

const API_BASE_URL = 'http://localhost:5129'; 
export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  
  // ================= STATES =================
  // 1. Profile State
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isProfileSuccess, setIsProfileSuccess] = useState(false);
  const [settingsData, setSettingsData] = useState({
    fullName: '',
    email: '',
    avatar: "https://ui-avatars.com/api/?name=User&background=000&color=fff"
  });

  // 2. Security (Password) State
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fileInputRef = useRef(null);
  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettingsData(prev => ({ ...prev,fullName: fetchedFullName || "", 
  email: data.email || "", avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ================= API CALLS =================
  
  // 1. Fetch Profile (GET)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/Users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          // دمج الاسمين عشان نعرضهم في حقل "Full Identity"
          const fetchedFullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
          
          setSettingsData(prev => ({
            ...prev,
            fullName: fetchedFullName, 
            email: data.email || '',
            avatar: localStorage.getItem('userAvatar') || `https://ui-avatars.com/api/?name=${data.firstName || 'User'}&background=000&color=fff`
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  // 2. Update Profile (PUT)
  const handleProfileUpdate = async () => {
    setIsSavingProfile(true);
    setIsProfileSuccess(false);
    
    // فصل الاسم الأول عن باقي الاسم عشان الـ DTO في الـ C#
    const nameParts = settingsData.fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || ''; 

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/Users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          email: settingsData.email
        })
      });

      if (response.ok) {
        localStorage.setItem('userAvatar', settingsData.avatar);
        setIsProfileSuccess(true);
        setTimeout(() => setIsProfileSuccess(false), 3000);
      } else {
        alert("فشل تحديث البيانات");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 3. Change Password (PUT)
  const handlePasswordUpdate = async () => {
    setPasswordMessage(null);

    // فحص مبدئي قبل ما نبعت للباك إند
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setIsSavingPassword(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/Users/me/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });

      if (response.ok) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully! 🔐' });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); // تفريغ الحقول
      } else {
        const errorData = await response.json();
        setPasswordMessage({ type: 'error', text: errorData.message || 'Incorrect current password.' });
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'Network error occurred.' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  // ================= UI RENDERER =================

  const renderTabContent = () => {
    // تاب الأمان (تغيير كلمة المرور)
    if (activeTab === 'privacy') {
      return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Security & Authentication</h3>
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                  <Key size={18} className="text-indigo-600" />
                </div>
            </div>
            
            <div className="max-w-md space-y-6">
              {/* رسائل النجاح أو الخطأ */}
              {passwordMessage && (
                <div className={`p-4 rounded-2xl text-sm font-bold ${passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {passwordMessage.text}
                </div>
              )}

              <div className="relative">
                <p className="text-[10px] font-black text-slate-400 mb-2 ml-1 uppercase">Current Password</p>
                <input 
                  type="password" 
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 font-bold text-slate-800 outline-none focus:bg-white focus:border-slate-900/5 transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div className="relative">
                <p className="text-[10px] font-black text-slate-400 mb-2 ml-1 uppercase">New Password</p>
                <input 
                  type="password" 
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 font-bold text-slate-800 outline-none focus:bg-white focus:border-slate-900/5 transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div className="relative">
                <p className="text-[10px] font-black text-slate-400 mb-2 ml-1 uppercase">Confirm New Password</p>
                <input 
                  type="password" 
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 font-bold text-slate-800 outline-none focus:bg-white focus:border-slate-900/5 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button 
                onClick={handlePasswordUpdate}
                disabled={isSavingPassword || !passwords.currentPassword || !passwords.newPassword}
                className="w-full h-[56px] mt-4 rounded-[20px] font-black text-[12px] uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 bg-slate-900 text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingPassword ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // التابات اللي لسه تحت الإنشاء
    if (activeTab !== 'profile') {
      return (
        <div className="flex flex-col items-center justify-center h-full py-24 animate-in fade-in zoom-in-95 duration-500 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200 text-center px-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm mx-auto">
             <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
          </div>
          <p className="text-slate-400 font-bold text-sm tracking-tight uppercase">Module Under Development</p>
        </div>
      );
    }

    // تاب البروفايل الأساسية (زي ما هي بتصميمك)
    return (
      <div className="animate-in fade-in slide-in-from-right-8 duration-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="order-2 md:order-1 md:col-span-2 bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-sm group hover:border-slate-200 transition-all">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Personal Details</h3>
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
            </div>
            <div className="space-y-8">
              <div className="relative">
                <p className="text-[10px] font-black text-slate-400 mb-2 ml-1 uppercase">Full Identity</p>
                <input 
                  type="text" 
                  value={settingsData.fullName}
                  onChange={(e) => setSettingsData({...settingsData, fullName: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 font-bold text-slate-800 outline-none focus:bg-white focus:border-slate-900/5 transition-all"
                  placeholder="e.g. Omar Abdullah"
                />
              </div>
              <div className="relative">
                <p className="text-[10px] font-black text-slate-400 mb-2 ml-1 uppercase">Contact Email</p>
                <input 
                  type="email" 
                  value={settingsData.email}
                  onChange={(e) => setSettingsData({...settingsData, email: e.target.value})}
                  disabled
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 font-bold text-slate-800 opacity-60 cursor-not-allowed outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Card: Avatar */}
          <div className="order-1 md:order-2 bg-slate-900 rounded-[32px] p-8 text-white flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl transition-all group-hover:bg-white/10" />
             <div className="relative mb-6">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white/10 p-1.5 transition-transform group-hover:scale-105 duration-500">
                    <img src={settingsData.avatar} className="w-full h-full rounded-full object-cover bg-slate-800 shadow-inner" alt="Avatar" />
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <button onClick={handleImageClick} className="absolute bottom-1 right-1 bg-white text-black p-2.5 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border-2 border-slate-900">
                    <Camera size={16} />
                </button>
             </div>
             <h4 className="font-bold text-lg tracking-tight">Identity Image</h4>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Click camera to upload</p>
          </div>

          {/* Card: Regional */}
          <div className="order-3 bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm md:col-span-3 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-slate-200 transition-all text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                    <Globe size={24} />
                </div>
                
            </div>
            <button className="w-full md:w-auto group flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-900 px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all">
                Configure
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Deploy Button */}
        <div className="mt-12 flex justify-center md:justify-end pb-10 md:pb-0">
            <button 
                onClick={handleProfileUpdate}
                disabled={isSavingProfile}
                className={`w-full md:w-auto min-w-[200px] h-[64px] rounded-[24px] font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${
                  isProfileSuccess 
                  ? 'bg-emerald-500 text-white shadow-emerald-200' 
                  : 'bg-slate-900 text-white shadow-slate-200 hover:bg-black'
                }`}
            >
                {isSavingProfile ? <Loader2 size={20} className="animate-spin" /> : isProfileSuccess ? (
                  <> <Check size={20} strokeWidth={3} /> <span>Updated</span> </>
                ) : 'Deploy Changes'}
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 pb-10 md:pb-20 bg-[#FDFDFF] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 md:mb-16 pt-8 md:pt-12">
            <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-[2px] bg-indigo-600"></div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Preferences</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Settings<span className="text-indigo-600">.</span></h1>
            </div>
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm self-start">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <SettingsIcon size={18} />
                </div>
                <div className="pr-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Environment</p>
                  <p className="text-xs font-bold text-slate-900 tracking-tight">V3.0.4-Stable</p>
                </div>
            </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          <aside className="w-full lg:w-56 shrink-0 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
            <nav className="flex lg:flex-col gap-3 min-w-max lg:min-w-0 pb-2 lg:pb-0">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`group flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all ${
                      isActive ? 'bg-slate-900 text-white shadow-2xl shadow-slate-300 scale-[1.02]' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <tab.icon size={18} strokeWidth={isActive ? 3 : 2} className={isActive ? 'text-indigo-400' : ''} />
                    <span className="tracking-tight">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1 min-h-[400px]">
            {renderTabContent()}
          </main>
        </div>
      </div>
    </div>
  );
}