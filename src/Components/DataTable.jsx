/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, IconButton, Popover, Button } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import CryptoJS from "crypto-js";
import { secretKey } from "../Helper/SecretKey";
import axiosInstance from "../Helper/AxiosInstance";

const DataTable = ({ data, refreshData, searchTerm, category }) => {
    const [localData, setLocalData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pageNo, setPageNo] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const pageSize = 50;
    const [totalPages, setTotalPages] = useState(0);
    const [expandedRows, setExpandedRows] = useState({});

    useEffect(() => {
        if (Array.isArray(data)) {
            setLocalData(data);
        } else {
            setLocalData([]);
        }
    }, [data]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            if (category) {
                fetchCategoryData();
            } else {
                fetchData();
            }
        } else {
            fetchSearchData();
        }
    }, [searchTerm, category]);

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

    const handleRowClick = (rowId) => {
        setExpandedRows((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
    };

    const truncateText = (text, isExpanded) => {
        if (isExpanded || !text) return text;
        const words = text.split(" ");
        return words.length > 2 ? words.slice(0, 2).join(" ") + " ..." : text;
    };

    const fetchData = async (newPageNo = pageNo) => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                pageNo: newPageNo,
                pageSize: pageSize,
            };

            const response = await axiosInstance.get("planotech-inhouse/getAll/data", {
                params: params,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (Array.isArray(response.data)) {
                setLocalData(response.data);
                setFilteredData(response.data);
            } else {
                const arrayKey = Object.keys(response.data).find((key) =>
                    Array.isArray(response.data[key])
                );
                const fetchedData = arrayKey ? response.data[arrayKey] : [];
                setLocalData(fetchedData);
                setFilteredData(fetchedData);
            }
            setTotalPages(response.data.totalPages || 0);
            setPageNo(newPageNo);
        } catch (err) {
            setError(err.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoryData = async (newPageNo = pageNo) => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                pageNo: newPageNo,
                pageSize: pageSize,
            };

            const response = await axiosInstance.get(
                `/planotech-inhouse/get/data/${category}`,
                {
                    params: params,
                    category: category,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (Array.isArray(response.data.content)) {
                setLocalData(response.data.content);
                setFilteredData(response.data.content);
                setTotalPages(response.data.totalPages || 0);
                setPageNo(newPageNo);
            } else {
                setLocalData([]);
                setFilteredData([]);
                setTotalPages(0);
                setPageNo(0);
            }
        } catch (err) {
            setError(err.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    const fetchSearchData = async (newPageNo = pageNo) => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                searchText: searchTerm,
                pageNo: newPageNo,
                pageSize: pageSize,
            };

            const response = await axiosInstance.get(`planotech-inhouse/search`, {
                params: params,
                headers: { Authorization: `Bearer ${token}` },
            });

            if (Array.isArray(response.data)) {
                setFilteredData(response.data);
            } else {
                const arrayKey = Object.keys(response.data).find((key) =>
                    Array.isArray(response.data[key])
                );
                setFilteredData(arrayKey ? response.data[arrayKey] : []);
            }
            setTotalPages(response.data.totalPages || 0);
            setPageNo(newPageNo);
        } catch (err) {
            setError(err.message || "Something went wrong!");
            setFilteredData([]);
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

    const handleNextPage = () => {
        if (pageNo < totalPages - 1) {
            if (searchTerm.trim() === "") {
                if (category) {
                    fetchCategoryData(pageNo + 1);
                } else {
                    fetchData(pageNo + 1);
                }
            } else {
                fetchSearchData(pageNo + 1);
            }
        }
    };

    const handlePrevPage = () => {
        if (pageNo > 0) {
            if (searchTerm.trim() === "") {
                if (category) {
                    fetchCategoryData(pageNo - 1);
                } else {
                    fetchData(pageNo - 1);
                }
            } else {
                fetchSearchData(pageNo - 1);
            }
        }
    };

    const handlePageClick = (page) => {
        if (searchTerm.trim() === "") {
            if (category) {
                fetchCategoryData(page);
            } else {
                fetchData(page);
            }
        } else {
            fetchSearchData(page);
        }
    };

    const renderPagination = () => {
        const pages = [];
        const visiblePages = 4;
        const startPage = Math.max(0, pageNo - Math.floor(visiblePages / 2));
        const endPage = Math.min(totalPages, startPage + visiblePages);

        if (startPage > 0) {
            pages.push(
                <Button key="first" onClick={() => handlePageClick(0)}>
                    1
                </Button>
            );
            if (startPage > 1) pages.push(<span key="start-ellipsis">...</span>);
        }

        for (let i = startPage; i < endPage; i++) {
            pages.push(
                <Button key={i} onClick={() => handlePageClick(i)} disabled={i === pageNo}>
                    {i + 1}
                </Button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push(<span key="end-ellipsis">...</span>);
            pages.push(
                <Button key="last" onClick={() => handlePageClick(totalPages - 1)}>
                    {totalPages}
                </Button>
            );
        }

        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "10px",
                    alignItems: "center",
                }}
            >
                <IconButton onClick={handlePrevPage} disabled={pageNo === 0}>
                    <ArrowBackIosIcon />
                </IconButton>
                {pages}
                <IconButton onClick={handleNextPage} disabled={pageNo === totalPages - 1}>
                    <ArrowForwardIosIcon />
                </IconButton>
            </div>
        );
    };

    const highlightSearch = (text, searchTerm) => {
        if (!text) return text;
        if (!searchTerm.trim()) return text;
        const regex = new RegExp(`(${searchTerm})`, "gi");
        return text.split(regex).map((part, index) =>
            regex.test(part) ? (
                <span key={index} style={{ backgroundColor: "yellow" }}>
                    {part}
                </span>
            ) : (
                part
            )
        );
    };

    return (
        <Paper
            sx={{
                width: "100%",
                margin: "auto",
                overflow: "hidden",
                borderRadius: "8px",
                boxShadow: 3,
            }}
        >
            <TableContainer sx={{ maxHeight: "60vh", overflowX: "auto" }}>
                {loading ? (
                    <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
                ) : error ? (
                    <Typography color="error" sx={{ padding: 1, fontSize: "0.9rem" }}>
                        {error}
                    </Typography>
                ) : !Array.isArray(filteredData) || filteredData.length === 0 ? (
                    <Typography sx={{ padding: 1, fontSize: "0.9rem" }}>
                        No data available
                    </Typography>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow
                                sx={{
                                    "& th": {
                                        backgroundColor: "#eaf1f0",
                                        fontWeight: "bold",
                                        height: "35px",
                                        fontSize: "0.8rem",
                                    },
                                }}
                            >
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
                                <TableRow key={row.id} sx={{ "& td": { height: "30px", fontSize: "0.8rem" } }}>
                                    <TableCell>{index + 1 + pageNo * pageSize}</TableCell>
                                    <TableCell>{highlightSearch(row.name, searchTerm)}</TableCell>
                                    <TableCell>
                                        <a
                                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${row.email}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {highlightSearch(row.email, searchTerm)}
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        {/^([6-9])\d{9}$/.test(row.phoneNumber) &&
                                            row.phoneNumber.length === 10
                                            ? `+91${row.phoneNumber}`
                                            : "Wrong Number"}
                                    </TableCell>
                                    <TableCell onClick={() => handleRowClick(row.id)}>
                                        {highlightSearch(truncateText(row.designation, expandedRows[row.id]), searchTerm)}
                                    </TableCell>
                                    <TableCell>{highlightSearch(row.address, searchTerm)}</TableCell>
                                    <TableCell onClick={() => handleRowClick(row.id)}>
                                        {highlightSearch(truncateText(row.companyName, expandedRows[row.id]), searchTerm)}
                                    </TableCell>
                                    <TableCell>{highlightSearch(row.industryType, searchTerm)}</TableCell>
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
            {filteredData.length > 0 && renderPagination()}
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
                disableRestoreFocus
            >
                {selectedRow && (
                    <div
                        style={{ padding: "16px", fontSize: "0.8rem" }}
                        onMouseEnter={() => setAnchorEl(anchorEl)}
                        onMouseLeave={handlePopoverClose}
                    >
                        <p>Category : {selectedRow.category}</p>
                        <p>Entry Date : {selectedRow.entryDate}</p>
                        <p>Entered By : {selectedRow.enteredBy}</p>
                    </div>
                )}
            </Popover>
        </Paper>
    );
};

export default DataTable;