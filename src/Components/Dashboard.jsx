import React, { useState } from "react";
import {
    Box, Grid, Drawer, IconButton, useMediaQuery, useTheme
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SideBar from "./SideBar";
import Bin from "../SideBarComponents/Bin";
import Recent from "../SideBarComponents/Recent";
import AllFiles from "../SideBarComponents/AllFiles";
import Collections from "../SideBarComponents/Collections";
import Favourites from "../SideBarComponents/Favourites";
import AllFolders from "../SideBarComponents/AllFolders";

const Dashboard = () => {
    const [selectedContent, setSelectedContent] = useState("allFiles");
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const renderContent = () => {

        switch (selectedContent) {
            case "recent":
                return <Recent />;
            case "allFolders":
                return <AllFolders />;
            case "bin":
                return <Bin />;
            case "collections":
                return <Collections />;
            case "favourites":
                return <Favourites />;
            default:
                return <AllFiles />;
        }
    };

    return (
        <Grid container sx={{ width: "100%", height: "100vh", overflow: "hidden" }}>
            {!isMobile && (
                <Grid item md={3} lg={2} sx={{ height: "100vh", position: "fixed", overflow: "hidden" }}>
                    <SideBar setSelectedContent={setSelectedContent} />
                </Grid>
            )}

            <Drawer
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                sx={{ display: { md: "none" } }}
            >
                <Box sx={{ width: 250, bgcolor: "lightgoldenrodyellow", height: "100%" }}>
                    <SideBar setSelectedContent={setSelectedContent} />
                </Box>
            </Drawer>

            <Grid
                item xs={12} md={9} lg={10}
                sx={{
                    flexGrow: 1,
                    p: 3,
                    ml: { md: "250px", xs: "0" },
                    height: "100vh",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",

                }}
            >
                {isMobile && (
                    <IconButton onClick={() => setMobileOpen(true)} sx={{ mb: 2 }}>
                        <MenuIcon />
                    </IconButton>
                )}

                {renderContent()}
            </Grid>
        </Grid>
    );
};

export default Dashboard;