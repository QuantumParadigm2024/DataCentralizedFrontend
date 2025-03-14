/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
    CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import axiosInstance from "../utils/axiosInstance";

const DataTable = ({ refreshData, searchTerm }) => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pageNo, setPageNo] = useState(0);
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

    const handleOpenPopup = (row) => setSelectedRow(row);
    const handleClosePopup = () => setSelectedRow(null);

    const handleNextPage = () => fetchData(pageNo + 1);
    const handlePrevPage = () => fetchData(pageNo > 0 ? pageNo - 1 : 1);

    return (
        <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: "8px", boxShadow: 3 }}>
            <TableContainer sx={{ maxHeight: "70vh", overflowX: "auto" }}>
                {loading ? (
                    <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
                ) : error ? (
                    <Typography color="error" sx={{ padding: 2 }}>{error}</Typography>
                ) : filteredData.length === 0 ? (
                    <Typography sx={{ padding: 2 }}>No data available</Typography>
                ) : (
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow sx={{ '& th': { backgroundColor: "#eaf1f0", fontWeight: "bold", height: "40px" } }}>
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
                                <TableRow key={row.id} sx={{ '& td': { height: "30px" } }}>
                                    <TableCell>{index + 1 + pageNo * pageSize}</TableCell>
                                    <TableCell>{row.name}</TableCell><TableCell>
                                        <a href={`mailto:${row.email}`}>
                                            {row.email}
                                        </a>
                                    </TableCell>
                                    <TableCell>{row.phoneNumber}</TableCell>
                                    <TableCell>{row.designation}</TableCell>
                                    <TableCell>{row.address}</TableCell>
                                    <TableCell>{row.companyName}</TableCell>
                                    <TableCell>{row.industryType}</TableCell>
                                    <TableCell>
                                        <IconButton size="small" onClick={() => handleOpenPopup(row)}>
                                            <InfoIcon />
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
            <Dialog open={Boolean(selectedRow)} onClose={handleClosePopup} sx={{justifyItems: "flex-end"}}>
                <DialogTitle>More Information</DialogTitle>
                <DialogContent>
                    {selectedRow && (
                        <div>
                            <Typography><strong>Category:</strong> {selectedRow.category}</Typography>
                            <Typography><strong>Entry Date:</strong> {selectedRow.entryDate}</Typography>
                            <Typography><strong>Entered By:</strong> {selectedRow.enteredBy}</Typography>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePopup}>Close</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default DataTable;
