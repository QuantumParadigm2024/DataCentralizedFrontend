import React, { useState } from "react";
import {
    Box, Grid, Drawer, IconButton, useMediaQuery, useTheme, TextField
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SideBar from "./SideBar";
import Bin from "./Bin";
import Recent from "./Recent";
import AllFiles from "./AllFiles";
import Collections from "./Collections";
import Favourites from "./Favourites";
import { AccountCircle, Search } from "@mui/icons-material";
import dashboardbg from "../Assets/Planotech Logo Black.png";

const Dashboard = () => {
    const [selectedContent, setSelectedContent] = useState("allFiles");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(""); // Search state
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const renderContent = () => {
        const props = { searchTerm }; 

        switch (selectedContent) {
            case "recent":
                return <Recent {...props} />;
            case "bin":
                return <Bin {...props} />;
            case "collections":
                return <Collections {...props} />;
            case "favourites":
                return <Favourites {...props} />;
            default:
                return <AllFiles {...props} />;
        }
    };

    return (
        <Grid container sx={{ width: "100%", height: "100vh" }}>
            {!isMobile && (
                <Grid item md={3} lg={2} sx={{ height: "100vh", position: "fixed" }}>
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

            {/* Main content with background image */}
            <Grid
                item xs={12} md={9} lg={10}
                sx={{
                    flexGrow: 1,
                    p: 3,
                    ml: { md: "250px", xs: "0" },
                    height: "100vh",
                    backgroundImage: `url(${dashboardbg})`,
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

                <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Grid item xs={10} sm={8} md={6}>
                        <TextField
                            variant="outlined"
                            size="small"
                            placeholder="Search files and folders"
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} // Update search term
                            InputProps={{
                                startAdornment: (<Search sx={{ color: "gray", mr: 1 }} />),
                                sx: { borderRadius: 5 }
                            }}
                        />
                    </Grid>

                    <Grid item xs={2} sm={4} md={2} sx={{ textAlign: "right" }}>
                        <IconButton>
                            <AccountCircle sx={{ fontSize: 40 }} />
                        </IconButton>
                    </Grid>
                </Grid>

                {renderContent()}
            </Grid>
        </Grid>
    );
};

export default Dashboard;
