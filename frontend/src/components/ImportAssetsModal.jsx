import { useState } from "react";
import Papa from "papaparse";
import {
  Modal,
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from "@mui/material";

function ImportAssetsModal({ open, onClose, onImport }) {
  const [csvRows, setCsvRows] = useState([]);

  // 1. Handle file selection and parse CSV
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvRows(results.data);
      }
    });
  };

  // 2. When user confirms, call onImport with parsed rows
  const handleImportClick = () => {
    onImport(csvRows);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ /* your styling here */ p: 4, bgcolor: "background.paper", mx: "auto", my: "10%", width: 600 }}>
        <Typography variant="h6" gutterBottom>
          Import Assets from CSV
        </Typography>

        {/* File input */}
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
        />

        {/* 3. Preview table if rows exist */}
        {csvRows.length > 0 && (
          <Table size="small" sx={{ mt: 2, maxHeight: 300, overflow: "auto" }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>Purchase Date</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Useful Life</TableCell>
                <TableCell>Depreciation Method</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {csvRows.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.Name}</TableCell>
                  <TableCell>{row.Cost}</TableCell>
                  <TableCell>{row["Purchase Date"]}</TableCell>
                  <TableCell>{row.Category}</TableCell>
                  <TableCell>{row["Useful Life"]}</TableCell>
                  <TableCell>{row["Depreciation Method"]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Import & Cancel buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 2 }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleImportClick}
            disabled={csvRows.length === 0}
          >
            Import {csvRows.length} Rows
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default ImportAssetsModal;
