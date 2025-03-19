import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Grid,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SideBar from "./SideBar";
import Bin from "../SideBarComponents/Bin";
import Recent from "../SideBarComponents/Recent";
import AllFiles from "../SideBarComponents/AllFiles";
import Collections from "../SideBarComponents/Collections";
import Favourites from "../SideBarComponents/Favourites";
import Logo from "../Assets/Planotech Logo Black.png";

const Dashboard = () => {
  const [selectedContent, setSelectedContent] = useState("allFiles");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(200);

  const renderContent = () => {
    switch (selectedContent) {
      case "recent":
        return <Recent />;
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
            src={Logo}
            alt="Company Logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </Box>

        <Box sx={{ width: "100%", height: "100%" }}>
          <Bin />
        </Box>
      </Box>

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
              setSelectedContent={setSelectedContent}
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
          <Box sx={{ width: 250, bgcolor: "lightgoldenrodyellow", height: "100%" }}>
            <SideBar
              setSelectedContent={setSelectedContent}
              drawerOpen={drawerOpen}
              setDrawerOpen={setDrawerOpen}
            />
          </Box>
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
          {renderContent()}
        </Grid>
      </Box>
    </Grid>
  );
};

export default Dashboard;