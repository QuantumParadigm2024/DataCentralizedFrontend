/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Box, Grid, TextField, IconButton, Table, TableHead, TableRow, TableCell, TableBody, Paper, Typography, Button, TableContainer, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, } from "@mui/material";
import { Search, Edit, Add } from "@mui/icons-material";
import axiosInstance from "../Helper/AxiosInstance";
import CryptoJS from "crypto-js";
import { secretKey } from "../Helper/SecretKey";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CheckIcon from '@mui/icons-material/Check';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

const Leads = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [leads, setLeads] = useState([]);
    const [showAddRow, setShowAddRow] = useState(false);
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
            console.error("Error decrypting token:", error);
            return null;
        }
    };

    const encryptedToken = sessionStorage.getItem("dc");
    const token = decryptToken(encryptedToken);

    useEffect(() => {
        fetchLeads(0);
    }, []);

    useEffect(() => {
        if (searchTerm.trim() !== "") {
            fetchLeadSearch(pageNo);
        } else {
            fetchLeads(pageNo);
        }
    }, [searchTerm, pageNo]);

    const fetchLeadSearch = async (pageNo) => {
        try {
            const response = await axiosInstance.get("/planotech-inhouse/search/leads", {
                params: { searchText: searchTerm, pageNo, pageSize },
                headers: { Authorization: `Bearer ${token}` },
            });
            setLeads(response.data.content);
            setTotalPages(response.data.totalPages || 1);
            setPageNo(pageNo);
        } catch (error) {
            console.error("Error searching leads:", error);
        }
    };

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
        if (pageNo > 0) fetchLeads(pageNo - 1);
    };

    const handleNextPage = () => {
        if (pageNo < totalPages - 1) fetchLeads(pageNo + 1);
    };

    const handlePageClick = (page) => {
        fetchLeads(page);
    };

    const [errors, setErrors] = useState({
        person_name: false,
        phone_number: false,
        email: false,
    });

    const handleAddLead = async () => {
        const newErrors = {
            person_name: !newLead.person_name.trim(),
            phone_number: !newLead.phone_number.trim() || !/^\d{10}$/.test(newLead.phone_number),
            email: !newLead.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newLead.email),
        };

        setErrors(newErrors);
        if (Object.values(newErrors).some((error) => error)) {
            return;
        }

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
            setErrors({
                person_name: false,
                phone_number: false,
                email: false,
            });
            setShowAddRow(false);
            fetchLeads();
        } catch (error) {
            console.error("Error adding lead:", error);
        }
    };

    const [editingNoteId, setEditingNoteId] = useState(null);
    const [noteValue, setNoteValue] = useState("");
    const [editingStatusId, setEditingStatusId] = useState(null);
    const [statusValue, setStatusValue] = useState("");

    const handleStatusUpdate = async (lead) => {
        try {
            await axiosInstance.post(`/planotech-inhouse/modify/lead/status/${lead.id}?status=${statusValue}`,
                {
                    ...lead,
                    status: statusValue,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setEditingStatusId(null);
            fetchLeads(pageNo);
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleNoteUpdate = async (lead) => {
        try {
            await axiosInstance.post(`/planotech-inhouse/modify/lead/note/${lead.id}?note=${noteValue}`,
                {
                    ...lead,
                    note: noteValue,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setEditingNoteId(null);
            fetchLeads(pageNo);
        } catch (error) {
            console.error("Error updating note:", error);
        }
    };

    const [noteDialogOpen, setNoteDialogOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState('');

    return (
        <Box>
            <Box
                sx={{
                    background: "#fff",
                    p: 2,
                    borderRadius: "8px",
                    boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                }}
            >
                <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
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
                    <Grid item xs={12} sm="auto" sx={{ mt: { xs: 1, sm: 0 } }}>
                        <Button
                            fullWidth
                            startIcon={showAddRow ? <BookmarkBorderIcon /> : <Add />}
                            onClick={showAddRow ? handleAddLead : () => setShowAddRow(true)}
                            sx={{
                                fontWeight: "bold",
                                bgcolor: '#ba343b',
                                '&:hover': { bgcolor: '#9e2b31' },
                                color: 'white',
                            }}
                        >
                            {showAddRow ? "Save Lead" : "Add Lead"}
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            {/* Leads Table */}
            <Paper
                sx={{
                    width: "100%",
                    margin: "auto",
                    overflow: "hidden",
                    borderRadius: "8px",
                    boxShadow: 3,
                    mt: 3,
                }}
            >
                <TableContainer sx={{ maxHeight: "60vh", overflowX: "auto" }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow
                                sx={{
                                    "& th": {
                                        backgroundColor: "#eaf1f0",
                                        fontWeight: "bold",
                                        height: "35px",
                                        fontSize: "0.8rem",
                                        borderRight: "1px solid #ddd",
                                    },
                                    "& th:last-child": {
                                        borderRight: "none",
                                    },
                                }}
                            >
                                <TableCell>Sl no</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Phone Number</TableCell>
                                <TableCell sx={{ minWidth: 180 }}>Email</TableCell>
                                <TableCell sx={{ minWidth: 220 }}>Address</TableCell>
                                <TableCell sx={{ minWidth: 220 }}>Company Name</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Note</TableCell>
                                <TableCell>Lead By</TableCell>
                                <TableCell>Date & Time</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {showAddRow && (
                                <TableRow>
                                    <TableCell>{leads.length + 1}</TableCell>
                                    <TableCell>
                                        <TextField
                                            variant="standard"
                                            value={newLead.person_name}
                                            onChange={(e) => {
                                                setNewLead({ ...newLead, person_name: e.target.value });
                                                setErrors({ ...errors, person_name: false });
                                            }}
                                            error={errors.person_name}
                                            helperText={errors.person_name ? "Name is required" : ""}
                                            FormHelperTextProps={{
                                                sx: {
                                                    fontSize: '10px',
                                                    marginTop: '2px',
                                                },
                                            }}
                                            inputProps={{
                                                style: {
                                                    paddingBottom: '4px',
                                                },
                                            }}
                                            sx={{
                                                '& .MuiInputBase-root': {
                                                    alignItems: 'flex-end',
                                                },
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            variant="standard"
                                            value={newLead.phone_number}
                                            onChange={(e) => {
                                                setNewLead({ ...newLead, phone_number: e.target.value });
                                                setErrors({ ...errors, phone_number: false });
                                            }}
                                            error={errors.phone_number}
                                            helperText={errors.phone_number ? "Valid 10-digit number required" : ""}
                                            FormHelperTextProps={{
                                                sx: {
                                                    fontSize: '10px',
                                                    marginTop: '2px',
                                                },
                                            }}
                                            inputProps={{
                                                style: {
                                                    paddingBottom: '4px',
                                                },
                                            }}
                                            sx={{
                                                '& .MuiInputBase-root': {
                                                    alignItems: 'flex-end',
                                                },
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            variant="standard"
                                            value={newLead.email}
                                            onChange={(e) => {
                                                setNewLead({ ...newLead, email: e.target.value });
                                                setErrors({ ...errors, email: false });
                                            }}
                                            error={errors.email}
                                            helperText={errors.email ? "Valid email required (user@example.com)" : ""}
                                            FormHelperTextProps={{
                                                sx: {
                                                    fontSize: '10px',
                                                    marginTop: '2px',
                                                },
                                            }}
                                            inputProps={{
                                                style: {
                                                    paddingBottom: '4px',
                                                },
                                            }}
                                            sx={{
                                                '& .MuiInputBase-root': {
                                                    alignItems: 'flex-end',
                                                },
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            variant="standard"
                                            value={newLead.address}
                                            onChange={(e) => setNewLead({ ...newLead, address: e.target.value })}
                                            inputProps={{ style: { paddingBottom: '4px' } }}
                                            sx={{
                                                '& .MuiInputBase-root': {
                                                    alignItems: 'flex-end',
                                                },
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            variant="standard"
                                            value={newLead.company_name}
                                            onChange={(e) => setNewLead({ ...newLead, company_name: e.target.value })}
                                            inputProps={{ style: { paddingBottom: '4px' } }}
                                            sx={{
                                                '& .MuiInputBase-root': {
                                                    alignItems: 'flex-end',
                                                },
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>{newLead.status}</TableCell>
                                    <TableCell>
                                        <TextField
                                            variant="standard"
                                            value={newLead.note}
                                            onChange={(e) => setNewLead({ ...newLead, note: e.target.value })}
                                            inputProps={{ style: { paddingBottom: '4px' } }}
                                            sx={{
                                                '& .MuiInputBase-root': {
                                                    alignItems: 'flex-end',
                                                },
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>—</TableCell>
                                    <TableCell>—</TableCell>
                                </TableRow>
                            )}

                            {/* Existing Leads */}
                            {leads && leads.length > 0 ? (
                                leads.map((lead, index) => (
                                    <TableRow
                                        key={index}
                                        sx={{
                                            "& td": {
                                                height: "30px",
                                                fontSize: "0.8rem",
                                                borderRight: "1px solid #eee",
                                            },
                                            "& td:last-child": {
                                                borderRight: "none",
                                            },
                                        }}
                                    >
                                        <TableCell>{(pageNo || 0) * pageSize + index + 1}</TableCell>
                                        <TableCell>{lead.person_name}</TableCell>
                                        <TableCell>{lead.phone_number}</TableCell>
                                        <TableCell sx={{ minWidth: 180, wordBreak: "break-word", whiteSpace: "normal" }}>{lead.email}</TableCell>
                                        <TableCell sx={{ minWidth: 220, wordBreak: "break-word", whiteSpace: "normal" }}>{lead.address}</TableCell>
                                        <TableCell sx={{ minWidth: 220, wordBreak: "break-word", whiteSpace: "normal" }}>{lead.company_name}</TableCell>
                                        <TableCell>
                                            {editingStatusId === lead.id ? (
                                                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                                                    <TextField
                                                        select
                                                        size="small"
                                                        value={statusValue}
                                                        onChange={(e) => setStatusValue(e.target.value)}
                                                        onBlur={() => handleStatusUpdate(lead)}
                                                        sx={{
                                                            fontWeight: "400",
                                                            color: "grey",
                                                            fontSize: "10px",
                                                            flex: 1,
                                                            maxWidth: 140,
                                                        }}
                                                    >
                                                        <MenuItem value="Active">Active</MenuItem>
                                                        <MenuItem value="Incomplete">Incomplete</MenuItem>
                                                        <MenuItem value="Complete">Complete</MenuItem>
                                                    </TextField>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setEditingStatusId(null);
                                                            handleStatusUpdate(lead);
                                                        }}
                                                    >
                                                        <CheckIcon sx={{ fontSize: 22, color: "#4caf50" }} />
                                                    </IconButton>
                                                </Box>
                                            ) : (
                                                <Box display="flex" alignItems="center" justifyContent="space-between" gap="10px" width="100%">
                                                    <Box
                                                        sx={{
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            fontWeight: "bold",
                                                            color:
                                                                lead.status === "Active"
                                                                    ? "orange"
                                                                    : lead.status === "Incomplete"
                                                                        ? "red"
                                                                        : lead.status === "Complete"
                                                                            ? "green"
                                                                            : "black",
                                                        }}
                                                    >
                                                        {lead.status}
                                                    </Box>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setEditingStatusId(lead.id);
                                                            setStatusValue(lead.status);
                                                        }}
                                                    >
                                                        <Edit fontSize="10px" />
                                                    </IconButton>
                                                </Box>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingNoteId === lead.id ? (
                                                <Box sx={{ width: 200, position: "relative" }}>
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        minRows={4}
                                                        maxRows={8}
                                                        value={noteValue}
                                                        onChange={(e) => {
                                                            if (e.target.value.length <= 2000) {
                                                                setNoteValue(e.target.value);
                                                            }
                                                        }}
                                                        inputProps={{ maxLength: 2000 }}
                                                        variant="outlined"
                                                        placeholder="Enter note (max 2000 characters)"
                                                    />
                                                    <Box
                                                        sx={{
                                                            position: "absolute",
                                                            bottom: 8,
                                                            right: 12,
                                                            zIndex: 1,
                                                        }}
                                                    >
                                                        <Button
                                                            size="small"
                                                            onClick={() => {
                                                                handleNoteUpdate(lead);
                                                                setEditingNoteId(null);
                                                            }}
                                                            sx={{
                                                                fontWeight: "bold",
                                                                fontSize: "12px",
                                                                minWidth: "auto",
                                                                padding: "2px 10px",
                                                                color: "#ba343b",
                                                                "&:hover": {
                                                                    border: "0.5px solid #ba343b",
                                                                },
                                                            }}
                                                        >
                                                            Save
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <Grid container alignItems="center" justifyContent="space-between">
                                                    <Grid
                                                        item
                                                        onClick={() => {
                                                            setSelectedNote(lead.note);
                                                            setNoteDialogOpen(true);
                                                        }}
                                                        sx={{
                                                            maxWidth: "80%",
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            cursor: "pointer",
                                                            color: "#333",
                                                        }}
                                                    >
                                                        {lead.note.length > 30 ? `${lead.note.substring(0, 30)}...` : lead.note}
                                                    </Grid>
                                                    <Grid item>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setEditingNoteId(lead.id);
                                                                setNoteValue(lead.note || '');
                                                            }}
                                                        >
                                                            <Edit fontSize="10px" />
                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                            )}
                                        </TableCell>
                                        <TableCell>{lead.enteredBy.split('(')[0].trim()}</TableCell>
                                        <TableCell>{new Date(lead.entryDate).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={10} align="center">
                                        <Typography variant="body2" sx={{ padding: 2, fontSize: '14px', color: 'grey', fontWeight: 'bold', textAlign: "center" }}>
                                            No leads found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>

                    </Table>
                </TableContainer>
            </Paper>

            {/* Pagination */}
            <br />
            {leads.length > 0 && (
                <Box
                    sx={{
                        position: "sticky",
                        bottom: 0,
                        width: "100%",
                        backgroundColor: "#fff",
                        boxShadow: "0px -2px 5px rgba(0,0,0,0.1)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 10,
                        borderRadius: "12px",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "center", padding: "10px" }}>
                        <IconButton onClick={handlePrevPage} disabled={pageNo === 0}>
                            <ArrowBackIosIcon />
                        </IconButton>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <Button key={i} onClick={() => handlePageClick(i)} disabled={i === pageNo}>
                                {i + 1}
                            </Button>
                        ))}
                        <IconButton onClick={handleNextPage} disabled={pageNo === totalPages - 1}>
                            <ArrowForwardIosIcon />
                        </IconButton>
                    </div>
                </Box>
            )}

            <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontSize: '18px', fontWeight: 'bold', color: '#ba343b' }}>Note</DialogTitle>
                <DialogContent
                    sx={{
                        maxHeight: '500px',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                    }}
                >
                    <Typography
                        variant="body1"
                        sx={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            maxWidth: '100%',
                        }}
                    >
                        {selectedNote}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNoteDialogOpen(false)} sx={{ color: '#ba343b', fontWeight: 'bold' }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Leads;