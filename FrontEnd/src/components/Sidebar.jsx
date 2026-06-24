import React, { useState, useEffect, useRef } from 'react';
import { 
  Home as HomeIcon, Calendar, CheckSquare, Settings, Menu, X, 
  LayoutDashboard, Plus, ChevronDown, LogOut, BarChart3, Search
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';
import axios from '../api/axiosInstance';

export default function Sidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const dropdownRef = useRef(null);
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        if (isAdmin) {
          setLoading(false);
          return;
        }

        const response = await axios.get('/api/workspaces');
        setWorkspaces(response.data);

        const savedWorkspaceId = localStorage.getItem('workspaceId');
        const current = response.data.find(w => w.id == savedWorkspaceId);
        
        if (current) {
          setCurrentWorkspace(current);
          localStorage.setItem('workspaceType', current.type);
        } else if (response.data.length > 0) {
          setCurrentWorkspace(response.data[0]);
          localStorage.setItem('workspaceId', response.data[0].id);
          localStorage.setItem('workspaceType', response.data[0].type);
        }
      } catch (error) {
        console.error("Error fetching workspaces:", error);
      }
    };

    fetchWorkspaces();
  }, [isAdmin]);

  const handleSelectWorkspace = (workspace) => {
    setCurrentWorkspace(workspace);
    localStorage.setItem('workspaceId', workspace.id);
    localStorage.setItem('workspaceType', workspace.type);
    setIsDropdownOpen(false);
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isDropdownOpen]);

  const links = isAdmin 
    ? [{ to: "/admin-dashboard", icon: BarChart3, label: "Admin Dashboard" }]
    : [
        { to: "/home", icon: HomeIcon, label: "Home" },
        { to: "/meeting", icon: Calendar, label: "Meeting" },
        { to: "/search", icon: Search, label: "Search" },
        { to: "/tasks", icon: CheckSquare, label: "Tasks" },
        { to: "/settings", icon: Settings, label: "Settings" },
      ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-6 left-6 z-50 p-3 bg-[#334155] text-white rounded-2xl shadow-xl transition-transform active:scale-90"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-md z-40 md:hidden" onClick={() => setIsOpen(false)}></div>
      )}

      <div className={`
        fixed left-0 top-0 bottom-0 z-40
        w-72 bg-[#D9EEEB] flex flex-col
        transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 border-r border-slate-200/50
      `}>
        
        <div className="p-8 pb-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/60 rounded-full flex items-center justify-center shadow-sm border border-white">
            <div className="w-6 h-6 bg-slate-200 rounded-md"></div>
          </div>
          <div>
            <h1 className="text-[#334155] font-black text-lg leading-tight tracking-tight">After Meeting</h1>
            <p className="text-[#64748b] text-xs font-semibold">AI Meeting Assistant</p>
          </div>
        </div>

        {!isAdmin && (
          <div className="px-6 mb-8 relative" ref={dropdownRef}>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`group bg-white/40 border border-white/60 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${isDropdownOpen ? 'bg-white shadow-lg ring-2 ring-blue-100' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white rounded-lg shadow-sm flex items-center justify-center">
                  <LayoutDashboard size={14} className="text-[#4ABAE8]" />
                </div>
                <div>
                  <span className="text-[13px] font-bold text-slate-700">
                    {currentWorkspace?.name || 'Loading...'}
                  </span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    {currentWorkspace?.type || ''}
                  </p>
                </div>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {isDropdownOpen && (
              <div className="absolute left-6 right-6 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden py-2">
                {workspaces.map((workspace) => (
                  <div 
                    key={workspace.id}
                    onClick={() => handleSelectWorkspace(workspace)}
                    className={`px-5 py-3 text-sm font-bold cursor-pointer transition-all
                      ${currentWorkspace?.id === workspace.id 
                        ? 'bg-[#D9EEEB] text-[#4ABAE8]' 
                        : 'text-slate-600 hover:bg-[#D9EEEB] hover:text-[#4ABAE8]'}`}
                  >
                    <p>{workspace.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{workspace.type}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <nav className="flex-1 px-0 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink 
              key={link.to}
              to={link.to}
              end={link.to === "/home"}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-4 px-8 py-4 transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-[#BCE4E7]/70 text-[#4ABAE8] font-bold border-l-4 border-[#0EA5E9]' 
                  : 'text-[#64748b] hover:bg-white/20 hover:text-[#334155] font-medium'}
              `}
            >
              {({ isActive }) => (
                <>
                  <link.icon 
                    size={22} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={isActive ? 'text-[#0EA5E9]' : 'text-[#475569]'} 
                  />
                  <span className="text-[15px] tracking-wide">{link.label}</span>
                </>
              )}
            </NavLink>
          ))}

          {!isAdmin && (
            <div className="px-6 pt-6">
              <button 
                onClick={() => setIsWorkspaceModalOpen(true)}
                className="w-full cursor-pointer group flex items-center justify-center gap-2 bg-[#334155] text-white py-4 rounded-xl font-bold text-[11px] tracking-widest hover:bg-[#0EA5E9] transition-all shadow-md active:scale-95"
              >
                <Plus size={16} strokeWidth={3} />
                NEW WORKSPACE
              </button>
            </div>
          )}
        </nav>

        <div className="mt-auto border-t border-slate-200/50">
          <div className="px-6 pb-6 pt-4">
            <button 
              onClick={handleLogout}
              className="w-full cursor-pointer flex items-center justify-between px-6 py-3.5 bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl text-rose-600 font-bold text-[12px] tracking-widest hover:bg-rose-600 hover:text-white hover:shadow-lg hover:shadow-rose-200 transition-all duration-300 active:scale-95 group"
            >
              <span>LOG OUT</span>
              <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <CreateWorkspaceModal 
        isOpen={isWorkspaceModalOpen} 
        onClose={() => setIsWorkspaceModalOpen(false)}
        onCreated={(newWorkspace) => {
          setWorkspaces([...workspaces, newWorkspace]);
          handleSelectWorkspace(newWorkspace);
        }}
      />
    </>
  );
}