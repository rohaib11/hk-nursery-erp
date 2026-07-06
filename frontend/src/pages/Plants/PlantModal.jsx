import { useState, useEffect } from 'react';
import { Leaf, X, ImagePlus, Calculator, History } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export default function PlantModal({ isOpen, onClose, plant, setPlant, onSubmit, editMode, viewMode }) {
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'history'
  const [historyEntries, setHistoryEntries] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  if (!isOpen) return null;

  useEffect(() => {
    if (isOpen && plant.id) {
      fetchHistory();
    } else {
      setHistoryEntries([]);
    }
  }, [isOpen, plant.id]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/history/${plant.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistoryEntries(res.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setPlant({ ...plant, image: files[0] });
    } else {
      setPlant({ ...plant, [name]: value });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    let submitPlant = { ...plant };
    if (submitPlant.health_status === 'Dead') {
      submitPlant.quantity = 0;
    }

    Object.entries(submitPlant).forEach(([key, value]) => {
      if (key === 'image' && value instanceof File) {
        formData.append('image', value);
      } else if (key !== 'image' && value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    onSubmit(formData);
  };

  const readonly = viewMode;

  const qty = parseInt(plant.quantity) || 0;
  const plantCost = parseFloat(plant.cost_price) || 0;
  const potCost = parseFloat(plant.pot_cost) || 0;
  const salePrice = parseFloat(plant.sale_price) || 0;
  const unitCostTotal = plantCost + potCost;
  const totalInvestment = unitCostTotal * qty;
  const totalInventoryValue = salePrice * qty;
  const expectedProfit = totalInventoryValue - totalInvestment;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b0f15]/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111827] border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center p-6 border-b border-slate-800 sticky top-0 bg-[#111827]/90 backdrop-blur z-20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Leaf className="text-emerald-400" size={20} />
            {viewMode ? 'Plant Details & Financials' : editMode ? 'Edit Plant' : 'Add New Plant'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs – only show History when viewing/editing an existing plant */}
        {plant.id && (
          <div className="flex border-b border-slate-800 px-6 pt-4 gap-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === 'details' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'history' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <History size={16} />
              History
            </button>
          </div>
        )}

        {activeTab === 'details' && (
          <form onSubmit={readonly ? (e) => e.preventDefault() : handleFormSubmit} className="p-6">
            {/* VIEW MODE FINANCIAL DASHBOARD */}
            {readonly && (
              <div className="mb-8 bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 shadow-inner">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Calculator size={16} className="text-emerald-400" />
                  Financial Projection (For {qty} Live Plants)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#0b0f15]/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Unit Cost (Plant+Pot)</p>
                    <p className="text-lg font-bold text-white">Rs {unitCostTotal.toLocaleString()}</p>
                  </div>
                  <div className="bg-[#0b0f15]/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Investment</p>
                    <p className="text-lg font-bold text-blue-400">Rs {totalInvestment.toLocaleString()}</p>
                  </div>
                  <div className="bg-[#0b0f15]/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Est. Value</p>
                    <p className="text-lg font-bold text-emerald-400">Rs {totalInventoryValue.toLocaleString()}</p>
                  </div>
                  <div className="bg-[#0b0f15]/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Expected Profit</p>
                    <p className={`text-lg font-bold ${expectedProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      Rs {expectedProfit.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              {/* Image Upload */}
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Plant Image</label>
                <div className="flex items-center gap-4">
                  {plant.primary_image && typeof plant.primary_image === 'string' && !plant.image && (
                    <img
                      src={`http://localhost:5000/${plant.primary_image}`}
                      alt="Current"
                      className="w-24 h-24 object-cover rounded-xl border border-slate-700 shadow-sm"
                    />
                  )}
                  {!readonly && (
                    <label className="cursor-pointer flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-slate-300 hover:border-emerald-500 hover:bg-slate-800 transition-all shadow-sm">
                      <ImagePlus size={18} />
                      <span className="text-sm font-medium">Choose Image</span>
                      <input type="file" name="image" accept="image/*" onChange={handleInputChange} className="hidden" />
                    </label>
                  )}
                  {plant.image instanceof File && (
                    <span className="text-emerald-400 text-sm font-medium">{plant.image.name}</span>
                  )}
                </div>
              </div>

              {/* Name fields */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">English Name *</label>
                <input type="text" name="name" required value={plant.name} onChange={handleInputChange} disabled={readonly}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 shadow-inner disabled:opacity-60 disabled:cursor-not-allowed" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Local/Urdu Name</label>
                <input type="text" name="local_name" value={plant.local_name || ''} onChange={handleInputChange} disabled={readonly}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white text-right outline-none focus:border-emerald-500 shadow-inner urdu-font disabled:opacity-60 disabled:cursor-not-allowed" dir="auto" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category *</label>
                <select name="category_id" required value={plant.category_id} onChange={handleInputChange} disabled={readonly}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 shadow-inner appearance-none disabled:opacity-60 disabled:cursor-not-allowed">
                  <option value="1">🥭 Fruit Tree</option>
                  <option value="2">🌸 Ornamental</option>
                  <option value="3">🌿 Indoor</option>
                  <option value="4">🌻 Seasonal</option>
                  <option value="5">🌱 Medicinal</option>
                  <option value="6">🌴 Palm</option>
                  <option value="7">🌳 Tree</option>
                </select>
              </div>

              {/* Quantity & Pricing */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Live Quantity *</label>
                <input type="number" name="quantity" required min="0" value={plant.quantity} onChange={handleInputChange} disabled={readonly}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 shadow-inner disabled:opacity-60 disabled:cursor-not-allowed" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Plant Cost (Rs)</label>
                <input type="number" name="cost_price" min="0" step="0.01" value={plant.cost_price} onChange={handleInputChange} disabled={readonly}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 shadow-inner disabled:opacity-60 disabled:cursor-not-allowed" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Retail Sale Price (Rs)</label>
                <input type="number" name="sale_price" min="0" step="0.01" value={plant.sale_price} onChange={handleInputChange} disabled={readonly}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 shadow-inner disabled:opacity-60 disabled:cursor-not-allowed" />
              </div>

              {/* Wholesale Pricing */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Wholesale Rate (Rs)</label>
                <input type="number" name="wholesale_price" min="0" step="0.01" value={plant.wholesale_price || ''} onChange={handleInputChange} disabled={readonly}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-500 shadow-inner disabled:opacity-60 disabled:cursor-not-allowed" />
              </div>

              {/* Pot details */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pot Size</label>
                <input type="text" name="pot_size" placeholder="e.g. 14 inch" value={plant.pot_size || ''} onChange={handleInputChange} disabled={readonly}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 shadow-inner disabled:opacity-60 disabled:cursor-not-allowed" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pot Cost (Rs)</label>
                <input type="number" name="pot_cost" min="0" step="0.01" value={plant.pot_cost || 0} onChange={handleInputChange} disabled={readonly}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 shadow-inner disabled:opacity-60 disabled:cursor-not-allowed" />
              </div>

              {/* Health & Growth */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Health Status</label>
                <select name="health_status" value={plant.health_status} onChange={handleInputChange} disabled={readonly}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 shadow-inner appearance-none disabled:opacity-60 disabled:cursor-not-allowed">
                  <option value="Healthy">Healthy</option>
                  <option value="Diseased">Diseased</option>
                  <option value="Dead">Dead (Zeroes Stock)</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Growth Stage</label>
                <select name="growth_status" value={plant.growth_status} onChange={handleInputChange} disabled={readonly}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 shadow-inner appearance-none disabled:opacity-60 disabled:cursor-not-allowed">
                  <option value="Seedling">Seedling</option>
                  <option value="Growing">Growing</option>
                  <option value="Ready">Ready for Sale</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location / Bed</label>
                <input type="text" name="location_id" value={plant.location_id || ''} onChange={handleInputChange} disabled={readonly}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 shadow-inner disabled:opacity-60 disabled:cursor-not-allowed" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Supplier ID / Name</label>
                <input type="text" name="supplier_id" value={plant.supplier_id || ''} onChange={handleInputChange} disabled={readonly}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 shadow-inner disabled:opacity-60 disabled:cursor-not-allowed" />
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Batch Code</label>
                <input type="text" name="batch_code" placeholder="e.g. BATCH-2026-01" value={plant.batch_code || ''} onChange={handleInputChange} disabled={readonly}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 shadow-inner disabled:opacity-60 disabled:cursor-not-allowed" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Batch / Sowing Date</label>
                <input type="date" name="sowing_date" value={plant.sowing_date ? plant.sowing_date.split('T')[0] : ''} onChange={handleInputChange} disabled={readonly}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 shadow-inner disabled:opacity-60 disabled:cursor-not-allowed" />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes & History</label>
                <textarea name="notes" value={plant.notes || ''} onChange={handleInputChange} rows="2" disabled={readonly}
                  className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 shadow-inner disabled:opacity-60 disabled:cursor-not-allowed" />
              </div>
            </div>

            {/* Action Buttons */}
            {!readonly ? (
              <div className="flex justify-end gap-3 pt-5 border-t border-slate-800">
                <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                  Cancel
                </button>
                <button type="submit" className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                  {editMode ? 'Update Database' : 'Save to Inventory'}
                </button>
              </div>
            ) : (
              <div className="flex justify-end pt-5 border-t border-slate-800">
                <button type="button" onClick={onClose} className="px-8 py-2.5 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all">
                  Close Window
                </button>
              </div>
            )}
          </form>
        )}

        {activeTab === 'history' && (
          <div className="p-6">
            {historyLoading ? (
              <p className="text-slate-500 text-center py-10">Loading history...</p>
            ) : historyEntries.length === 0 ? (
              <p className="text-slate-500 text-center py-10">No history recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {historyEntries.map(entry => (
                  <div key={entry.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                          entry.action === 'create' ? 'bg-emerald-900/40 text-emerald-400' :
                          entry.action === 'update' ? 'bg-indigo-900/40 text-indigo-400' :
                          entry.action === 'mortality' ? 'bg-amber-900/40 text-amber-400' :
                          'bg-red-900/40 text-red-400'
                        }`}>
                          {entry.action}
                        </span>
                        <span className="text-slate-400 text-xs ml-3">
                          {new Date(entry.performed_at).toLocaleString('en-GB')}
                        </span>
                      </div>
                      {entry.performed_by_username && (
                        <span className="text-xs text-slate-500">by {entry.performed_by_username}</span>
                      )}
                    </div>
                    {entry.changed_fields && entry.changed_fields.length > 0 && (
                      <p className="text-xs text-slate-400 mb-1">
                        Changed: {entry.changed_fields.join(', ')}
                      </p>
                    )}
                    {entry.old_values && (
                      <details className="text-xs text-slate-500 mt-1">
                        <summary className="cursor-pointer">Old values</summary>
                        <pre className="mt-1 bg-slate-900 p-2 rounded-lg overflow-x-auto">
                          {JSON.stringify(entry.old_values, null, 2)}
                        </pre>
                      </details>
                    )}
                    {entry.new_values && (
                      <details className="text-xs text-slate-500 mt-1">
                        <summary className="cursor-pointer">New values</summary>
                        <pre className="mt-1 bg-slate-900 p-2 rounded-lg overflow-x-auto">
                          {JSON.stringify(entry.new_values, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}