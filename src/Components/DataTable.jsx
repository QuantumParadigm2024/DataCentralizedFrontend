import { CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

const DataTable = ({ refreshData }) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch Data when refreshData changes
    useEffect(() => {
        if (refreshData) {
            fetchData();
        }
    }, [refreshData]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get("planotech-inhouse/getAll/data");

            console.log("API Response:", response.data);

            if (Array.isArray(response.data)) {
                setData(response.data);
            } else {
                const arrayKey = Object.keys(response.data).find(key => Array.isArray(response.data[key]));
                setData(arrayKey ? response.data[arrayKey] : []);
            }
        } catch (err) {
            setError(err.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TableContainer component={Paper}>
            <Typography variant="h6" sx={{ padding: 2 }}>Data Table</Typography>

            {loading ? (
                <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
            ) : error ? (
                <Typography color="error" sx={{ padding: 2 }}>{error}</Typography>
            ) : data.length === 0 ? (
                <Typography sx={{ padding: 2 }}>No data available</Typography>
            ) : (
                <Table>
                     <TableHead>
                        <TableRow>
                            <TableCell><strong>ID</strong></TableCell>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Phone Number</strong></TableCell>
                            <TableCell><strong>Category</strong></TableCell>
                            <TableCell><strong>Designation</strong></TableCell>
                            <TableCell><strong>Address</strong></TableCell>
                            <TableCell><strong>Company Name</strong></TableCell>
                            <TableCell><strong>Industry Type</strong></TableCell>
                            <TableCell><strong>Entry Date</strong></TableCell>
                            <TableCell><strong>Entered By</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.id}</TableCell>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.email}</TableCell>
                                <TableCell>{row.phoneNumber}</TableCell>
                                <TableCell>{row.category}</TableCell>
                                <TableCell>{row.designation}</TableCell>
                                <TableCell>{row.address}</TableCell>
                                <TableCell>{row.companyName}</TableCell>
                                <TableCell>{row.industryType}</TableCell>
                                <TableCell>{row.entryDate}</TableCell>
                                <TableCell>{row.enteredBy}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </TableContainer>
    );
};

export default DataTable;
