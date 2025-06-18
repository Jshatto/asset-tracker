import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Modal,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Snackbar,
  Alert
} from "@mui/material";
import ImportAssetsModal from "../components/ImportAssetsModal";
import AddAssetModal from "../components/AddAssetModal";
import EditAssetModal from "../components/EditAssetModal";
import EditIcon from '@mui/icons-material/Edit';

function Dashboard() {
  const { token } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Filter / search / sort state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [sortOption, setSortOption] = useState("");

  // Snackbars
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch assets
  const refreshAssets = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/assets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssets(res.data);
    } catch (err) {
      console.error("Error refreshing assets", err);
      setErrorMessage(err.response?.data?.message || err.message);
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAssets();
  }, [token]);

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      await axios.delete(`/api/assets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssets((prev) => prev.filter((a) => a.id !== id));
      setSuccessOpen(true);
    } catch (err) {
      console.error("Delete error:", err);
      setErrorMessage(err.response?.data?.message || err.message);
      setErrorOpen(true);
    }
  };

  // Handle edit click
  const handleEditClick = (asset) => {
    setSelectedAsset(asset);
    setShowEditModal(true);
  };

  // Handle update from modal
  const handleUpdate = (updatedAsset) => {
    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
    setSuccessOpen(true);
  };

  // Filtering/sorting logic
  const getFilteredAssets = () => {
    let filtered = [...assets];
    if (search) {
      filtered = filtered.filter((a) =>
        a.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (categoryFilter) {
      filtered = filtered.filter((a) => a.category === categoryFilter);
    }
    if (yearFilter) {
      filtered = filtered.filter(
        (a) => new Date(a.purchase_date).getFullYear().toString() === yearFilter
      );
    }
    switch (sortOption) {
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "cost-asc":
        filtered.sort((a, b) => a.cost - b.cost);
        break;
      case "cost-desc":
        filtered.sort((a, b) => b.cost - a.cost);
        break;
      case "method":
        filtered.sort((a, b) =>
          a.depreciation_method.localeCompare(b.depreciation_method)
        );
        break;
      default:
        break;
    }
    return filtered;
  };

  const purchaseYears = Array.from(
    new Set(
      assets.map((a) => new Date(a.purchase_date).getFullYear().toString())
    )
  );

  return (
    <Box sx={{ p: 2, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        📊 Asset Dashboard
      </Typography>

      {/* Controls: search, filters, sort, add/import */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <TextField
          label="Category"
          select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {/* ...other categories... */}
        </TextField>
        <TextField
          label="Year"
          select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {purchaseYears.map((yr) => (
            <MenuItem key={yr} value={yr}>
              {yr}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Sort"
          select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <MenuItem value="">None</MenuItem>
          {/* ...sort options... */}
        </TextField>
        <Button variant="contained" onClick={() => setShowAddModal(true)}>
          ➕ Add Asset
        </Button>
        <Button variant="outlined" onClick={() => setImportModalOpen(true)}>
          📥 Import Assets
        </Button>
      </Box>

      {/* Asset Table */}
      {loading ? (
        <Typography>Loading assets…</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Purchase Date</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Life (yrs)</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFilteredAssets().map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>{asset.name}</TableCell>
                <TableCell>{asset.category}</TableCell>
                <TableCell>${asset.cost}</TableCell>
                <TableCell>
                  {new Date(asset.purchase_date).toLocaleDateString()}
                </TableCell>
                <TableCell>{asset.depreciation_method}</TableCell>
                <TableCell>{asset.useful_life}</TableCell>
                <TableCell>{asset.description}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEditClick(asset)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(asset.id)}
                  >
                    🗑 Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modals & Snackbars... */}
      <AddAssetModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(asset) => { setAssets(prev => [...prev, asset]); setSuccessOpen(true); }}
      />
      <EditAssetModal
        open={showEditModal}
        asset={selectedAsset}
        onClose={() => setShowEditModal(false)}
        onUpdate={handleUpdate}
      />
      <ImportAssetsModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={async (rows) => {
          await axios.post("/api/assets/import", rows, {
            headers: { Authorization: `Bearer ${token}` },
          });
          refreshAssets();
        }}
      />

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Operation successful!
        </Alert>
      </Snackbar>
      <Snackbar
        open={errorOpen}
        autoHideDuration={4000}
        onClose={() => setErrorOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErrorOpen(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Dashboard;
