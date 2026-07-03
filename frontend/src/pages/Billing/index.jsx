import { useState, useEffect } from 'react';
import axios from 'axios';
import PlantSearch from './PlantSearch';
import BillingCart from './BillingCart';
import CheckoutSidebar from './CheckoutSidebar';
import InvoiceReceipt from './InvoiceReceipt';
import { AlertCircle, ShoppingCart } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function Billing() {
  const [plants, setPlants] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Cart & Checkout State
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(''); // Empty = Walk-in
  const [discount, setDiscount] = useState(0);
  const [extraCharges, setExtraCharges] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [notes, setNotes] = useState('');
  
  // Post-Checkout State
  const [completedInvoice, setCompletedInvoice] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [plantRes, customerRes] = await Promise.all([
          axios.get(`${API_BASE}/plants`, config),
          axios.get(`${API_BASE}/customers`, config)
        ]);
        
        setPlants(plantRes.data.filter(p => p.quantity > 0 && p.health_status !== 'Dead'));
        setCustomers(customerRes.data);
      } catch (err) {
        setError('Failed to load POS data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🪄 THE MAGIC PRICING ENGINE
  const handleCustomerChange = (customerId) => {
    setSelectedCustomer(customerId);
    
    // Automatically switch cart prices based on Walk-in vs Registered Customer
    setCart(prevCart => prevCart.map(item => {
      const originalPlant = plants.find(p => p.id === item.plant_id);
      if (!originalPlant) return item;

      // If registered customer, use wholesale (if it exists). If Walk-in, use normal sale price.
      const hasWholesale = parseFloat(originalPlant.wholesale_price) > 0;
      const newPrice = customerId && hasWholesale 
        ? parseFloat(originalPlant.wholesale_price) 
        : parseFloat(originalPlant.sale_price);

      return { ...item, unit_price: newPrice };
    }));
  };

  const addToCart = (plant) => {
    const existing = cart.find(item => item.plant_id === plant.id);
    if (existing) {
      if (existing.quantity >= plant.quantity) {
        alert('Cannot add more than available stock!');
        return;
      }
      setCart(cart.map(item => item.plant_id === plant.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      // Determine initial price based on whether a wholesale customer is already selected
      const hasWholesale = parseFloat(plant.wholesale_price) > 0;
      const startingPrice = selectedCustomer && hasWholesale
        ? parseFloat(plant.wholesale_price)
        : parseFloat(plant.sale_price);

      setCart([...cart, { 
        plant_id: plant.id, 
        name: plant.name, 
        local_name: plant.local_name,
        pot_size: plant.pot_size,
        unit_price: startingPrice || 0, 
        quantity: 1, 
        max_stock: plant.quantity 
      }]);
    }
  };

  const updateCartItem = (plant_id, field, value) => {
    setCart(cart.map(item => {
      if (item.plant_id === plant_id) {
        let newValue = parseFloat(value) || 0;
        if (field === 'quantity' && newValue > item.max_stock) newValue = item.max_stock;
        if (field === 'quantity' && newValue < 1) newValue = 1;
        return { ...item, [field]: newValue };
      }
      return item;
    }));
  };

  const removeFromCart = (plant_id) => setCart(cart.filter(item => item.plant_id !== plant_id));

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Cart is empty!');
    
    const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const totalAmount = (subtotal + parseFloat(extraCharges || 0)) - parseFloat(discount || 0);
    const paid = parseFloat(amountPaid || 0);

    if (!selectedCustomer && paid < totalAmount) {
      return alert('Walk-in customers must pay the full amount in cash (No Udhaar allowed). Please select a registered customer to apply Udhaar.');
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        customer_id: selectedCustomer || null,
        items: cart,
        discount: parseFloat(discount || 0),
        extra_charges: parseFloat(extraCharges || 0),
        amount_paid: paid,
        notes
      };

      const res = await axios.post(`${API_BASE}/invoices`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Pass all details to the receipt component for WhatsApp formatting
      const custDetails = customers.find(c => c.id === parseInt(selectedCustomer));
      
      setCompletedInvoice({
        id: res.data.invoice_id,
        cart: [...cart],
        customer: custDetails || { name: 'Walk-in Gahak', phone: '' },
        totals: { subtotal, totalAmount, paid, discount: payload.discount, extra: payload.extra_charges, udhaar: Math.max(totalAmount - paid, 0) }
      });

    } catch (err) {
      alert(err.response?.data?.error || 'Failed to process checkout.');
    }
  };

  const resetPOS = () => {
    setCart([]);
    setSelectedCustomer('');
    setDiscount(0);
    setExtraCharges(0);
    setAmountPaid(0);
    setNotes('');
    setCompletedInvoice(null);
    window.location.reload(); 
  };

  if (completedInvoice) {
    return <InvoiceReceipt invoice={completedInvoice} onNewSale={resetPOS} />;
  }

  return (
    <div className="animate-fade-in h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="text-emerald-400" /> Point of Sale (POS)
        </h2>
        <p className="text-slate-400 text-sm">Create bills, manage cart, and process Udhaar.</p>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-800/50 text-red-300 p-4 rounded-xl mb-4 flex items-center gap-2 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        <div className="lg:col-span-2 flex flex-col bg-[#111827]/60 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
          <PlantSearch plants={plants} onAdd={addToCart} isLoading={isLoading} />
          <BillingCart cart={cart} onUpdate={updateCartItem} onRemove={removeFromCart} />
        </div>

        <div className="lg:col-span-1 bg-[#111827]/60 border border-slate-700/50 rounded-2xl p-5 shadow-xl overflow-y-auto">
          <CheckoutSidebar 
            cart={cart}
            customers={customers}
            selectedCustomer={selectedCustomer}
            onCustomerChange={handleCustomerChange} // 🆕 Connected to Magic Engine
            discount={discount}
            setDiscount={setDiscount}
            extraCharges={extraCharges}
            setExtraCharges={setExtraCharges}
            amountPaid={amountPaid}
            setAmountPaid={setAmountPaid}
            notes={notes}
            setNotes={setNotes}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
}