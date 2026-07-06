import { useState, useEffect } from 'react';
import axios from 'axios';
import PlantsHeader from './PlantsHeader';
import PlantsTable from './PlantsTable';
import PlantModal from './PlantModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import MortalityModal from './MortalityModal';
import BulkImportModal from './BulkImportModal'; // 🆕
import { AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function Plants() {
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [search, setSearch] = useState('');
  const [filterGrowth, setFilterGrowth] = useState('');
  const [showZeroStock, setShowZeroStock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [currentPlant, setCurrentPlant] = useState(getInitialState());

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [mortalityTarget, setMortalityTarget] = useState(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false); // 🆕

  function getInitialState() {
    return {
      name: '', local_name: '', category_id: 1, quantity: 0,
      cost_price: 0, sale_price: 0, wholesale_price: 0, pot_size: '', pot_cost: 0,
      health_status: 'Healthy', growth_status: 'Growing',
      location_id: '', supplier_id: '', batch_code: '',
      sowing_date: '', notes: '', image: null
    };
  }

  const fetchPlants = async () => {
    setIsLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/plants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlants(res.data);
    } catch (err) {
      setError('Failed to load plants. Ensure backend is running and you are logged in.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPlants(); }, []);

  useEffect(() => {
    let result = plants;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(s) ||
        (p.local_name && p.local_name.toLowerCase().includes(s))
      );
    }
    if (filterGrowth) result = result.filter(p => p.growth_status === filterGrowth);

    result = result.filter(p => p.health_status !== 'Dead');
    if (!showZeroStock) {
      result = result.filter(p => p.quantity > 0);
    }

    setFilteredPlants(result);
  }, [search, filterGrowth, plants, showZeroStock]);

  // --- Modal Handlers ---
  const handleOpenAdd = () => {
    setCurrentPlant(getInitialState());
    setEditMode(false); setViewMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (plant) => {
    setCurrentPlant({ ...plant, image: null });
    setEditMode(true); setViewMode(false);
    setIsModalOpen(true);
  };

  const handleView = (plant) => {
    setCurrentPlant({ ...plant });
    setViewMode(true); setEditMode(false);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id) => {
    setDeleteTarget(id);
  };

  const handleLogMortalityRequest = (plant) => {
    setMortalityTarget(plant);
  };

  // 🆕 Bulk Import handler
  const handleBulkImport = async (plantsArray) => {
    const token = localStorage.getItem('token');
    const res = await axios.post(
      `${API_BASE}/plants/bulk-import`,
      { plants: plantsArray },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // Refresh the list after import
    await fetchPlants();
    return res.data;
  };

  // --- API Submission Handlers ---
  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/plants/${deleteTarget}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteTarget(null);
      fetchPlants();
    } catch (err) {
      alert('Failed to delete plant');
      setDeleteTarget(null);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (editMode) {
        await axios.put(`${API_BASE}/plants/${currentPlant.id}`, formData, config);
      } else {
        await axios.post(`${API_BASE}/plants`, formData, config);
      }
      setIsModalOpen(false);
      fetchPlants();
    } catch (err) {
      alert(editMode ? 'Failed to update plant' : 'Failed to add plant');
    }
  };

  const handleMortalitySubmit = async (count, reason) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/plants/${mortalityTarget.id}/mortality`, 
        { dead_count: count, reason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMortalityTarget(null);
      fetchPlants();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to log mortality');
    }
  };

  return (
    <div className="animate-fade-in">
      <PlantsHeader
        count={filteredPlants.length}
        onAdd={handleOpenAdd}
        onBulkImport={() => setIsBulkImportOpen(true)}   // 🆕
        search={search}
        setSearch={setSearch}
        filterGrowth={filterGrowth}
        setFilterGrowth={setFilterGrowth}
        showZeroStock={showZeroStock}
        setShowZeroStock={setShowZeroStock}
        onRefresh={fetchPlants}
        isLoading={isLoading}
      />

      {error && (
        <div className="bg-red-950/30 border border-red-800/50 text-red-300 p-4 rounded-xl mb-4 flex items-center gap-2 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <PlantsTable
        plants={filteredPlants}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onView={handleView}
        onLogMortality={handleLogMortalityRequest}
      />

      {isModalOpen && (
        <PlantModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          plant={currentPlant}
          setPlant={setCurrentPlant}
          onSubmit={handleSubmit}
          editMode={editMode}
          viewMode={viewMode}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {mortalityTarget && (
        <MortalityModal
          plant={mortalityTarget}
          onConfirm={handleMortalitySubmit}
          onCancel={() => setMortalityTarget(null)}
        />
      )}

      {/* 🆕 Bulk Import Modal */}
      {isBulkImportOpen && (
        <BulkImportModal
          isOpen={isBulkImportOpen}
          onClose={() => setIsBulkImportOpen(false)}
          onImport={handleBulkImport}
        />
      )}
    </div>
  );
}