/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Box, Grid, TextField, IconButton, Table, TableHead, TableRow, TableCell, TableBody, Paper, Typography, Button, } from "@mui/material";
import { Search, Edit } from "@mui/icons-material";
import axiosInstance from "../Helper/AxiosInstance";
import CryptoJS from 'crypto-js';
import { secretKey } from '../Helper/SecretKey';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const Leads = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [leads, setLeads] = useState([]);
    const [newLead, setNewLead] = useState({
        person_name: "",
        phone_number: "",
        company_name: "",
        email: "",
        address: "",
        status: "Active",
        note: "",
    });
    const pageSize = 10;
    const [pageNo, setPageNo] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const decryptToken = (encryptedToken) => {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('Error decrypting token:', error);
            return null;
        }
    };

    const encryptedToken = sessionStorage.getItem("dc");
    const token = decryptToken(encryptedToken);

    useEffect(() => {
        fetchLeadSearch();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() !== "") {
            fetchLeadSearch();
        }
    }, [searchTerm]);

    const fetchLeadSearch = async () => {
        try {
            const response = await axiosInstance.get("/planotech-inhouse/search/leads",
                {
                    params: { searchText: searchTerm },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setLeads(response.data);
        } catch (error) {
            console.error("Error fetching leads:", error);
        }
    };

    useEffect(() => {
        fetchLeads(pageNo);
    }, []);

    const fetchLeads = async (newPageNo = pageNo) => {
        try {
            const response = await axiosInstance.get("/planotech-inhouse/get/leads", {
                params: {
                    pageNo: newPageNo,
                    pageSize: pageSize,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setLeads(response.data.content);
            setTotalPages(response.data.totalPages);
            setPageNo(newPageNo);
        } catch (error) {
            console.error("Error fetching leads:", error);
        }
    };

    const handlePrevPage = () => {
        if (pageNo > 0) {
            fetchLeads(pageNo - 1);
        }
    };

    const handleNextPage = () => {
        if (pageNo < totalPages - 1) {
            fetchLeads(pageNo + 1);
        }
    };

    const handlePageClick = (page) => {
        fetchLeads(page);
    };

    // Handle Add Lead
    const handleAddLead = async () => {
        try {
            await axiosInstance.post("/planotech-inhouse/add/leads", newLead, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setNewLead({
                person_name: "",
                phone_number: "",
                company_name: "",
                email: "",
                address: "",
                status: "Active",
                note: "",
            });
            fetchLeads(); // refresh the list
        } catch (error) {
            console.error("Error adding lead:", error);
        }
    };

    return (
        <Box>
            {/* Search Bar */}
            <Box
                sx={{
                    background: "#fff",
                    p: 2,
                    borderRadius: "8px",
                    boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                }}
            >
                <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item xs={10} sm={8} md={6}>
                        <TextField
                            variant="outlined"
                            size="small"
                            placeholder="Search leads"
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <Search sx={{ color: "gray", mr: 1 }} />,
                                sx: { borderRadius: 5 },
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* Add Lead Form */}
            <Box
                sx={{
                    background: "#f9f9f9",
                    p: 3,
                    borderRadius: 2,
                    mt: 2,
                    mb: 2,
                }}
            >
                <Typography variant="h6" mb={2}>
                    Add New Lead
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Name"
                            fullWidth
                            value={newLead.person_name}
                            onChange={(e) =>
                                setNewLead({ ...newLead, person_name: e.target.value })
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Phone Number"
                            fullWidth
                            value={newLead.phone_number}
                            onChange={(e) =>
                                setNewLead({ ...newLead, phone_number: e.target.value })
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Company Name"
                            fullWidth
                            value={newLead.company_name}
                            onChange={(e) =>
                                setNewLead({ ...newLead, company_name: e.target.value })
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Email"
                            fullWidth
                            value={newLead.email}
                            onChange={(e) =>
                                setNewLead({ ...newLead, email: e.target.value })
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Address"
                            fullWidth
                            value={newLead.address}
                            onChange={(e) =>
                                setNewLead({ ...newLead, address: e.target.value })
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Note"
                            fullWidth
                            value={newLead.note}
                            onChange={(e) =>
                                setNewLead({ ...newLead, note: e.target.value })
                            }
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" onClick={handleAddLead}>
                            Add Lead
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            {/* Leads Table */}
            <Paper elevation={3} sx={{ borderRadius: 3 }}>
                <Table>
                    <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Phone Number</TableCell>
                            <TableCell>Company Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Note</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {leads.length > 0 ? (
                            leads.map((lead, index) => (
                                <TableRow key={index}>
                                    <TableCell>{lead.person_name}</TableCell>
                                    <TableCell>{lead.phone_number}</TableCell>
                                    <TableCell>{lead.company_name}</TableCell>
                                    <TableCell>{lead.email}</TableCell>
                                    <TableCell>{lead.address}</TableCell>
                                    <TableCell>
                                        <Grid container alignItems="center" spacing={1}>
                                            <Grid item>{lead.status}</Grid>
                                            <Grid item>
                                                <IconButton size="small">
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    </TableCell>
                                    <TableCell>
                                        <Grid container alignItems="center" spacing={1}>
                                            <Grid item>{lead.note}</Grid>
                                            <Grid item>
                                                <IconButton size="small">
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography variant="body2" color="text.secondary">
                                        No leads found.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
            <br />
            <Box
                sx={{
                    position: "sticky",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    backgroundColor: "#fff",
                    boxShadow: "0px -2px 5px rgba(0,0,0,0.1)",
                    // padding: "10px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 10,
                    borderRadius: "12px",
                }}
            >
                <div style={{ display: "flex", justifyContent: "center", padding: "10px" }}>
                    <IconButton onClick={handlePrevPage} disabled={pageNo === 0}><ArrowBackIosIcon /></IconButton>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <Button key={i} onClick={() => handlePageClick(i)} disabled={i === pageNo}>{i + 1}</Button>
                    ))}
                    <IconButton onClick={handleNextPage} disabled={pageNo === totalPages - 1}><ArrowForwardIosIcon /></IconButton>
                </div>
            </Box>
        </Box>
    );
};

export default Leads;