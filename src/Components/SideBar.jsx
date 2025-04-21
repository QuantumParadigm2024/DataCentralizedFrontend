/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, IconButton, } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate, useLocation } from "react-router-dom";
import FolderCopyTwoToneIcon from '@mui/icons-material/FolderCopyTwoTone';
import StarTwoToneIcon from '@mui/icons-material/StarTwoTone';
import ContactPageTwoToneIcon from '@mui/icons-material/ContactPageTwoTone';
import LeaderboardTwoToneIcon from '@mui/icons-material/LeaderboardTwoTone';

const SideBar = ({ drawerOpen, setDrawerOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeItem, setActiveItem] = useState("");

    useEffect(() => {
        const path = location.pathname.split("/").pop(); // get last segment
        setActiveItem(path || "files"); // default to 'files' if blank
    }, [location.pathname]);

    const handleNavigation = (key) => {
        navigate(`/dashboard/${key}`);
    };

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
                    { text: "Datas", icon: <ContactPageTwoToneIcon sx={{ fontSize: 28 }} />, key: "datas" },
                    { text: "Leads", icon: <LeaderboardTwoToneIcon sx={{ fontSize: 28 }} />, key: "leads" },
                    { text: "Folders", icon: <FolderCopyTwoToneIcon sx={{ fontSize: 28 }} />, key: "folders" },
                    { text: "Favourites", icon: <StarTwoToneIcon sx={{ fontSize: 29 }} />, key: "favourites" },
                ].map(({ text, icon, key }) => (
                    <ListItem key={key} disablePadding>
                        <ListItemButton
                            onClick={() => handleNavigation(key)}
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
                                    handleNavigation(key);
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