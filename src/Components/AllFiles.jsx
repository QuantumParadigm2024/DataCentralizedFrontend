import React, { useState } from "react";
import { 
    Box, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, 
    ListItemIcon, ListItemText, Grid, IconButton 
} from "@mui/material";
import { Add, Folder, ArrowBack, UploadFile, Delete } from "@mui/icons-material";

const AllFiles = ({ searchTerm }) => {
    const [open, setOpen] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [folders, setFolders] = useState([]); // Stores created folders
    const [currentFolder, setCurrentFolder] = useState(null); // Tracks opened folder
    const [files, setFiles] = useState({}); // Stores files inside folders

    // Open/Close Dialog
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFolderName(""); // Reset input
    };

    // Handle Folder Creation
    const handleCreateFolder = () => {
        if (folderName.trim()) {
            setFolders([...folders, folderName]);
            setFiles({ ...files, [folderName]: [] }); // Initialize empty file list for folder
            handleClose();
        } else {
            alert("Please enter a folder name!");
        }
    };

    // Handle file uploads inside a folder
    const handleFileUpload = (event) => {
        const uploadedFiles = Array.from(event.target.files);
        if (currentFolder) {
            setFiles({
                ...files,
                [currentFolder]: [...(files[currentFolder] || []), ...uploadedFiles],
            });
        }
    };

    // Open selected folder
    const handleOpenFolder = (folder) => setCurrentFolder(folder);

    // Go back to folder list
    const handleGoBack = () => setCurrentFolder(null);

    // Delete a file from a folder
    const handleDeleteFile = (fileIndex) => {
        setFiles({
            ...files,
            [currentFolder]: files[currentFolder].filter((_, index) => index !== fileIndex),
        });
    };

    // Delete a folder and its contents
    const handleDeleteFolder = (folder) => {
        setFolders(folders.filter(f => f !== folder));
        const updatedFiles = { ...files };
        delete updatedFiles[folder];
        setFiles(updatedFiles);
    };

    // Filter folders based on search term
    const filteredFolders = folders.filter(folder =>
        folder.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ width: "100%", p: 2 }}>
            <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2}}>
                {currentFolder ? (
                    <>
                        <IconButton onClick={handleGoBack}><ArrowBack /></IconButton>
                        <Typography variant="h5" sx={{ fontWeight: "bold", fontSize: '18px' }}>{currentFolder}</Typography>
                        <input
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            style={{ display: "none" }}
                            id="file-upload"
                        />
                        <label htmlFor="file-upload">
                            <Button variant="contained" component="span" startIcon={<UploadFile />}>
                                Upload Files
                            </Button>
                        </label>
                    </>
                ) : (
                    <>
                        <Typography variant="h5" sx={{ fontWeight: "bold", fontSize: '18px' }}>All Files</Typography>
                        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>New Folder</Button>
                    </>
                )}
            </Grid>

            {/* Dialog for Folder Creation */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Folder Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Cancel</Button>
                    <Button onClick={handleCreateFolder} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>

            {/* Show Files inside the selected folder */}
            {currentFolder ? (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6">Uploaded Files</Typography>
                    {files[currentFolder]?.length === 0 ? (
                        <Typography sx={{ color: "gray", mt: 1 }}>No files uploaded.</Typography>
                    ) : (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            {files[currentFolder].map((file, index) => (
                                <Grid item xs={12} key={index}>
                                    <Box sx={{ p: 1, bgcolor: "#f5f5f5", borderRadius: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        {file.name}
                                        <IconButton onClick={() => handleDeleteFile(index)} color="error">
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            ) : (
                /* List of Created Folders */
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6">Folders</Typography>
                    {filteredFolders.length === 0 ? (
                        <Typography sx={{ color: "gray", mt: 1 }}>No matching folders found.</Typography>
                    ) : (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            {filteredFolders.map((folder, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Box
                                        sx={{
                                            p: 2,
                                            bgcolor: "white",
                                            borderRadius: 2,
                                            boxShadow: 3,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            cursor: "pointer",
                                            "&:hover": { boxShadow: 6 }
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }} onClick={() => handleOpenFolder(folder)}>
                                            <ListItemIcon><Folder color="primary" /></ListItemIcon>
                                            <ListItemText primary={folder} />
                                        </Box>
                                        <IconButton onClick={() => handleDeleteFolder(folder)} color="error">
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default AllFiles;