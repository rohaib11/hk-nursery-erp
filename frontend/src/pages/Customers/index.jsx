import { useState, useEffect } from 'react';
import axios from 'axios';
import CustomersHeader from './CustomersHeader';
import CustomersTable from './CustomersTable';
import CustomerModal from './CustomerModal';
import PaymentModal from './PaymentModal';
import { AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal States
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = async () => {
    setIsLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(res.data);
    } catch (err) {
      setError('Failed to load customer data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleCreateCustomer = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/customers`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsCustomerModalOpen(false);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create customer');
    }
  };

  const handleProcessPayment = async (paymentData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/customers/${selectedCustomer.id}/payments`, paymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsPaymentModalOpen(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to process payment');
    }
  };

  const openPaymentModal = (customer) => {
    setSelectedCustomer(customer);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <CustomersHeader 
        customers={customers} 
        onAdd={() => setIsCustomerModalOpen(true)} 
        onRefresh={fetchCustomers} 
        isLoading={isLoading} 
      />

      {error && (
        <div className="bg-red-950/30 border border-red-800/50 text-red-300 p-4 rounded-xl mb-4 flex items-center gap-2 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <CustomersTable 
        customers={customers} 
        isLoading={isLoading} 
        onReceivePayment={openPaymentModal} 
      />

      {isCustomerModalOpen && (
        <CustomerModal 
          isOpen={isCustomerModalOpen} 
          onClose={() => setIsCustomerModalOpen(false)} 
          onSubmit={handleCreateCustomer} 
        />
      )}

      {isPaymentModalOpen && selectedCustomer && (
        <PaymentModal 
          isOpen={isPaymentModalOpen} 
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedCustomer(null);
          }} 
          customer={selectedCustomer}
          onSubmit={handleProcessPayment} 
        />
      )}
    </div>
  );
}