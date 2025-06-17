import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function AddAssetModal({ onClose, onAdd }) {
  const { token } = useAuth();

  const [form, setForm] = useState({
    name: '',
    purchase_date: '',
    cost: '',
    depreciation_method: 'straight_line',
    useful_life: '',
    category: '',
    description: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, purchase_date, cost, depreciation_method, useful_life, category } = form;
    if (!name || !purchase_date || !cost || !depreciation_method || !useful_life || !category) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const res = await axios.post('/api/assets', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onAdd(res.data);
    } catch (err) {
      setError('❌ Failed to create asset.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Add New Asset</h3>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Asset Name*" value={form.name} onChange={handleChange} />
          <input name="purchase_date" type="date" value={form.purchase_date} onChange={handleChange} />
          <input name="cost" type="number" placeholder="Purchase Price*" value={form.cost} onChange={handleChange} />
          
          <select name="depreciation_method" value={form.depreciation_method} onChange={handleChange}>
            <option value="straight_line">Straight Line</option>
            <option value="double_declining">Double Declining</option>
            <option value="sum_of_years_digits">Sum-of-Years Digits</option>
          </select>

          <input name="useful_life" type="number" placeholder="Useful Life (years)*" value={form.useful_life} onChange={handleChange} />

          <select name="category" value={form.category} onChange={handleChange}>
            <option value="">Select Category*</option>
            <option value="Machinery and Equipment">Machinery and Equipment</option>
            <option value="Vehicles">Vehicles</option>
            <option value="Furniture">Furniture</option>
            <option value="Intangibles">Intangibles</option>
            <option value="179 Assets">179 Assets</option>
            <option value="Bonus Depreciation Assets">Bonus Depreciation Assets</option>
          </select>

          <textarea name="description" placeholder="Description (optional)" value={form.description} onChange={handleChange} />

          <div className="modal-actions">
            <button type="submit">✅ Add Asset</button>
            <button type="button" onClick={onClose}>❌ Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAssetModal;
