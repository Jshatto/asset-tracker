import React, { useEffect, useState } from "react";
import api from "../services/api";
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
  Snackbar,
  Alert,
} from "@mui/material";
import ImportAssetsModal from "../components/ImportAssetsModal";

function Dashboard() {
  const { token } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add‐asset modal state
  const [showModal, setShowModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: "",
    cost: "",
    purchase_date: "",
    category: "",
    depreciation_method: "",
    useful_life: "",
    description: "",
  });

  // Import‐CSV modal state
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
      const res = await api.get("/assets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssets(res.data);
    } catch (err) {
      console.error("Error refreshing assets", err);
      setErrorMessage(err.message);
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAssets();
  }, [token]);

  // Handle add‐asset form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📤 Submitting asset:", newAsset);
    try {
      const res = await api.post("/assets", newAsset, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Asset created:", res.data);
      setAssets((prev) => [...prev, res.data]);
      setShowModal(false);
      setNewAsset({
        name: "",
        cost: "",
        purchase_date: "",
        category: "",
        depreciation_method: "",
        useful_life: "",
        description: "",
      });
      setSuccessOpen(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("❌ Failed to create asset:", err.response?.data || err.message);
      const msg = err.response?.data?.message || err.message;
      setErrorMessage(msg);
      setErrorOpen(true);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      await api.delete(`/assets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssets((prev) => prev.filter((a) => a.id !== id));
      setSuccessOpen(true);
    } catch (err) {
      console.error("Delete error:", err);
      setErrorMessage(err.message);
      setErrorOpen(true);
    }
  };

  // Handle CSV import
  const handleImport = async (rows) => {
    try {
      await api.post("/assets/import", rows, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshAssets();
      setSuccessOpen(true);
    } catch (err) {
      console.error("Import failed:", err.response?.data || err.message);
      const msg = err.response?.data?.message || err.message;
      setErrorMessage(msg);
      setErrorOpen(true);
    } finally {
      setImportModalOpen(false);
    }
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
        (a) =>
          new Date(a.purchase_date).getFullYear().toString() === yearFilter
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
    }
    return filtered;
  };

  const groupedAssets = () => {
    const groups = {};
    for (const asset of getFilteredAssets()) {
      groups[asset.category] = groups[asset.category] || [];
      groups[asset.category].push(asset);
    }
    return groups;
  };

  const purchaseYears = Array.from(
    new Set(
      assets.map((a) =>
        new Date(a.purchase_date).getFullYear().toString()
      )
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
          <MenuItem value="Machinery and Equipment">
            Machinery & Equipment
          </MenuItem>
          <MenuItem value="Vehicles">Vehicles</MenuItem>
          <MenuItem value="Furniture">Furniture</MenuItem>
          <MenuItem value="Intangibles">Intangibles</MenuItem>
          <MenuItem value="179 Assets">179 Assets</MenuItem>
          <MenuItem value="Bonus Depreciation Assets">
            Bonus Depreciation Assets
          </MenuItem>
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
          <MenuItem value="name-asc">Name (A–Z)</MenuItem>
          <MenuItem value="name-desc">Name (Z–A)</MenuItem>
          <MenuItem value="cost-asc">Cost (Low–High)</MenuItem>
          <MenuItem value="cost-desc">Cost (High–Low)</MenuItem>
          <MenuItem value="method">Depreciation Method</MenuItem>
        </TextField>
        <Button
          variant="contained"
          onClick={() => setShowModal(true)}
        >
          ➕ Add Asset
        </Button>
        <Button
          variant="outlined"
          onClick={() => setImportModalOpen(true)}
        >
          📥 Import Assets
        </Button>
      </Box>

      {/* Asset list */}
      {loading ? (
        <Typography>Loading assets…</Typography>
      ) : (
        Object.entries(groupedAssets()).map(([category, grp]) => (
          <Box key={category} sx={{ mb: 3 }}>
            <Typography variant="h6">{category}</Typography>
            {grp.map((asset) => (
              <Box
                key={asset.id}
                sx={{
                  border: "1px solid #ccc",
                  p: 1,
                  mb: 1,
                }}
              >
                <strong>{asset.name}</strong> — ${asset.cost} —{" "}
                {new Date(asset.purchase_date).toLocaleDateString()}
                <br />
                Method: {asset.depreciation_method}, Life:{" "}
                {asset.useful_life} yrs
                <br />
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete(asset.id)}
                  sx={{ mt: 1 }}
                >
                  🗑 Delete
                </Button>
              </Box>
            ))}
          </Box>
        ))
      )}

      {/* Add Asset Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 1,
            boxShadow: 24,
            p: 3,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Add New Asset
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              fullWidth
              required
              margin="dense"
              value={newAsset.name}
              onChange={(e) =>
                setNewAsset({ ...newAsset, name: e.target.value })
              }
            />
            <TextField
              label="Purchase Price"
              type="number"
              fullWidth
              required
              margin="dense"
              value={newAsset.cost}
              onChange={(e) =>
                setNewAsset({ ...newAsset, cost: e.target.value })
              }
            />
            <TextField
              label="Purchase Date"
              type="date"
              fullWidth
              required
              margin="dense"
              InputLabelProps={{ shrink: true }}
              value={newAsset.purchase_date}
              onChange={(e) =>
                setNewAsset({
                  ...newAsset,
                  purchase_date: e.target.value,
                })
              }
            />
            <TextField
              label="Category"
              select
              fullWidth
              required
              margin="dense"
              value={newAsset.category}
              onChange={(e) =>
                setNewAsset({ ...newAsset, category: e.target.value })
              }
            >
              <MenuItem value="Machinery and Equipment">
                Machinery & Equipment
              </MenuItem>
              <MenuItem value="Vehicles">Vehicles</MenuItem>
              <MenuItem value="Furniture">Furniture</MenuItem>
              <MenuItem value="Intangibles">Intangibles</MenuItem>
              <MenuItem value="179 Assets">179 Assets</MenuItem>
              <MenuItem value="Bonus Depreciation Assets">
                Bonus Depreciation Assets
              </MenuItem>
            </TextField>
            <TextField
              label="Depreciation Method"
              select
              fullWidth
              required
              margin="dense"
              value={newAsset.depreciation_method}
              onChange={(e) =>
                setNewAsset({
                  ...newAsset,
                  depreciation_method: e.target.value,
                })
              }
            >
              <MenuItem value="MACRS">MACRS</MenuItem>
              <MenuItem value="Straight-Line">Straight-Line</MenuItem>
            </TextField>
            <TextField
              label="Useful Life (years)"
              type="number"
              fullWidth
              required
              margin="dense"
              value={newAsset.useful_life}
              onChange={(e) =>
                setNewAsset({
                  ...newAsset,
                  useful_life: e.target.value,
                })
              }
            />
            <TextField
              label="Description"
              multiline
              rows={2}
              fullWidth
              margin="dense"
              value={newAsset.description}
              onChange={(e) =>
                setNewAsset({
                  ...newAsset,
                  description: e.target.value,
                })
              }
            />
            <Button
              type="submit"
              variant="contained"
              color="success"
              fullWidth
              sx={{ mt: 2 }}
            >
              Save Asset
            </Button>
          </form>
        </Box>
      </Modal>

      {/* Import CSV Modal */}
      <ImportAssetsModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
      />

      {/* Success Snackbar */}
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
          Asset saved successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
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
