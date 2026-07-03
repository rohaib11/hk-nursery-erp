import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Eye, EyeOff, LogIn, HelpCircle, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'forgot' | 'reset'
  const [formData, setFormData] = useState({ username: '', password: '', answer: '', newPassword: '', rememberMe: false });
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE = '/api/auth';

  // Foldable height animation mechanics
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState('auto');

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(`${contentRef.current.scrollHeight}px`);
    }
  }, [mode, message, showPassword]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // 🔐 LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); setMessage({ type: '', text: '' });
    try {
      const res = await axios.post(`${API_BASE}/login`, { username: formData.username, password: formData.password });
      onLogin(res.data.token, res.data.user, formData.rememberMe);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Login failed. Check your credentials.' });
    } finally { setIsLoading(false); }
  };

  // 🔐 GET SECURITY QUESTION
  const handleGetQuestion = async (e) => {
    e.preventDefault();
    setIsLoading(true); setMessage({ type: '', text: '' });
    try {
      const res = await axios.get(`${API_BASE}/security-question/${formData.username}`);
      setSecurityQuestion(res.data.question);
      setMode('reset');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Account not found.' });
    } finally { setIsLoading(false); }
  };

  // 🔐 RESET PASSWORD
  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true); setMessage({ type: '', text: '' });
    try {
      const res = await axios.post(`${API_BASE}/reset-password`, { username: formData.username, answer: formData.answer, newPassword: formData.newPassword });
      setMessage({ type: 'success', text: res.data.message });
      setFormData(prev => ({ ...prev, password: '', answer: '', newPassword: '' }));
      setTimeout(() => setMode('login'), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Security answer is incorrect.' });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0b0f15] via-[#0d131c] to-[#111827] relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* ── FOLDABLE AUTH CARD ── */}
      <div className="relative w-full max-w-[420px] mt-12">
        
        {/* OVERLAPPING CIRCLE LOGO */}
        <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center">
          <div className="w-28 h-28 rounded-full border-[6px] border-[#0b0f15] bg-slate-800 shadow-[0_0_25px_rgba(16,185,129,0.25)] relative overflow-hidden group">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay"></div>
          </div>
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-[10px] uppercase font-bold tracking-widest px-4 py-1 rounded-full shadow-lg -mt-3 border border-emerald-400/30 z-10">
            Secure Portal
          </div>
        </div>

        {/* GLASSMORPHISM CONTAINER */}
        <div className="bg-[#111827]/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-500">
          
          {/* Header Spacer for Logo */}
          <div className="pt-20 pb-4 text-center">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">HK Nursery</h2>
            <p className="text-emerald-400 text-sm font-medium mt-0.5">Management Dashboard</p>
          </div>

          {/* Animated height wrapper */}
          <div className="transition-all duration-500 ease-in-out overflow-hidden" style={{ height: contentHeight }}>
            <div ref={contentRef} className="px-8 pb-8">
              
              {/* Dynamic Title */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-slate-200">
                  {mode === 'login' ? 'Welcome Back' : mode === 'forgot' ? 'Account Recovery' : 'Create New Password'}
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  {mode === 'login' ? 'Please sign in to continue' : mode === 'forgot' ? 'We will help you get back in' : 'Secure your account'}
                </p>
              </div>

              {/* Alerts */}
              {message.text && (
                <div className={`p-3.5 rounded-xl mb-6 text-sm font-medium flex items-center gap-3 animate-fade-in ${
                  message.type === 'error' ? 'bg-red-950/40 border border-red-900/50 text-red-400' : 'bg-emerald-950/40 border border-emerald-900/50 text-emerald-400'
                }`}>
                  {message.type === 'error' ? '⚠️' : '✅'} {message.text}
                </div>
              )}

              {/* ── LOGIN FORM ── */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
                  
                  {/* Floating Label Input: Username */}
                  <div className="relative">
                    <input type="text" name="username" id="username" required value={formData.username} onChange={handleChange} 
                      className="block px-4 pb-2.5 pt-5 w-full text-sm text-white bg-[#0b0f15]/50 border border-slate-700 rounded-xl appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 peer transition-all shadow-inner" placeholder=" " />
                    <label htmlFor="username" className="absolute text-sm text-slate-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-emerald-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 cursor-text">
                      Username
                    </label>
                  </div>

                  {/* Floating Label Input: Password */}
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} name="password" id="password" required value={formData.password} onChange={handleChange} 
                      className="block px-4 pb-2.5 pt-5 w-full text-sm text-white bg-[#0b0f15]/50 border border-slate-700 rounded-xl appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 peer transition-all shadow-inner pr-12" placeholder=" " />
                    <label htmlFor="password" className="absolute text-sm text-slate-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-emerald-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 cursor-text">
                      Password
                    </label>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} className="peer sr-only" />
                        <div className="w-4 h-4 border border-slate-600 rounded bg-[#0b0f15]/50 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all"></div>
                        <svg className="absolute w-3 h-3 left-0.5 top-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
                    </label>
                    <button type="button" onClick={() => setMode('forgot')} className="text-sm text-emerald-500 hover:text-emerald-400 font-medium transition-colors">
                      Forgot password?
                    </button>
                  </div>

                  <button type="submit" disabled={isLoading} className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:from-emerald-600 disabled:hover:to-emerald-500 active:scale-[0.98]">
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                    {isLoading ? 'Authenticating...' : 'Sign In'}
                  </button>
                </form>
              )}

              {/* ── FORGOT USERNAME FORM ── */}
              {mode === 'forgot' && (
                <form onSubmit={handleGetQuestion} className="space-y-4 animate-fade-in">
                  <div className="relative">
                    <input type="text" name="username" id="forgot-username" required value={formData.username} onChange={handleChange} 
                      className="block px-4 pb-2.5 pt-5 w-full text-sm text-white bg-[#0b0f15]/50 border border-slate-700 rounded-xl appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 peer transition-all shadow-inner" placeholder=" " />
                    <label htmlFor="forgot-username" className="absolute text-sm text-slate-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-emerald-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 cursor-text">
                      System Username
                    </label>
                  </div>
                  
                  <button type="submit" disabled={isLoading} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98]">
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <HelpCircle size={18} />}
                    Locate Account
                  </button>
                  <button type="button" onClick={() => setMode('login')} className="w-full text-slate-400 hover:text-white font-medium py-2 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                    <ArrowLeft size={16} /> Back to Login
                  </button>
                </form>
              )}

              {/* ── RESET PASSWORD FORM ── */}
              {mode === 'reset' && (
                <form onSubmit={handleReset} className="space-y-4 animate-fade-in">
                  <div className="bg-[#0b0f15]/60 border border-slate-700/50 rounded-xl p-4 flex gap-3 items-start shadow-inner">
                    <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold mb-1">Security Question</p>
                      <p className="text-white font-medium text-sm leading-snug">{securityQuestion}</p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input type="text" name="answer" id="answer" required value={formData.answer} onChange={handleChange} 
                      className="block px-4 pb-2.5 pt-5 w-full text-sm text-white bg-[#0b0f15]/50 border border-slate-700 rounded-xl appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 peer transition-all shadow-inner" placeholder=" " />
                    <label htmlFor="answer" className="absolute text-sm text-slate-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-emerald-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 cursor-text">
                      Your Secret Answer
                    </label>
                  </div>

                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} name="newPassword" id="newPassword" required value={formData.newPassword} onChange={handleChange} 
                      className="block px-4 pb-2.5 pt-5 w-full text-sm text-white bg-[#0b0f15]/50 border border-slate-700 rounded-xl appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 peer transition-all shadow-inner pr-12" placeholder=" " />
                    <label htmlFor="newPassword" className="absolute text-sm text-slate-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-emerald-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 cursor-text">
                      New Password
                    </label>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setMode('login')} className="flex-1 bg-slate-800/50 hover:bg-slate-700 text-slate-300 font-medium py-3.5 rounded-xl transition-all border border-slate-700/50">
                      Cancel
                    </button>
                    <button type="submit" disabled={isLoading} className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98]">
                      {isLoading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                      Update & Login
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}