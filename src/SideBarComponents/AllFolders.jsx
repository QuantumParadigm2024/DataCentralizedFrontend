/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Box, Button, Grid, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Typography, List, ListItem, ListItemText, ToggleButton, ToggleButtonGroup, Card, CardContent, Tooltip, Input, IconButton } from "@mui/material";
import { Search, ViewList, GridView, Folder as FolderIcon, UploadFile } from "@mui/icons-material";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import axiosInstance from "../Helper/AxiosInstance";
import { toast, ToastContainer } from "react-toastify";
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import CryptoJS from 'crypto-js';
import { secretKey } from '../Helper/SecretKey';
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import FolderZipIcon from '@mui/icons-material/FolderZip';

const AllFolders = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [open, setOpen] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [folders, setFolders] = useState([]);
    const [viewMode, setViewMode] = useState("list");
    const [openFolder, setOpenFolder] = useState(null);
    const [files, setFiles] = useState({});
    const pageSize = 10;
    const [pageNo, setPageNo] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const decryptToken = (encryptedToken) => {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('Error decrypting token:', error);
            return null;
        }
    };

    const encryptedToken = sessionStorage.getItem("dc");
    const token = decryptToken(encryptedToken);

    useEffect(() => {
        fetchFolders();
    }, []);

    const fetchFolders = async (newPageNo = pageNo) => {
        try {
            const response = await axiosInstance.get(`/planotech-inhouse/getFolders`, {
                params: {
                    pageNo: newPageNo,
                    pageSize: pageSize
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const fetchedFolders = response.data.content || [];
            setFolders(fetchedFolders);
            setTotalPages(response.data.totalPages || Math.ceil(fetchedFolders.length / pageSize));
            setPageNo(newPageNo);
        } catch (error) {
            console.error("Error fetching folders:", error);
        }
    };

    const handleNextPage = () => {
        if (pageNo < totalPages - 1) fetchFolders(pageNo + 1);
    };

    const handlePrevPage = () => {
        if (pageNo > 0) fetchFolders(pageNo - 1);
    };

    const handlePageClick = (page) => {
        fetchFolders(page);
    };

    const filteredFolders = folders.filter(folder =>
        folder.folderName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredFiles = openFolder ? (files[openFolder] || []).filter(file =>
        file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        setOpen(false);
        setFolderName("");
    };

    const handleCreateFolder = async () => {
        if (!folderName.trim()) {
            alert("Please enter a folder name");
            return;
        }
        try {
            await axiosInstance.post(`/planotech-inhouse/create/folder/${folderName}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("Folder created successfully");
            setFolderName("");
            handleClose();
            fetchFolders();
        } catch (error) {
            console.error("Error creating folder:", error);
            toast.error("Failed to create folder");
        }
    };

    const handleFolderClick = (entityId) => {
        setOpenFolder(entityId);
    };

    const fetchFiles = async (entityId) => {
        try {
            const response = await axiosInstance.get(`/planotech-inhouse/getFiles?folderId=${entityId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setFiles(prevFiles => ({
                ...prevFiles,
                [entityId]: response.data.files
            }));
        } catch (error) {
            console.error("Error fetching files:", error);
            toast.error(error.response?.data?.message || "Error fetching files");
        }
    };

    useEffect(() => {
        if (openFolder) {
            fetchFiles(openFolder);
        }
    }, [openFolder]);

    const handleFileUpload = async (event, entityId) => {
        const files = event.target.files[0];
        if (!files) return;

        const formData = new FormData();
        formData.append("files", files);

        const toastId = toast.loading("Uploading file...");

        try {
            const response = await axiosInstance.post(`/planotech-inhouse/uploadFile?folderId=${entityId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("File uploaded successfully:", response.data);
            toast.update(toastId, {
                render: "File uploaded successfully",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });

            fetchFiles(entityId);
        } catch (error) {
            console.error("Error uploading file:", error);
            toast.update(toastId, {
                render: "Error uploading file",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        }
    };

    const handleLargeFileUpload = async (event, entityId) => {
        const files = event.target.files[0];
        if (!files) return;

        const formData = new FormData();
        formData.append("files", files);

        const toastId = toast.loading("Uploading file...");

        try {
            const response = await axiosInstance.post(`/planotech-inhouse/upload/largeFile?folderId=${entityId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("File uploaded successfully:", response.data);
            toast.update(toastId, {
                render: "File uploaded successfully",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });

            fetchFiles(entityId);
        } catch (error) {
            console.error("Error uploading file:", error);
            toast.update(toastId, {
                render: "Error uploading file",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        }
    };

    const getFileIcon = (fileName) => {
        if (fileName.endsWith('.pdf')) {
            return <PictureAsPdfIcon sx={{ color: '#de2429' }} />;
        } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
            return <DescriptionIcon sx={{ color: '#2B579A' }} />; // Word Icon (Blue)
        } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
            return <TableChartIcon sx={{ color: '#217346' }} />; // Excel Icon (Green)
        } else if (fileName.endsWith('.csv')) {
            return <InsertChartIcon sx={{ color: '#217346' }} />; // CSV Icon (Green)
        } else if (fileName.endsWith('.zip') || fileName.endsWith('.rar')) {
            return <FolderZipIcon sx={{ color: '#f0a500' }} />; // ZIP Icon (Orange)
        } else {
            return <InsertDriveFileIcon sx={{ color: '#f8d775' }} />; // Default File Icon
        }
    };

    return (
        <>
            <Box>
                <Box
                    sx={{
                        background: "#fff",
                        p: 2,
                        borderRadius: "8px",
                        boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                    }}
                >
                    <Grid container alignItems="center" justifyContent="space-between">
                        <Grid item xs={10} sm={8} md={6}>
                            <TextField
                                variant="outlined"
                                size="small"
                                placeholder={openFolder ? "Search files" : "Search folders"}
                                fullWidth
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <Search sx={{ color: "gray", mr: 1 }} />,
                                    sx: { borderRadius: 5 },
                                }}
                            />
                        </Grid>
                        {!openFolder && (
                            <Grid item xs={12} sm="auto" sx={{ mt: { xs: 1, sm: 0 } }}>
                                <Button variant="contained" startIcon={<CreateNewFolderIcon />} onClick={handleOpen}>
                                    Create Folder
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </Box>

                {/* If a folder is open, show its content */}
                {openFolder ? (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                                {filteredFolders.find(f => f.entityId === openFolder)?.folderName || "Folder"}
                            </Typography>
                            <Box>
                                <Button
                                    variant="outlined"
                                    startIcon={<UploadFile />}
                                    component="label"
                                    sx={{ fontWeight: "bold", mr: 1 }}
                                >
                                    Upload Files
                                    <Input
                                        type="file"
                                        sx={{ display: "none" }}
                                        hidden
                                        onChange={(e) => handleFileUpload(e, openFolder)}
                                    />
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<UploadFile />}
                                    component="label"
                                    sx={{ fontWeight: "bold" }}
                                >
                                    Upload Large Files
                                    <Input
                                        type="file"
                                        sx={{ display: "none" }}
                                        hidden
                                        onChange={(e) => handleLargeFileUpload(e, openFolder)}
                                    />
                                </Button>
                            </Box>
                        </Box>

                        {filteredFiles && filteredFiles.length > 0 ? (
                            <Box sx={{ mt: 2 }}>
                                {/* Title and Back Button in the same row */}
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontSize: '14px', color: 'grey', fontWeight: 'bold' }}>
                                        Uploaded Files
                                    </Typography>
                                    <Button variant="text" startIcon={<ArrowBackIosRoundedIcon sx={{ fontSize: 12, mr: -0.8 }} />} onClick={() => setOpenFolder(null)} sx={{ fontWeight: 'bold' }}>
                                        Back
                                    </Button>
                                </Box>
                                <Box sx={{ width: '100%' }}>
                                    <Box sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr',
                                        fontWeight: 'bold',
                                        bgcolor: '#f5f5f5',
                                        p: 1,
                                        borderBottom: '2px solid #ddd',
                                        borderRadius: '8px'
                                    }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 5 }}>Name</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Date Modified</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Size</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Actions</Typography>
                                    </Box>
                                    <List>
                                        {filteredFiles.map((file, index) => (
                                            <ListItem
                                                key={index}
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr',
                                                    alignItems: 'center',
                                                    p: 1.5,
                                                    borderBottom: '1px solid #ddd',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => {
                                                    if (file.type === "application/pdf") {
                                                        window.open(file.fileLink, '_blank');
                                                    } else {
                                                        const link = document.createElement('a');
                                                        link.href = file.fileLink;
                                                        link.download = file.fileName;
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                    }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {getFileIcon(file.fileName)}
                                                    <Typography variant="body1" sx={{ color: "#555555", fontSize: '14px', fontWeight: 'bold' }}>
                                                        {file.fileName}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{ fontSize: '13px', color: 'gray' }}>
                                                    {new Date(file.time).toLocaleString()}
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontSize: '13px', color: 'gray' }}>
                                                    {Math.round(file.fileSize / 1024)} KB
                                                </Typography>
                                                <Tooltip title="Admin access only, employees restricted" arrow>
                                                    <IconButton sx={{ color: "gray", mr: 15 }}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontSize: '14px', color: 'grey', fontWeight: 'bold' }}>
                                    No files uploaded yet
                                </Typography>
                                <Button variant="text" startIcon={<ArrowBackIosRoundedIcon sx={{ fontSize: 12, mr: -0.8 }} />} onClick={() => setOpenFolder(null)} sx={{ fontWeight: 'bold' }}>
                                    Back
                                </Button>
                            </Box>)}
                    </Box>
                ) : (
                    <Box sx={{ mt: 3 }}>
                        <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item>
                                <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 'bold' }}>All Folders</Typography>
                            </Grid>
                            <Grid item>
                                <ToggleButtonGroup
                                    value={viewMode}
                                    exclusive
                                    onChange={(e, newMode) => setViewMode(newMode || viewMode)}
                                    aria-label="View Mode"
                                    sx={{
                                        borderRadius: "24px",
                                        border: "1px solid #ccc",
                                        overflow: "hidden",
                                        height: "36px",
                                    }}
                                >
                                    <ToggleButton value="list">
                                        <ViewList fontSize="medium" />
                                    </ToggleButton>
                                    <ToggleButton value="grid">
                                        <GridView fontSize="medium" />
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Grid>
                        </Grid>
                        {filteredFolders.length === 0 ? (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
                                <Typography color="textSecondary" sx={{ fontSize: '14px', color: 'grey', fontWeight: 'bold' }}>No folders available</Typography>
                            </Box>
                        ) : viewMode === "list" ? (
                            <Box sx={{ width: '100%', mt: 2 }}>
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1.5fr 1.51fr 1fr',
                                    fontWeight: 'bold',
                                    bgcolor: '#f5f5f5',
                                    p: 1,
                                    borderBottom: '2px solid #ddd',
                                    borderRadius: '8px'
                                }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 5 }}>Name</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Date Modified</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Created By</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Actions</Typography>
                                </Box>
                                <List>
                                    {filteredFolders.map((folder) => (
                                        <ListItem
                                            key={folder.entityId}
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr',
                                                alignItems: 'center',
                                                p: 1.5,
                                                borderBottom: '1px solid #ddd',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleFolderClick(folder.entityId)}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <FolderIcon sx={{ color: "#f8d775", mr: 1 }} />
                                                <Typography
                                                    variant="body1"
                                                    sx={{ color: "#555555", fontSize: "14px", fontWeight: "bold" }}
                                                >
                                                    {folder.folderName}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ fontSize: "13px", color: "gray" }}>
                                                {new Date(folder.time).toLocaleString()}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: "13px", color: "gray" }}>
                                                {folder.createdBy ? folder.createdBy : "N/A"}
                                            </Typography>

                                            {/* Delete Icon with Tooltip */}
                                            <Tooltip title="Admin access only, employees restricted" arrow>
                                                <IconButton sx={{ color: "gray", mr: 15 }}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        ) : (
                            <Grid container spacing={2} sx={{ mt: 2, mb: 1 }}>
                                {filteredFolders.map((folder) => (
                                    <Grid item key={folder[0]} xs={6} sm={4} md={3} lg={2.4} xl={2.4}>
                                        <Card
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                cursor: "pointer",
                                                boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
                                                width: "100%",
                                            }}
                                            onClick={() => handleFolderClick(folder[0])}
                                        >
                                            <FolderIcon sx={{ fontSize: 80, color: "#f8d775", mt: 2 }} />
                                            <CardContent sx={{ textAlign: "center" }}>
                                                <Typography
                                                    variant="body2"
                                                    noWrap
                                                    sx={{
                                                        width: "100px",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        fontWeight: "bold",
                                                        color: "#555555",
                                                    }}
                                                >
                                                    {folder.folderName}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                        {filteredFolders.length > 0 && (
                            <Box
                                sx={{
                                    position: "sticky",
                                    bottom: 0,
                                    left: 0,
                                    width: "100%",
                                    backgroundColor: "#fff",
                                    boxShadow: "0px -2px 5px rgba(0,0,0,0.1)",
                                    // padding: "10px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    zIndex: 10,
                                    borderRadius: "12px",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "center", padding: "10px" }}>
                                    <IconButton onClick={handlePrevPage} disabled={pageNo === 0}><ArrowBackIosIcon /></IconButton>
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <Button key={i} onClick={() => handlePageClick(i)} disabled={i === pageNo}>{i + 1}</Button>
                                    ))}
                                    <IconButton onClick={handleNextPage} disabled={pageNo === totalPages - 1}><ArrowForwardIosIcon /></IconButton>
                                </div>
                            </Box>
                        )}
                    </Box>
                )}

                {/* Create Folder Dialog */}
                <Dialog open={open} onClose={handleClose}>
                    {/* Dialog Title with Proper Styling */}
                    <DialogTitle sx={{ fontSize: "16px", fontWeight: "bold", color: "#ba343b" }}>
                        Create New Folder
                    </DialogTitle>
                    <DialogContent sx={{ minWidth: "300px", paddingBottom: "16px" }}>
                        <TextField
                            fullWidth
                            value={folderName}
                            placeholder="enter folder name"
                            onChange={(e) => setFolderName(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions sx={{ padding: "16px" }}>
                        <Button onClick={handleClose} color="error" sx={{ fontSize: "bold" }}>Cancel</Button>
                        <Button
                            onClick={handleCreateFolder}
                            variant="outlined"
                            sx={{ borderRadius: "16px", fontWeight: "bold" }}
                        >
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
            <ToastContainer />
        </>
    );
};

export default AllFolders;