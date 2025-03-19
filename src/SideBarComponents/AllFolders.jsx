/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Box, Button, Grid, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Typography, List, ListItem, ListItemText, ToggleButton, ToggleButtonGroup, Card, CardContent, IconButton, Input, ListItemIcon } from "@mui/material";
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

const AllFolders = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [open, setOpen] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [folders, setFolders] = useState([]);
    const [viewMode, setViewMode] = useState("list");
    const [openFolder, setOpenFolder] = useState(null);
    const [files, setFiles] = useState({});

    useEffect(() => {
        fetchFolders();
    }, []);

    const fetchFolders = async () => {
        try {
            const response = await axiosInstance.get(`/planotech-inhouse/getFolders`);
            setFolders(response.data.content || []);
        } catch (error) {
            console.error("Error fetching folders:", error);
        }
    };

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
            await axiosInstance.post(`/planotech-inhouse/create/folder/${folderName}`);
            toast.success("Folder created successfully");
            setFolderName("");
            handleClose();
            fetchFolders();
        } catch (error) {
            console.error("Error creating folder:", error);
            toast.error("Failed to create folder");
        }
    };

    const handleFolderClick = (folderId) => {
        setOpenFolder(folderId);
    };

    const handleFileUpload = async (event, folderId) => {
        const files = event.target.files[0];
        if (!files) return;

        const formData = new FormData();
        formData.append("files", files);

        const toastId = toast.loading("Uploading file...");

        try {
            const response = await axiosInstance.post(`/planotech-inhouse/uploadFile?folderId=${folderId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("File uploaded successfully:", response.data);
            toast.update(toastId, {
                render: "File uploaded successfully",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });

            fetchFiles(folderId);
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

    const fetchFiles = async (folderId) => {
        try {
            const response = await axiosInstance.get(`/planotech-inhouse/getFiles?folderId=${folderId}`);
            setFiles(prevFiles => ({
                ...prevFiles,
                [folderId]: response.data.files
            }));
        } catch (error) {
            console.error("Error fetching files:", error);
            toast.error("Error fetching files");
        }
    };

    useEffect(() => {
        if (openFolder) {
            fetchFiles(openFolder);
        }
    }, [openFolder]);

    const getFileIcon = (fileName) => {
        if (fileName.endsWith('.pdf')) {
            return <PictureAsPdfIcon sx={{ color: '#de2429' }} />;
        } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
            return <DescriptionIcon sx={{ color: '#2B579A' }} />; // Word Icon (Blue)
        } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
            return <TableChartIcon sx={{ color: '#217346' }} />; // Excel Icon (Green)
        } else if (fileName.endsWith('.csv')) {
            return <InsertChartIcon sx={{ color: '#217346' }} />; // CSV Icon (Green)
        } else {
            return <InsertDriveFileIcon sx={{ color: '#f8d775' }} />; // Default File Icon
        }
    };

    return (
        <>
            <Box>
                <Box
                    sx={{
                        position: "sticky",
                        top: 0,
                        zIndex: 100,
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
                                placeholder="Search folders"
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
                            <Box>
                                <Button variant="contained" startIcon={<CreateNewFolderIcon />} onClick={handleOpen}>
                                    Create Folder
                                </Button>
                            </Box>
                        )}
                    </Grid>
                </Box>

                {/* If a folder is open, show its content */}
                {openFolder ? (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Typography variant="h6">
                                {folders.find(f => f[0] === openFolder)?.[1]}
                            </Typography>
                            <Box>
                                <Button
                                    variant="outlined"
                                    startIcon={<UploadFile />}
                                    component="label"
                                    sx={{ fontWeight: "bold" }}
                                >
                                    Upload Files
                                    <Input
                                        type="file"
                                        sx={{ display: "none" }}
                                        hidden
                                        onChange={(e) => handleFileUpload(e, openFolder)}
                                    />
                                </Button>
                            </Box>
                        </Box>

                        {files[openFolder] && files[openFolder].length > 0 ? (
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
                                        gridTemplateColumns: '2fr 1fr 1fr',
                                        fontWeight: 'bold',
                                        bgcolor: '#f5f5f5',
                                        p: 1,
                                        borderBottom: '2px solid #ddd',
                                        borderRadius: '8px'
                                    }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 5 }}>Name</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Date Modified</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Size</Typography>
                                    </Box>
                                    <List>
                                        {files[openFolder].map((file, index) => (
                                            <ListItem
                                                key={index}
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '2fr 1fr 1fr',
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
                        {folders.length === 0 ? (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
                                <Typography color="textSecondary" sx={{ fontSize: '14px', color: 'grey', fontWeight: 'bold' }}>No folders available</Typography>
                            </Box>
                        ) : viewMode === "list" ? (
                            <Box sx={{ width: '100%', mt: 2 }}>
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1fr 1fr',
                                    fontWeight: 'bold',
                                    bgcolor: '#f5f5f5',
                                    p: 1,
                                    borderBottom: '2px solid #ddd',
                                    borderRadius: '8px'
                                }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 5 }}>Name</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Date Modified</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Created By</Typography>
                                </Box>
                                <List>
                                    {folders.map((folder, dateModified) => (
                                        <ListItem
                                            key={folder[0]}
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '2fr 1fr 1fr',
                                                alignItems: 'center',
                                                p: 1.5,
                                                borderBottom: '1px solid #ddd',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleFolderClick(folder[0])}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <FolderIcon sx={{ color: "#f8d775", mr: 1 }} />
                                                <ListItemText
                                                    primary={folder[1]}
                                                    primaryTypographyProps={{
                                                        sx: { color: "#555555", fontSize: "14px", fontWeight: "bold" }
                                                    }}
                                                />
                                            </Box>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        ) : (
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            {folders.map((folder) => (
                                <Grid item key={folder[0]} xs={6} sm={4} md={3} lg={2}>
                                    <Card
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            cursor: "pointer",
                                            boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
                                        }}
                                        onClick={() => handleFolderClick(folder[0])}
                                    >
                                        <FolderIcon sx={{ fontSize: 80, color: "#f8d775", mt: 2 }} />
                                        <CardContent sx={{ textAlign: "center" }}>
                                            <Typography
                                                variant="body2"
                                                noWrap
                                                sx={{ width: "100px", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 'bold', color: '#555555' }}
                                            >
                                                {folder[1]}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        )}
                    </Box>
                )}

                {/* Create Folder Dialog */}
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Create New Folder</DialogTitle>
                    <DialogContent>
                        <TextField fullWidth value={folderName} placeholder="enter folder name" onChange={(e) => setFolderName(e.target.value)} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="error">Cancel</Button>
                        <Button onClick={handleCreateFolder} variant="contained">Create</Button>
                    </DialogActions>
                </Dialog>
            </Box>
            <ToastContainer />
        </>
    );
};

export default AllFolders;