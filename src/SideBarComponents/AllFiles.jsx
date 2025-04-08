/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    TableHead,
    TableRow,
    Table,
    TableCell,
    TableBody,
} from "@mui/material";
import { Search, UploadFile, CloseRounded } from "@mui/icons-material";
import axiosInstance from "../Helper/AxiosInstance";
import DataTable from "../Components/DataTable";
import CryptoJS from "crypto-js";
import { secretKey } from "../Helper/SecretKey";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import demo from "../Assets/ColumnNaame.jpg";

const AllFiles = () => {
    const [chooseCategory, setChoosecategory] = useState(""); // Initialize as empty string
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [refreshData, setRefreshData] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const headerRef = useRef(null);
    const fileInputRef = useRef(null);
    const [openUploadDialog, setOpenUploadDialog] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
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

    const decryptToken = (encryptedToken) => {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error("Error decrypting token:", error);
            return null;
        }
    };

    const encryptedToken = sessionStorage.getItem("dc");
    const token = decryptToken(encryptedToken);

    const handleOpenUploadDialog = () => {
        setOpenUploadDialog(true);
    };
    const handleCloseUploadDialog = () => {
        setOpenUploadDialog(false);
    };

    const handleOpenaddManualDialog = () => {
        handleCloseUploadDialog(false);
        setAddManualDialog(true);
    };
    const handleCloseAddManualDialog = () => {
        setAddManualDialog(false);
    };

    const handleUploadButtonClick = () => {
        if (!chooseCategory) {
            setErrorMessage("Please select a category first.");
            setError(true);
            return;
        }
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

    const handleSendFiles = async () => {
        if (!chooseCategory) {
            setErrorMessage("Please select a category before uploading.");
            setError(true);
            return;
        }
        if (selectedFiles.length === 0) {
            setErrorMessage("Please select files to upload.");
            setError(true);
            return;
        }

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

            setSuccessMessage(" ✅ Files uploaded successfully!");
            setSuccess(true);
            setOpenUploadDialog(false);
            setSelectedFiles([]);
            setChoosecategory("");
            setRefreshData((prev) => !prev);
        } catch (error) {
            console.error("Upload failed:", error);
            setErrorMessage("File upload failed. Please try again.");
            setError(true);
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
        if (!chooseCategory) {
            setErrorMessage("Please select a category before saving manual data.");
            setError(true);
            return;
        }
        try {
            const customer = {
                ...manualData[0],
                category: chooseCategory,
            };

            const response = await axiosInstance.post(
                "/planotech-inhouse/add/customers",
                customer,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                }
            );

            console.log("response", response);
            setSuccessMessage("✅ Customers added successfully!");
            setSuccess(true);
            setAddManualDialog(false);
            setManualData([
                {
                    name: "",
                    email: "",
                    phoneNumber: "",
                    designation: "",
                    address: "",
                    companyName: "",
                    industryType: "",
                }
            ]);
            setRefreshData((prev) => !prev);
            setChoosecategory("");  
        } catch (err) {
            console.error("Error adding customers:", err);
            setErrorMessage("❌ Failed to add customer data manually. Please try again.");
            setError(true);
        }
    };

    return (
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
                                See Category Wise
                            </InputLabel>
                            <Select
                                labelId="category-choose"
                                id="category-choose"
                                value={chooseCategory}
                                label="choose Category"
                                onChange={(e) => {
                                    setChoosecategory(e.target.value);
                                }}
                            >
                                {[
                                    "Event Clients",
                                    "Venders",
                                    "Corporate",
                                    "Executive Data",
                                    "Pharma",
                                    "Customer",
                                    "Other",
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
                            sx={{ bgcolor: '#ba343b', '&:hover': { bgcolor: '#9e2b31' } }}
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
                    accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                />

                <Dialog
                    open={openUploadDialog}
                    onClose={handleCloseUploadDialog}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
                        <span>File Requirements</span>
                        <IconButton onClick={handleCloseUploadDialog} color="primary">
                            <CloseRounded sx={{ color: 'black' }} />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Box
                            sx={{
                                boxShadow: 2,
                                p: 2,
                                mb: 3,
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: "#FFF3CD",
                            }}
                        >
                            <ReportProblemRoundedIcon
                                sx={{ color: "red", mr: 2, fontSize: "60px" }}
                            />
                            <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                Before uploading, ensure your file contains any of the following headers:
                                Name, Email, Phone Number, Category, Designation, Address, Company Name, Industry Type, Entry Date, Entered by.
                                Incorrect headers may lead to data processing errors
                            </Typography>
                        </Box>

                        {demo && (
                            <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
                                <img
                                    src={demo}
                                    alt="Demo file format"
                                    style={{ maxWidth: "100%", borderRadius: "8px" }}
                                />
                            </Box>
                        )}

                        <Box
                            sx={{
                                boxShadow: 3,
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                color: "gray",
                                p: 2,
                                borderRadius: "16px",
                                background: "linear-gradient(145deg, #f3f3f3, #ffffff)",
                                mb: 2, // Add some margin below the category select
                            }}
                        >
                            <FormControl fullWidth size="small">
                                <InputLabel id="category-select-label">
                                    Select Category
                                </InputLabel>
                                <Select
                                    labelId="category-select"
                                    id="category-select"
                                    value={chooseCategory}
                                    label="Select Category"
                                    onChange={(e) => {
                                        setChoosecategory(e.target.value);
                                        setRefreshData((prev) => !prev);
                                    }}
                                >
                                    {[
                                        "Event Clients",
                                        "Venders",
                                        "Corporate",
                                        "Executive Data",
                                        "Pharma",
                                        "Customer",
                                        "Other",
                                    ].map((category) => (
                                        <MenuItem key={category} value={category}>
                                            {category}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </DialogContent>

                    <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', pb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: 'auto' }, marginBottom: { xs: '10px', sm: '0px' } }}>
                            <Button
                                onClick={handleUploadButtonClick}
                                variant="contained"
                                disabled={!chooseCategory}
                                sx={{ bgcolor: '#ba343b', '&:hover': { bgcolor: '#9e2b31' } }}
                            >
                                Select Files
                            </Button>
                            <Box>
                                {selectedFiles.length > 0 && (
                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                        {selectedFiles.length === 1
                                            ? selectedFiles[0].name
                                            : `${selectedFiles.length} files selected`}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        <Button
                            onClick={handleOpenaddManualDialog}
                            variant="contained"
                            disabled={!chooseCategory}
                            sx={{ bgcolor: '#ba343b', '&:hover': { bgcolor: '#9e2b31' } }}
                        >
                            Add Data Manually
                        </Button>
                        <Button
                            onClick={handleSendFiles}
                            variant="contained"
                            disabled={!chooseCategory || selectedFiles.length === 0}
                            sx={{ bgcolor: '#ba343b', '&:hover': { bgcolor: '#9e2b31' } }}
                            fullWidth={{ xs: true, sm: false }}
                        >
                            Submit
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>

            <Box sx={{ mt: 2, height: calculateDataTableHeight() }}>
                <DataTable refreshData={refreshData} searchTerm={searchTerm} category={chooseCategory} data={tableData} />
            </Box>
            <Dialog open={success}
                onClose={() => setSuccess(false)}
                fullWidth
                maxWidth="sm"
                sx={{ "& .MuiDialog-paper": { width: "400px" } }}
            >
                <DialogContent sx={{ textAlign: "center", p: 1 }}>
                    <Typography variant="h6">{successMessage}</Typography>
                </DialogContent>
            </Dialog>
            <Dialog open={error}
                onClose={() => setError(false)}
                fullWidth
                maxWidth="sm"
                sx={{ "& .MuiDialog-paper": { width: "400px" } }}

            >
                <DialogContent sx={{ textAlign: "center", p: 1 }}>
                    <Typography variant="h6" color="error">{errorMessage}</Typography>
                </DialogContent>
            </Dialog>

            <Dialog
                open={addManualDialog}
                onClose={handleCloseAddManualDialog}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>Add Customer Manually</DialogTitle>
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
                            <Button
                                onClick={handleAddManualRow}
                            >
                                Add Row
                            </Button>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseAddManualDialog}>Cancel</Button>
                        <Button
                            variant="contained"
                            sx={{ bgcolor: '#ba343b', '&:hover': { bgcolor: '#9e2b31' } }}
                            onClick={handleSaveManualData}
                            disabled={!chooseCategory}
                        >
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    };
    
    export default AllFiles;