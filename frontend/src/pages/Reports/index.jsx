import { useState, useEffect } from 'react';
import axios from 'axios';
import KPIGrid from './KPIGrid';
import Charts from './Charts';
import InvoiceHistory from './InvoiceHistory';
import { RefreshCw, AlertCircle, BarChart3 } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function ReportsDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReportsData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [dashRes, histRes] = await Promise.all([
        axios.get(`${API_BASE}/reports/dashboard`, config),
        axios.get(`${API_BASE}/reports/history`, config)
      ]);

      setMetrics(dashRes.data);
      setHistory(histRes.data.history);
    } catch (err) {
      console.error('Report fetching error:', err);
      setError('Failed to load financial reports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-indigo-400" /> Executive Dashboard
          </h2>
          <p className="text-slate-400 text-sm mt-1">Real-time financial analytics, market debt, and cash flow.</p>
        </div>
        <button 
          onClick={fetchReportsData} 
          disabled={isLoading}
          className="bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700 p-2.5 rounded-xl text-slate-300 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin text-indigo-400' : ''} />
          <span className="text-sm font-medium">Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-800/50 text-red-300 p-4 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <RefreshCw size={32} className="animate-spin text-indigo-500 mb-4" />
          <p className="font-medium">Compiling financial reports...</p>
        </div>
      ) : metrics ? (
        <>
          <KPIGrid kpis={metrics.kpis} />
          <Charts charts={metrics.charts} />
          <InvoiceHistory history={history} />
        </>
      ) : null}
    </div>
  );
}