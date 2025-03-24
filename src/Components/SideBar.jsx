/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CollectionsIcon from "@mui/icons-material/Collections";
import StarIcon from "@mui/icons-material/Star";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

const SideBar = ({ setSelectedContent, drawerOpen, setDrawerOpen }) => {
  const [activeItem, setActiveItem] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logging out...");
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
          { text: "All Files", icon: <FileCopyIcon sx={{ fontSize: 28 }} />, key: "allFiles" },
          { text: "All Folders", icon: <FolderIcon sx={{ fontSize: 28 }} />, key: "allFolders" },
          // { text: "Recents", icon: <AccessTimeIcon sx={{ fontSize: 28 }} />, key: "recent" },
          // { text: "Collections", icon: <CollectionsIcon sx={{ fontSize: 28 }} />, key: "collections" },
          { text: "Starred", icon: <StarIcon sx={{ fontSize: 28 }} />, key: "starred" },
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