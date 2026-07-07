import { useState, useRef, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';

export default function PlantSearch({ plants, onAdd, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter logic: Show all if search is empty, otherwise filter by text
  const filteredPlants = plants
    .filter(p => {
      if (!searchTerm) return true; // Show all when empty
      
      const term = searchTerm.toLowerCase();
      return (
        p.name?.toLowerCase().includes(term) ||
        p.local_name?.toLowerCase().includes(term) ||
        p.batch_code?.toLowerCase().includes(term)
      );
    })
    .slice(0, 10); // Increased to 10 items for a better grid view

  return (
    <div className="p-4 border-b border-slate-700/50 bg-slate-800/40 relative z-40" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search inventory by name, urdu name, or batch..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          className="w-full bg-[#0b0f15]/80 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-emerald-500 shadow-inner transition-all"
        />
      </div>

      {/* Floating Dropdown Container */}
      {!isLoading && isDropdownOpen && (
        <div className="absolute left-4 right-4 top-[72px] bg-[#131821] border border-slate-700 rounded-xl shadow-2xl p-3 z-50 flex flex-col gap-2 max-h-[350px] overflow-y-auto scrollbar-hide">
          
          {!searchTerm && filteredPlants.length > 0 && (
            <div className="px-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Available Stock
            </div>
          )}

          {filteredPlants.length === 0 ? (
            <p className="text-slate-500 text-sm p-4 text-center">No matching stock found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredPlants.map(p => {
                const isOutOfStock = p.quantity <= 0;

                return (
                  <button
                    key={p.id}
                    disabled={isOutOfStock}
                    onClick={() => {
                      onAdd(p);
                      setSearchTerm('');
                      setIsDropdownOpen(false); // Close dropdown after adding
                    }}
                    className={`flex items-center justify-between border p-3 rounded-xl transition-all text-left group ${
                      isOutOfStock
                        ? 'bg-red-950/10 border-red-900/30 cursor-not-allowed opacity-60'
                        : 'bg-[#0b0f15]/50 hover:bg-slate-700 border-slate-700/80 hover:border-emerald-500/50'
                    }`}
                  >
                    <div>
                      <p className={`font-bold text-sm leading-tight ${isOutOfStock ? 'text-slate-400' : 'text-white'}`}>
                        {p.name} {p.local_name && <span className="text-slate-500 text-xs font-normal ml-1">({p.local_name})</span>}
                      </p>
                      <p className="text-xs mt-1">
                        <span className="text-slate-400">Stock: </span>
                        <span className={isOutOfStock ? 'text-red-500 font-bold' : p.quantity < 10 ? 'text-orange-400 font-bold' : 'text-emerald-400 font-bold'}>
                          {p.quantity}
                        </span>
                        <span className="text-slate-500 mx-1">•</span>
                        <span className="text-slate-400">Rs {p.sale_price}</span>
                      </p>
                    </div>
                    
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      isOutOfStock
                        ? 'bg-slate-800 text-slate-600'
                        : 'bg-emerald-600/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white'
                    }`}>
                      <Plus size={16} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}