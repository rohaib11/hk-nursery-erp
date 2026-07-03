import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, AlertTriangle, Users, 
  ShoppingCart, PlusCircle, CreditCard, Sprout 
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function HomeDashboard({ onNavigate }) {
  const [data, setData] = useState({ today: {}, lowStock: [], topDebtors: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const money = (n) => new Intl.NumberFormat("en-PK").format(Number(n) || 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      
      {/* ─── HEADER & QUICK ACTIONS ─── */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide">HK Nursery POS</h1>
          <p className="text-slate-400 mt-1">Welcome back. Here is what is happening today.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
          <button 
            onClick={() => onNavigate('billing')} 
            className="flex-1 xl:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
          >
            <ShoppingCart size={18} /> New Sale
          </button>
          <button 
            onClick={() => onNavigate('plants')} 
            className="flex-1 xl:flex-none bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20"
          >
            <PlusCircle size={18} /> Add Stock
          </button>
          <button 
            onClick={() => onNavigate('customers')} 
            className="flex-1 xl:flex-none bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all"
          >
            <CreditCard size={18} /> Collect Udhaar
          </button>
        </div>
      </div>

      {/* ─── TODAY'S OVERVIEW CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Revenue Card */}
        <div className="bg-gradient-to-br from-emerald-900/40 to-[#111827] border border-emerald-800/30 p-6 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <TrendingUp size={100} className="text-emerald-400" />
          </div>
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">Today's Revenue</p>
          <h2 className="text-5xl font-black text-white mb-2">Rs {money(data.today.revenue)}</h2>
          <p className="text-slate-400 text-sm font-medium">
            From {data.today.invoiceCount} printed invoices today
          </p>
        </div>

        {/* Quick Operations Card */}
        <div className="bg-gradient-to-br from-slate-800/40 to-[#111827] border border-slate-700/50 p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Quick Operations</p>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => onNavigate('reports')} 
              className="bg-slate-900/50 hover:bg-slate-800 border border-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors group"
            >
              <TrendingUp size={24} className="text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-slate-300">View Reports</span>
            </button>
            <button 
              onClick={() => onNavigate('expenses')} 
              className="bg-slate-900/50 hover:bg-slate-800 border border-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors group"
            >
              <CreditCard size={24} className="text-rose-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-slate-300">Log Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── TWO-COLUMN ALERTS SECTIONS ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* LEFT: LOW STOCK ALERTS */}
        <div className="bg-[#111827]/60 border border-slate-700/50 rounded-3xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500" /> Low Stock Alerts
            </h3>
            <span className="bg-amber-900/30 text-amber-500 text-xs font-bold px-3 py-1 rounded-full border border-amber-900/50">
              Action Required
            </span>
          </div>
          <div className="p-2">
            {data.lowStock.length === 0 ? (
              <div className="p-8 text-center text-slate-500">All inventory levels are healthy.</div>
            ) : (
              <div className="space-y-1">
                {data.lowStock.map(plant => (
                  <div key={plant.id} className="flex items-center justify-between p-4 hover:bg-slate-800/40 rounded-2xl transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                        <Sprout size={18} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{plant.name}</p>
                        <p className="text-slate-400 text-xs">{plant.local_name || plant.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-500 font-black text-lg">{plant.quantity}</p>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Remaining</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: TOP DEBTORS (UDHAAR) */}
        <div className="bg-[#111827]/60 border border-slate-700/50 rounded-3xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users size={20} className="text-rose-400" /> Top Market Debtors
            </h3>
            <button 
              onClick={() => onNavigate('customers')} 
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
            >
              View All Khata &rarr;
            </button>
          </div>
          <div className="p-2">
            {data.topDebtors.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No outstanding market Udhaar.</div>
            ) : (
              <div className="space-y-1">
                {data.topDebtors.map(customer => (
                  <div key={customer.id} className="flex items-center justify-between p-4 hover:bg-slate-800/40 rounded-2xl transition-colors">
                    <div>
                      <p className="text-white font-bold text-sm">{customer.name}</p>
                      <p className="text-slate-400 text-xs">{customer.phone || 'No Phone'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-rose-400 font-bold">Rs {money(customer.outstanding_balance)}</p>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Pending Udhaar</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}