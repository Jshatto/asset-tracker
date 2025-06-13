import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getAssets, createAsset } from "../services/assetService";
import {
  Modal,
  Box,
  Button,
  TextField,
  MenuItem,
  Typography
} from "@mui/material";



export default function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState("");
  const [newAsset, setNewAsset] = useState({
    name: "",
    cost: "",
    purchase_date: "",
  });
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);


  useEffect(() => {
    async function fetchAssets() {
      try {
        const data = await getAssets();
        setAssets(data);
      } catch (err) {
        setError("Failed to load assets.");
      }
    }

    fetchAssets();
  }, []);

  const handleCreateAsset = async (e) => {
  e.preventDefault();
  try {
    await createAsset(newAsset);
    setNewAsset({ name: "", cost: "", purchase_date: "" });
    const updated = await getAssets();
    setAssets(updated);
  } catch (err) {
    console.error("❌ Asset creation failed:", err.response?.data || err.message);
    alert("Failed to add asset");
  }
};


  return (
    <>
      <Navbar />
      <div style={{ padding: "2rem" }}>
        <h2>Welcome to your Dashboard</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ marginBottom: "1rem" }}>
          <label>
            Filter by Year:{" "}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">All</option>
              {[...new Set(assets.map((a) => new Date(a.purchase_date).getFullYear()))]
                .sort((a, b) => b - a)
                .map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
            </select>
          </label>

          <label style={{ marginLeft: "1rem" }}>
            Filter Assets:{" "}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All</option>
              <option value="179 Assets">179 Assets</option>
              <option value="Bonus Depreciation Assets">Bonus Depreciation Assets</option>
              <option value="Standard Depreciation">Standard Depreciation</option>
              
            </select>
          </label>

          <label style={{ marginLeft: "1rem" }}>
  Sort By:{" "}
  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
    <option value="">None</option>
    <option value="name-asc">Name (A–Z)</option>
    <option value="name-desc">Name (Z–A)</option>
    <option value="cost-asc">Cost (Low → High)</option>
    <option value="cost-desc">Cost (High → Low)</option>
    <option value="method">Depreciation Method</option>
  </select>
</label>

 <input
  type="text"
  placeholder="Search by name or category"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  style={{ marginLeft: "1rem", padding: "0.5rem" }}
/>

        </div>

        {assets.length === 0 ? (
          <p>No assets found.</p>
        ) : (
          <ul>
         {assets
  .filter((asset) => {
  const matchesYear =
    !selectedYear ||
    new Date(asset.purchase_date).getFullYear().toString() === selectedYear;

  const matchesCategory =
    !selectedCategory || asset.category === selectedCategory;

  const matchesSearch =
    !searchTerm ||
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (asset.category?.toLowerCase() || "").includes(searchTerm.toLowerCase());

  return matchesYear && matchesCategory && matchesSearch;
})

  .sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "cost-asc":
        return a.cost - b.cost;
      case "cost-desc":
        return b.cost - a.cost;
      case "method":
        return (a.depreciation_method || "").localeCompare(
          b.depreciation_method || ""
        );
      default:
        return 0;
    }
  })
  .map((asset) => (
    <li key={asset.id}>
      <strong>{asset.name}</strong> — ${asset.cost}
      <br />
      Method: {asset.depreciation_method || "N/A"} <br />
      Depreciation: ${asset.accumulated_depreciation}
    </li>
  ))}

          </ul>
        )}

        <Button variant="contained" color="primary" onClick={() => setShowModal(true)}>
  + Add Asset
</Button>

<Modal open={showModal} onClose={() => setShowModal(false)}>
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 400,
      bgcolor: "background.paper",
      borderRadius: "8px",
      boxShadow: 24,
      p: 4,
    }}
  >
    <Typography variant="h6" gutterBottom>
      Add New Asset
    </Typography>

    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await createAsset(newAsset);
          setNewAsset({ name: "", cost: "", purchase_date: "", category: "", depreciation_method: "", useful_life: "", description: "" });
          const updated = await getAssets();
          setAssets(updated);
          setShowModal(false);
        } catch (err) {
          alert("Error creating asset");
        }
      }}
    >
      <TextField label="Name" fullWidth required margin="dense" value={newAsset.name} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} />
      <TextField label="Purchase Price" type="number" fullWidth required margin="dense" value={newAsset.cost} onChange={(e) => setNewAsset({ ...newAsset, cost: e.target.value })} />
      <TextField label="Purchase Date" type="date" fullWidth required margin="dense" InputLabelProps={{ shrink: true }} value={newAsset.purchase_date} onChange={(e) => setNewAsset({ ...newAsset, purchase_date: e.target.value })} />
      <TextField label="Category" select fullWidth required margin="dense" value={newAsset.category || ""} onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}>
        <MenuItem value="Machinery and Equipment">Machinery and Equipment</MenuItem>
        <MenuItem value="Vehicles">Vehicles</MenuItem>
        <MenuItem value="Furniture">Furniture</MenuItem>
        <MenuItem value="Intangibles">Intangibles</MenuItem>
      </TextField>
      <TextField label="Depreciation Method" select fullWidth required margin="dense" value={newAsset.depreciation_method || ""} onChange={(e) => setNewAsset({ ...newAsset, depreciation_method: e.target.value })}>
        <MenuItem value="MACRS">MACRS</MenuItem>
        <MenuItem value="Straight-Line">Straight-Line</MenuItem>
      </TextField>
      <TextField label="Useful Life (years)" type="number" fullWidth required margin="dense" value={newAsset.useful_life || ""} onChange={(e) => setNewAsset({ ...newAsset, useful_life: e.target.value })} />
      <TextField label="Description" fullWidth multiline rows={2} margin="dense" value={newAsset.description || ""} onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })} />
      <Button type="submit" variant="contained" color="success" fullWidth sx={{ mt: 2 }}>Save Asset</Button>
    </form>
  </Box>
</Modal>

      </div>
    </>
  );
}
