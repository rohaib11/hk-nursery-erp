import { useState } from 'react';
import { Skull, AlertCircle } from 'lucide-react';

export default function MortalityModal({ plant, onConfirm, onCancel }) {
  const [deadCount, setDeadCount] = useState(1);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (deadCount <= 0) {
      setError('You must log at least 1 dead plant.');
      return;
    }
    if (deadCount > plant.quantity) {
      setError(`You cannot log more than ${plant.quantity} dead plants.`);
      return;
    }

    onConfirm(deadCount, reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b0f15]/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111827] border border-amber-900/50 rounded-3xl w-full max-w-md p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)]">
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-950/50 flex items-center justify-center border border-amber-900/50">
            <Skull className="text-amber-500" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Log Mortality</h3>
            <p className="text-slate-400 text-sm">Update dead stock for {plant.name}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-900/50 text-red-400 p-3 rounded-xl mb-4 flex items-center gap-2 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Number of Dead Plants</label>
              <span className="text-xs font-medium text-emerald-400">Live Stock: {plant.quantity}</span>
            </div>
            <input 
              type="number" 
              min="1" 
              max={plant.quantity} 
              required
              value={deadCount} 
              onChange={(e) => setDeadCount(parseInt(e.target.value) || '')}
              className="w-full bg-[#0b0f15]/50 border border-amber-900/30 rounded-xl p-3 text-white text-lg font-bold outline-none focus:border-amber-500 shadow-inner" 
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Reason for Death (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g., Frost damage, Overwatered, Pest infestation..." 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-500 shadow-inner" 
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              Log Dead Plants
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}