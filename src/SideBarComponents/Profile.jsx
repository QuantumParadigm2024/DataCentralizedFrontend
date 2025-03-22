/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Avatar, Box, CircularProgress } from "@mui/material";
import axiosInstance from "../Helper/AxiosInstance";
import CryptoJS from 'crypto-js';
import { secretKey } from '../Helper/SecretKey';
import EmailIcon from '@mui/icons-material/Email';
import CallIcon from '@mui/icons-material/Call';
import CakeIcon from '@mui/icons-material/Cake';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

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
        const fetchProfile = async () => {
            try {
                const response = await axiosInstance.get("/planotech-inhouse/get/profileInfo", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                });

                if (response.data.status) {
                    setProfile(response.data.body);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                <CircularProgress size={40} sx={{ color: "#ba343b" }} />
            </Box>
        );
    }

    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="80vh"
            overflow="hidden"
        >
            <Card sx={{ maxWidth: 500, p: 2, boxShadow: 5, borderRadius: 3 }}>
                <Box display="flex" flexDirection="column" alignItems="center">
                    <Avatar
                        sx={{ width: 100, height: 100, mb: 2 }}
                        src={profile.userPhoto || "https://via.placeholder.com/100"}
                        alt={profile.userName}
                    />
                    <Typography sx={{ fontWeight: "bold", fontSize: "20px" }} >
                        {profile.userName}
                    </Typography>
                    <Typography color="textSecondary" sx={{ fontWeight: "bold", fontSize: "16px" }}>
                        {profile.userDepartment}
                    </Typography>
                </Box>
                <CardContent sx={{ mt: 2 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                        <EmailIcon sx={{ color: "grey", mr: 1 }} />
                        <Typography variant="body1" sx={{ color: "grey" }}>
                            {profile.userEmail}
                        </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" mb={2}>
                        <CallIcon sx={{ color: "grey", mr: 1 }} />
                        <Typography variant="body1" sx={{ color: "grey" }}>
                            {profile.userPhone}
                        </Typography>
                    </Box>

                    <Box display="flex" alignItems="center">
                        <CakeIcon sx={{ color: "grey", mr: 1 }} />
                        <Typography variant="body1" sx={{ color: "grey" }}>
                            {profile.dob}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Profile;