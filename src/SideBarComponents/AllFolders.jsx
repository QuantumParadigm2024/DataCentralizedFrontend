/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { LinearProgress, Box, Button, Grid, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Typography, List, ListItem, ListItemText, ToggleButton, ToggleButtonGroup, Card, CardContent, Tooltip, Input, IconButton, Menu, MenuItem } from "@mui/material";
import { Search, ViewList, GridView, Folder as FolderIcon, UploadFile, Star, StarBorder } from "@mui/icons-material";
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
import ImageIcon from '@mui/icons-material/Image';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';

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
    const [starredFolders, setStarredFolders] = useState([]);
    const [starredFiles, setStarredFiles] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUploadClose = () => {
        setAnchorEl(null);
    }

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

    const toggleFolderStar = async (entityId) => {
        try {
            const isStarred = starredFolders.some(folder => folder.entityId === entityId);
            let updatedStarredFolders = [];

            if (isStarred) {
                updatedStarredFolders = starredFolders.filter(folder => folder.entityId !== entityId);
                await axiosInstance.get(`/planotech-inhouse/unstar/favorites`, {
                    params: {
                        id: entityId,
                        type: "folder"
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
            } else {
                updatedStarredFolders = [...starredFolders, { entityId }];
                await axiosInstance.post("/planotech-inhouse/add/favorite", {
                    entityId: entityId,
                    type: "folder"
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
            }
            setStarredFolders(updatedStarredFolders);
        } catch (error) {
            console.error("Error toggling star:", error);
        }
    };

    const toggleFileStar = async (id) => {
        try {
            const isStarred = starredFiles.some(file => file.id === id);
            let updatedStarredFiles = [];

            if (isStarred) {
                // Unstar logic
                updatedStarredFiles = starredFiles.filter(file => file.id !== id);
                await axiosInstance.get(`/planotech-inhouse/unstar/favorites`, {
                    params: { id, type: "file" },
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
            } else {
                // Star logic
                updatedStarredFiles = [...starredFiles, { id }];
                await axiosInstance.post("/planotech-inhouse/add/favorite", {
                    entityId: id,
                    type: "file"
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
            }
            setStarredFiles(updatedStarredFiles);
        } catch (error) {
            console.error("Error toggling star:", error);
        }
    };

    useEffect(() => {
        const fetchStarredFoldersandFiles = async () => {
            try {
                const response = await axiosInstance.get("/planotech-inhouse/getAll/favorites", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setStarredFolders(response.data.data || []);
                setStarredFiles(response.data.data || []);
            } catch (error) {
                console.error("Error fetching starred folders:", error);
            }
        };
        fetchStarredFoldersandFiles();
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

    const [createFolder, setCreateFolder] = useState("");
    const [createFolderOpen, setCreateFolderOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    const handleCreateFolder = async () => {
        setOpen(false);
        if (!folderName.trim()) {
            setCreateFolder("Please enter a folder name");
            setCreateFolderOpen(true);
            return;
        }

        setCreating(true);
        setCreateFolder("Creating folder...");
        setCreateFolderOpen(true);

        try {
            await axiosInstance.post(`/planotech-inhouse/create/folder/${folderName}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setCreateFolder("✅ Folder created successfully!");
            setFolderName("");
            handleClose();
            fetchFolders();
        } catch (error) {
            console.error("Error creating folder:", error);
            setCreateFolder("❌ Failed to create folder");
        } finally {
            setCreating(false);
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

    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("");
    const [uploadOpen, setUploadOpen] = useState(false);

    const MAX_SMALL_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    const MAX_LARGE_FILE_SIZE = 1024 * 1024 * 1024; // 1GB

    const handleFileValidation = (files, maxSize) => {
        let validFiles = [];
        let totalSize = 0;

        for (let file of files) {
            if (file.size > maxSize) {
                setUploadStatus(`❌ File "${file.name}" exceeds ${(maxSize / (1024 * 1024)).toFixed(0)}MB limit and can't be uploaded. Choose large file option`);
                setUploading(false);
                setTimeout(() => setUploadOpen(false), 8000);
                return []; // Stop execution immediately
            }

            if (totalSize + file.size > maxSize) {
                setUploadStatus(`⚠️ Total file size exceeds ${(maxSize / (1024 * 1024)).toFixed(0)}MB. Removing the last file.`);
                setTimeout(() => setUploadOpen(false), 8000);
                break; // Stop adding more files
            }

            validFiles.push(file);
            totalSize += file.size;
        }

        return validFiles;
    };

    // ✅ Small File Upload (≤100MB)
    const handleFileUpload = async (event, entityId) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setUploadOpen(true);
        setUploadStatus("Checking file size...");

        await new Promise((resolve) => setTimeout(resolve, 500)); // Ensure UI updates

        let validFiles = handleFileValidation([...files], MAX_SMALL_FILE_SIZE);
        if (validFiles.length === 0) return;

        await uploadFiles(validFiles, entityId, "/planotech-inhouse/uploadFile");
    };

    // ✅ Large File Upload (≤1GB)
    const handleLargeFileUpload = async (event, entityId) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setUploadOpen(true);
        setUploadStatus("Checking file size...");

        await new Promise((resolve) => setTimeout(resolve, 500)); // Ensure UI updates

        let validFiles = handleFileValidation([...files], MAX_LARGE_FILE_SIZE);
        if (validFiles.length === 0) return;

        await uploadFiles(validFiles, entityId, "/planotech-inhouse/upload/largeFile");
    };

    // ✅ Reusable Upload Function
    const uploadFiles = async (validFiles, entityId, endpoint) => {
        setUploadStatus("Uploading files...");

        const formData = new FormData();
        validFiles.forEach(file => formData.append("files", file));

        try {
            const response = await axiosInstance.post(`${endpoint}?folderId=${entityId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("Files uploaded successfully:", response.data);
            setUploadStatus("✅ Files uploaded successfully!");
            fetchFiles(entityId);
        } catch (error) {
            console.error("Error uploading files:", error);
            setUploadStatus("❌ Error uploading files.");
        } finally {
            setUploading(false);
            setTimeout(() => setUploadOpen(false), 3000);
        }
    };

    const getFileIcon = (fileName) => {
        if (fileName.endsWith('.pdf')) {
            return <PictureAsPdfIcon sx={{ color: '#de2429' }} />;
        } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
            return <DescriptionIcon sx={{ color: '#2B579A' }} />;
        } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
            return <TableChartIcon sx={{ color: '#217346' }} />;
        } else if (fileName.endsWith('.csv')) {
            return <InsertChartIcon sx={{ color: '#217346' }} />;
        } else if (fileName.endsWith('.zip') || fileName.endsWith('.rar')) {
            return <FolderZipIcon sx={{ color: '#f0a500' }} />;
        } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.PNG') || fileName.endsWith('.gif') || fileName.endsWith('.svg')) {
            return <ImageIcon sx={{ color: '#098dc6' }} />;
        } else {
            return <InsertDriveFileIcon sx={{ color: '#f8d775' }} />;
        }
    };

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState("Deleting...");
    const [deleting, setDeleting] = useState(false);

    const handleDeleteFolder = async (folderId) => {
        setDeleteMessage("Deleting...");
        setDeleteOpen(true);
        setDeleting(true);

        try {
            await axiosInstance.delete(`/planotech-inhouse/admin/delete/folder/${folderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            setDeleteMessage("✅ Folder successfully deleted!");
            fetchFolders();
        } catch (error) {
            if (error.response && error.response.data) {
                const { message } = error.response.data;
                if (message === "Employess Restricted, Admin use only") {
                    setDeleteMessage("❌ Access Denied! Only admin have access.");
                } else {
                    setDeleteMessage(message || "Failed to delete folder!");
                }
            } else {
                setDeleteMessage("An unexpected error occurred!");
            }

            console.error("Error deleting folder:", error);
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteFile = async (file, entityId) => {
        setDeleteMessage("Deleting...");
        setDeleteOpen(true);
        setDeleting(true);

        try {
            await axiosInstance.delete(`/planotech-inhouse/admin/delete/file?folderId=${entityId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                data: {
                    id: file.id,
                    type: file.type,
                    fileName: file.fileName,
                    fileLink: file.fileLink,
                    fileSize: file.fileSize,
                    time: file.time,
                    createdBy: file.createdBy
                },
            });

            setDeleteMessage("✅ File deleted successfully!");
            fetchFiles(entityId);
        } catch (error) {
            if (error.response && error.response.data) {
                const { message } = error.response.data;
                if (message === "Employess Restricted, Admin use only") {
                    setDeleteMessage("❌ Access Denied! Only admin have access.");
                } else {
                    setDeleteMessage(message || "Failed to delete folder!");
                }
            } else {
                setDeleteMessage("An unexpected error occurred!");
            }

            console.error("Error deleting folder:", error);
        } finally {
            setDeleting(false);
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
                                <Button startIcon={<CreateNewFolderIcon />} onClick={handleOpen}
                                    sx={{
                                        fontWeight: "bold",
                                        bgcolor: '#ba343b',
                                        '&:hover': { bgcolor: '#9e2b31' },
                                        color: 'white',
                                    }}>
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
                                    onClick={handleClick}
                                    sx={{
                                        fontWeight: "bold",
                                        color: "#ba343b",
                                        border: "0.5px solid #ba343b",
                                    }}
                                >
                                    Upload Files
                                </Button>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleUploadClose}
                                >
                                    <MenuItem>
                                        <label style={{ fontWeight: "bold", color: "grey", fontSize: "12.5px" }}>
                                            Small File (≤100mb)
                                            <Input
                                                type="file"
                                                sx={{ display: "none" }}
                                                inputProps={{ multiple: true }}
                                                onChange={(e) => {
                                                    handleFileUpload(e, openFolder, MAX_SMALL_FILE_SIZE, "uploadFile");
                                                    handleUploadClose();
                                                }}
                                            />
                                        </label>
                                    </MenuItem>
                                    <MenuItem>
                                        <label style={{ fontWeight: "bold", color: "grey", fontSize: "12.5px" }}>
                                            Large File (≤1gb)
                                            <Input
                                                type="file"
                                                sx={{ display: "none" }}
                                                inputProps={{ multiple: true }}
                                                onChange={(e) => {
                                                    handleLargeFileUpload(e, openFolder, MAX_LARGE_FILE_SIZE, "largeFile");
                                                    handleUploadClose();
                                                }}
                                            />
                                        </label>
                                    </MenuItem>
                                </Menu>
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
                                        gridTemplateColumns: '2.5fr 2.5fr 1.5fr 1.5fr 1fr',
                                        fontWeight: 'bold',
                                        bgcolor: '#f5f5f5',
                                        p: 1,
                                        borderBottom: '2px solid #ddd',
                                        borderRadius: '8px'
                                    }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 5 }}>Name</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Created Time</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Size</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Add Favourites</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Actions</Typography>
                                    </Box>
                                    <List>
                                        {filteredFiles.map((file, index) => (
                                            <ListItem
                                                key={index}
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '2.5fr 2.5fr 1.5fr 1.5fr 1fr',
                                                    alignItems: 'center',
                                                    p: 1.5,
                                                    borderBottom: '1px solid #ddd',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    "&:hover": { bgcolor: "#f9f9f9" }
                                                }}
                                                onClick={() => {
                                                    const imageExtensions = ["jpg", "jpeg", "png", "PNG", "gif", "bmp", "webp"];
                                                    const fileExtension = file.fileName.split('.').pop().toLowerCase();

                                                    if (file.type === "application/pdf") {
                                                        window.open(file.fileLink, '_blank');
                                                    } else if (imageExtensions.includes(fileExtension)) {
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
                                                    <Typography
                                                        variant="body1"
                                                        sx={{
                                                            color: "#555555",
                                                            fontSize: "14px",
                                                            fontWeight: "bold",
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            maxWidth: "200px"
                                                        }}
                                                        title={file.fileName}
                                                    >
                                                        {file.fileName.length > 20 ? `${file.fileName.slice(0, 20)}...` : file.fileName}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{ fontSize: '13px', color: 'gray' }}>
                                                    {new Date(file.time).toLocaleString()}
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontSize: '13px', color: 'gray' }}>
                                                    {Math.round(file.fileSize / 1024)} KB
                                                </Typography>
                                                <Tooltip title="Star this folder" arrow>
                                                    <IconButton
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            toggleFileStar(file.id);
                                                        }}
                                                    >
                                                        {starredFiles.some(fav => fav.id === file.id) ? (
                                                            <Star sx={{ color: "gold", mr: 8 }} />
                                                        ) : (
                                                            <StarBorder sx={{ mr: 8 }} />
                                                        )}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip>
                                                    <IconButton
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleDeleteFile(file, openFolder);
                                                        }}
                                                        sx={{ color: "gray", mr: 7 }}
                                                    >
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
                                    gridTemplateColumns: '2.5fr 2.5fr 1.5fr 1.5fr 1fr',
                                    fontWeight: 'bold',
                                    bgcolor: '#f5f5f5',
                                    p: 1,
                                    borderBottom: '2px solid #ddd',
                                    borderRadius: '8px'
                                }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 5 }}>Name</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Created Time</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Created By</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Add Favourites</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Actions</Typography>
                                </Box>
                                <List>
                                    {filteredFolders.map((folder) => (
                                        <ListItem
                                            key={folder.entityId}
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '2.5fr 2.5fr 1.5fr 1.5fr 1fr',
                                                alignItems: 'center',
                                                p: 1.5,
                                                borderBottom: '1px solid #ddd',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                "&:hover": { bgcolor: "#f9f9f9" }
                                            }}
                                            onClick={() => handleFolderClick(folder.entityId)}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <FolderIcon sx={{ color: "#f8d775", mr: 1 }} />
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        color: "#555555",
                                                        fontSize: "14px",
                                                        fontWeight: "bold",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        maxWidth: "200px"
                                                    }}
                                                    title={folder.folderName}
                                                >
                                                    {folder.folderName.length > 20 ? `${folder.folderName.slice(0, 20)}...` : folder.folderName}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ fontSize: "13px", color: "gray" }}>
                                                {new Date(folder.time).toLocaleString()}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: "13px", color: "gray" }}>
                                                {folder.createdBy ? folder.createdBy : "N/A"}
                                            </Typography>
                                            <Tooltip title="Star this folder" arrow>
                                                <IconButton
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        toggleFolderStar(folder.entityId);
                                                    }}>
                                                    {starredFolders.some(fav => fav.entityId === folder.entityId) ? (
                                                        <Star sx={{ color: "gold", mr: 8 }} />
                                                    ) : (
                                                        <StarBorder sx={{ mr: 8 }} />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip>
                                                <IconButton
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleDeleteFolder(folder.entityId, event);
                                                    }}
                                                    sx={{ color: "gray", mr: 7 }}
                                                >
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
                                            onClick={() => handleFolderClick(folder.entityId)}
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
                            sx={{ borderRadius: "16px", fontWeight: "bold", color: "#ba343b", border: "0.5px solid #ba343b" }}
                        >
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={uploadOpen}
                    onClose={() => setUploadOpen(false)}
                    fullWidth
                    maxWidth="sm"
                    sx={{ "& .MuiDialog-paper": { width: "450px" } }}
                >
                    <DialogContent sx={{ textAlign: "center", p: 3 }}>
                        {uploadStatus.includes("✅") ? (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                <CheckIcon sx={{ fontSize: 28, color: "#4caf50" }} />
                                <Typography
                                    variant="h6"
                                    sx={{ color: '#232323', fontSize: "18px", fontWeight: "bold" }}
                                >
                                    Files uploaded successfully!
                                </Typography>
                            </Box>
                        ) : uploadStatus.includes("❌") ? (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                <ClearIcon sx={{ fontSize: 28, color: "#f44336" }} />
                                <Typography
                                    variant="h6"
                                    sx={{ color: '#232323', fontSize: "18px", fontWeight: "bold" }}
                                >
                                    {uploadStatus.replace("❌ ", "")}
                                </Typography>
                            </Box>
                        ) : (
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ color: '#232323', fontSize: "18px", fontWeight: "bold" }}
                            >
                                {uploading ? "Uploading File....." : uploadStatus}
                            </Typography>
                        )}

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
                    open={deleteOpen}
                    onClose={() => setDeleteOpen(false)}
                    fullWidth
                    maxWidth="sm"
                    sx={{ "& .MuiDialog-paper": { width: "450px" } }}
                >
                    <DialogContent sx={{ textAlign: "center", p: 3 }}>
                        {deleteMessage.includes("✅") ? (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                <CheckIcon sx={{ fontSize: 28, color: "#4caf50" }} />
                                <Typography
                                    variant="h6"
                                    sx={{ color: '#232323', fontSize: "18px", fontWeight: "bold" }}
                                >
                                    Folder successfully deleted!
                                </Typography>
                            </Box>
                        ) : deleteMessage.includes("❌") ? (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                <ClearIcon sx={{ fontSize: 28, color: "#f44336" }} />
                                <Typography
                                    variant="h6"
                                    sx={{ color: '#232323', fontSize: "18px", fontWeight: "bold" }}
                                >
                                    {deleteMessage.replace("❌ ", "")}
                                </Typography>
                            </Box>
                        ) : (
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ color: '#232323', fontSize: "18px", fontWeight: "bold" }}
                            >
                                {deleteMessage}
                            </Typography>
                        )}

                        {deleting && (
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
                    open={createFolderOpen}
                    onClose={() => setCreateFolderOpen(false)}
                    fullWidth
                    maxWidth="sm"
                    sx={{ "& .MuiDialog-paper": { width: "450px" } }}
                >
                    <DialogContent sx={{ textAlign: "center", p: 3 }}>
                        {(createFolder === "✅ Folder created successfully!" || createFolder === "❌ Failed to create folder") ? (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                {createFolder === "✅ Folder created successfully!" ? (
                                    <CheckIcon sx={{ fontSize: 28, color: "#4caf50" }} />
                                ) : (
                                    <ClearIcon sx={{ fontSize: 28, color: "#f44336" }} />
                                )}
                                <Typography
                                    variant="h6"
                                    sx={{ color: '#232323', fontSize: "18px", fontWeight: "bold" }}
                                >
                                    {createFolder === "✅ Folder created successfully!" ? "Folder created successfully!" : "Failed to create folder"}
                                </Typography>
                            </Box>
                        ) : (
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ color: '#232323', fontSize: "18px", fontWeight: "bold" }}
                            >
                                {createFolder}
                            </Typography>
                        )}

                        {creating && (
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
            </Box>
            <ToastContainer />
        </>
    );
};

export default AllFolders;