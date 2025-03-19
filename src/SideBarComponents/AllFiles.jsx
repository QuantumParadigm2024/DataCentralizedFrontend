import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  TextField,
} from "@mui/material";
import { Search, UploadFile } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../Helper/AxiosInstance";
import DataTable from "../Components/DataTable";

const AllFiles = () => {
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openTeamDialog, setOpenTeamDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [team, setTeam] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const headerRef = useRef(null);

  const handleOpenCategoryDialog = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    setSelectedFiles(files);
    setOpenCategoryDialog(true);
  };

  const handleCloseCategoryDialog = () => {
    setOpenCategoryDialog(false);
    setSelectedCategory("");
  };

  const handleCloseTeamDialog = () => {
    setOpenTeamDialog(false);
    setTeam("");
    setSelectedFiles([]);
  };

  const handleProceedToTeamDialog = () => {
    if (!selectedCategory) {
      toast.error("Please select a category before proceeding.");
      return;
    }
    setOpenCategoryDialog(false);
    setOpenTeamDialog(true);
  };

  const handleDataFetched = () => {
    setRefreshData((prev) => !prev);
    setDataFetched(true);
  };

  const handleUpload = async () => {
    if (!team) {
      toast.error("Please select a team before uploading.");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("file", file));
    formData.append("category", selectedCategory);
    formData.append("enteredBy", team);

    try {
      await axiosInstance.post("/planotech-inhouse/importCustomers", formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Files uploaded successfully!");
      handleCloseTeamDialog();
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("File upload failed. Please try again.");
    }
  };

  const calculateDataTableHeight = () => {
    if (headerRef.current) {
      return `calc(100% - ${headerRef.current.offsetHeight + 16}px)`; // 16px is approx. for top margin of datatable
    }
    return '100%';
  };

  return (
    <Box sx={{ width: "100%", height: "100%", }}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <Box
        ref={headerRef}
        sx={{
          top: 0,
          zIndex: 100,
          background: "#fff",
          p: 2,
          boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
          borderRadius: "8px",
        }}
      >
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item xs={10} sm={8} md={6}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search files and folders"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: "gray", mr: 1 }} />,
                sx: { borderRadius: 5 },
              }}
            />
          </Grid>

          <Box>
            <label htmlFor="file-upload">
              <Button variant="contained" component="span" startIcon={<UploadFile />}>
                Upload Files
              </Button>
            </label>
          </Box>
        </Grid>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <input
            type="file"
            name="file"
            multiple
            onChange={handleOpenCategoryDialog}
            style={{ display: "none" }}
            id="file-upload"
          />
        </Grid>

        {!dataFetched && (
          <Button variant="contained" color="primary" onClick={handleDataFetched}>
            Get All Files Data
          </Button>
        )}

        <Dialog open={openCategoryDialog} onClose={handleCloseCategoryDialog} fullWidth maxWidth="sm">
          <DialogTitle>Select Category</DialogTitle>
          <DialogContent>
            <FormControl component="fieldset">
              <RadioGroup value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {[
                  "Event Clients",
                  "Venders",
                  "Corporate",
                  "Executive Data",
                  "Pharma",
                  "Customer",
                  "Other",
                ].map((category) => (
                  <FormControlLabel key={category} value={category} control={<Radio />} label={category} />
                ))}
              </RadioGroup>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCategoryDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleProceedToTeamDialog} variant="contained" disabled={!selectedCategory}>
              Next
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openTeamDialog} onClose={handleCloseTeamDialog} fullWidth maxWidth="sm">
          <DialogTitle>Select Team</DialogTitle>
          <DialogContent>
            <FormControl component="fieldset">
              <RadioGroup value={team} onChange={(e) => setTeam(e.target.value)}>
                {["IT team", "Design team", "Marketing team", "Audio Fusion", "Other"].map((enteredBy) => (
                  <FormControlLabel key={enteredBy} value={enteredBy} control={<Radio />} label={enteredBy} />
                ))}
              </RadioGroup>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseTeamDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleUpload} variant="contained" disabled={!team}>
              Upload
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      <Box sx={{ mt: 2, height: calculateDataTableHeight() }}>
        <DataTable refreshData={refreshData} searchTerm={searchTerm} />
      </Box>
    </Box>
  );
};

export default AllFiles;