/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { LinearProgress, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography, FormControl, InputLabel, Select, MenuItem, IconButton, TableHead, TableRow, Table, TableCell, TableBody, } from "@mui/material";
import { Search, UploadFile, CloseRounded } from "@mui/icons-material";
import axiosInstance from "../Helper/AxiosInstance";
import DataTable from "../Components/DataTable";
import CryptoJS from "crypto-js";
import { secretKey } from "../Helper/SecretKey";
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import demo from "../Assets/ColumnNaame.jpg";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import SampleFile from "../Assets/Sample File.csv"
import { useDispatch, useSelector } from "react-redux";
import { addCategory } from "../Redux/CategorySlice";

const AllFiles = () => {
    const [chooseCategory, setChoosecategory] = useState("");
    const [chooseCategoryWise, setChooseCategoryWise] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [refreshData, setRefreshData] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const headerRef = useRef(null);
    const fileInputRef = useRef(null);
    const [openUploadDialog, setOpenUploadDialog] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [error, setError] = useState(false);
    const [addManualDialog, setAddManualDialog] = useState(false);
    const [manualData, setManualData] = useState([{
        name: "",
        email: "",
        phoneNumber: "",
        designation: "",
        address: "",
        companyName: "",
        industryType: "",
    }]);
    const dispatch = useDispatch();
    const categories = useSelector((state) => state.category.categories);


    const decryptToken = (encryptedToken) => {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error("Error decrypting token:", error);
            return null;
        }
    };
    const [otherCategory, setOtherCategory] = useState('');
    const [openOtherCategoryDialog, setOpenOtherCategoryDialog] = useState(false);


    const encryptedToken = sessionStorage.getItem("dc");
    const token = decryptToken(encryptedToken);

    const handleOpenUploadDialog = () => {
        setOpenUploadDialog(true);
    };

    const handleCloseUploadDialog = () => {
        setOpenUploadDialog(false);
        setSelectedFiles([]);
        setChoosecategory("");
        setRefreshData((prev) => !prev);
    };

    const handleOpenaddManualDialog = () => {
        setOpenUploadDialog(false);
        setAddManualDialog(true);
    };

    const handleCloseAddManualDialog = () => {
        setAddManualDialog(false);
    };

    const handleUploadButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        const allowedFiles = files.filter((file) => {
            const fileType = file.name.toLowerCase();
            return fileType.endsWith(".csv") || fileType.endsWith(".xls") || fileType.endsWith(".xlsx");
        });

        if (allowedFiles.length === 0) {
            setErrorMessage("Please select only CSV or Excel files.");
            setError(true);
            return;
        }

        setSelectedFiles(allowedFiles);
    };

    const [uploading, setUploading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [statusType, setStatusType] = useState("");
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);

    const handleSendFiles = async () => {
        setOpenUploadDialog(false);
        setUploading(true);
        setStatusDialogOpen(true);
        setStatusMessage("Uploading files...");
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append("file", file));
        formData.append("category", chooseCategory);

        try {
            await axiosInstance.post("/planotech-inhouse/importCustomers", formData, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            setStatusMessage("Files uploaded successfully!");
            setStatusType("success");
            setSelectedFiles([]);
            setChoosecategory("");
            setRefreshData((prev) => !prev);
        } catch (error) {
            console.error("Upload failed:", error);
            setStatusMessage("File upload failed. Please try again.");
            setStatusType("error");
        } finally {
            setUploading(false);
            setTimeout(() => setStatusDialogOpen(false), 3000);
        }
    };

    const calculateDataTableHeight = () => {
        if (headerRef.current) {
            return `calc(100% - ${headerRef.current.offsetHeight + 16}px)`;
        }
        return "100%";
    };

    const handleManualInputChange = (event, index, field) => {
        const newManualData = [...manualData];
        newManualData[index][field] = event.target.value;
        setManualData(newManualData);
    };

    const handleAddManualRow = () => {
        setManualData([
            ...manualData,
            {
                name: "",
                email: "",
                phoneNumber: "",
                designation: "",
                address: "",
                companyName: "",
                industryType: "",
            },
        ]);
    };

    const handleRemoveManualRow = (index) => {
        const newManualData = [...manualData];
        newManualData.splice(index, 1);
        setManualData(newManualData);
    };

    const handleSaveManualData = async () => {
        setAddManualDialog(false);

        try {
            const customer = {
                ...manualData[0],
                category: chooseCategory,
            };

            await axiosInstance.post("/planotech-inhouse/add/customers", customer, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });

            setStatusMessage("Customers added successfully!");
            setStatusType("success");
            setStatusDialogOpen(true);
            setManualData([{
                name: "", email: "", phoneNumber: "", designation: "", address: "", companyName: "", industryType: "",
            }]);
            setChoosecategory("");
            setRefreshData((prev) => !prev);
        } catch (err) {
            console.error("Error adding customers:", err);
            setStatusMessage("Failed to add customer data manually. Please try again.");
            setStatusType("error");
            setStatusDialogOpen(true);
        } finally {
            setTimeout(() => setStatusDialogOpen(false), 3000);
        }
    };
    const handleSubmit = () => {
        dispatch(addCategory(otherCategory));
        setChoosecategory(otherCategory.trim());
        setOpenOtherCategoryDialog(false);
        setOtherCategory('');
    };


    const handleCategoryChange = (e) => {
        const selected = e.target.value;
        setChoosecategory(selected);

        if (selected === 'Other') {
            setChoosecategory("")
            setOpenOtherCategoryDialog(true);
        } else {
            setOtherCategory('');
            setOpenOtherCategoryDialog(false);
        }
    };

    return (
        <>
            <Box sx={{ width: "100%", height: "100%" }}>
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
                    <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
                        <Grid item xs={12} sm={6} md={6}>
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

                        <Grid item xs={12} sm={6} md={4} >
                            <FormControl fullWidth size="small">
                                <InputLabel id="category-select-label">
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <TuneIcon fontSize="small" />
                                        <Typography sx={{ color: "#a6a6a6", fontWeight: 500 }}>
                                            Filter category wise
                                        </Typography>
                                    </Box>
                                </InputLabel>
                                <Select
                                    labelId="category-choose"
                                    id="category-choose"
                                    value={chooseCategoryWise}
                                    label="choose Category"
                                    onChange={(e) => {
                                        setChooseCategoryWise(e.target.value);
                                    }}
                                >
                                    {[
                                        "Event Clients",
                                        "Vendors",
                                        "Corporate",
                                        "Executive Data",
                                        "Pharma",
                                        "Customer",
                                    ].map((category) => (
                                        <MenuItem key={category} value={category}>
                                            {category}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={12} md={2}>
                            <Button
                                variant="contained"
                                component="span"
                                startIcon={<UploadFile />}
                                onClick={handleOpenUploadDialog}
                                sx={{ fontWeight: 'bold', bgcolor: '#ba343b', '&:hover': { bgcolor: '#9e2b31' } }}
                                fullWidth
                            >
                                Upload Files
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={{ mt: 2 }}>
                    <input
                        type="file"
                        name="file"
                        multiple
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        ref={fileInputRef}
                        accept=".csv,text/csv"
                    />
                    <Dialog
                        open={openUploadDialog}
                        onClose={handleCloseUploadDialog}
                        maxWidth="sm"
                        fullWidth
                        PaperProps={{
                            sx: {
                                background: "linear-gradient(135deg, #ffffff, #f9f9f9)",
                                boxShadow: "0px 10px 25px rgba(0,0,0,0.1)"
                            }
                        }}
                    >
                        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, pt: 2 }}>
                            <Typography variant="h6" sx={{ color: "#ba343b", fontWeight: "bold" }}>
                                File Requirements
                            </Typography>
                            <IconButton onClick={handleCloseUploadDialog}>
                                <CloseRounded sx={{ color: '#ba343b' }} />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent sx={{ px: 3, pt: 0 }}>
                            <Box
                                sx={{
                                    boxShadow: 1,
                                    p: 2,
                                    mb: 3,
                                    borderRadius: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    backgroundColor: "#fff9e6",
                                }}
                            >
                                <InfoOutlinedIcon sx={{ color: "#d32f2f", mr: 2, fontSize: "30px" }} />
                                <Typography variant="body2" sx={{ flexGrow: 1, color: "#5f5f5f" }}>
                                    Before uploading, ensure your file is in <b>CSV format</b> and contains any of the following headers:{" "}
                                    <b>Name, Email, Phone Number, Designation, Address, Company Name, Industry Type.</b>{" "}
                                    Incorrect headers or file format may lead to data processing errors.{" "}
                                    You can{" "}
                                    <a href={SampleFile} download="Sample File.csv" style={{ color: "#1976d2", textDecoration: "underline" }}>
                                        download a Sample File.csv
                                    </a>{" "}
                                    file here to see the expected format.
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    p: 2,
                                    border: "1px dashed #ccc",
                                    borderRadius: "16px",
                                    backgroundColor: "#fafafa",
                                    mb: 2,
                                }}
                            >
                                <FormControl fullWidth size="small">
                                    <InputLabel id="category-select-label">Select Category</InputLabel>
                                    <Select
                                        labelId="category-select"
                                        id="category-select"
                                        value={chooseCategory}
                                        label="Select Category"
                                        onChange={handleCategoryChange}
                                    >
                                        {Array.isArray(categories) &&
                                            categories.map((category) => (
                                                <MenuItem key={category} value={category}>
                                                    {category}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>


                                <Dialog
                                    open={openOtherCategoryDialog}
                                    onClose={() => setOpenOtherCategoryDialog(false)}
                                    maxWidth="sm"
                                    fullWidth
                                >
                                    <DialogTitle sx={{ fontSize: "16px", fontWeight: "bold", color: "#ba343b" }}>Enter Other Category</DialogTitle>
                                    <DialogContent>
                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            label="Other Category"
                                            fullWidth
                                            value={otherCategory}
                                            onChange={(e) => setOtherCategory(e.target.value)}
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={() => setOpenOtherCategoryDialog(false)} sx={{ color: "#ba343b", }}>Cancel</Button>
                                        <Button
                                            onClick={handleSubmit}
                                            variant="outlined"
                                            disabled={!otherCategory.trim()}
                                            sx={{
                                                fontWeight: "bold",
                                                color: "#ba343b",
                                                borderColor: "#ba343b",
                                                borderRadius: "30px",
                                                px: 3,
                                                "&:hover": {
                                                    backgroundColor: "#ba343b",
                                                    color: "white",
                                                },
                                            }}
                                        >
                                            Submit
                                        </Button>
                                    </DialogActions>
                                </Dialog>

                                {selectedFiles.length > 0 && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            mt: 1,
                                            width: "100%",
                                            textAlign: "left",
                                            color: "gray",
                                            fontStyle: "italic",
                                        }}
                                    >
                                        {selectedFiles.length === 1
                                            ? selectedFiles[0].name
                                            : `${selectedFiles.length} files selected`}
                                    </Typography>
                                )}
                            </Box>
                        </DialogContent>

                        <DialogActions
                            sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 2,
                                px: 3,
                                pb: 3,
                            }}
                        >
                            <Button
                                onClick={handleUploadButtonClick}
                                variant="outlined"
                                disabled={!chooseCategory}
                                sx={{
                                    fontWeight: "bold",
                                    color: "#ba343b",
                                    borderColor: "#ba343b",
                                    borderRadius: "30px",
                                    px: 3,
                                    "&:hover": {
                                        backgroundColor: "#ba343b",
                                        color: "white",
                                    },
                                }}
                            >
                                Select Files
                            </Button>

                            <Button
                                onClick={handleOpenaddManualDialog}
                                variant="outlined"
                                disabled={!chooseCategory}
                                sx={{
                                    fontWeight: "bold",
                                    color: "#ba343b",
                                    borderColor: "#ba343b",
                                    borderRadius: "30px",
                                    px: 3,
                                    "&:hover": {
                                        backgroundColor: "#ba343b",
                                        color: "white",
                                    },
                                }}
                            >
                                Add Data Manually
                            </Button>

                            <Button
                                onClick={handleSendFiles}
                                variant="outlined"
                                disabled={!chooseCategory || selectedFiles.length === 0}
                                sx={{
                                    fontWeight: "bold",
                                    color: "#ba343b",
                                    borderColor: "#ba343b",
                                    borderRadius: "30px",
                                    px: 3,
                                    "&:hover": {
                                        backgroundColor: "#ba343b",
                                        color: "white",
                                    },
                                }}
                            >
                                Submit
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>

                <Box sx={{ mt: 2, height: calculateDataTableHeight() }}>
                    <DataTable refreshData={refreshData} searchTerm={searchTerm} category={chooseCategoryWise} data={tableData} />
                </Box>

                <Dialog
                    open={statusDialogOpen}
                    onClose={() => setStatusDialogOpen(false)}
                    fullWidth
                    maxWidth="sm"
                    sx={{ "& .MuiDialog-paper": { width: "450px" } }}
                >
                    <DialogContent sx={{ textAlign: "center", p: 3 }}>
                        {statusType === "success" ? (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                <CheckIcon sx={{ fontSize: 28, color: "#4caf50" }} />
                                <Typography variant="h6" sx={{ fontSize: "18px", fontWeight: "bold" }}>
                                    {statusMessage}
                                </Typography>
                            </Box>
                        ) : statusType === "error" ? (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                <ClearIcon sx={{ fontSize: 28, color: "#f44336" }} />
                                <Typography variant="h6" sx={{ fontSize: "18px", fontWeight: "bold" }}>
                                    {statusMessage}
                                </Typography>
                            </Box>
                        ) : uploading ? (
                            <Typography variant="h6" sx={{ fontSize: "18px", fontWeight: "bold" }}>
                                Uploading File...
                            </Typography>
                        ) : null}

                        {uploading && (
                            <LinearProgress
                                sx={{
                                    mt: 3,
                                    "& .MuiLinearProgress-bar": {
                                        backgroundColor: "#ba343b",
                                    },
                                    backgroundColor: "#ffccd0",
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={addManualDialog}
                    onClose={handleCloseAddManualDialog}
                    maxWidth="lg"
                    fullWidth
                >
                    <DialogTitle sx={{ color: "#ba343b", fontWeight: "bold", fontSize: "18px" }}>Add Customer Manually</DialogTitle>
                    <DialogContent>
                        <Table size="small">
                            <TableHead>
                                <TableRow
                                    sx={{
                                        "& th": {
                                            backgroundColor: "#eaf1f0",
                                            fontWeight: "bold",
                                            height: "35px",
                                            fontSize: "0.8rem",
                                        },
                                    }}
                                >
                                    <TableCell>SL NO</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Designation</TableCell>
                                    <TableCell>Address</TableCell>
                                    <TableCell>Company</TableCell>
                                    <TableCell>Industry</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {manualData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                value={row.name}
                                                onChange={(e) => handleManualInputChange(e, index, "name")}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                value={row.email}
                                                onChange={(e) => handleManualInputChange(e, index, "email")}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                value={row.phoneNumber}
                                                onChange={(e) => handleManualInputChange(e, index, "phoneNumber")}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                value={row.designation}
                                                onChange={(e) => handleManualInputChange(e, index, "designation")}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                value={row.address}
                                                onChange={(e) => handleManualInputChange(e, index, "address")}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                value={row.companyName}
                                                onChange={(e) => handleManualInputChange(e, index, "companyName")}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                value={row.industryType}
                                                onChange={(e) => handleManualInputChange(e, index, "industryType")}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleRemoveManualRow(index)}
                                                color="error">
                                                <CloseRounded />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Box mt={2}>
                            <Button sx={{ color: "#ba343b", fontWeight: "bold" }}
                                onClick={handleAddManualRow}
                            >
                                Add Row
                            </Button>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseAddManualDialog} sx={{ color: "#ba343b" }}>Cancel</Button>
                        <Button
                            variant="contained"
                            sx={{ borderRadius: "20px", bgcolor: '#ba343b', '&:hover': { bgcolor: '#9e2b31' } }}
                            onClick={handleSaveManualData}
                        >
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    );
};

export default AllFiles;