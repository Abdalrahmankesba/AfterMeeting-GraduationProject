import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import axios from '../api/axiosInstance';

export default function CreateWorkspaceModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('1'); // 1 = Company
  const [inviteEmails, setInviteEmails] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      // 1. إنشاء الـ Workspace
      const response = await axios.post('/api/workspaces', {
        name: name.trim(),
        type: parseInt(type) // 0 = Personal, 1 = Company
      });

      const newWorkspaceId = response.data.workspaceId;

      // 2. لو في إيميلات، ابعت دعوات
      if (inviteEmails.trim()) {
        const emails = inviteEmails.split(',').map(e => e.trim()).filter(e => e);
        for (const email of emails) {
          try {
            await axios.post(`/api/workspaces/${newWorkspaceId}/invite`, {
              email,
              role: 1 // 1 = Member
            });
          } catch {
            // لو إيميل مش موجود نكمل
          }
        }
      }

      // 3. جيب بيانات الـ Workspace الجديد
      const workspaceResponse = await axios.get(`/api/workspaces/${newWorkspaceId}`);
      
      onCreated?.(workspaceResponse.data);
      onClose();

      // reset
      setName('');
      setType('1');
      setInviteEmails('');

    } catch (error) {
      alert(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[24px] shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-0 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Create New Workspace</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          
          {/* Workspace Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">Workspace Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              placeholder="e.g., My Company"
            />
          </div>

          {/* Workspace Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">Workspace Type</label>
            <div className="relative">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none appearance-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
              >
                <option value="1">Company</option>
                <option value="0">Personal</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Invite Members (اختياري) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">
              Invite Members <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              value={inviteEmails}
              onChange={(e) => setInviteEmails(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              placeholder="email1@test.com, email2@test.com"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm bg-slate-100 text-slate-600 font-bold rounded-xl active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 text-sm bg-[#AEE2D7] text-[#2D5A50] font-bold rounded-xl active:scale-95 transition-all hover:bg-[#97d1c5] disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create & Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}