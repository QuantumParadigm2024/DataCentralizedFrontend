import React, { useEffect, useState } from "react";
import {
    CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, IconButton, Popover
} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import axiosInstance from "../Helper/AxiosInstance";

const DataTable = ({ refreshData, searchTerm }) => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pageNo, setPageNo] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const pageSize = 50;

    useEffect(() => {
        if (refreshData) {
            fetchData();
        }
    }, [refreshData]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredData(data);
        } else {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            const filtered = data.filter((row) =>
                Object.values(row).some(
                    (value) =>
                        value &&
                        value.toString().toLowerCase().includes(lowercasedSearchTerm)
                )
            );
            setFilteredData(filtered);
        }
    }, [searchTerm, data]);

    const fetchData = async (newPageNo = pageNo) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.get("planotech-inhouse/getAll/data", {
                params: {
                    pageNo: newPageNo,
                    pageSize: pageSize
                }
            });

            console.log("API Response:", response.data);
            if (Array.isArray(response.data)) {
                setData(response.data);
                setFilteredData(response.data);
            } else {
                const arrayKey = Object.keys(response.data).find(key => Array.isArray(response.data[key]));
                const fetchedData = arrayKey ? response.data[arrayKey] : [];
                setData(fetchedData);
                setFilteredData(fetchedData);
            }
            setPageNo(newPageNo);
        } catch (err) {
            setError(err.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    const handlePopoverOpen = (event, row) => {
        setAnchorEl(event.currentTarget);
        setSelectedRow(row);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
        setSelectedRow(null);
    };

    const open = Boolean(anchorEl);

    const handleNextPage = () => fetchData(pageNo + 1);
    const handlePrevPage = () => fetchData(pageNo > 0 ? pageNo - 1 : 1);

    return (
        <Paper sx={{ width: "100%", margin: "auto", overflow: "hidden", borderRadius: "8px", boxShadow: 3 }}>
            <TableContainer sx={{ maxHeight: "60vh", overflowX: "auto" }}>
                {loading ? (
                    <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
                ) : error ? (
                    <Typography color="error" sx={{ padding: 2, fontSize: "0.9rem" }}>{error}</Typography>
                ) : filteredData.length === 0 ? (
                    <Typography sx={{ padding: 1, fontSize: "0.9rem" }}>No data available</Typography>
                ) : (
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow sx={{ '& th': { backgroundColor: "#eaf1f0", fontWeight: "bold", height: "35px", fontSize: "0.8rem" } }}>
                                <TableCell>SL NO</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone Number</TableCell>
                                <TableCell>Designation</TableCell>
                                <TableCell>Address</TableCell>
                                <TableCell>Company Name</TableCell>
                                <TableCell>Industry Type</TableCell>
                                <TableCell>More Info</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredData.map((row, index) => (
                                <TableRow key={row.id} sx={{ '& td': { height: "30px", fontSize: "0.8rem" } }}>
                                    <TableCell>{index + 1 + pageNo * pageSize}</TableCell>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.email}</TableCell>
                                    <TableCell>{row.phoneNumber}</TableCell>
                                    <TableCell>{row.designation}</TableCell>
                                    <TableCell>{row.address}</TableCell>
                                    <TableCell>{row.companyName}</TableCell>
                                    <TableCell>{row.industryType}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onMouseEnter={(e) => handlePopoverOpen(e, row)}
                                        >
                                            <InfoIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>
            {filteredData.length > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "16px" }}>
                    <button onClick={handlePrevPage} disabled={pageNo <= 0}>Previous</button>
                    <button onClick={handleNextPage}>Next</button>
                </div>
            )}
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                disableRestoreFocus
            >
                {selectedRow && (
                    <div style={{ padding: "16px", fontSize: "0.8rem" }} onMouseEnter={() => setAnchorEl(anchorEl)} onMouseLeave={handlePopoverClose}>
                        <p><strong>Category:</strong> {selectedRow.category}</p>
                        <p>Entry Date: {selectedRow.entryDate}</p>
                        <p>Entered By: {selectedRow.enteredBy}</p>
                    </div>
                )}
            </Popover>
        </Paper>
    );
};

export default DataTable;
