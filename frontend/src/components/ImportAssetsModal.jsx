import { useState } from "react";
import Papa from "papaparse";
import {
  Modal,
  Box,
  Button,
  Input,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

function ImportAssetsModal({ open, onClose, onImport }) {
  const [csvRows, setCsvRows] = useState([]);

  // Parse CSV on file select
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvRows(results.data);
      },
    });
  };

  // When user clicks “Import”
  const handleImportClick = () => {
    onImport(csvRows);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Import Assets from CSV
        </Typography>

        {/* Hidden Input + Label/Button */}
        <Input
          accept=".csv"
          id="csv-file-input"
          type="file"
          onChange={handleFileChange}
          sx={{ display: "none" }}
        />
        <label htmlFor="csv-file-input">
          <Button variant="outlined" component="span" sx={{ mb: 2 }}>
            Select CSV File
          </Button>
        </label>

        {/* Preview */}
        {csvRows.length > 0 && (
          <Table size="small" sx={{ mb: 2, maxHeight: 300, overflow: "auto" }}>
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
              {csvRows.map((row, i) => (
                <TableRow key={i}>
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

        {/* Actions */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleImportClick}
            disabled={csvRows.length === 0}
          >
            Import {csvRows.length} Row{csvRows.length !== 1 ? "s" : ""}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default ImportAssetsModal;
