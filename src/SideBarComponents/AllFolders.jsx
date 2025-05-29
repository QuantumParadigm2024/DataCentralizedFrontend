/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { LinearProgress, CircularProgress, Box, Button, Grid, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Typography, List, ListItem, ListItemText, ToggleButton, ToggleButtonGroup, Card, CardContent, Tooltip, Input, IconButton, Menu, MenuItem, Checkbox } from "@mui/material";
import { Search, ViewList, GridView, Folder as FolderIcon, UploadFile, Star, StarBorder } from "@mui/icons-material";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import axiosInstance from "../Helper/AxiosInstance";
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import CryptoJS from 'crypto-js';
import { secretKey } from '../Helper/SecretKey';
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import ImageIcon from '@mui/icons-material/Image';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import BlockIcon from '@mui/icons-material/Block';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import { useDropzone } from 'react-dropzone';

const AllFolders = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [open, setOpen] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [folders, setFolders] = useState([]);
    const [viewMode, setViewMode] = useState("list");
    const [openFolder, setOpenFolder] = useState(null);
    const [files, setFiles] = useState({});
    const pageSize = 10;
    const [pageNo, setPageNo] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [starredFolders, setStarredFolders] = useState([]);
    const [starredFiles, setStarredFiles] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [categoryLoading, setCategoryLoading] = useState(false);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUploadClose = () => {
        setAnchorEl(null);
    }

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

    const toggleFolderStar = async (entityId) => {
        try {
            const isStarred = starredFolders.some(folder => folder.entityId === entityId);
            let updatedStarredFolders = [];

            if (isStarred) {
                updatedStarredFolders = starredFolders.filter(folder => folder.entityId !== entityId);
                await axiosInstance.get(`/planotech-inhouse/unstar/favorites`, {
                    params: {
                        id: entityId,
                        type: "folder"
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
            } else {
                updatedStarredFolders = [...starredFolders, { entityId }];
                await axiosInstance.post("/planotech-inhouse/add/favorite", {
                    entityId: entityId,
                    type: "folder"
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
            }
            setStarredFolders(updatedStarredFolders);
            if (currentFolderId) {
                fetchFiles(currentFolderId);
            }
        } catch (error) {
            console.error("Error toggling star:", error);
        }
    };

    const toggleFileStar = async (id) => {
        try {
            const isStarred = starredFiles.some(file => file.id === id);
            let updatedStarredFiles = [];

            if (isStarred) {
                // Unstar logic
                updatedStarredFiles = starredFiles.filter(file => file.id !== id);
                await axiosInstance.get(`/planotech-inhouse/unstar/favorites`, {
                    params: { id, type: "file" },
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
            } else {
                // Star logic
                updatedStarredFiles = [...starredFiles, { id }];
                await axiosInstance.post("/planotech-inhouse/add/favorite", {
                    entityId: id,
                    type: "file"
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
            }
            setStarredFiles(updatedStarredFiles);
        } catch (error) {
            console.error("Error toggling star:", error);
        }
    };

    useEffect(() => {
        const fetchStarredFoldersandFiles = async () => {
            try {
                const response = await axiosInstance.get("/planotech-inhouse/getAll/favorites", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setStarredFolders(response.data.data || []);
                setStarredFiles(response.data.data || []);
            } catch (error) {
                console.error("Error fetching starred folders:", error);
            }
        };
        fetchStarredFoldersandFiles();
    }, []);

    useEffect(() => {
        fetchFolders(selectedCategory);
    }, []);

    const fetchFolders = async (category = 'IT', newPageNo = pageNo) => {
        try {
            const response = await axiosInstance.get(`/planotech-inhouse/getFolders/${category}`, {
                params: {
                    pageNo: newPageNo,
                    pageSize: pageSize
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            );
            const fetchedFolders = response.data.content || [];
            setFolders(fetchedFolders);
            setTotalPages(response.data.totalPages || Math.ceil(fetchedFolders.length / pageSize));
            setPageNo(newPageNo);
        } catch (error) {
            console.error("Error fetching folders:", error);
        }
    };

    const handleNextPage = () => {
        if (pageNo < totalPages - 1) fetchFolders(selectedCategory, pageNo + 1);
    };

    const handlePrevPage = () => {
        if (pageNo > 0) fetchFolders(selectedCategory, pageNo - 1);
    };

    const handlePageClick = (page) => {
        fetchFolders(selectedCategory, page);
    };

    const filteredFolders = folders.filter(folder =>
        folder.folderName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredFiles = openFolder ? (files[openFolder] || []).filter(file =>
        file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        setOpen(false);
        setFolderName("");
    };

    const [createFolder, setCreateFolder] = useState("");
    const [createFolderOpen, setCreateFolderOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    const handleCreateFolder = async () => {
        setOpen(false);

        if (!folderName.trim()) {
            setCreateFolder("Please enter a folder name");
            setCreateFolderOpen(true);
            return;
        }

        setCreating(true);
        setCreateFolder("Creating folder...");
        setCreateFolderOpen(true);

        try {
            await axiosInstance.post(`/planotech-inhouse/create/folder/${folderName}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCreateFolder("✅ Folder created successfully!");
            setFolderName("");
            handleClose();
            fetchFolders(selectedCategory);
        } catch (error) {
            console.error("Error creating folder:", error);
            if (
                error.response &&
                error.response.status === 400 &&
                error.response.data.message === "folder already exists"
            ) {
                setCreateFolder("⚠️ Folder name exists. Try another.");
            } else {
                setCreateFolder("❌ Failed to create folder. Please try again.");
            }
            setFolderName("");
        } finally {
            setCreating(false);
        }
    };

    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [currentFolderName, setCurrentFolderName] = useState('');
    const [subfolders, setSubfolders] = useState({});

    const handleCreateSubfolder = async () => {
        setOpen(false);
        try {
            await axiosInstance.post(`/planotech-inhouse/create/subfolder/${folderName}?rootFolderId=${currentFolderId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            setCreateFolder("✅ Folder created successfully!");
            setFolderName("");
            handleClose();
            fetchFiles(currentFolderId);
        } catch (error) {
            console.error("Error creating subfolder:", error);
        }
    };

    const [folderHistory, setFolderHistory] = useState([]);

    const handleFolderClick = (folder) => {
        if (currentFolderId) {
            setFolderHistory((prev) => [...prev, { entityId: currentFolderId, folderName: currentFolderName }]);
        }
        setOpenFolder(folder.entityId);
        setCurrentFolderId(folder.entityId);
        setCurrentFolderName(folder.folderName);
        // fetchFiles(folder.entityId);
    };

    const openFolderDirectly = (folder) => {
        setOpenFolder(folder.entityId);
        setCurrentFolderId(folder.entityId);
        setCurrentFolderName(folder.folderName);
        fetchFiles(folder.entityId);
    };

    const handleBackClick = () => {
        if (folderHistory.length > 0) {
            const previous = folderHistory[folderHistory.length - 1];
            setFolderHistory((prev) => prev.slice(0, -1));
            openFolderDirectly(previous);
        } else {
            setOpenFolder(null);
            setCurrentFolderId(null);
            setCurrentFolderName('');
        }
    };

    const [combinedItems, setCombinedItems] = useState([]);

    const fetchFiles = async (entityId) => {
        try {
            const response = await axiosInstance.get(`/planotech-inhouse/getFiles?folderId=${entityId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const { files: fetchedFiles, subFolder } = response.data;

            const foldersWithType = (subFolder || []).map(folder => ({ ...folder, type: 'folder' }));
            const filesWithType = (fetchedFiles || []).map(file => ({ ...file, type: 'file' }));

            const combined = [...foldersWithType, ...filesWithType];

            setCombinedItems(prev => ({
                ...prev,
                [entityId]: combined
            }));

            setFiles(prev => ({ ...prev, [entityId]: fetchedFiles || [] }));
            setSubfolders(prev => ({ ...prev, [entityId]: subFolder || [] }));
        } catch (error) {
            console.error("Error fetching files and subfolders:", error);
        }
    };

    useEffect(() => {
        if (openFolder) {
            fetchFiles(openFolder);
        }
    }, [openFolder]);

    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("");
    const [uploadOpen, setUploadOpen] = useState(false);

    const MAX_SMALL_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    const MAX_LARGE_FILE_SIZE = 50 * 1024 * 1024 * 1024; // 50GB

    const handleFileValidation = (files, maxSize) => {
        let validFiles = [];
        let totalSize = 0;

        for (let file of files) {
            if (file.size > maxSize) {
                setUploadStatus(`❌ File "${file.name}" exceeds ${(maxSize / (1024 * 1024)).toFixed(0)}MB limit and can't be uploaded. Choose large file option`);
                setUploading(false);
                setTimeout(() => setUploadOpen(false), 8000);
                return []; // Stop execution immediately
            }

            if (totalSize + file.size > maxSize) {
                setUploadStatus(`⚠️ Total file size exceeds ${(maxSize / (1024 * 1024)).toFixed(0)}MB. Removing the last file.`);
                setTimeout(() => setUploadOpen(false), 8000);
                break;
            }

            validFiles.push(file);
            totalSize += file.size;
        }

        return validFiles;
    };

    const handleDrop = (acceptedFiles, rejectedFiles) => {
        setUploading(true);
        setUploadOpen(true);
        setUploadStatus("");
        if (acceptedFiles.length > 0) {
            const smallFiles = [];
            const largeFiles = [];

            for (const file of acceptedFiles) {
                if (file.size <= MAX_SMALL_FILE_SIZE) {
                    smallFiles.push(file);
                } else if (file.size <= MAX_LARGE_FILE_SIZE) {
                    largeFiles.push(file);
                } else {
                    setUploadStatus(`❌ File "${file.name}" exceeds the 50GB limit and can't be uploaded.`);
                    setUploadOpen(true);
                    setTimeout(() => setUploadOpen(false), 6000);
                    return;
                }
            }

            // Handle small files upload
            const validSmallFiles = handleFileValidation(smallFiles, MAX_SMALL_FILE_SIZE);
            if (validSmallFiles.length > 0) {
                uploadFiles(validSmallFiles, openFolder, "/planotech-inhouse/uploadFile");
            }

            // Handle large files upload
            const validLargeFiles = handleFileValidation(largeFiles, MAX_LARGE_FILE_SIZE);
            if (validLargeFiles.length > 0) {
                uploadFiles(validLargeFiles, openFolder, "/planotech-inhouse/upload/largeFile");
            }
        }

        if (rejectedFiles.length > 0) {
            setUploadStatus("❌ Some files were rejected due to size or format.");
            setUploadOpen(true);
            setTimeout(() => setUploadOpen(false), 5000);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: handleDrop,
        noClick: true,
        noKeyboard: true,
        multiple: true,
        maxSize: MAX_LARGE_FILE_SIZE,
    });

    // ✅ Small File Upload (≤100MB)
    const handleFileUpload = async (event, entityId) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        let validFiles = handleFileValidation([...files], MAX_SMALL_FILE_SIZE);
        if (validFiles.length === 0) return;

        await uploadFiles(validFiles, entityId, "/planotech-inhouse/uploadFile");
    };

    // ✅ Large File Upload (≤50GB)
    const handleLargeFileUpload = async (event, entityId) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        let validFiles = handleFileValidation([...files], MAX_LARGE_FILE_SIZE);
        if (validFiles.length === 0) return;

        await uploadFiles(validFiles, entityId, "/planotech-inhouse/upload/largeFile");
    };

    const uploadFiles = async (validFiles, entityId, endpoint) => {
        let anyFileUploaded = false;
        let skippedCount = 0;
        let uploadedCount = 0;

        if (!validFiles.length) return;

        setUploading(true);
        setUploadOpen(true);
        setUploadStatus("Uploading...");
        const checkFormData = new FormData();
        validFiles.forEach(file => checkFormData.append("files", file));

        let existsMap = {};
        let selectedFileNames = [];

        try {
            const checkResponse = await axiosInstance.post(
                `/planotech-inhouse/file/isExists?folderId=${entityId}`,
                checkFormData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            existsMap = checkResponse?.data?.exists || {};
        } catch (error) {
            console.error("Error checking file existence:", error);
            setUploadStatus(`❌ Failed to check file existence`);
            return;
        }

        const existingFiles = Object.values(existsMap);
        const multipleConflicts = existingFiles.length > 1;
        let bulkDecision = null;
        let bulkConflictAction = null;

        if (multipleConflicts) {
            setUploading(false);
            setUploadOpen(false);
            bulkDecision = await new Promise((resolve) => {
                setConflictDialog({
                    open: true,
                    fileList: existingFiles.map(file => file.fileName),
                    entityId,
                    endpoint,
                    selectedFiles: [],
                    onDecision: resolve,
                });
            });
            if (!bulkDecision) {
                setUploadStatus("");
                return;
            }
            selectedFileNames = bulkDecision.selectedFiles || [];
            if (bulkDecision.action === "replaceAll") {
                bulkConflictAction = "replace";
            } else if (bulkDecision.action === "skipAll") {
                bulkConflictAction = "skip";
            }
            // Start showing progress again after dialog
            setUploading(true);
            setUploadOpen(true);
            setUploadStatus("Uploading...");
        }

        for (const file of validFiles) {
            const existEntry = Object.values(existsMap).find(item => item.fileName === file.name);
            // ✅ File does not exist – upload normally
            if (!existEntry || !existEntry.id) {
                const uploadFormData = new FormData();
                uploadFormData.append("files", file);

                try {
                    if (!anyFileUploaded) {
                        anyFileUploaded = true;
                    }

                    await axiosInstance.post(`${endpoint}?folderId=${entityId}`, uploadFormData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    setUploadStatus(`✅ ${file.name} uploaded successfully`);
                    uploadedCount++;
                } catch (error) {
                    console.error("Upload failed:", error);
                    setUploadStatus(`❌ ${file.name} upload failed`);
                }
                continue;
            }

            // ⚠️ File exists – need user decision
            const existingFileId = existEntry.id;
            let userDecision = bulkConflictAction;

            // For single conflicts (or when bulk action is not yet decided)
            if (!multipleConflicts && !bulkConflictAction) {
                setUploading(false);
                setUploadOpen(false);
                const singleDecision = await new Promise((resolve) => {
                    setConflictDialog({
                        open: true,
                        file,
                        fileList: [file.name],
                        entityId,
                        endpoint,
                        selectedFiles: [],
                        onDecision: resolve,
                    });
                });

                if (!singleDecision || singleDecision === "skip") {
                    skippedCount++;
                    continue;
                }

                userDecision = singleDecision === "replace" ? "replace" : "skip";
                setUploading(true);
                setUploadOpen(true);
                setUploadStatus("Uploading...");
            }

            const isSelected = selectedFileNames.length === 0 || selectedFileNames.includes(file.name);
            if ((userDecision === "replace" && isSelected) || (userDecision === "skip" && !isSelected)) {
                // ✅ Replace the file
                try {
                    const replaceFormData = new FormData();
                    replaceFormData.append("replaceFiles", file);
                    replaceFormData.append("files", existingFileId.toString());

                    if (!anyFileUploaded) {
                        anyFileUploaded = true;
                    }

                    await axiosInstance.post(`/planotech-inhouse/replaceFile?folderId=${entityId}`, replaceFormData, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data",
                        },
                    });

                    setUploadStatus(`✅ ${file.name} replaced successfully`);
                    uploadedCount++;
                } catch (err) {
                    console.error("Replace failed:", err);
                    setUploadStatus(`❌ Replace failed: ${file.name}`);
                    skippedCount++;
                }
            } else {
                // ❌ Skip the file
                skippedCount++;
            }
        }

        if (anyFileUploaded) {
            fetchFiles(entityId);
            setTimeout(() => setUploadOpen(false), 3000);
        } else {
            setUploadOpen(false);
        }

        setUploading(false);
        console.log(`${uploadedCount} uploaded, ${skippedCount} skipped.`);
    };

    const [bulkConflictAction, setBulkConflictAction] = useState(null);
    // const [conflictDialog, setConflictDialog] = useState({
    //     open: false,
    //     file: null,
    //     entityId: null,
    //     endpoint: "",
    // });
    const [conflictDialog, setConflictDialog] = useState({
        open: false,
        file: null,
        fileList: [],
        entityId: null,
        endpoint: "",
        selectedFiles: [],
        onDecision: () => { },
    });

    const commonButtonStyles = {
        fontWeight: "bold",
        color: "#ba343b",
        borderColor: "#ba343b",
        borderRadius: "30px",
        px: 3,
        minWidth: "100px",
        "&:hover": {
            backgroundColor: "#ba343b",
            color: "white",
        },
    };

    const getFileIcon = (fileName) => {
        if (fileName.endsWith('.pdf')) {
            return <PictureAsPdfIcon sx={{ color: '#de2429' }} />;
        } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
            return <DescriptionIcon sx={{ color: '#2B579A' }} />;
        } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
            return <TableChartIcon sx={{ color: '#217346' }} />;
        } else if (fileName.endsWith('.csv')) {
            return <InsertChartIcon sx={{ color: '#217346' }} />;
        } else if (fileName.endsWith('.zip') || fileName.endsWith('.rar')) {
            return <FolderZipIcon sx={{ color: '#f0a500' }} />;
        } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.PNG') || fileName.endsWith('.gif') || fileName.endsWith('.svg')) {
            return <ImageIcon sx={{ color: '#098dc6' }} />;
        } else {
            return <InsertDriveFileIcon sx={{ color: '#f8d775' }} />;
        }
    };

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState("Deleting...");
    const [deleting, setDeleting] = useState(false);

    const handleDeleteFolder = async (folderId) => {
        setDeleteMessage("Deleting...");
        setDeleteOpen(true);
        setDeleting(true);

        try {
            await axiosInstance.delete(`/planotech-inhouse/admin/delete/folder/${folderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            setDeleteMessage("✅ Folder successfully deleted!");
            fetchFolders(selectedCategory);
            if (openFolder) {
                fetchFiles(openFolder);
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const { message } = error.response.data;
                if (message === "Employess Restricted, Admin use only") {
                    setDeleteMessage("❌ Access Denied! Only admin have access.");
                } else {
                    setDeleteMessage(message || "Failed to delete folder!");
                }
            } else {
                setDeleteMessage("An unexpected error occurred!");
            }

            console.error("Error deleting folder:", error);
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteFile = async (file, entityId) => {
        setDeleteMessage("Deleting...");
        setDeleteOpen(true);
        setDeleting(true);

        try {
            await axiosInstance.delete(`/planotech-inhouse/admin/delete/file?folderId=${entityId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                data: {
                    id: file.id,
                    type: file.type,
                    fileName: file.fileName,
                    fileLink: file.fileLink,
                    fileSize: file.fileSize,
                    time: file.time,
                    createdBy: file.createdBy
                },
            });

            setDeleteMessage("✅ File deleted successfully!");
            fetchFiles(entityId);
        } catch (error) {
            if (error.response && error.response.data) {
                const { message } = error.response.data;
                if (message === "Employess Restricted, Admin use only") {
                    setDeleteMessage("❌ Access Denied! Only admin have access.");
                } else {
                    setDeleteMessage(message || "Failed to delete file!");
                }
            } else {
                setDeleteMessage("An unexpected error occurred!");
            }

            console.error("Error deleting file:", error);
        } finally {
            setDeleting(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes >= 1024 ** 3) {
            return (bytes / (1024 ** 3)).toFixed(2) + ' GB';
        } else if (bytes >= 1024 ** 2) {
            return (bytes / (1024 ** 2)).toFixed(2) + ' MB';
        } else {
            return Math.round(bytes / 1024) + ' KB';
        }
    };

    const [openTooltipId, setOpenTooltipId] = useState(null);
    const [copiedLinkId, setCopiedLinkId] = useState(null);

    const handleCopyLink = (fileLink, id) => {
        navigator.clipboard.writeText(fileLink);
        setCopiedLinkId(id);
        setTimeout(() => setCopiedLinkId(null), 1500);
    };

    const [selectedCategory, setSelectedCategory] = useState('IT');
    const [isAccountsUser, setIsAccountsUser] = useState(true);
    const [twoFactorOpen, setTwoFactorOpen] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState(null);
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const [otpCategory, setOtpCategory] = useState("");
    const [submittingOtp, setSubmittingOtp] = useState(false);
    const [authResultOpen, setAuthResultOpen] = useState(false);
    const [authResultMessage, setAuthResultMessage] = useState("");
    const [authSuccess, setAuthSuccess] = useState(false);
    const [isHrUser, setIsHrUser] = useState(false);

    const otpRefs = useRef([...Array(6)].map(() => React.createRef()));

    const handleOtpChange = (value, index) => {
        const digit = value.replace(/\D/, ''); // allow only digits
        const newOtpDigits = [...otpDigits];
        newOtpDigits[index] = digit;
        setOtpDigits(newOtpDigits);

        // Move to next box if digit is entered
        if (digit && index < otpRefs.current.length - 1) {
            otpRefs.current[index + 1].current.focus();
        }
    };

    const handleOtpPaste = (e, index) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("Text").trim();
        const digits = pasteData.split("").filter(char => /\d/.test(char));

        if (digits.length === 0) return;

        const newOtp = [...otpDigits];
        for (let i = 0; i < digits.length && index + i < newOtp.length; i++) {
            newOtp[index + i] = digits[i];
        }

        setOtpDigits(newOtp);

        const nextIndex = index + digits.length;
        if (nextIndex < otpRefs.current.length) {
            otpRefs.current[nextIndex].focus();
        }
    };

    const handleSubmitOtp = async () => {
        const otpCode = otpDigits.join('');
        if (otpCode.length !== 6) {
            // alert("Please enter the complete 6-digit OTP.");
            return;
        }

        setSubmittingOtp(true);
        try {
            await axiosInstance.post(`/planotech-inhouse/verify-2fa?code=${otpCode}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setAuthSuccess(true);
            setAuthResultMessage(`Authentication successful. Access granted to ${otpCategory} dashboard.`);

            if (otpCategory === "Finance and Accounts") {
                setIsAccountsUser(true);
            } else if (otpCategory === "HR") {
                setIsHrUser(true);
            }

            const backendCategory =
                otpCategory === "Finance and Accounts" ? "Finance and Accounts" :
                    otpCategory === "HR" ? "HR" : otpCategory;

            fetchFolders(backendCategory);
        } catch (err) {
            console.error(err);
            setAuthSuccess(false);
            setAuthResultMessage("Authentication failed. Please try again.");
        } finally {
            setSubmittingOtp(false);
            setTwoFactorOpen(false);
            setAuthResultOpen(true);
            setOtpDigits(["", "", "", "", "", ""]);
        }
    };

    const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [renameFolderName, setRenameFolderName] = useState("");
    const [folderToRename, setFolderToRename] = useState(null);

    const handleActionMenuOpen = (event, folder) => {
        event.stopPropagation();
        setActionMenuAnchorEl(event.currentTarget);
        setSelectedFolder(folder);
    };

    const handleActionMenuClose = () => {
        setActionMenuAnchorEl(null);
        setSelectedFolder(null);
    };

    const handleRenameOpen = (folder) => {
        setFolderToRename(folder);
        setRenameFolderName(folder.folderName);
        setRenameDialogOpen(true);
    };

    const handleRenameFolder = async () => {
        try {
            await axiosInstance.post(`/planotech-inhouse/rename/folder`, null, {
                params: {
                    folderId: folderToRename.entityId,
                    foldername: renameFolderName
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setRenameDialogOpen(false);
            fetchFolders(selectedCategory);
            if (openFolder) {
                fetchFiles(openFolder);
            }
        } catch (error) {
            console.error("Error renaming folder:", error);
        }
    };

    const [renameFileDialogOpen, setRenameFileDialogOpen] = useState(false);
    const [renameFileName, setRenameFileName] = useState("");
    const [fileToRename, setFileToRename] = useState(null);

    const handleRenameFile = async () => {
        if (!fileToRename) return;
        const trimmedBaseName = renameFileName.trim().replace(/\.[^/.]+$/, "");
        const newFileName = trimmedBaseName;
        console.log("Renaming to:", newFileName);
        try {
            await axiosInstance.post(`/planotech-inhouse/rename/file`, null, {
                params: {
                    fileId: fileToRename.id,
                    filename: newFileName
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setRenameFileDialogOpen(false);
            fetchFiles(openFolder);
        } catch (error) {
            console.error("Failed to rename file:", error);
        }
    };

    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const searchCounterRef = useRef(0);

    const handleSearchChange = async (e) => {
        const text = e.target.value;
        setSearchTerm(text);

        if (text.trim().length === 0) {
            setIsSearching(false);
            setSearchResults(null);
            return;
        }
        const currentVersion = ++searchCounterRef.current;
        try {
            setIsSearching(true);
            const response = await axiosInstance.get(`/planotech-inhouse/search/inFolders`, {
                params: { searchText: text },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Only accept result if it's the latest version
            if (currentVersion === searchCounterRef.current) {
                setSearchResults(response.data);
                console.log("Search Results (Files):", response.data?.files);
                console.log("Expected Key:", normalizedCategory);
                console.log("Files under that category:", response.data?.files?.[normalizedCategory]);
            }
        } catch (error) {
            if (currentVersion === searchCounterRef.current) {
                console.error("Error searching:", error);
                setSearchResults(null);
            }
        }
    };

    const categoryMap = {
        "Accounts": "Finance and Accounts",
        "Marketing": "Sales and Marketing",
        "Admin": "Administration"
    };

    const normalizedCategory = categoryMap[selectedCategory] || selectedCategory;

    const foldersToDisplay = isSearching
        ? (searchResults?.folders?.[normalizedCategory] || [])
        : (!openFolder ? folders : subfolders[openFolder] || []);

    const filesToDisplay = isSearching
        ? (searchResults?.files?.[normalizedCategory] || [])
        : (openFolder ? files[openFolder] || [] : []);

    const highlightText = (text, query) => {
        if (!query) return text;

        const regex = new RegExp(`(${query})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <mark key={index} style={{ backgroundColor: '#ffc107', padding: '0 2px' }}>{part}</mark>
            ) : (
                <span key={index}>{part}</span>
            )
        );
    };

    return (
        <>
            <Box>
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
                                placeholder="Search folders and files"
                                fullWidth
                                value={searchTerm}
                                onChange={handleSearchChange}
                                InputProps={{
                                    startAdornment: <Search sx={{ color: "gray", mr: 1 }} />,
                                    sx: { borderRadius: 5 },
                                }}
                            />
                        </Grid>
                        {!openFolder && (
                            <Grid item xs={12} sm="auto" sx={{ mt: { xs: 1, sm: 0 } }}>
                                <Button
                                    fullWidth
                                    startIcon={<CreateNewFolderIcon />}
                                    onClick={handleOpen}
                                    disabled={
                                        (selectedCategory === "Finance and Accounts" && !isAccountsUser) ||
                                        (selectedCategory === "HR" && !isHrUser)
                                    }
                                    sx={{
                                        fontWeight: "bold",
                                        bgcolor:
                                            (selectedCategory === "Finance and Accounts" && !isAccountsUser) ||
                                                (selectedCategory === "HR" && !isHrUser)
                                                ? '#ededed'
                                                : '#ba343b',
                                        '&:hover': {
                                            bgcolor:
                                                (selectedCategory === "Finance and Accounts" && !isAccountsUser) ||
                                                    (selectedCategory === "HR" && !isHrUser)
                                                    ? '#ededed'
                                                    : '#9e2b31',
                                        },
                                        color:
                                            (selectedCategory === "Finance and Accounts" && !isAccountsUser) ||
                                                (selectedCategory === "HR" && !isHrUser)
                                                ? 'white'
                                                : 'white',
                                        cursor:
                                            (selectedCategory === "Finance and Accounts" && !isAccountsUser) ||
                                                (selectedCategory === "HR" && !isHrUser)
                                                ? 'not-allowed'
                                                : 'pointer',
                                    }}
                                >
                                    Create Folder
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </Box>

                {!openFolder && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                borderRadius: '18px',
                                overflow: 'hidden',
                                border: '1px solid #c4c4c4',
                                maxWidth: 900,
                            }}
                        >
                            {['Administration', 'HR', 'IT', 'Design', 'Sales and Marketing', 'Finance and Accounts'].map((label) => (
                                <Button
                                    key={label}
                                    variant={selectedCategory === label ? 'contained' : 'outlined'}
                                    onClick={async () => {
                                        setCategoryLoading(true);
                                        setSelectedCategory(label);
                                        setPageNo(0);
                                        if (label === 'Finance and Accounts') {
                                            try {
                                                const response = await axiosInstance.get('/planotech-inhouse/verify-access/accounts', {
                                                    headers: {
                                                        Authorization: `Bearer ${token}`,
                                                    },
                                                });

                                                if (response.data.code === 200 && response.data.sessionValid === false) {
                                                    setTwoFactorCode(response.data.twoFactorCode);
                                                    setTwoFactorOpen(true);
                                                    setOtpCategory(label);
                                                    setFolders([]);
                                                } else if (response.data.code === 200 && response.data.sessionValid === true) {
                                                    setIsAccountsUser(true);
                                                    fetchFolders(label, 0);
                                                } else {
                                                    setIsAccountsUser(false);
                                                    setFolders([]);
                                                }
                                            } catch (error) {
                                                setIsAccountsUser(false);
                                                setFolders([]);
                                            } finally {
                                                setCategoryLoading(false);
                                            }
                                        } else if (label === 'HR') {
                                            try {
                                                const response = await axiosInstance.get('/planotech-inhouse/verify-access/hr', {
                                                    headers: { Authorization: `Bearer ${token}` },
                                                });

                                                if (response.data.code === 200 && response.data.sessionValid === false) {
                                                    setTwoFactorCode(response.data.twoFactorCode);
                                                    setTwoFactorOpen(true);
                                                    setOtpCategory(label);
                                                    setFolders([]);
                                                } else if (response.data.code === 200 && response.data.sessionValid === true) {
                                                    setIsHrUser(true);
                                                    fetchFolders(label, 0);
                                                } else {
                                                    setIsHrUser(false);
                                                    setFolders([]);
                                                }
                                            } catch (error) {
                                                setIsHrUser(false);
                                                setFolders([]);
                                            } finally {
                                                setCategoryLoading(false);
                                            }
                                        } else {
                                            await fetchFolders(label, 0);
                                            setCategoryLoading(false);
                                        }
                                    }}
                                    sx={{
                                        flex: 1,
                                        px: 2.5,
                                        py: 1,
                                        borderRadius: 0,
                                        fontWeight: 'bold',
                                        fontSize: '0.75rem',
                                        color: selectedCategory === label ? '#ba343b' : '#ba343b',
                                        backgroundColor: selectedCategory === label ? '#d4d4d4' : 'transparent',
                                        border: 'none',
                                        '&:hover': {
                                            backgroundColor: selectedCategory === label ? 'none' : '#f2f2f2',
                                        },
                                        '&:not(:last-of-type)': {
                                            borderRight: '1px solid #c4c4c4',
                                        },
                                    }}
                                >
                                    {label}
                                </Button>
                            ))}
                        </Box>
                    </Box>
                )}

                {categoryLoading && (
                    <Box
                        sx={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            backgroundColor: 'rgba(255, 255, 255, 0.6)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 9999,
                        }}
                    >
                        <CircularProgress sx={{ color: '#ba343b' }} />
                    </Box>
                )}

                {/* If a folder is open, show its content */}
                {isSearching ? (
                    <Box sx={{ mt: 3 }}>
                        {/* Folders */}
                        {foldersToDisplay.length > 0 && (
                            <Box sx={{ width: '100%', mt: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontSize: '14px', color: 'grey', fontWeight: 'bold', mb: 1 }}>
                                    Folders
                                </Typography>
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '3.5fr 2.5fr 2.5fr 1fr 1fr',
                                    fontWeight: 'bold',
                                    bgcolor: '#f5f5f5',
                                    p: 1,
                                    borderBottom: '2px solid #ddd',
                                    borderRadius: '8px',
                                }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 5 }}>Name</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Created Time</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Created By</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Star</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Actions</Typography>
                                </Box>
                                <List>
                                    {foldersToDisplay.map(folder => (
                                        <ListItem
                                            key={folder.entityId}
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '3.5fr 2.5fr 2.5fr 1fr 1fr',
                                                alignItems: 'center',
                                                p: 1.5,
                                                borderBottom: '1px solid #ddd',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                "&:hover": { bgcolor: "#f9f9f9" }
                                            }}
                                            onClick={() => {
                                                setSearchTerm("");
                                                setIsSearching(false);
                                                setSearchResults(null);
                                                handleFolderClick(folder);
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <FolderIcon sx={{ color: "#f8d775", mr: 1 }} />
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        color: "#555555",
                                                        fontSize: "14px",
                                                        fontWeight: "bold",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        maxWidth: "200px"
                                                    }}
                                                    title={folder.folderName}
                                                >
                                                    {highlightText(folder.folderName.length > 20 ? `${folder.folderName.slice(0, 20)}...` : folder.folderName, searchTerm)}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ fontSize: "13px", color: "gray" }}>
                                                {new Date(folder.time).toLocaleString()}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: "13px", color: "gray" }}>
                                                {folder.createdBy || "N/A"}
                                            </Typography>
                                            <Tooltip>
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                                    <IconButton
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            toggleFolderStar(folder.entityId);
                                                        }}
                                                        disableRipple
                                                        disableFocusRipple
                                                        sx={{
                                                            '&:hover': {
                                                                backgroundColor: 'transparent',
                                                            },
                                                            '&.MuiIconButton-root': {
                                                                padding: 0,
                                                            },
                                                        }}
                                                    >
                                                        {starredFolders.some(fav => fav.entityId === folder.entityId) ? (
                                                            <Star sx={{ color: "gold" }} />
                                                        ) : (
                                                            <StarBorder />
                                                        )}
                                                    </IconButton>
                                                </Box>
                                            </Tooltip>
                                            <Tooltip>
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', pl: 1 }}>
                                                    <IconButton onClick={(e) => handleActionMenuOpen(e, folder)} sx={{ color: "gray", cursor: 'pointer' }}>
                                                        <MoreVertIcon />
                                                    </IconButton>
                                                    <Menu
                                                        anchorEl={actionMenuAnchorEl}
                                                        open={Boolean(actionMenuAnchorEl)}
                                                        onClose={(e, reason) => {
                                                            if (e?.stopPropagation) e.stopPropagation();
                                                            handleActionMenuClose();
                                                        }}
                                                        PaperProps={{
                                                            elevation: 0,
                                                            sx: {
                                                                boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
                                                                border: '1px solid #e0e0e0',
                                                                borderRadius: 1,
                                                            },
                                                            onClick: (e) => e.stopPropagation(),
                                                        }}
                                                    >
                                                        <MenuItem
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                handleActionMenuClose();
                                                                handleRenameOpen(selectedFolder);
                                                            }}
                                                        >
                                                            <EditIcon fontSize="small" sx={{ mr: 1, color: "gray" }} />
                                                            Rename
                                                        </MenuItem>
                                                        <MenuItem
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                handleActionMenuClose();
                                                                handleDeleteFolder(selectedFolder.entityId);
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="small" sx={{ mr: 1, color: "gray" }} />
                                                            Delete
                                                        </MenuItem>
                                                    </Menu>
                                                </Box>
                                            </Tooltip>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}
                        {/* Files */}
                        {filesToDisplay.length > 0 && (
                            <Box sx={{ width: '100%', mt: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontSize: '14px', color: 'grey', fontWeight: 'bold', mb: 1 }}>
                                    Files
                                </Typography>
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '3.5fr 2.5fr 1.5fr 2.5fr 1fr 1fr 1fr',
                                    fontWeight: 'bold',
                                    bgcolor: '#f5f5f5',
                                    p: 1,
                                    borderBottom: '2px solid #ddd',
                                    borderRadius: '8px'
                                }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 5 }}>Name</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Created Time</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Size</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Created By</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Star</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Actions</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Share</Typography>
                                </Box>
                                <List>
                                    {filesToDisplay.map(file => (
                                        <ListItem
                                            key={file.id}
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '3.5fr 2.5fr 1.5fr 2.5fr 1fr 1fr 1fr',
                                                alignItems: 'center',
                                                p: 1.5,
                                                borderBottom: '1px solid #ddd',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                "&:hover": { bgcolor: "#f9f9f9" }
                                            }}
                                            onClick={() => {
                                                const imageExtensions = ["jpg", "jpeg", "png", "PNG", "gif", "bmp", "webp"];
                                                const videoExtensions = ["mp4", "webm", "ogg", "mov", "avi", "mkv"];
                                                const fileType = ["pdf"]
                                                const fileExtension = file.fileName.split('.').pop().toLowerCase();
                                                if (
                                                    fileType.includes(fileExtension) ||
                                                    imageExtensions.includes(fileExtension) ||
                                                    videoExtensions.includes(fileExtension)
                                                ) {
                                                    window.open(file.fileLink, '_blank', 'noopener,noreferrer');
                                                } else {
                                                    const link = document.createElement('a');
                                                    link.href = file.fileLink;
                                                    link.download = file.fileName;
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getFileIcon(file.fileName)}
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        color: "#555555",
                                                        fontSize: "14px",
                                                        fontWeight: "bold",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        maxWidth: "200px"
                                                    }}
                                                    title={file.fileName}
                                                >
                                                    {highlightText(file.fileName.length > 20 ? `${file.fileName.slice(0, 20)}...` : file.fileName, searchTerm)}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ fontSize: '13px', color: 'gray' }}>
                                                {new Date(file.time).toLocaleString()}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: '13px', color: 'gray' }}>
                                                {formatFileSize(file.fileSize)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: '13px', color: 'gray' }}>
                                                {file.createdBy}
                                            </Typography>
                                            <Tooltip>
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', pl: 0.5 }}>
                                                    <IconButton
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            toggleFileStar(file.id);
                                                        }}
                                                        disableRipple
                                                        disableFocusRipple
                                                        sx={{
                                                            '&:hover': {
                                                                backgroundColor: 'transparent',
                                                            },
                                                            '&.MuiIconButton-root': {
                                                                padding: 0,
                                                            },
                                                        }}
                                                    >
                                                        {starredFiles.some(fav => fav.id === file.id) ? (
                                                            <Star sx={{ color: "gold" }} />
                                                        ) : (
                                                            <StarBorder />
                                                        )}
                                                    </IconButton>
                                                </Box>
                                            </Tooltip>
                                            <Tooltip>
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', pl: 1 }}>
                                                    <IconButton onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActionMenuAnchorEl(e.currentTarget);
                                                        setFileToRename(file);
                                                    }}>
                                                        <MoreVertIcon />
                                                    </IconButton>
                                                    <Menu
                                                        anchorEl={actionMenuAnchorEl}
                                                        open={Boolean(actionMenuAnchorEl) && fileToRename?.id === file.id}
                                                        onClose={(e, reason) => {
                                                            if (e?.stopPropagation) e.stopPropagation();
                                                            setActionMenuAnchorEl(null);
                                                            setFileToRename(null);
                                                        }}
                                                        PaperProps={{
                                                            elevation: 0,
                                                            sx: {
                                                                boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
                                                                border: '1px solid #e0e0e0',
                                                                borderRadius: 1,
                                                            },
                                                            onClick: (e) => e.stopPropagation(),
                                                        }}
                                                    >
                                                        <MenuItem onClick={() => {
                                                            setRenameFileDialogOpen(true);
                                                            setRenameFileName(file.fileName.split('.').slice(0, -1).join('.'));
                                                            setActionMenuAnchorEl(null);
                                                        }}>
                                                            <EditIcon fontSize="small" sx={{ mr: 1, color: "gray" }} />
                                                            Rename
                                                        </MenuItem>
                                                        <MenuItem
                                                            onClick={() => {
                                                                setActionMenuAnchorEl(null);
                                                                handleDeleteFile(file, openFolder);
                                                            }}                                                            >
                                                            <DeleteIcon fontSize="small" sx={{ mr: 1, color: "gray" }} />
                                                            Delete
                                                        </MenuItem>
                                                    </Menu>
                                                </Box>
                                            </Tooltip>
                                            <ClickAwayListener onClickAway={() => setOpenTooltipId(null)}>
                                                <Box
                                                    onMouseEnter={() => setOpenTooltipId(file.id)}
                                                    onMouseLeave={() => setOpenTooltipId(null)}
                                                    sx={{ display: 'flex', justifyContent: 'flex-start' }}
                                                >
                                                    <Tooltip
                                                        arrow
                                                        open={openTooltipId === file.id}
                                                        placement="top"
                                                        componentsProps={{
                                                            tooltip: {
                                                                sx: {
                                                                    backgroundColor: '#ffffff',
                                                                    color: '#ffffff',
                                                                    p: 1.2,
                                                                    borderRadius: 2,
                                                                    boxShadow: 3,
                                                                    maxWidth: 350,
                                                                    backdropFilter: 'none',
                                                                },
                                                            },
                                                            arrow: {
                                                                sx: {
                                                                    color: '#fff',
                                                                },
                                                            },
                                                        }}
                                                        title={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        fontSize: '12px',
                                                                        fontWeight: 'bold',
                                                                        color: 'grey',
                                                                        wordBreak: 'break-all',
                                                                        flex: 1,
                                                                    }}
                                                                >
                                                                    {file.fileLink}
                                                                </Typography>
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<ContentCopyIcon />}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleCopyLink(file.fileLink, file.id);
                                                                    }}
                                                                    sx={{
                                                                        textTransform: 'none',
                                                                        fontSize: '12px',
                                                                        fontWeight: 'bold',
                                                                        color: '#ba343b',
                                                                        border: '0.5px solid #ba343b',
                                                                        whiteSpace: 'nowrap',
                                                                    }}
                                                                >
                                                                    {copiedLinkId === file.id ? 'Copied!' : 'Copy'}
                                                                </Button>
                                                            </Box>
                                                        }
                                                        PopperProps={{
                                                            modifiers: [
                                                                {
                                                                    name: 'offset',
                                                                    options: {
                                                                        offset: [0, 10],
                                                                    },
                                                                },
                                                            ],
                                                        }}
                                                    >
                                                        <IconButton
                                                            onClick={(e) => e.stopPropagation()}
                                                            sx={{ color: 'gray' }}
                                                        >
                                                            <ShareIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </ClickAwayListener>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}
                        {foldersToDisplay.length === 0 && filesToDisplay.length === 0 && (
                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Typography sx={{ fontSize: '14px', color: 'gray', fontWeight: 'bold' }}>
                                    No folders or files match your search.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                ) : openFolder ? (
                    <Box {...getRootProps()} sx={{ mt: 2, minHeight: '600px', border: '2px #ccc' }}>
                        <input {...getInputProps()} />
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                                {[...folderHistory.map(f => f.folderName), currentFolderName].join(' / ') || 'Folder'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {currentFolderId && (
                                    <Button
                                        variant="outlined"
                                        onClick={() => setOpen(true)}
                                        startIcon={<CreateNewFolderOutlinedIcon />}
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#ba343b",
                                            border: "0.5px solid #ba343b",
                                        }}
                                    >
                                        Create Folder
                                    </Button>
                                )}
                                <Button
                                    variant="outlined"
                                    startIcon={<UploadFile />}
                                    onClick={handleClick}
                                    sx={{
                                        fontWeight: "bold",
                                        color: "#ba343b",
                                        border: "0.5px solid #ba343b",
                                    }}
                                >
                                    Upload Files
                                </Button>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleUploadClose}
                                >
                                    <MenuItem>
                                        <label style={{ fontWeight: "bold", color: "grey", fontSize: "12.5px" }}>
                                            Small File (≤500mb)
                                            <Input
                                                type="file"
                                                sx={{ display: "none" }}
                                                inputProps={{ multiple: true }}
                                                onChange={(e) => {
                                                    handleFileUpload(e, openFolder, MAX_SMALL_FILE_SIZE, "uploadFile");
                                                    handleUploadClose();
                                                }}
                                            />
                                        </label>
                                    </MenuItem>
                                    <MenuItem>
                                        <label style={{ fontWeight: "bold", color: "grey", fontSize: "12.5px" }}>
                                            Large File (≤50gb)
                                            <Input
                                                type="file"
                                                sx={{ display: "none" }}
                                                inputProps={{ multiple: true }}
                                                onChange={(e) => {
                                                    handleLargeFileUpload(e, openFolder, MAX_LARGE_FILE_SIZE, "largeFile");
                                                    handleUploadClose();
                                                }}
                                            />
                                        </label>
                                    </MenuItem>
                                </Menu>
                            </Box>
                        </Box>

                        {combinedItems[openFolder]?.length > 0 ? (
                            <>
                                <Box sx={{ mt: 1 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                                        <Typography variant="subtitle1" sx={{ fontSize: '14px', color: 'grey', fontWeight: 'bold' }}>
                                            Folder Contents
                                        </Typography>
                                        <Button
                                            variant="text"
                                            startIcon={<ArrowBackIosRoundedIcon sx={{ fontSize: 12, mr: -0.8 }} />}
                                            onClick={handleBackClick}
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            Back
                                        </Button>
                                    </Box>

                                    <Box sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '3.5fr 2.5fr 1.5fr 2.5fr 1fr 1fr 1fr',
                                        fontWeight: 'bold',
                                        bgcolor: '#f5f5f5',
                                        p: 1,
                                        borderBottom: '2px solid #ddd',
                                        borderRadius: '8px'
                                    }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 5 }}>Name</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Created Time</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Size</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Created By</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Star</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Actions</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Share</Typography>
                                    </Box>

                                    <List>
                                        {combinedItems[openFolder].map(item => (
                                            <ListItem
                                                key={item.id || item.entityId}
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '3.5fr 2.5fr 1.5fr 2.5fr 1fr 1fr 1fr',
                                                    alignItems: 'center',
                                                    p: 1.5,
                                                    borderBottom: '1px solid #ddd',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    "&:hover": { bgcolor: "#f9f9f9" }
                                                }}
                                                onClick={() => {
                                                    if (item.type === 'folder') {
                                                        handleFolderClick(item);
                                                    } else {
                                                        const imageExtensions = ["jpg", "jpeg", "png", "PNG", "gif", "bmp", "webp"];
                                                        const videoExtensions = ["mp4", "webm", "ogg", "mov", "avi", "mkv"];
                                                        const pdfExtension = ["pdf"];
                                                        const fileExtension = item.fileName.split('.').pop().toLowerCase();
                                                        if (
                                                            pdfExtension.includes(fileExtension) ||
                                                            imageExtensions.includes(fileExtension) ||
                                                            videoExtensions.includes(fileExtension)
                                                        ) {
                                                            window.open(item.fileLink, '_blank', 'noopener,noreferrer');
                                                        } else {
                                                            const link = document.createElement('a');
                                                            link.href = item.fileLink;
                                                            link.download = item.fileName;
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            document.body.removeChild(link);
                                                        }
                                                    }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {item.type === 'folder' ? (
                                                        <FolderIcon sx={{ color: "#f8d775" }} />
                                                    ) : (
                                                        getFileIcon(item.fileName)
                                                    )}
                                                    <Typography
                                                        variant="body1"
                                                        sx={{
                                                            color: "#555555",
                                                            fontSize: "14px",
                                                            fontWeight: "bold",
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            maxWidth: "200px"
                                                        }}
                                                        title={item.folderName || item.fileName}
                                                    >
                                                        {(item.folderName || item.fileName)?.slice(0, 20)}
                                                        {(item.folderName || item.fileName)?.length > 20 ? "..." : ""}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{ fontSize: "13px", color: "gray" }}>
                                                    {new Date(item.time).toLocaleString()}
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontSize: "13px", color: "gray" }}>
                                                    {item.type === 'file' ? formatFileSize(item.fileSize) : ""}
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontSize: "13px", color: "gray" }}>
                                                    {item.createdBy || "N/A"}
                                                </Typography>
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                                    <IconButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            item.type === 'folder'
                                                                ? toggleFolderStar(item.entityId)
                                                                : toggleFileStar(item.id);
                                                        }}
                                                        sx={{ padding: 0 }}
                                                    >
                                                        {(item.type === 'folder'
                                                            ? starredFolders.some(f => f.entityId === item.entityId)
                                                            : starredFiles.some(f => f.id === item.id))
                                                            ? <Star sx={{ color: "gold" }} />
                                                            : <StarBorder />}
                                                    </IconButton>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', pl: 1 }}>
                                                    <IconButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActionMenuAnchorEl(e.currentTarget);

                                                            if (item.type === 'folder') {
                                                                setSelectedFolder(item);
                                                                setFileToRename(null);
                                                            } else {
                                                                setFileToRename(item);
                                                                setSelectedFolder(null);
                                                            }
                                                        }}
                                                    >
                                                        <MoreVertIcon />
                                                    </IconButton>
                                                    <Menu
                                                        anchorEl={actionMenuAnchorEl}
                                                        open={Boolean(actionMenuAnchorEl) && ((item.type === 'folder' && selectedFolder?.entityId === item.entityId) || (item.type !== 'folder' && fileToRename?.id === item.id))}
                                                        onClose={(e) => {
                                                            if (e?.stopPropagation) e.stopPropagation();
                                                            setActionMenuAnchorEl(null);
                                                            setSelectedFolder(null);
                                                            setFileToRename(null);
                                                        }}
                                                        PaperProps={{
                                                            elevation: 0,
                                                            sx: {
                                                                boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
                                                                border: '1px solid #e0e0e0',
                                                                borderRadius: 1,
                                                            },
                                                            onClick: (e) => e.stopPropagation(),
                                                        }}
                                                    >
                                                        <MenuItem
                                                            onClick={() => {
                                                                setActionMenuAnchorEl(null);
                                                                if (item.type === 'folder') {
                                                                    handleRenameOpen(item); // Folder rename
                                                                } else {
                                                                    setRenameFileDialogOpen(true); // File rename
                                                                    setRenameFileName(item.fileName.split('.').slice(0, -1).join('.'));
                                                                }
                                                            }}
                                                        >
                                                            <EditIcon fontSize="small" sx={{ mr: 1, color: "gray" }} />
                                                            Rename
                                                        </MenuItem>
                                                        <MenuItem
                                                            onClick={() => {
                                                                setActionMenuAnchorEl(null);
                                                                if (item.type === 'folder') {
                                                                    handleDeleteFolder(item.entityId);
                                                                } else {
                                                                    handleDeleteFile(item, openFolder);
                                                                }
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="small" sx={{ mr: 1, color: "gray" }} />
                                                            Delete
                                                        </MenuItem>
                                                    </Menu>
                                                </Box>
                                                <Box>
                                                    {item.type === 'file' ? (
                                                        <ClickAwayListener onClickAway={() => setOpenTooltipId(null)}>
                                                            <Box
                                                                onMouseEnter={() => setOpenTooltipId(item.id)}
                                                                onMouseLeave={() => setOpenTooltipId(null)}
                                                            >
                                                                <Tooltip
                                                                    arrow
                                                                    open={openTooltipId === item.id}
                                                                    placement="top"
                                                                    title={
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                            <Typography
                                                                                variant="caption"
                                                                                sx={{
                                                                                    fontSize: '12px',
                                                                                    fontWeight: 'bold',
                                                                                    color: 'grey',
                                                                                    wordBreak: 'break-all',
                                                                                    flex: 1,
                                                                                }}
                                                                            >
                                                                                {item.fileLink}
                                                                            </Typography>
                                                                            <Button
                                                                                variant="outlined"
                                                                                size="small"
                                                                                startIcon={<ContentCopyIcon />}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleCopyLink(item.fileLink, item.id);
                                                                                }}
                                                                                sx={{
                                                                                    textTransform: 'none',
                                                                                    fontSize: '12px',
                                                                                    fontWeight: 'bold',
                                                                                    color: '#ba343b',
                                                                                    border: '0.5px solid #ba343b',
                                                                                    whiteSpace: 'nowrap',
                                                                                }}
                                                                            >
                                                                                {copiedLinkId === item.id ? 'Copied!' : 'Copy'}
                                                                            </Button>
                                                                        </Box>
                                                                    }
                                                                >
                                                                    <IconButton onClick={(e) => e.stopPropagation()} sx={{ color: 'gray' }}>
                                                                        <ShareIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        </ClickAwayListener>
                                                    ) : null}
                                                </Box>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontSize: '14px', color: 'grey', fontWeight: 'bold' }}>
                                    No files or folders found
                                </Typography>
                                <Button variant="text" startIcon={<ArrowBackIosRoundedIcon sx={{ fontSize: 12, mr: -0.8 }} />} onClick={handleBackClick} sx={{ fontWeight: 'bold' }}>
                                    Back
                                </Button>
                            </Box>)}
                    </Box>
                ) : (
                    <Box sx={{ mt: 3 }}>
                        {((selectedCategory === "Finance and Accounts" && !isAccountsUser && !twoFactorOpen) ||
                            (selectedCategory === "HR" && !isHrUser && !twoFactorOpen)) ? (
                            <Box
                                sx={{
                                    height: '50vh',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'column',
                                    textAlign: 'center'
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: 'gray',
                                        fontWeight: 'bold',
                                        fontSize: '16px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: 0.5
                                    }}
                                >
                                    <BlockIcon fontSize="small" />
                                    {selectedCategory === "Finance and Accounts"
                                        ? "Access Denied – You are not authorized to view Finance and Accounts department."
                                        : "Access Denied – You are not authorized to view HR department."}
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <Grid container alignItems="center" justifyContent="space-between">
                                    <Grid item>
                                        <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                                            All Folders
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <ToggleButtonGroup
                                            value={viewMode}
                                            exclusive
                                            onChange={(e, newMode) => setViewMode(newMode || viewMode)}
                                            aria-label="View Mode"
                                            sx={{
                                                borderRadius: "24px",
                                                border: "1px solid #ccc",
                                                overflow: "hidden",
                                                height: "36px",
                                            }}
                                        >
                                            <ToggleButton value="list">
                                                <ViewList fontSize="medium" />
                                            </ToggleButton>
                                            <ToggleButton value="grid">
                                                <GridView fontSize="medium" />
                                            </ToggleButton>
                                        </ToggleButtonGroup>
                                    </Grid>
                                </Grid>

                                {filteredFolders.length === 0 && (selectedCategory !== "Finance and Accounts" || (selectedCategory === "Finance and Accounts" && isAccountsUser)) && (
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
                                        <Typography
                                            color="textSecondary"
                                            sx={{ fontSize: '14px', color: 'grey', fontWeight: 'bold' }}
                                        >
                                            No folders available
                                        </Typography>
                                    </Box>
                                )}

                                {filteredFolders.length > 0 && (viewMode === "list" ? (
                                    <Box sx={{ width: '100%', mt: 2 }}>
                                        <Box sx={{
                                            display: 'grid',
                                            gridTemplateColumns: '3.5fr 2.5fr 2.5fr 1fr 1fr',
                                            fontWeight: 'bold',
                                            bgcolor: '#f5f5f5',
                                            p: 1,
                                            borderBottom: '2px solid #ddd',
                                            borderRadius: '8px'
                                        }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 5 }}>Name</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Created Time</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Created By</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Star</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Actions</Typography>
                                        </Box>
                                        <List>
                                            {filteredFolders.map((folder) => (
                                                <ListItem
                                                    key={folder.entityId}
                                                    sx={{
                                                        display: 'grid',
                                                        gridTemplateColumns: '3.5fr 2.5fr 2.5fr 1fr 1fr',
                                                        alignItems: 'center',
                                                        p: 1.5,
                                                        borderBottom: '1px solid #ddd',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        "&:hover": { bgcolor: "#f9f9f9" }
                                                    }}
                                                    onClick={() => handleFolderClick(folder)}
                                                >
                                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                                        <FolderIcon sx={{ color: "#f8d775", mr: 1 }} />
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                color: "#555555",
                                                                fontSize: "14px",
                                                                fontWeight: "bold",
                                                                whiteSpace: "nowrap",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                maxWidth: "200px"
                                                            }}
                                                            title={folder.folderName}
                                                        >
                                                            {folder.folderName.length > 20 ? `${folder.folderName.slice(0, 20)}...` : folder.folderName}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ fontSize: "13px", color: "gray" }}>
                                                        {new Date(folder.time).toLocaleString()}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontSize: "13px", color: "gray" }}>
                                                        {folder.createdBy ? folder.createdBy : "N/A"}
                                                    </Typography>
                                                    <Tooltip>
                                                        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                                            <IconButton
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    toggleFolderStar(folder.entityId);
                                                                }}
                                                                disableRipple
                                                                disableFocusRipple
                                                                sx={{
                                                                    '&:hover': {
                                                                        backgroundColor: 'transparent',
                                                                    },
                                                                    '&.MuiIconButton-root': {
                                                                        padding: 0,
                                                                    },
                                                                }}
                                                            >
                                                                {starredFolders.some(fav => fav.entityId === folder.entityId) ? (
                                                                    <Star sx={{ color: "gold" }} />
                                                                ) : (
                                                                    <StarBorder />
                                                                )}
                                                            </IconButton>
                                                        </Box>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', pl: 1 }}>
                                                            <IconButton onClick={(e) => handleActionMenuOpen(e, folder)} sx={{ color: "gray", cursor: 'pointer' }}>
                                                                <MoreVertIcon />
                                                            </IconButton>
                                                            <Menu
                                                                anchorEl={actionMenuAnchorEl}
                                                                open={Boolean(actionMenuAnchorEl)}
                                                                onClose={(e, reason) => {
                                                                    if (e?.stopPropagation) e.stopPropagation();
                                                                    handleActionMenuClose();
                                                                }}
                                                                PaperProps={{
                                                                    elevation: 0,
                                                                    sx: {
                                                                        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
                                                                        border: '1px solid #e0e0e0',
                                                                        borderRadius: 1,
                                                                    },
                                                                    onClick: (e) => e.stopPropagation(),
                                                                }}
                                                            >
                                                                <MenuItem
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        handleActionMenuClose();
                                                                        handleRenameOpen(selectedFolder);
                                                                    }}
                                                                >
                                                                    <EditIcon fontSize="small" sx={{ mr: 1, color: "gray" }} />
                                                                    Rename
                                                                </MenuItem>
                                                                <MenuItem
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        handleActionMenuClose();
                                                                        handleDeleteFolder(selectedFolder.entityId);
                                                                    }}
                                                                >
                                                                    <DeleteIcon fontSize="small" sx={{ mr: 1, color: "gray" }} />
                                                                    Delete
                                                                </MenuItem>
                                                            </Menu>
                                                        </Box>
                                                    </Tooltip>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                ) : (
                                    <Grid container spacing={2} sx={{ mt: 2, mb: 1 }}>
                                        {filteredFolders.map((folder) => (
                                            <Grid item key={folder.entityId} xs={6} sm={4} md={3} lg={2.4} xl={2.4}>
                                                <Card
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        alignItems: "center",
                                                        cursor: "pointer",
                                                        boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
                                                        width: "100%",
                                                    }}
                                                    onClick={() => handleFolderClick(folder.entityId)}
                                                >
                                                    <FolderIcon sx={{ fontSize: 80, color: "#f8d775", mt: 2 }} />
                                                    <CardContent sx={{ textAlign: "center" }}>
                                                        <Typography
                                                            variant="body2"
                                                            noWrap
                                                            sx={{
                                                                width: "100px",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                fontWeight: "bold",
                                                                color: "#555555",
                                                            }}
                                                        >
                                                            {folder.folderName}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                ))}

                                {filteredFolders.length > 0 && (
                                    <Box
                                        sx={{
                                            position: "sticky",
                                            bottom: 0,
                                            left: 0,
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
                            </>
                        )}
                    </Box>
                )}

                {/* Create Folder Dialog */}
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle sx={{ fontSize: "16px", fontWeight: "bold", color: "#ba343b", paddingBottom: 0, }}>
                        Create New Folder
                    </DialogTitle>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (openFolder) {
                                handleCreateSubfolder();
                            } else {
                                handleCreateFolder();
                            }
                        }}
                    >
                        <DialogContent sx={{ minWidth: "300px", paddingBottom: "16px" }}>
                            <TextField
                                fullWidth
                                value={folderName}
                                placeholder="enter folder name"
                                onChange={(e) => setFolderName(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions sx={{ padding: "16px" }}>
                            <Button onClick={handleClose} color="error" sx={{ fontSize: "bold" }}>Cancel</Button>
                            <Button
                                type="submit"
                                variant="outlined"
                                sx={{
                                    borderRadius: "20px",
                                    fontWeight: "bold",
                                    color: "#ba343b",
                                    border: "0.5px solid #ba343b",
                                }}
                            >
                                Create
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

                <Dialog
                    open={uploadOpen}
                    onClose={() => setUploadOpen(false)}
                    fullWidth
                    maxWidth="sm"
                    sx={{ "& .MuiDialog-paper": { width: "450px" } }}
                >
                    <DialogContent fullWidth sx={{ textAlign: "center", p: 3 }}>
                        {uploadStatus.includes("✅") ? (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                <CheckIcon sx={{ fontSize: 28, color: "#4caf50" }} />
                                <Typography variant="h6" sx={{ color: '#232323', fontSize: "18px" }}>
                                    <strong>
                                        {
                                            uploadStatus
                                                .replace("✅ ", "")
                                                .replace("❌ ", "")
                                                .match(/^(.*?)(?=\s(uploaded|replaced|upload failed))/)?.[1]
                                        }
                                    </strong>{" "}
                                    {
                                        uploadStatus
                                            .replace("✅ ", "")
                                            .replace("❌ ", "")
                                            .match(/\s(uploaded|replaced|upload failed).*$/)?.[0]
                                    }
                                </Typography>
                            </Box>
                        ) : uploadStatus.includes("❌") ? (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                <ClearIcon sx={{ fontSize: 28, color: "#f44336" }} />
                                <Typography variant="h6" sx={{ color: '#232323', fontSize: "18px" }} >
                                    <strong>
                                        {uploadStatus.split(" ")[1]}
                                    </strong>{" "}
                                    {uploadStatus.replace("❌ ", "").replace(uploadStatus.split(" ")[1], "").trim()}
                                </Typography>
                            </Box>
                        ) : (
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ color: '#232323', fontSize: "18px", fontWeight: "bold" }}
                            >
                                {uploading ? "Uploading File....." : uploadStatus}
                            </Typography>
                        )}
                        {uploading && (
                            <LinearProgress
                                sx={{
                                    mt: 3,
                                    "& .MuiLinearProgress-bar": {
                                        backgroundColor: "#ba343b",
                                    },
                                    backgroundColor: "#ffccd0",
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={deleteOpen}
                    onClose={() => setDeleteOpen(false)}
                    fullWidth
                    maxWidth="sm"
                    sx={{ "& .MuiDialog-paper": { width: "450px" } }}
                >
                    <DialogContent sx={{ textAlign: "center", p: 3 }}>
                        {deleteMessage.includes("✅") ? (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                <CheckIcon sx={{ fontSize: 28, color: "#4caf50" }} />
                                <Typography
                                    variant="h6"
                                    sx={{ color: '#232323', fontSize: "18px", fontWeight: "bold" }}
                                >
                                    {deleteMessage.replace("✅ ", "")}
                                </Typography>
                            </Box>
                        ) : deleteMessage.includes("❌") ? (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                <ClearIcon sx={{ fontSize: 28, color: "#f44336" }} />
                                <Typography
                                    variant="h6"
                                    sx={{ color: '#232323', fontSize: "18px", fontWeight: "bold" }}
                                >
                                    {deleteMessage.replace("❌ ", "")}
                                </Typography>
                            </Box>
                        ) : (
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ color: '#232323', fontSize: "18px", fontWeight: "bold" }}
                            >
                                {deleteMessage}
                            </Typography>
                        )}

                        {deleting && (
                            <LinearProgress
                                sx={{
                                    mt: 3,
                                    "& .MuiLinearProgress-bar": {
                                        backgroundColor: "#ba343b",
                                    },
                                    backgroundColor: "#ffccd0",
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={createFolderOpen}
                    onClose={() => setCreateFolderOpen(false)}
                    fullWidth
                    maxWidth="sm"
                    sx={{ "& .MuiDialog-paper": { width: "450px" } }}
                >
                    <DialogContent sx={{ textAlign: "center", p: 3 }}>
                        {["✅ Folder created successfully!", "❌ Failed to create folder", "⚠️ Folder name exists. Try another."].includes(createFolder) ? (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                {createFolder === "✅ Folder created successfully!" && (
                                    <CheckIcon sx={{ fontSize: 28, color: "#4caf50" }} />
                                )}
                                {createFolder === "❌ Failed to create folder" && (
                                    <ClearIcon sx={{ fontSize: 28, color: "#f44336" }} />
                                )}
                                {createFolder === "⚠️ Folder name exists. Try another." && (
                                    <InfoOutlinedIcon sx={{ fontSize: 28, color: "#ff9800" }} />
                                )}

                                <Typography
                                    variant="h6"
                                    sx={{ color: '#232323', fontSize: "18px", fontWeight: "bold" }}
                                >
                                    {createFolder.replace(/^✅ |^❌ |^⚠️ /, '')}
                                </Typography>
                            </Box>
                        ) : (
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ color: '#232323', fontSize: "18px", fontWeight: "bold" }}
                            >
                                {createFolder}
                            </Typography>
                        )}

                        {creating && (
                            <LinearProgress
                                sx={{
                                    mt: 3,
                                    "& .MuiLinearProgress-bar": {
                                        backgroundColor: "#ba343b",
                                    },
                                    backgroundColor: "#ffccd0",
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog open={twoFactorOpen} onClose={() => setTwoFactorOpen(false)}>
                    <DialogTitle sx={{ fontSize: "18px", fontWeight: "bold", color: "#ba343b", textAlign: 'center' }}>
                        Enter OTP
                    </DialogTitle>
                    <DialogContent sx={{ textAlign: "center" }}>
                        <Typography sx={{ fontWeight: 'bold', mb: 2 }}>
                            OTP has been sent to your email. Please enter it below.
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                            {otpDigits.map((digit, index) => (
                                <TextField
                                    key={index}
                                    value={digit}
                                    inputRef={otpRefs.current[index]}
                                    onChange={(e) => handleOtpChange(e.target.value, index)}
                                    onPaste={(e) => handleOtpPaste(e, index)}
                                    variant="outlined"
                                    inputProps={{ maxLength: 1, style: { textAlign: "center", fontSize: "20px" } }}
                                    sx={{ width: "40px" }}
                                />
                            ))}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setTwoFactorOpen(false)} color="error">Cancel</Button>
                        <Button
                            onClick={handleSubmitOtp}
                            disabled={submittingOtp}
                            variant="outlined"
                            sx={{
                                fontWeight: "bold",
                                color: "#ba343b",
                                borderColor: "#ba343b",
                                borderRadius: "30px",
                                px: 3,
                                "&:hover": {
                                    backgroundColor: "#ba343b",
                                    color: "white",
                                },
                            }}
                        >
                            {submittingOtp ? "Verifying..." : "Submit"}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={authResultOpen} onClose={() => setAuthResultOpen(false)}>
                    <DialogContent>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                mt: 1,
                            }}
                        >
                            {authSuccess ? (
                                <CheckIcon sx={{ fontSize: 28, color: "#4caf50" }} />
                            ) : (
                                <ClearIcon sx={{ fontSize: 28, color: "#f44336" }} />
                            )}
                            <Typography sx={{ fontWeight: 'bold', textAlign: 'center', fontSize: '16px' }}>
                                {authResultMessage}
                            </Typography>
                        </Box>
                    </DialogContent>
                </Dialog>

                <Dialog open={conflictDialog.open} onClose={() => setConflictDialog({ ...conflictDialog, open: false })}
                    PaperProps={{
                        sx: {
                            borderRadius: 4,
                        },
                    }}>
                    <DialogTitle sx={{ fontSize: "17px", fontWeight: "bold", color: "#ba343b" }}>
                        File Already Exists
                    </DialogTitle>
                    <DialogContent>
                        {conflictDialog.fileList?.length > 1 ? (
                            <>
                                <Typography
                                    sx={{
                                        fontSize: "15px",
                                        mb: 1,
                                    }}
                                >
                                    Multiple files already exist in this folder :
                                </Typography>
                                <Box
                                    sx={{
                                        backgroundColor: "#fff",
                                        maxHeight: 180,
                                        overflowY: "auto",
                                        mb: 1,
                                    }}
                                >
                                    {conflictDialog.fileList.map((name, index) => (
                                        <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
                                            <Checkbox
                                                checked={conflictDialog.selectedFiles?.includes(name)}
                                                onChange={(e) => {
                                                    const updatedSelection = e.target.checked
                                                        ? [...conflictDialog.selectedFiles, name]
                                                        : conflictDialog.selectedFiles.filter(f => f !== name);
                                                    setConflictDialog(prev => ({
                                                        ...prev,
                                                        selectedFiles: updatedSelection
                                                    }));
                                                }}
                                                size="small"
                                            />
                                            <Typography
                                                sx={{
                                                    fontSize: "13px",
                                                    py: 0.7,
                                                    px: 1,
                                                    borderBottom: "1px solid #eee",
                                                    "&:last-child": {
                                                        borderBottom: "none",
                                                    },
                                                }}
                                            >
                                                <b>{name}</b>
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>

                                <Typography sx={{ fontSize: "15px" }}>
                                    What would you like to do with these files?
                                </Typography>
                            </>
                        ) : (
                            <Typography sx={{ fontSize: "15px", textAlign: "center" }}>
                                The file <b>{conflictDialog.file?.name}</b> already exists in this folder.
                                <br />
                                What would you like to do?
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mb: 1 }}>
                        {conflictDialog.fileList?.length > 1 ? (
                            <>
                                <Button
                                    onClick={() => {
                                        conflictDialog.onDecision({
                                            action: "skipAll",
                                            selectedFiles: conflictDialog.selectedFiles,
                                        });
                                        setConflictDialog({ ...conflictDialog, open: false });
                                    }}
                                    variant="outlined"
                                    sx={commonButtonStyles}
                                >
                                    Skip All
                                </Button>
                                <Button
                                    onClick={() => {
                                        conflictDialog.onDecision({
                                            action: "replaceAll",
                                            selectedFiles: conflictDialog.selectedFiles,
                                        });
                                        setConflictDialog({ ...conflictDialog, open: false });
                                    }}
                                    variant="outlined"
                                    sx={commonButtonStyles}
                                >
                                    Replace All
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    onClick={() => {
                                        conflictDialog.onDecision("skip");
                                        setConflictDialog({ ...conflictDialog, open: false });
                                    }}
                                    variant="outlined"
                                    sx={commonButtonStyles}
                                >
                                    Skip
                                </Button>
                                <Button
                                    onClick={() => {
                                        conflictDialog.onDecision("replace");
                                        setConflictDialog({ ...conflictDialog, open: false });
                                    }}
                                    variant="outlined"
                                    sx={commonButtonStyles}
                                >
                                    Replace
                                </Button>
                            </>
                        )}
                    </DialogActions>
                </Dialog>

                <Dialog fullWidth open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleRenameFolder();
                        }}
                    >
                        <DialogTitle sx={{ fontSize: "16px", fontWeight: "bold", color: "#ba343b" }}>
                            Rename Folder
                        </DialogTitle>
                        <DialogContent>
                            <TextField
                                fullWidth
                                value={renameFolderName}
                                onChange={(e) => setRenameFolderName(e.target.value)}
                                placeholder="Rename folder name"
                                autoFocus
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setRenameDialogOpen(false)} color="error">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="outlined"
                                sx={{
                                    borderRadius: "20px",
                                    fontWeight: "bold",
                                    color: "#ba343b",
                                    border: "0.5px solid #ba343b"
                                }}
                            >
                                Rename
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

                <Dialog fullWidth open={renameFileDialogOpen} onClose={() => setRenameFileDialogOpen(false)}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();        
                            handleRenameFile();        
                        }}
                    >
                        <DialogTitle sx={{ fontSize: "16px", fontWeight: "bold", color: "#ba343b" }}>
                            Rename File
                        </DialogTitle>
                        <DialogContent>
                            <TextField
                                fullWidth
                                value={renameFileName}
                                onChange={(e) => setRenameFileName(e.target.value)}
                                placeholder="Rename file name"
                                autoFocus 
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setRenameFileDialogOpen(false)} color="error">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="outlined"
                                sx={{
                                    borderRadius: "20px",
                                    fontWeight: "bold",
                                    color: "#ba343b",
                                    border: "0.5px solid #ba343b"
                                }}
                            >
                                Rename
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </Box >
        </>
    );
};

export default AllFolders;