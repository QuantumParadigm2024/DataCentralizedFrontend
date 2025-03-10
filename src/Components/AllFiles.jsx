import React, { useState } from "react";
import {
    Box, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, RadioGroup, FormControlLabel, Radio, Grid,
    TextField
} from "@mui/material";
import { Search, UploadFile } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../utils/axiosInstance";
import DataTable from "./DataTable";

const AllFiles = () => {
    const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
    const [openTeamDialog, setOpenTeamDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [team, setTeam] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [refreshData, setRefreshData] = useState(false); // Fetch data only when button is clicked

    // Open category selection popup
    const handleOpenCategoryDialog = (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;
        setSelectedFiles(files);
        setOpenCategoryDialog(true);
    };

    // Close category popup
    const handleCloseCategoryDialog = () => {
        setOpenCategoryDialog(false);
        setSelectedCategory("");
    };

    // Close team popup
    const handleCloseTeamDialog = () => {
        setOpenTeamDialog(false);
        setTeam("");
        setSelectedFiles([]);
    };

    // Handle category selection and proceed to team selection
    const handleProceedToTeamDialog = () => {
        if (!selectedCategory) {
            toast.error("Please select a category before proceeding.");
            return;
        }
        setOpenCategoryDialog(false);
        setOpenTeamDialog(true);
    };

    // Final file upload function
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
                    "Accept": "application/json",
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

    return (
        <Box sx={{ width: "100%", p: 2 }}>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
            <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Grid item xs={10} sm={8} md={6}>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search files and folders"
                        fullWidth
                        InputProps={{
                            startAdornment: (<Search sx={{ color: "gray", mr: 1 }} />),
                            sx: { borderRadius: 5 }
                        }}
                    />
                </Grid>

                {/* Upload Files button moved to top-right */}
                <Grid item>
                    <label htmlFor="file-upload">
                        <Button variant="contained" component="span" startIcon={<UploadFile />}>
                            Upload Files
                        </Button>
                    </label>
                </Grid>
            </Grid>

            <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", fontSize: "18px" }}>All Files</Typography>

                <input
                    type="file"
                    name="file"
                    multiple
                    onChange={handleOpenCategoryDialog}
                    style={{ display: "none" }}
                    id="file-upload"
                />

            </Grid>

            {/* Fetch Data Button */}
            <Button variant="contained" color="primary" onClick={() => setRefreshData((prev) => !prev)}>
                All Data
            </Button>

            {/* Category Selection Dialog */}
            <Dialog open={openCategoryDialog} onClose={handleCloseCategoryDialog} fullWidth maxWidth="sm">
                <DialogTitle>Select Category</DialogTitle>
                <DialogContent>
                    <FormControl component="fieldset">
                        <RadioGroup value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                            {["Event Clients", "Venders", "Corporate", "Executive Data", "Pharma", "Customer", "Other"].map((category) => (
                                <FormControlLabel key={category} value={category} control={<Radio />} label={category} />
                            ))}
                        </RadioGroup>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCategoryDialog} color="secondary">Cancel</Button>
                    <Button onClick={handleProceedToTeamDialog} variant="contained" disabled={!selectedCategory}>
                        Next
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Team Selection Dialog */}
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
                    <Button onClick={handleCloseTeamDialog} color="secondary">Cancel</Button>
                    <Button onClick={handleUpload} variant="contained" disabled={!team}>
                        Upload
                    </Button>
                </DialogActions>
            </Dialog>

            <Box>
                <DataTable refreshData={refreshData} />
            </Box>
        </Box>
    );
};

export default AllFiles;
