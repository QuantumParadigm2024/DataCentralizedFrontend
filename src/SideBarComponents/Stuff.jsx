import React, { useState } from "react";
import { 
    Box, List, ListItem, ListItemButton, ListItemIcon, 
    ListItemText, Divider, IconButton 
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FolderIcon from "@mui/icons-material/Folder";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DeleteIcon from "@mui/icons-material/Delete";
import CollectionsIcon from "@mui/icons-material/Collections";
import StarIcon from "@mui/icons-material/Star";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Logo from "../Assets/Planotech Logo Black.png";

const SideBar = ({ setSelectedContent }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "white", borderRight: "1px solid #ddd" }}>
            
            {/* Fixed Logo Section (Doesn't Change Size) */}
            <Box sx={{ width: 250, textAlign: "center", p: 2, bgcolor: "white", borderBottom: "1px solid #ddd" }}>
                <img src={Logo} alt="Company Logo" style={{ width: "80%", maxWidth: 180 }} />
            </Box>

            {/* Sidebar Content */}
            <Box sx={{ display: "flex", flexDirection: "row", flexGrow: 1 }}>
                
                {/* Sidebar Menu */}
                <Box sx={{
                    width: drawerOpen ? 250 : 80,
                    transition: "width 0.3s ease",
                    bgcolor: "white",
                    display: "flex",
                    flexDirection: "column"
                }}>
                    
                    {/* Toggle Button */}
                    <IconButton onClick={() => setDrawerOpen(!drawerOpen)} sx={{ alignSelf: "flex-end", mr: 1 }}>
                        <ChevronRightIcon sx={{ transform: drawerOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }} />
                    </IconButton>

                    {/* Sidebar Items */}
                    <List>
                        {[
                            { text: "All Files", icon: <FileCopyIcon />, key: "allFiles" },
                            { text: "All Folders", icon: <FolderIcon />, key: "allFolders" },
                            { text: "Recents", icon: <AccessTimeIcon />, key: "recent" },
                            { text: "Bin", icon: <DeleteIcon />, key: "bin" },
                            { text: "My Collections", icon: <CollectionsIcon />, key: "collections" },
                            { text: "Favourites", icon: <StarIcon />, key: "favourites" },
                        ].map(({ text, icon, key }) => (
                            <ListItem key={key} disablePadding>
                                <ListItemButton onClick={() => setSelectedContent(key)} sx={{ justifyContent: drawerOpen ? "initial" : "center" }}>
                                    <ListItemIcon sx={{ minWidth: 0, mr: drawerOpen ? 2 : "auto", justifyContent: "center" }}>
                                        {icon}
                                    </ListItemIcon>
                                    {drawerOpen && <ListItemText primary={text} />}
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                    
                    <Divider />

                    {/* Profile Section */}
                    <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: drawerOpen ? "flex-start" : "center" }}>
                        <IconButton>
                            <AccountCircleIcon sx={{ fontSize: 30 }} />
                        </IconButton>
                        {drawerOpen && <ListItemText primary="Profile" />}
                    </Box>

                </Box>
            </Box>
        </Box>
    );
};

export default SideBar;
