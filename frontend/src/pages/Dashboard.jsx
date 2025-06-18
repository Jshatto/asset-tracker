import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Snackbar,
  Alert
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import ImportAssetsModal from "../components/ImportAssetsModal";
import AddAssetModal from "../components/AddAssetModal";
import EditAssetModal from "../components/EditAssetModal";
import EditIcon from '@mui/icons-material/Edit';

function Dashboard() {
  const { token } = useAuth();

  // State
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1, limit: 10 });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [sortOption, setSortOption] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Snackbars
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch assets (paginated)
  const refreshAssets = async (pageNum = page) => {
    setLoading(true);
    try {
      const limitVal = meta?.limit ?? 10;
      const res = await axios.get(
        `/api/assets?page=${pageNum}&limit=${limitVal}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Determine data array
      const fetched = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
        ? res.data.data
        : [];

      setAssets(fetched);

      if (res.data.meta) {
        setMeta(res.data.meta);
      }
    } catch (err) {
      console.error("Error refreshing assets", err);
      setErrorMessage(err.response?.data?.message || err.message);
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAssets(page);
  }, [token, page]);

  // Filter & Sort
  const getFilteredAssets = () => {
    const base = Array.isArray(assets) ? assets : [];
    let filtered = [...base];

    if (search) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(asset => asset.category === categoryFilter);
    }

    if (yearFilter) {
      filtered = filtered.filter(
        asset =>
          new Date(asset.purchase_date).getFullYear().toString() ===
          yearFilter
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

  // Depreciation schedule for chart
  const chartData = (() => {
    const sched = {};
    getFilteredAssets().forEach(asset => {
      const annual = parseFloat(asset.cost) / Number(asset.useful_life);
      const start = new Date(asset.purchase_date).getFullYear();

      for (let i = 0; i < asset.useful_life; i++) {
        const year = start + i;
        sched[year] = (sched[year] || 0) + annual;
      }
    });

    return Object.entries(sched)
      .map(([year, dep]) => ({ year, depreciation: +dep.toFixed(2) }))
      .sort((a, b) => a.year - b.year);
  })();

  // Grouped tables data
  const grouped = (() => {
    const groups = {};
    getFilteredAssets().forEach(asset => {
      const key = asset.category || "Uncategorized";
      groups[key] = groups[key] || [];
      groups[key].push(asset);
    });
    return groups;
  })();

  // Handlers
  const handleDelete = async id => {
    if (!window.confirm("Archive this asset?")) return;
    try {
      await axios.delete(`/api/assets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      refreshAssets(page);
      setSuccessOpen(true);
    } catch (err) {
      console.error("Delete error:", err);
      setErrorMessage(err.response?.data?.message || err.message);
      setErrorOpen(true);
    }
  };

  const handleEditClick = asset => {
    setSelectedAsset(asset);
    setShowEditModal(true);
  };

  const handleUpdate = updated => {
    setAssets(prev => prev.map(a => (a.id === updated.id ? updated : a)));
    setSuccessOpen(true);
  };

  const handleExport = async () => {
    try {
      const res = await axios.get("/api/assets/export", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob"
      });
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "assets.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      setErrorMessage(err.response?.data?.message || err.message);
      setErrorOpen(true);
    }
  };

  // Unique years for filter
  const purchaseYears = Array.isArray(assets)
    ? Array.from(
        new Set(
          assets.map(a => new Date(a.purchase_date).getFullYear().toString())
        )
      )
    : [];

  return (
    <Box sx={{ p: 2, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        📊 Asset Dashboard
      </Typography>

      {/* Controls */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        <TextField
          label="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <TextField
          label="Category"
          select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
        </TextField>
        <TextField
          label="Year"
          select
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {purchaseYears.map(yr => (
            <MenuItem key={yr} value={yr}>
              {yr}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Sort"
          select
          value={sortOption}
          onChange={e => setSortOption(e.target.value)}
        >
          <MenuItem value="">None</MenuItem>
        </TextField>
        <Button variant="contained" onClick={() => setShowAddModal(true)}>
          ➕ Add Asset
        </Button>
        <Button variant="outlined" onClick={() => setImportModalOpen(true)}>
          📥 Import Assets
        </Button>
        <Button variant="outlined" onClick={handleExport}>
          📤 Download CSV
        </Button>
      </Box>

      {/* Grouped Tables by Category */}
      {loading ? (
        <Typography>Loading assets…</Typography>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <Box key={category} sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {category}
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Cost</TableCell>
                  <TableCell>Purchase Date</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Life (yrs)</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(items || []).map(asset => (
                  <TableRow key={asset.id}>
                    <TableCell>{asset.name}</TableCell>
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
          </Box>
        ))
      )}

      {/* Depreciation Chart */}
      <Box sx={{ height: 300, mb: 4 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="depreciation"
              stroke="#8884d8"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Pagination Controls */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 1 }}>
        <Button
          disabled={page <= 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
        >
          Previous
        </Button>
        <Typography sx={{ alignSelf: "center" }}>
          Page {meta?.page ?? 1} of {meta?.pages ?? 1}
        </Typography>
        <Button
          disabled={page >= (meta?.pages ?? 1)}
          onClick={() => setPage(p => Math.min(meta?.pages ?? 1, p + 1))}
        >
          Next
        </Button>
      </Box>

      {/* Modals & Snackbars */}
      <AddAssetModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={asset => { setAssets(prev => [...prev, asset]); setSuccessOpen(true); }}
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
        onImport={async rows => {
          await axios.post(
            "/api/assets/import",
            rows,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          refreshAssets(page);
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
