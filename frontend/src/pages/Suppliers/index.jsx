import { useState, useEffect } from 'react';
import axios from 'axios';
import SuppliersHeader from './SuppliersHeader';
import SuppliersTable from './SuppliersTable';
import SupplierModal from './SupplierModal';
import PaymentModal from './PaymentModal';
import { AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal States
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const fetchSuppliers = async () => {
    setIsLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/suppliers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuppliers(res.data);
    } catch (err) {
      setError('Failed to load supplier data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleCreateSupplier = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/suppliers`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsSupplierModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create supplier');
    }
  };

  const handleProcessPayment = async (paymentData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/suppliers/${selectedSupplier.id}/payments`, paymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsPaymentModalOpen(false);
      setSelectedSupplier(null);
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to process payment');
    }
  };

  const openPaymentModal = (supplier) => {
    setSelectedSupplier(supplier);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <SuppliersHeader 
        suppliers={suppliers} 
        onAdd={() => setIsSupplierModalOpen(true)} 
        onRefresh={fetchSuppliers} 
        isLoading={isLoading} 
      />

      {error && (
        <div className="bg-red-950/30 border border-red-800/50 text-red-300 p-4 rounded-xl mb-4 flex items-center gap-2 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <SuppliersTable 
        suppliers={suppliers} 
        isLoading={isLoading} 
        onSendPayment={openPaymentModal} 
      />

      {isSupplierModalOpen && (
        <SupplierModal 
          isOpen={isSupplierModalOpen} 
          onClose={() => setIsSupplierModalOpen(false)} 
          onSubmit={handleCreateSupplier} 
        />
      )}

      {isPaymentModalOpen && selectedSupplier && (
        <PaymentModal 
          isOpen={isPaymentModalOpen} 
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedSupplier(null);
          }} 
          supplier={selectedSupplier}
          onSubmit={handleProcessPayment} 
        />
      )}
    </div>
  );
}