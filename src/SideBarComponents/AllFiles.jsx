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
} from "@mui/material";
import { Search, UploadFile, CloseRounded } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../Helper/AxiosInstance";
import DataTable from "../Components/DataTable";
import CryptoJS from "crypto-js";
import { secretKey } from "../Helper/SecretKey";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import demo from "../Assets/ColumnNaame.jpg";

const AllFiles = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const headerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [chooseCategory,setChoosecategory] = useState(false);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (chooseCategory) { // Use chooseCategory here
          const response = await axiosInstance.get(
            `/planotech-inhouse/get/data/category?category=${chooseCategory}`,
            {
              headers: {
                Authorization: `Bearer ${decryptToken(
                  sessionStorage.getItem("dc")
                )}`,
              },
            }
          );
          setTableData(response.data);
        } else {
          setTableData([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data.");
      }
    };
    fetchData();
  }, [chooseCategory, refreshData]); // Use chooseCategory as dependency

  useEffect(() => {
    setRefreshData((prev) => !prev);
  }, [selectedCategory]);

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

  const handleUploadButtonClick = () => {
    if (!chooseCategory) {
      toast.error("Please select a category first.");
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
      toast.error("Please select only CSV or Excel files.");
      return;
    }

    setSelectedFiles(allowedFiles);
  };

  const handleSendFiles = async () => {
    if (!selectedCategory) {
      toast.error("Please select a category before uploading.");
      return;
    }
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload.");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("file", file));
    formData.append("category", selectedCategory);

    try {
      await axiosInstance.post("/planotech-inhouse/importCustomers", formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Files uploaded successfully!");
      setOpenUploadDialog(false);
      setSelectedFiles([]);
      setSelectedCategory("");
      setRefreshData((prev) => !prev);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("File upload failed. Please try again.");
    }
  };

  const calculateDataTableHeight = () => {
    if (headerRef.current) {
      return `calc(100% - ${headerRef.current.offsetHeight + 16}px)`;
    }
    return "100%";
  };

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
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
          <Box sx={{
                boxShadow: 1,
                width: "20%",
                ml: "15%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
          <FormControl fullWidth size="small" >
                <InputLabel id="category-select-label">
                  Choose Category
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
              </Box>
          <Box>
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadFile />}
              onClick={handleOpenUploadDialog}
            >
              Upload Files
            </Button>
          </Box>
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
            {/* Alert Box */}
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
                width: "70%",
                ml: "15%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "gray",
                p: 2,
                borderRadius: "16px",
                background: "linear-gradient(145deg, #f3f3f3, #ffffff)",
              }}
            >
              <FormControl fullWidth size="small" >
                <InputLabel id="category-select-label">
                  Select Category
                </InputLabel>
                <Select
                  labelId="category-select"
                  id="category-select"
                  value={selectedCategory}
                  label="Select Category"
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
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
  
            <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', pb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  onClick={handleUploadButtonClick}
                  variant="contained"
                  disabled={!selectedCategory}
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
                onClick={handleSendFiles}
                variant="contained"
                disabled={!selectedCategory || selectedFiles.length === 0}
              >
                Submit
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
  
        <Box sx={{ mt: 2, height: calculateDataTableHeight() }}>
          <DataTable refreshData={refreshData} searchTerm={searchTerm} selectedCategory={selectedCategory} data={tableData}/>
        </Box>
      </Box>
    );
  };
  
  export default AllFiles;