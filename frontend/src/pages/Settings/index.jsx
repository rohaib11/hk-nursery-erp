import { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings as SettingsIcon, User, Building2, Save, Lock } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'business'
  const [profile, setProfile] = useState({ username: '', full_name: '', security_question: '', security_answer: '' });
  const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '' });
  const [business, setBusiness] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchProfile();
    fetchBusinessSettings();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/me`, config);
      const u = res.data.user;
      setProfile({
        username: u.username || '',
        full_name: u.full_name || '',
        security_question: u.security_question || '',
        security_answer: '' // never prefill answer
      });
    } catch (err) {
      showMessage('error', 'Failed to load profile.');
    }
  };

  const fetchBusinessSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/settings`, config);
      setBusiness(res.data.settings);
    } catch (err) {
      showMessage('error', 'Failed to load business settings.');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { ...profile };
      // Only send non‑empty fields
      Object.keys(payload).forEach(k => {
        if (payload[k] === '' && k !== 'security_answer') delete payload[k];
      });
      await axios.put(`${API_BASE}/auth/me`, payload, config);
      showMessage('success', 'Profile updated successfully.');
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.current_password || !passwordData.new_password) {
      showMessage('error', 'Both fields are required.');
      return;
    }
    setIsLoading(true);
    try {
      await axios.put(`${API_BASE}/auth/change-password`, passwordData, config);
      setPasswordData({ current_password: '', new_password: '' });
      showMessage('success', 'Password changed successfully.');
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to change password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Business settings update
  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.put(`${API_BASE}/settings`, business, config);
      showMessage('success', 'Business settings saved.');
    } catch (err) {
      showMessage('error', 'Failed to save business settings.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-10 max-w-3xl">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="text-indigo-400" size={24} /> System Settings
        </h2>
        <p className="text-slate-400 text-sm mt-1">Manage your profile and business information.</p>
      </div>

      {message.text && (
        <div className={`p-3.5 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in ${
          message.type === 'error' ? 'bg-red-950/40 border border-red-900/50 text-red-400' : 'bg-emerald-950/40 border border-emerald-900/50 text-emerald-400'
        }`}>
          {message.type === 'error' ? '⚠️' : '✅'} {message.text}
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-slate-800/40 p-1.5 rounded-2xl w-max border border-slate-700/50">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'profile' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <User size={16} /> Profile
        </button>
        <button
          onClick={() => setActiveTab('business')}
          className={`px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'business' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 size={16} /> Business Info
        </button>
      </div>

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Form */}
          <div className="bg-[#111827]/60 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User size={18} className="text-emerald-400" /> Edit Profile
            </h3>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input type="text" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 shadow-inner" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Username</label>
                <input type="text" value={profile.username} onChange={e => setProfile({...profile, username: e.target.value})}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 shadow-inner" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Security Question</label>
                <input type="text" value={profile.security_question} onChange={e => setProfile({...profile, security_question: e.target.value})}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 shadow-inner" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Security Answer (new)</label>
                <input type="text" value={profile.security_answer} onChange={e => setProfile({...profile, security_answer: e.target.value})}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 shadow-inner" />
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20">
                <Save size={18} /> Save Profile
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-[#111827]/60 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Lock size={18} className="text-amber-400" /> Change Password
            </h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                <input type="password" value={passwordData.current_password} onChange={e => setPasswordData({...passwordData, current_password: e.target.value})}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-500 shadow-inner" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                <input type="password" value={passwordData.new_password} onChange={e => setPasswordData({...passwordData, new_password: e.target.value})}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-500 shadow-inner" />
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-900/20">
                <Lock size={18} /> Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BUSINESS TAB */}
      {activeTab === 'business' && (
        <div className="bg-[#111827]/60 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-indigo-400" /> Nursery Business Details
          </h3>
          <form onSubmit={handleBusinessSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nursery Name</label>
              <input type="text" value={business.nursery_name || ''} onChange={e => setBusiness({...business, nursery_name: e.target.value})}
                className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500 shadow-inner" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone 1</label>
              <input type="text" value={business.phone1 || ''} onChange={e => setBusiness({...business, phone1: e.target.value})}
                className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500 shadow-inner" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone 2</label>
              <input type="text" value={business.phone2 || ''} onChange={e => setBusiness({...business, phone2: e.target.value})}
                className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500 shadow-inner" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <input type="email" value={business.email || ''} onChange={e => setBusiness({...business, email: e.target.value})}
                className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500 shadow-inner" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Address</label>
              <input type="text" value={business.address || ''} onChange={e => setBusiness({...business, address: e.target.value})}
                className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500 shadow-inner" />
            </div>
            <button type="submit" disabled={isLoading}
              className="md:col-span-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20">
              <Save size={18} /> Save Business Info
            </button>
          </form>
        </div>
      )}
    </div>
  );
}