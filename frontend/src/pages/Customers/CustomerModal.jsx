import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

export default function CustomerModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', starting_balance: 0 });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b0f15]/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111827] border border-slate-700/80 rounded-3xl w-full max-w-md shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlus className="text-blue-400" size={20} /> Add New Client
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Name *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
              className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
            <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} 
              className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Address / City</label>
            <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} 
              className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Previous Udhaar / Starting Balance (Rs)</label>
            <input type="number" min="0" step="0.01" value={formData.starting_balance} onChange={(e) => setFormData({...formData, starting_balance: e.target.value})} 
              className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-amber-400 font-bold outline-none focus:border-blue-500" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800">Cancel</button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20">
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}