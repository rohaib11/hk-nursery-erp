import { Plus, Search, RefreshCw } from 'lucide-react';

export default function PlantsHeader({ count, onAdd, search, setSearch, filterGrowth, setFilterGrowth, onRefresh, isLoading, showZeroStock, setShowZeroStock }) {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
          <p className="text-slate-400 text-sm">{count} plants displayed</p>
        </div>
        <button
          onClick={onAdd}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
        >
          <Plus size={18} /> Add New Plant
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or local name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#111827]/60 border border-slate-700/50 rounded-xl text-white outline-none focus:border-emerald-500 shadow-inner backdrop-blur-sm"
          />
        </div>
        <select
          value={filterGrowth}
          onChange={(e) => setFilterGrowth(e.target.value)}
          className="bg-[#111827]/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 shadow-inner backdrop-blur-sm"
        >
          <option value="">All Growth Stages</option>
          <option value="Ready">Ready for Sale</option>
          <option value="Growing">Growing</option>
          <option value="Seedling">Seedling</option>
        </select>

        {/* ── Out of Stock Toggle ── */}
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showZeroStock}
              onChange={(e) => setShowZeroStock(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
          <span className="text-xs text-slate-400 whitespace-nowrap">Show Out of Stock</span>
        </div>

        <button
          onClick={onRefresh}
          className="bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700 p-3 rounded-xl text-slate-300 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin text-emerald-400' : ''} />
        </button>
      </div>
    </>
  );
}