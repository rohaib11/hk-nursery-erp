import { AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b0f15]/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111827] border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-red-400" size={24} />
          <h3 className="text-lg font-bold text-white">Confirm Deletion</h3>
        </div>
        <p className="text-slate-300 mb-6">
          Are you sure you want to permanently delete this plant? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}