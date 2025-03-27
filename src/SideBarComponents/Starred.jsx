/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Box, Typography, Button, List, ListItem, IconButton, Tooltip, ToggleButtonGroup, ToggleButton, CardContent, Card } from "@mui/material";
import axiosInstance from "../Helper/AxiosInstance";
import FolderIcon from "@mui/icons-material/Folder";
import CryptoJS from 'crypto-js';
import { secretKey } from '../Helper/SecretKey';
import { toast } from "react-toastify";
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import { Grid } from "@mui/joy";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import { Star } from "@mui/icons-material";
import ImageIcon from '@mui/icons-material/Image';

const Starred = () => {
    const [starredFolders, setStarredFolders] = useState([]);
    const [starredFiles, setStarredFiles] = useState([]);
    const [openFolder, setOpenFolder] = useState(null);
    const [files, setFiles] = useState({});

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
        const fetchStarredItems = async () => {
            try {
                const response = await axiosInstance.get("/planotech-inhouse/getAll/favorites", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.data) {
                    const folders = response.data.data.filter(item => item.folderName);
                    const files = response.data.data.filter(item => item.fileName);

                    setStarredFolders(folders || []);
                    setStarredFiles(files || []);
                } else {
                    setStarredFolders([]);
                    setStarredFiles([]);
                }
            } catch (error) {
                console.error("Error fetching starred items:", error);
                toast.error("Failed to load starred items");
            }
        };
        fetchStarredItems();
    }, []);

    const handleFolderClick = async (entityId) => {
        setOpenFolder(entityId);
        if (!files[entityId]) {
            try {
                const response = await axiosInstance.get(`/planotech-inhouse/getFiles?folderId=${entityId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFiles(prevFiles => ({ ...prevFiles, [entityId]: response.data.files || [] }));
            } catch (error) {
                console.error("Error fetching files:", error);
                toast.error("Error fetching files");
            }
        }
    };

    const handleFolderUnstar = async (entityId) => {
        try {
            const updatedStarredFolders = starredFolders.filter(folder => folder.entityId !== entityId);
            setStarredFolders(updatedStarredFolders);

            await axiosInstance.get(`/planotech-inhouse/unstar/favorites`, {
                params: {
                    id: entityId,
                    type: "folder"
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
        } catch (error) {
            console.error("Error unstarring folder:", error);
        }
    };

    const handleFileUnstar = async (id) => {
        try {
            const updatedStarredFiles = starredFiles.filter(file => file.id !== id);
            setStarredFiles(updatedStarredFiles);

            await axiosInstance.get(`/planotech-inhouse/unstar/favorites`, {
                params: {
                    id: id,
                    type: "file"
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
        } catch (error) {
            console.error("Error unstarring folder:", error);
        }
    }

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

    return (
        <Box sx={{ mt: 1 }}>
            <Typography variant="h6" sx={{ fontSize: "18px", fontWeight: "bold" }}>
                Starred
            </Typography>

            {/* Folders Section */}
            <Box sx={{ mt: 3 }}>
                {!openFolder ? (
                    <>
                        <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item>
                                <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                                    Folders
                                </Typography>
                            </Grid>
                        </Grid>

                        {starredFolders.length === 0 ? (
                            <Typography color="textSecondary" sx={{ fontSize: '14px', color: 'grey', fontWeight: 'bold', mt: 2 }}>
                                No starred folders available
                            </Typography>
                        ) : (
                            <Box sx={{ width: '100%', mt: 2 }}>
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '1.5fr 1.5fr 1.5fr 0.5fr',
                                    fontWeight: 'bold',
                                    bgcolor: '#f5f5f5',
                                    p: 1,
                                    borderBottom: '2px solid #ddd',
                                    borderRadius: '8px'
                                }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 5 }}>Name</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Created Time</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Created By</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Star</Typography>
                                </Box>
                                <List>
                                    {starredFolders.map((folder) => (
                                        <ListItem
                                            key={folder.entityId}
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '1.5fr 1.5fr 1.5fr 0.5fr',
                                                alignItems: 'center',
                                                p: 1.5,
                                                borderBottom: '1px solid #ddd',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
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
                                            <Star
                                                sx={{ color: "gold", cursor: "pointer" }}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleFolderUnstar(folder.entityId);
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}
                    </>
                ) : (
                    <Box>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                                {starredFolders.find(f => f.entityId === openFolder)?.folderName || 'Folder'}
                            </Typography>
                            <Button variant="text" startIcon={<ArrowBackIosRoundedIcon sx={{ fontSize: 12, mr: -0.8 }} />} onClick={() => setOpenFolder(null)} sx={{ fontWeight: 'bold' }}>
                                Back
                            </Button>
                        </Box>

                        {files[openFolder] && files[openFolder].length === 0 ? (
                            <Typography color="textSecondary" sx={{ fontSize: '14px', color: 'grey', fontWeight: 'bold', mt: 2 }}>
                                No files uploaded yet
                            </Typography>
                        ) : (
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
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Created Time</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Size</Typography>
                                </Box>
                                <List>
                                    {files[openFolder]?.map((file) => (
                                        <ListItem
                                            key={file.id}
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '2fr 1fr 1fr',
                                                alignItems: 'center',
                                                p: 1.5,
                                                borderBottom: '1px solid #ddd',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                "&:hover": { bgcolor: "#f9f9f9" }
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
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
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
                                                        maxWidth: "250px"
                                                    }}
                                                    title={file.fileName}
                                                >
                                                    {file.fileName.length > 20 ? `${file.fileName.slice(0, 20)}...` : file.fileName}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ fontSize: "13px", color: "gray" }}>
                                                {new Date(file.time).toLocaleString()}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: "13px", color: "gray" }}>
                                                {Math.round(file.fileSize / 1024)} KB
                                            </Typography>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}
                    </Box>
                )}
            </Box>

            {/* Files Section */}
            <Box sx={{ mt: 5 }}>
                <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                    Files
                </Typography>

                {starredFiles.length === 0 ? (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
                        <Typography color="textSecondary" sx={{ fontSize: '14px', color: 'grey', fontWeight: 'bold' }}>No starred files available</Typography>
                    </Box>
                ) : (
                    <Box sx={{ width: '100%', mt: 2 }}>
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: '1.5fr 1.5fr 1.5fr 0.5fr',
                            fontWeight: 'bold',
                            bgcolor: '#f5f5f5',
                            p: 1,
                            borderBottom: '2px solid #ddd',
                            borderRadius: '8px'
                        }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 5 }}>Name</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Created Time</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Size</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Star</Typography>
                        </Box>
                        <List>
                            {starredFiles.map((file) => (
                                <ListItem
                                    key={file.id}
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '1.5fr 1.5fr 1.5fr 0.5fr',
                                        alignItems: 'center',
                                        p: 1.5,
                                        borderBottom: '1px solid #ddd',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        "&:hover": { bgcolor: "#f9f9f9" }
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
                                    <Typography variant="body2" sx={{ fontSize: "13px", color: "gray" }}>
                                        {new Date(file.time).toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: "13px", color: "gray" }}>
                                        {Math.round(file.fileSize / 1024)} KB
                                    </Typography>
                                    <Star
                                        sx={{ color: "gold", cursor: "pointer" }}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleFileUnstar(file.id);
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Starred;