import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';

const Starred = () => {
    const [starredFolders, setStarredFolders] = useState([]);

    useEffect(() => {
        const savedStarredFolders = JSON.parse(localStorage.getItem("starredFolders")) || [];
        setStarredFolders(savedStarredFolders);
    }, []);

    return (
        <Box sx={{ mt: 1 }}>
            <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 'bold' }}>
                Starred Folders
            </Typography>
            {starredFolders.length === 0 ? (
                <Box sx={{ mt: 2 }}>
                    <Typography color="textSecondary" sx={{ fontSize: '14px', color: 'grey', fontWeight: 'bold' }}>No starred folders.</Typography>
                </Box>
            ) : (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    {starredFolders.map((folderName) => (
                        <Grid item xs={6} sm={4} md={3} lg={2.4} xl={2.4} key={folderName}>
                            <Card elevation={3}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
                                    width: "100%",
                                }}
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
                                        {folderName}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default Starred;