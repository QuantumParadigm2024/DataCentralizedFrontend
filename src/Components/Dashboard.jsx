/* eslint-disable no-unused-vars */
import React, { useRef, useEffect, useState } from "react";
import { Box, Grid, IconButton, Drawer, useMediaQuery, useTheme, } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import NavColorCode from "./NavColorCode";

const Dashboard = () => {
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(200);
    const headerRef = useRef(null);
    const contentRef = useRef(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    useEffect(() => {
        if (headerRef.current && contentRef.current) {
            const headerHeight = headerRef.current.offsetHeight;
            contentRef.current.style.marginTop = `${headerHeight}px`;
        }
    }, []);

    useEffect(() => {
        setSidebarWidth(drawerOpen ? 200 : 80);
    }, [drawerOpen]);

    return (
        <Grid container sx={{ width: "100%", height: "100vh" }}>
            {/* Header */}
            <Box
                ref={headerRef}
                sx={{
                    width: "100%",
                    height: "15%",
                    display: "flex",
                    alignItems: "center",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    gap: "15px",
                    background: "#fff",
                    zIndex: 1000,
                }}
            >
                <Box
                    sx={{
                        width: "16%",
                        height: "80%",
                        display: "flex",
                        justifyContent: "center",
                        pl: "10px",
                    }}
                >
                    <img
                        src="https://quantumshare.quantumparadigm.in/vedio/Planotech_Logo_Black.png"
                        alt="Company Logo"
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                </Box>
                <Box sx={{ width: "100%", height: "100%" }}>
                    <NavColorCode />
                </Box>
            </Box>

            {/* Content */}
            <Box ref={contentRef} sx={{ width: "100%", height: "100%" }}>
                {!isMobile && (
                    <Grid
                        item
                        md={drawerOpen ? 3 : 1}
                        lg={drawerOpen ? 2 : 1}
                        sx={{
                            top: "15%",
                            height: "100vh",
                            position: "fixed",
                            transition: "width 0.3s",
                        }}
                    >
                        <SideBar
                            drawerOpen={drawerOpen}
                            setDrawerOpen={setDrawerOpen}
                        />
                    </Grid>
                )}

                <Drawer
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    sx={{ display: { md: "none" } }}
                >
                    <SideBar
                        drawerOpen={drawerOpen}
                        setDrawerOpen={setDrawerOpen}
                    />
                </Drawer>

                <Grid
                    item
                    xs={12}
                    md={drawerOpen ? 9 : 11}
                    lg={drawerOpen ? 10 : 11}
                    sx={{
                        flexGrow: 1,
                        p: 0,
                        ml: {
                            md: `${sidebarWidth + 20}px`,
                            xs: "0",
                        },
                        height: "100%",
                        width: "100%",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        transition: "margin-left 0.3s",
                    }}
                >
                    {isMobile && (
                        <IconButton onClick={() => setMobileOpen(true)} sx={{ mb: 2 }}>
                            <MenuIcon />
                        </IconButton>
                    )}
                    {/* 👇 Load nested content */}
                    <Outlet />
                </Grid>
            </Box>
        </Grid>
    );
};

export default Dashboard;