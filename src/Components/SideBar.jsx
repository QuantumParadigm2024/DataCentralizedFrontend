import React from "react";
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Grid, IconButton } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DeleteIcon from "@mui/icons-material/Delete";
import CollectionsIcon from "@mui/icons-material/Collections";
import StarIcon from "@mui/icons-material/Star";
import Logo from "../Assets/Planotech Logo Black.png";
import { AccountCircle } from "@mui/icons-material";

const SideBar = ({ setSelectedContent }) => {
    return (
        <Box sx={{ width: 240, height: "100%", p: 1, bgcolor: "lightgoldenrodyellow", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Box>
                <Box sx={{ textAlign: "left", mb: 2 }}>
                    <img src={Logo} alt="Company Logo" style={{ width: "80%", maxWidth: 190 }} />
                </Box>

                <Divider sx={{ width: "100%", mx: "auto", mb: 1 }} />

                <List>
                    {[
                        { text: "All Files", icon: <FolderIcon />, key: "allFiles" },
                        { text: "Recents", icon: <AccessTimeIcon />, key: "recent" },
                        { text: "Bin", icon: <DeleteIcon />, key: "bin" },
                        { text: "My Collections", icon: <CollectionsIcon />, key: "collections" },
                        { text: "Favourites", icon: <StarIcon />, key: "favourites" },
                    ].map(({ text, icon, key }) => (
                        <ListItem key={key} disablePadding>
                            <ListItemButton onClick={() => setSelectedContent(key)}>
                                <ListItemIcon>{icon}</ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

            </Box>
            <Grid container justifyContent="flex-start" alignItems="center" sx={{ p: 1, pb: 3}}>
                <IconButton>
                    <AccountCircle sx={{ fontSize: 30 }} />
                </IconButton>
                <ListItemText primary="Profile" />
            </Grid>
        </Box>
    );
};

export default SideBar;
