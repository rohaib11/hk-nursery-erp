import { useState } from 'react';
import { Search, Plus } from 'lucide-react';

export default function PlantSearch({ plants, onAdd, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlants = plants.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.local_name && p.local_name.includes(searchTerm)) ||
    (p.batch_code && p.batch_code.toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, 8); // Only show top 8 results to keep UI clean

  return (
    <div className="p-4 border-b border-slate-700/50 bg-slate-800/40">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search inventory by name, urdu name, or batch..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0b0f15]/80 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-emerald-500 shadow-inner"
        />
      </div>

      {!isLoading && searchTerm && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto scrollbar-hide">
          {filteredPlants.length === 0 ? (
            <p className="text-slate-500 text-sm p-2">No matching stock found.</p>
          ) : (
            filteredPlants.map(p => (
              <button 
                key={p.id} 
                onClick={() => { onAdd(p); setSearchTerm(''); }}
                className="flex items-center justify-between bg-[#0b0f15]/50 hover:bg-slate-700 border border-slate-700/80 p-3 rounded-xl transition-all text-left group"
              >
                <div>
                  <p className="text-white font-bold text-sm leading-tight">{p.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Stock: <span className="text-emerald-400">{p.quantity}</span> • Rs {p.sale_price}</p>
                </div>
                <div className="bg-emerald-600/20 text-emerald-400 p-1.5 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Plus size={16} />
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}