import { X, Receipt, Upload, Calculator, AlertTriangle } from 'lucide-react';

export default function ExpenseModal({ isOpen, onClose, expense, setExpense, plants, onSubmit, editMode }) {
  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setExpense({ ...expense, receipt: files[0] });
    } else if (type === 'checkbox' && name === 'is_batch_expense') {
      setExpense({ ...expense, [name]: checked, plant_ids: checked ? [] : '' });
    } else {
      setExpense({ ...expense, [name]: value });
    }
  };

  const togglePlantSelection = (plantId) => {
    if (editMode) return; // Prevent changing targets during an edit
    const currentIds = expense.plant_ids ? [...expense.plant_ids] : [];
    if (currentIds.includes(plantId)) {
      setExpense({ ...expense, plant_ids: currentIds.filter(id => id !== plantId) });
    } else {
      setExpense({ ...expense, plant_ids: [...currentIds, plantId] });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    Object.entries(expense).forEach(([key, value]) => {
      if (key === 'receipt' && value instanceof File) {
        formData.append('receipt', value);
      } else if (key === 'plant_ids') {
        if (Array.isArray(value) && value.length > 0) {
          formData.append('plant_ids', value.join(','));
        }
      } else if (key !== 'receipt' && value !== null && value !== '' && value !== undefined) {
        formData.append(key, value);
      }
    });

    onSubmit(formData);
  };

  const splitPreview = () => {
    if (editMode || !expense.is_batch_expense || !expense.plant_ids?.length || !expense.amount) return null;
    const selectedPlants = plants.filter(p => expense.plant_ids.includes(p.id));
    if (selectedPlants.length === 0) return null;
    const totalAmount = parseFloat(expense.amount) || 0;
    const method = expense.split_method || 'proportional';
    const totalStock = selectedPlants.reduce((sum, p) => sum + p.quantity, 0);
    
    return selectedPlants.map(p => {
      let share = method === 'equal' ? totalAmount / selectedPlants.length : (totalStock > 0 ? (p.quantity / totalStock) * totalAmount : 0);
      const unitAdded = p.quantity > 0 ? share / p.quantity : 0;
      return { ...p, share, unitAdded };
    });
  };

  const previewData = splitPreview();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b0f15]/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111827] border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-800 sticky top-0 bg-[#111827]/90 backdrop-blur z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="text-rose-400" size={20} />
            {editMode ? 'Update Expense Record' : 'Log New Expense'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6">
          
          {editMode && expense.is_batch_expense && (
            <div className="mb-6 p-4 rounded-xl bg-amber-950/30 border border-amber-900/50 flex items-start gap-3">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-amber-200">
                <strong>Accounting Lock:</strong> You are editing a batch expense. You may modify the amount, date, and title. The system will automatically adjust the plant's cost basis, but you cannot switch which plant this expense is linked to.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Expense Title *</label>
              <input type="text" name="title" required value={expense.title} onChange={handleInputChange} 
                className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-rose-500 shadow-inner" />
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category *</label>
              <select name="category" required value={expense.category} onChange={handleInputChange} 
                className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-rose-500 shadow-inner appearance-none">
                <option value="Labor">👷 Labor / Wages</option>
                <option value="Fertilizer">🧪 Fertilizer / Medicine</option>
                <option value="Soil">🪨 Soil / Bhal</option>
                <option value="Pots">🏺 Pots / Shoppers</option>
                <option value="Transport">🚚 Transport / Freight</option>
                <option value="Utility">💡 Utility / Bills</option>
                <option value="Other">📌 Other</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Amount (Rs) *</label>
              <input type="number" name="amount" required min="1" step="0.01" value={expense.amount} onChange={handleInputChange} 
                className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white text-lg font-bold outline-none focus:border-rose-500 shadow-inner" />
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date *</label>
              <input type="date" name="expense_date" required value={expense.expense_date} onChange={handleInputChange} 
                className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-rose-500 shadow-inner" />
            </div>

            <div className="md:col-span-1 flex flex-col justify-end pb-1">
              <label className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${editMode ? 'bg-[#0b0f15]/50 border-slate-800 opacity-50 cursor-not-allowed' : 'cursor-pointer border-slate-700 bg-slate-800/30 hover:bg-slate-800/60'}`}>
                <input type="checkbox" name="is_batch_expense" checked={expense.is_batch_expense} onChange={handleInputChange} disabled={editMode} className="w-5 h-5 accent-emerald-500" />
                <span className="text-sm font-bold text-slate-300">Apply to Plant Batch(es)?</span>
              </label>
            </div>

            {/* MULTI-BATCH SELECTION */}
            {expense.is_batch_expense && (
              <div className="md:col-span-2 bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-xl animate-fade-in space-y-3">
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">Target Plant Batch</label>
                
                {editMode ? (
                  <div className="p-3 bg-[#0b0f15]/50 rounded-lg border border-slate-800 text-slate-300">
                    {expense.plant_name} {expense.local_name ? `(${expense.local_name})` : ''} - <span className="text-emerald-400">Locked for Edit</span>
                  </div>
                ) : (
                  <>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {plants.map(p => (
                        <label key={p.id} className="flex items-center gap-3 cursor-pointer hover:bg-slate-800/40 p-2 rounded-lg transition-colors">
                          <input type="checkbox" checked={expense.plant_ids?.includes(p.id) || false} onChange={() => togglePlantSelection(p.id)} className="w-5 h-5 accent-emerald-500" />
                          <span className="text-white text-sm">
                            {p.name} {p.local_name ? `(${p.local_name})` : ''} – Stock: {p.quantity} {p.pot_size ? `– ${p.pot_size}` : ''}
                          </span>
                        </label>
                      ))}
                    </div>
                    {expense.plant_ids?.length > 0 && (
                      <div className="mt-3">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Split Method</label>
                        <select name="split_method" value={expense.split_method || 'proportional'} onChange={handleInputChange}
                          className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 shadow-inner appearance-none">
                          <option value="proportional">Proportional to Stock (recommended)</option>
                          <option value="equal">Equal per Batch</option>
                        </select>
                      </div>
                    )}
                  </>
                )}

                {/* Live Preview of Split (Only on Create) */}
                {!editMode && previewData && previewData.length > 0 && (
                  <div className="bg-slate-800/60 p-3 rounded-xl mt-3 text-xs space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                      <Calculator size={14} /> Split Preview
                    </div>
                    {previewData.map(p => (
                      <div key={p.id} className="flex justify-between text-slate-300">
                        <span>{p.name} (x{p.quantity})</span>
                        <span>Rs {p.share.toFixed(2)} → +Rs {p.unitAdded.toFixed(2)}/plant</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Receipt / Bill Image (Optional)</label>
              <label className="flex items-center gap-2 cursor-pointer bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-slate-300 hover:border-rose-500 transition-colors w-max">
                <Upload size={18} /> <span className="text-sm font-medium">{expense.receipt_image && editMode ? 'Replace Image' : 'Upload Image'}</span>
                <input type="file" name="receipt" accept="image/*" onChange={handleInputChange} className="hidden" />
              </label>
              {expense.receipt instanceof File && <span className="text-rose-400 text-sm ml-3 block mt-2">{expense.receipt.name}</span>}
              {editMode && expense.receipt_image && !(expense.receipt instanceof File) && (
                <span className="text-slate-400 text-xs mt-2 block">Current file: {expense.receipt_image.split('/').pop()}</span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all">Cancel</button>
            <button type="submit" className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(225,29,72,0.2)]">
              {editMode ? 'Update Database' : 'Save Expense(s)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}