import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Leaf, ReceiptText, CircleDollarSign,
  Users, Truck, LineChart, LogOut, ChevronDown, Menu, X,
  User, Settings
} from 'lucide-react';
import DashboardHome from '../pages/Dashboard';
import Plants from '../pages/Plants';
import Billing from '../pages/Billing';
import Expenses from '../pages/Expenses';
import Customers from '../pages/Customers';
import Suppliers from '../pages/Suppliers';
import Reports from '../pages/Reports';
import SettingsPage from '../pages/Settings';   // still available, but not in sidebar

export default function DashboardLayout({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // ── Responsive breakpoints ──
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setMobileSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardHome onNavigate={setActiveTab} />;
      case 'plants': return <Plants />;
      case 'billing': return <Billing />;
      case 'expenses': return <Expenses />;
      case 'customers': return <Customers />;
      case 'suppliers': return <Suppliers />;
      case 'reports': return <Reports />;
      case 'settings': return <SettingsPage />;   // only reachable via user menu
      default: return <DashboardHome onNavigate={setActiveTab} />;
    }
  };

  const handleMobileTabSelect = (tabId) => {
    setActiveTab(tabId);
    setMobileSidebarOpen(false);
  };

  const handleUserMenuAction = (action) => {
    setUserMenuOpen(false);
    if (action === 'settings') {
      setActiveTab('settings');
    } else if (action === 'logout') {
      onLogout();
    }
  };

  // Navigation items – Settings removed from sidebar
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', urdu: 'ڈیش بورڈ', icon: LayoutDashboard },
    { id: 'plants', label: 'Plants / Inventory', urdu: 'پودے اور انوینٹری', icon: Leaf },
    { id: 'billing', label: 'Billing & Invoices', urdu: 'بلنگ اور رسیدیں', icon: ReceiptText },
    { id: 'expenses', label: 'Expenses (Kharch)', urdu: 'اخراجات (خرچ)', icon: CircleDollarSign },
    { id: 'customers', label: 'Customers & Udhaar', urdu: 'گاہک اور ادھار', icon: Users },
    { id: 'suppliers', label: 'Suppliers', urdu: 'سپلائرز', icon: Truck },
    { id: 'reports', label: 'Reports', urdu: 'رپورٹس', icon: LineChart },
  ];

  return (
    <div className="flex h-screen bg-[#0b0f15] text-slate-200 font-sans overflow-hidden relative">
      {/* Ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* ─── DESKTOP SIDEBAR (hidden on mobile) ─── */}
      {!isMobile && (
        <aside className={`${sidebarOpen ? 'w-[280px] xl:w-[340px]' : 'w-20'} transition-all duration-500 ease-in-out bg-[#111827]/60 backdrop-blur-2xl border-r border-slate-700/50 flex flex-col z-30 shadow-[4px_0_24px_rgba(0,0,0,0.2)] relative`}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex flex-col h-full">
            {/* Logo area */}
            <div className="h-24 px-5 flex items-center gap-4 border-b border-slate-700/50">
              <div className="w-11 h-11 rounded-full border-2 border-slate-800 bg-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.2)] overflow-hidden shrink-0 group">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              {sidebarOpen && (
                <div className="overflow-hidden flex-1 animate-fade-in whitespace-nowrap">
                  <h2 className="text-lg font-extrabold text-white tracking-tight leading-tight">HK Nursery</h2>
                  <p className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider">Management</p>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all shrink-0"
              >
                <ChevronDown size={16} className={`transform transition-transform duration-300 ${sidebarOpen ? 'rotate-90' : '-rotate-90'}`} />
              </button>
            </div>
            {/* Navigation */}
            <nav className="p-4 space-y-2 overflow-y-auto flex-1 scrollbar-hide">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 text-sm font-medium group relative overflow-hidden ${
                    activeTab === item.id
                      ? 'text-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.15)] border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-100 border border-transparent hover:bg-slate-800/40'
                  }`}
                >
                  {activeTab === item.id && <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-emerald-900/10"></div>}
                  <item.icon size={20} className={`relative z-10 shrink-0 transition-colors duration-300 ${activeTab === item.id ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-500/70'}`} />
                  {sidebarOpen && (
                    <div className="relative z-10 animate-fade-in flex items-center justify-between w-full">
                      <span className="whitespace-nowrap">{item.label}</span>
                      <span className="urdu-font text-[14px] leading-none mt-1 opacity-90" dir="rtl">{item.urdu}</span>
                    </div>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>
      )}

      {/* ─── MOBILE SIDEBAR OVERLAY ─── */}
      {isMobile && (
        <>
          {mobileSidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)}></div>
          )}
          <aside className={`fixed top-0 left-0 h-full w-[300px] bg-[#0f172a] backdrop-blur-2xl border-r border-slate-700/50 z-50 transform transition-transform duration-300 shadow-2xl ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full">
              <div className="h-16 px-5 flex items-center justify-between border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-900 overflow-hidden">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-lg font-extrabold text-white">HK Nursery</h2>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/50 text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <nav className="p-4 space-y-2 overflow-y-auto flex-1 scrollbar-hide">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMobileTabSelect(item.id)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 text-sm font-medium group relative overflow-hidden ${
                      activeTab === item.id ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-100 border border-transparent hover:bg-slate-800/40'
                    }`}
                  >
                    <item.icon size={20} className={`shrink-0 transition-colors duration-300 ${activeTab === item.id ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-500/70'}`} />
                    <span className="whitespace-nowrap">{item.label}</span>
                    <span className="urdu-font text-[14px] leading-none ml-auto opacity-70" dir="rtl">{item.urdu}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        </>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative z-10">
        {/* Header with user menu */}
        <header className="px-6 py-3 flex justify-between items-center border-b border-slate-700/50 bg-[#111827]/60 backdrop-blur-xl sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button onClick={() => setMobileSidebarOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800/50 text-slate-400 hover:text-white mr-2">
                <Menu size={20} />
              </button>
            )}
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight capitalize">
                {activeTab.replace('-', ' ')}
              </h1>
              <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {formattedDate}
              </p>
            </div>
          </div>

          {/* ─── USER MENU (Right side) ─── */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-800/50 transition-colors"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-white leading-tight">{user?.name || 'System Owner'}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role || 'Admin'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-sm shadow-inner border border-emerald-400/20">
                {user?.name?.[0] || 'A'}
              </div>
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#111827] border border-slate-700/50 rounded-2xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden">
                {/* User info inside dropdown (visible on small screens where name is hidden) */}
                <div className="p-4 border-b border-slate-700/50 sm:hidden">
                  <p className="text-white font-bold text-sm">{user?.name || 'System Owner'}</p>
                  <p className="text-slate-400 text-xs capitalize">{user?.role || 'Admin'}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => handleUserMenuAction('settings')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors text-sm"
                  >
                    <Settings size={18} />
                    <span>Profile & Settings</span>
                  </button>
                  <button
                    onClick={() => handleUserMenuAction('logout')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors text-sm"
                  >
                    <LogOut size={18} />
                    <span>Secure Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>

      <style>{`
        @font-face {
          font-family: 'Noto Nastaliq Urdu';
          src: url('/fonts/NotoNastaliqUrdu-Regular.ttf') format('truetype');
          font-weight: 400;
          font-style: normal;
        }
        @font-face {
          font-family: 'Noto Nastaliq Urdu';
          src: url('/fonts/NotoNastaliqUrdu-Medium.ttf') format('truetype');
          font-weight: 500;
          font-style: normal;
        }
        @font-face {
          font-family: 'Noto Nastaliq Urdu';
          src: url('/fonts/NotoNastaliqUrdu-SemiBold.ttf') format('truetype');
          font-weight: 600;
          font-style: normal;
        }
        @font-face {
          font-family: 'Noto Nastaliq Urdu';
          src: url('/fonts/NotoNastaliqUrdu-Bold.ttf') format('truetype');
          font-weight: 700;
          font-style: normal;
        }
        .urdu-font { font-family: 'Noto Nastaliq Urdu', serif; }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(-5px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}