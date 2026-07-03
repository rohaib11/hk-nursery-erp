import { useState, Fragment } from 'react';
import {
  Leaf, Edit, Trash2, Eye, RefreshCw, Skull,
  ChevronDown, ChevronUp
} from 'lucide-react';

export default function PlantsTable({ plants, isLoading, onEdit, onDelete, onView, onLogMortality }) {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
    const next = new Set(expandedRows);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedRows(next);
  };

  return (
    <div className="bg-[#111827]/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-slate-800/40 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700/50">
              <th className="p-2 w-8"></th>
              <th className="p-4 font-semibold">Plant</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Stock</th>
              <th className="p-4 font-semibold">Health</th>
              <th className="p-4 font-semibold">Growth</th>
              <th className="p-4 font-semibold">Price</th>
              <th className="p-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {isLoading ? (
              <tr>
                <td colSpan="8" className="p-12 text-center text-slate-500">
                  <RefreshCw size={28} className="mx-auto animate-spin mb-3 text-emerald-500/50" />
                  <p className="font-medium">Syncing with database...</p>
                </td>
              </tr>
            ) : plants.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-12 text-center text-slate-500">
                  <Leaf size={32} className="mx-auto mb-3 opacity-30 text-emerald-500" />
                  <p className="font-medium text-lg text-slate-400">No plants to display.</p>
                  <p className="text-sm mt-1">Adjust filters or add a new plant.</p>
                </td>
              </tr>
            ) : (
              plants.map((plant) => {
                const isExpanded = expandedRows.has(plant.id);
                const unitCost = (parseFloat(plant.cost_price) || 0) + (parseFloat(plant.pot_cost) || 0);
                const salePrice = parseFloat(plant.sale_price) || 0;
                const profit = salePrice - unitCost;
                
                const wholesalePrice = parseFloat(plant.wholesale_price) || 0;
                const wholesaleProfit = wholesalePrice - unitCost;

                return (
                  <Fragment key={plant.id}>
                    <tr className="hover:bg-slate-800/40 transition-all group">
                      <td className="p-2 text-center">
                        <button
                          onClick={() => toggleRow(plant.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
                          title={isExpanded ? 'Hide cost details' : 'Show cost details'}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          {plant.primary_image && typeof plant.primary_image === 'string' ? (
                            <img
                              src={`http://localhost:5000/${plant.primary_image}`}
                              alt={plant.name}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-700 shadow-sm"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shadow-inner">
                              {plant.category_icon || '🌱'}
                            </div>
                          )}
                          <div>
                            <p className="text-white font-bold text-sm leading-tight group-hover:text-emerald-400 transition-colors">
                              {plant.name}
                            </p>
                            {plant.local_name && (
                              <p className="text-slate-500 text-xs urdu-font mt-0.5">{plant.local_name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-medium bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-300 shadow-sm whitespace-nowrap">
                          {plant.category_name || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">
                        {plant.quantity === 0 ? (
                          <span className="text-xs font-bold text-red-400 bg-red-950/30 px-3 py-1 rounded-lg border border-red-900/30">
                            Out of Stock
                          </span>
                        ) : (
                          <span className="font-bold text-emerald-400 text-lg bg-emerald-950/30 px-3 py-1 rounded-lg border border-emerald-900/30">
                            {plant.quantity}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1.5 rounded-lg shadow-sm ${
                          plant.health_status === 'Healthy'
                            ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/60'
                            : plant.health_status === 'Diseased'
                            ? 'bg-amber-900/40 text-amber-400 border border-amber-800/60'
                            : 'bg-red-900/40 text-red-400 border border-red-800/60'
                        }`}>
                          {plant.health_status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1.5 rounded-lg shadow-sm ${
                          plant.growth_status === 'Ready'
                            ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/60'
                            : plant.growth_status === 'Growing'
                            ? 'bg-blue-900/40 text-blue-400 border border-blue-800/60'
                            : 'bg-slate-800/80 text-slate-400 border border-slate-700'
                        }`}>
                          {plant.growth_status}
                        </span>
                      </td>
                      <td className="p-4 text-white font-medium whitespace-nowrap">
                        Rs {salePrice.toFixed(2)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => onView(plant)}
                            className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 border border-slate-700/80 text-slate-400 hover:text-white transition-all shadow-sm"
                            title="View details & Financials">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => onEdit(plant)}
                            className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 border border-slate-700/80 text-slate-400 hover:text-white transition-all shadow-sm"
                            title="Edit Plant">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => onLogMortality(plant)}
                            className="p-2 rounded-xl bg-amber-950/30 hover:bg-amber-900/60 border border-amber-900/50 text-amber-500 hover:text-amber-400 hover:border-amber-500/50 transition-all shadow-sm"
                            title="Log Dead Plants (Mortality)">
                            <Skull size={16} />
                          </button>
                          <button onClick={() => onDelete(plant.id)}
                            className="p-2 rounded-xl bg-slate-800/50 hover:bg-red-950/80 border border-slate-700/80 hover:border-red-900/80 text-slate-500 hover:text-red-400 transition-all shadow-sm"
                            title="Delete Completely">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Cost Panel */}
                    {isExpanded && (
                      <tr className="bg-slate-900/60">
                        <td colSpan="8" className="p-0">
                          <div className="px-6 py-4 border-t border-slate-700/50 bg-gradient-to-r from-slate-900/80 to-slate-800/60 animate-fade-in">
                            <div className="flex flex-wrap gap-8 items-center text-sm">
                              <div className="flex flex-col">
                                <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Unit Cost</span>
                                <span className="text-white font-bold">Rs {unitCost.toFixed(2)}</span>
                              </div>
                              
                              {/* RETAIL STATS */}
                              <div className="flex flex-col border-l border-slate-700 pl-6">
                                <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Retail Price</span>
                                <span className="text-emerald-400 font-bold">Rs {salePrice.toFixed(2)}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Retail Profit</span>
                                <span className={`font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  Rs {profit.toFixed(2)}
                                </span>
                              </div>

                              {/* WHOLESALE STATS */}
                              <div className="flex flex-col border-l border-slate-700 pl-6">
                                <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Wholesale Rate</span>
                                <span className="text-amber-400 font-bold">Rs {wholesalePrice.toFixed(2)}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Wholesale Profit</span>
                                <span className={`font-bold ${wholesaleProfit >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                                  Rs {wholesaleProfit.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}