/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, IconButton } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import FolderCopyTwoToneIcon from '@mui/icons-material/FolderCopyTwoTone';
import StarTwoToneIcon from '@mui/icons-material/StarTwoTone';
import ContactPageTwoToneIcon from '@mui/icons-material/ContactPageTwoTone';

const SideBar = ({ setSelectedContent, drawerOpen, setDrawerOpen }) => {
    const [activeItem, setActiveItem] = useState(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem("dc");
        navigate("/");
    };

    return (
        <Box
            sx={{
                width: drawerOpen ? 200 : 80,
                bgcolor: "white",
                display: "flex",
                height: "100%",
                flexDirection: "column",
                alignItems: "center",
                // boxShadow: "2px 0px 5px rgba(0, 0, 0, 0.1)",
                transition: "width 0.3s",
            }}
        >
            <IconButton
                onClick={() => setDrawerOpen(!drawerOpen)}
                sx={{ alignSelf: drawerOpen ? "flex-end" : "center" }}
            >
                <MenuIcon
                    sx={{ transform: drawerOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
            </IconButton>

            <List sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
                {[
                    { text: "Datas", icon: <ContactPageTwoToneIcon sx={{ fontSize: 28 }} />, key: "allFiles" },
                    { text: "All Folders", icon: <FolderCopyTwoToneIcon sx={{ fontSize: 28 }} />, key: "allFolders" },
                    { text: "Starred", icon: <StarTwoToneIcon sx={{ fontSize: 29 }} />, key: "starred" },
                ].map(({ text, icon, key }) => (
                    <ListItem key={key} disablePadding>
                        <ListItemButton
                            onClick={() => {
                                setSelectedContent(key);
                                setActiveItem(key);
                            }}
                            sx={{
                                justifyContent: drawerOpen ? "flex-start" : "center",
                                backgroundColor: activeItem === key ? "#f0f0f0" : "transparent",
                            }}
                        >
                            <ListItemIcon sx={{ justifyContent: "center" }}>{icon}</ListItemIcon>
                            {drawerOpen && <ListItemText primary={text} />}
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider sx={{ width: "100%", my: 2 }} />

            <List sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
                {[
                    { text: "Profile", icon: <AccountCircleIcon sx={{ fontSize: 28 }} />, key: "profile" },
                    { text: "Logout", icon: <LogoutIcon sx={{ fontSize: 28 }} />, key: "logout", onClick: handleLogout },
                ].map(({ text, icon, key, onClick }) => (
                    <ListItem key={key} disablePadding>
                        <ListItemButton
                            onClick={() => {
                                if (key === "logout") {
                                    onClick?.();
                                } else {
                                    setSelectedContent(key);
                                    setActiveItem(key);
                                }
                            }}
                            sx={{
                                justifyContent: drawerOpen ? "flex-start" : "center",
                                backgroundColor: activeItem === key ? "#f0f0f0" : "transparent",
                            }}
                        >
                            <ListItemIcon sx={{ justifyContent: "center" }}>{icon}</ListItemIcon>
                            {drawerOpen && <ListItemText primary={text} />}
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default SideBar;