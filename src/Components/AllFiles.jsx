import React, { useState } from "react";
import {
    Box, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, RadioGroup, FormControlLabel, Radio, Grid
} from "@mui/material";
import { UploadFile } from "@mui/icons-material";
import axiosInstance from "../utils/axiosInstance"; // Ensure this file exists

const AllFiles = () => {
    const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
    const [openTeamDialog, setOpenTeamDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [team, setTeam] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);

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
        setSelectedFiles([]); // Clear files after successful upload
    };

    // Handle category selection and proceed to team selection
    const handleProceedToTeamDialog = () => {
        if (!selectedCategory) {
            alert("Please select a category before proceeding.");
            return;
        }
        setOpenCategoryDialog(false); // Close category dialog
        setOpenTeamDialog(true); // Open team selection dialog
    };

    // Final file upload function
    const handleUpload = async () => {
        if (!team) {
            alert("Please select a team before uploading.");
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

            alert("Files uploaded successfully!");
            handleCloseTeamDialog(); // Close team dialog after upload
        } catch (error) {
            console.error("Upload failed:", error);
            alert("File upload failed. Please try again.");
        }
    };

    return (
        <Box sx={{ width: "100%", p: 2 }}>
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
                <label htmlFor="file-upload">
                    <Button variant="contained" component="span" startIcon={<UploadFile />}>
                        Upload Files
                    </Button>
                </label>
            </Grid>

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
        </Box>
    );
};

export default AllFiles;
