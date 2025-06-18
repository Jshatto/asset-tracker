import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Modal,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Snackbar,
  Alert
} from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 1,
  boxShadow: 24,
  p: 4
};

function AddAssetModal({ open, onClose, onAdd }) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    name: '',
    purchase_date: '',
    cost: '',
    depreciation_method: 'straight_line',
    useful_life: '',
    category: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
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
      setSuccessOpen(true);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create asset.');
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box sx={style} component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Add New Asset
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            name="name"
            label="Asset Name*"
            fullWidth
            required
            margin="dense"
            value={form.name}
            onChange={handleChange}
          />
          <TextField
            name="purchase_date"
            label="Purchase Date*"
            type="date"
            fullWidth
            required
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={form.purchase_date}
            onChange={handleChange}
          />
          <TextField
            name="cost"
            label="Purchase Price*"
            type="number"
            fullWidth
            required
            margin="dense"
            value={form.cost}
            onChange={handleChange}
          />
          <TextField
            name="depreciation_method"
            label="Depreciation Method*"
            select
            fullWidth
            required
            margin="dense"
            value={form.depreciation_method}
            onChange={handleChange}
          >
            <MenuItem value="straight_line">Straight Line</MenuItem>
            <MenuItem value="double_declining">Double Declining</MenuItem>
            <MenuItem value="sum_of_years_digits">Sum-of-Years Digits</MenuItem>
          </TextField>
          <TextField
            name="useful_life"
            label="Useful Life (yrs)*"
            type="number"
            fullWidth
            required
            margin="dense"
            value={form.useful_life}
            onChange={handleChange}
          />
          <TextField
            name="category"
            label="Category*"
            select
            fullWidth
            required
            margin="dense"
            value={form.category}
            onChange={handleChange}
          >
            <MenuItem value="Machinery and Equipment">Machinery & Equipment</MenuItem>
            <MenuItem value="Vehicles">Vehicles</MenuItem>
            <MenuItem value="Furniture">Furniture</MenuItem>
            <MenuItem value="Intangibles">Intangibles</MenuItem>
            <MenuItem value="179 Assets">179 Assets</MenuItem>
            <MenuItem value="Bonus Depreciation Assets">Bonus Depreciation Assets</MenuItem>
          </TextField>
          <TextField
            name="description"
            label="Description (optional)"
            multiline
            rows={2}
            fullWidth
            margin="dense"
            value={form.description}
            onChange={handleChange}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              Add Asset
            </Button>
          </Box>
        </Box>
      </Modal>
      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success">Asset added successfully!</Alert>
      </Snackbar>
    </>
  );
}

export default AddAssetModal;
