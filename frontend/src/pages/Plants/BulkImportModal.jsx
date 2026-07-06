import { useState } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';

export default function BulkImportModal({ isOpen, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [step, setStep] = useState('upload'); // 'upload' | 'preview'
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Parse CSV file
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);
    setPreviewData([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target.result;
      const rows = csvText
        .split('\n')
        .map(row => row.split(',').map(cell => cell.trim()))
        .filter(row => row.length > 1 && row[0] !== '');

      if (rows.length < 2) {
        setErrors(['CSV file must contain at least a header row and one data row.']);
        return;
      }

      const headers = rows[0].map(h => h.toLowerCase().replace(/\s+/g, '_'));
      const required = ['name', 'category_id', 'quantity', 'cost_price', 'sale_price'];

      const missing = required.filter(f => !headers.includes(f));
      if (missing.length > 0) {
        setErrors([`Missing required columns: ${missing.join(', ')}`]);
        return;
      }

      const parsed = [];
      for (let i = 1; i < rows.length; i++) {
        const obj = {};
        headers.forEach((header, idx) => {
          obj[header] = rows[i][idx] || '';
        });
        // Convert numbers
        obj.quantity = parseInt(obj.quantity) || 0;
        obj.cost_price = parseFloat(obj.cost_price) || 0;
        obj.sale_price = parseFloat(obj.sale_price) || 0;
        obj.wholesale_price = obj.wholesale_price ? parseFloat(obj.wholesale_price) || 0 : 0;
        obj.pot_cost = obj.pot_cost ? parseFloat(obj.pot_cost) || 0 : 0;
        obj.category_id = parseInt(obj.category_id) || 1;
        parsed.push(obj);
      }

      if (parsed.length === 0) {
        setErrors(['No valid data rows found.']);
      } else {
        setPreviewData(parsed);
        setStep('preview');
      }
    };

    reader.onerror = () => {
      setErrors(['Failed to read file.']);
    };

    reader.readAsText(selectedFile, 'UTF-8');
  };

  // Submit to backend
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onImport(previewData);
      setFile(null);
      setPreviewData([]);
      setStep('upload');
      onClose();
    } catch (err) {
      setErrors([err.response?.data?.error || 'Import failed. Check console for details.']);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewData([]);
    setErrors([]);
    setStep('upload');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b0f15]/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111827] border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center p-6 border-b border-slate-800 sticky top-0 bg-[#111827]/90 backdrop-blur z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="text-indigo-400" size={20} />
            Bulk Import Plants (CSV)
          </h2>
          <button onClick={() => { reset(); onClose(); }} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="bg-indigo-950/20 border border-indigo-900/30 p-5 rounded-xl">
                <p className="text-sm text-slate-300 mb-3">
                  Upload a <strong>.csv</strong> file with the following columns:
                </p>
                <code className="text-xs text-emerald-400 block bg-[#0b0f15] p-3 rounded-lg">
                  name, local_name, category_id, quantity, cost_price, sale_price, wholesale_price, pot_size, pot_cost,
                  health_status, growth_status, location_id, supplier_id, batch_code, sowing_date, notes
                </code>
                <p className="text-xs text-slate-500 mt-3">
                  Only <strong>name</strong> and <strong>category_id</strong> are required. Other columns may be empty.
                </p>
              </div>

              <label className="flex flex-col items-center justify-center gap-3 cursor-pointer border-2 border-dashed border-slate-600 hover:border-indigo-500 rounded-2xl p-8 transition-colors bg-slate-800/30">
                <Upload size={32} className="text-indigo-400" />
                <span className="text-sm font-bold text-slate-300">Choose CSV File</span>
                <span className="text-xs text-slate-500">{file ? file.name : 'No file selected'}</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {errors.length > 0 && (
                <div className="bg-red-950/30 border border-red-900/50 text-red-300 p-4 rounded-xl flex items-start gap-2 text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    {errors.map((err, i) => (
                      <p key={i}>{err}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-xl">
                <CheckCircle size={18} />
                <span className="text-sm font-bold">{previewData.length} plants ready to import</span>
              </div>

              <div className="overflow-x-auto max-h-[400px] rounded-xl border border-slate-700">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800/80 sticky top-0">
                    <tr className="text-slate-400 text-xs uppercase">
                      <th className="p-3">Name</th>
                      <th className="p-3">Cat ID</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3">Cost</th>
                      <th className="p-3">Sale</th>
                      <th className="p-3">Pot Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="text-slate-300">
                        <td className="p-3">{row.name}</td>
                        <td className="p-3">{row.category_id}</td>
                        <td className="p-3">{row.quantity}</td>
                        <td className="p-3">{row.cost_price}</td>
                        <td className="p-3">{row.sale_price}</td>
                        <td className="p-3">{row.pot_size || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => { setStep('upload'); setErrors([]); }}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2"
                >
                  {isLoading ? 'Importing...' : 'Import All'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}