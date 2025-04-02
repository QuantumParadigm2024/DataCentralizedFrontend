/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import { Box, CircularProgress } from "@mui/material";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../Helper/AxiosInstance";
import IconButton from "@mui/joy/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Data from "../Assets/data.jpeg";
import CryptoJS from 'crypto-js';
import { secretKey } from '../Helper/SecretKey';
import { Dialog, DialogContent } from "@mui/material";

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [loginMessage, setLoginMessage] = useState("");
    const [loginOpen, setLoginOpen] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const newErrors = {};
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!emailRegex.test(formData.email.trim()))
            newErrors.email = "Please enter a valid email address";

        if (!formData.password.trim()) newErrors.password = "Password is required";

        setErrors(newErrors);

        const params = {
            email: formData.email,
            password: formData.password,
        };

        if (Object.keys(newErrors).length === 0) {
            setLoginLoading(true);
            
            try {
                const response = await axiosInstance.post("/planotech-inhouse/user/login", formData, {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    params: params,
                });

                if (response.status === 200) {
                    const encryptedToken = CryptoJS.AES.encrypt(response.data.token, secretKey).toString();
                    sessionStorage.setItem("dc", encryptedToken);
                    setLoginOpen(true);
                    setLoginMessage("✅ Login Successful! Redirecting...");
                    setTimeout(() => {
                        navigate("/dashboard");
                    }, 2000);
                }
            } catch (error) {
                setLoginOpen(true);
                setLoginMessage(error.response?.data?.message || "❌ Invalid email or password.");
            } finally {
                setLoginLoading(false);
            }
        }
    };

    return (
        <>
            <Box
                sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mt: 12,
                }}
            >
                <Box
                    sx={{
                        width: "800px",
                        display: "flex",
                        flexDirection: "row",
                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                        borderRadius: "10px",
                        overflow: "hidden",
                        backgroundColor: "#fff",
                    }}>
                    {/* Left Side - Illustration */}
                    <Box
                        style={{
                            width: "50%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            overflow: "hidden",
                        }}
                    >
                        <img
                            src={Data}
                            alt="Login Illustration"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    </Box>

                    {/* Right Side - Login Form */}
                    <Sheet
                        sx={{
                            width: "50%",
                            padding: "40px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            borderTopRightRadius: "10px",
                            borderTopLeftRadius: "0px",
                            borderBottomRightRadius: "10px",
                            borderBottomLeftRadius: "0px",
                            boxShadow: "lg",
                        }}
                        variant="outlined"
                    >
                        <div>
                            <Typography level="h3" component="h1" sx={{ fontWeight: "bold", color: "#b4b4b4", textAlign: 'center', mb: 1 }}>
                                <b>Welcome Back!</b>
                            </Typography>
                            <Typography level="body-sm" sx={{ textAlign: "center" }}>
                                Sign in to continue.
                            </Typography>
                        </div>
                        <FormControl error={Boolean(errors.email)}>
                            <FormLabel>
                                Email<span style={{ color: "red" }}>*</span>
                            </FormLabel>
                            <Input
                                name="email"
                                type="email"
                                placeholder="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && <Typography color="danger" fontSize="sm">{errors.email}</Typography>}
                        </FormControl>

                        <FormControl error={Boolean(errors.password)}>
                            <FormLabel>
                                Password<span style={{ color: "red" }}>*</span>
                            </FormLabel>
                            <Input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="password"
                                value={formData.password}
                                onChange={handleChange}
                                endDecorator={
                                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                }
                            />
                            {errors.password && <Typography color="danger" fontSize="sm">{errors.password}</Typography>}
                        </FormControl>

                        <Typography level="body-sm" sx={{ textAlign: "center", color: "red", fontSize: "11px" }}>
                            Note : Use the same credentials as the Planotech app. This login is only for Planotech employees.
                        </Typography>

                        <Button
                            onClick={handleSubmit}
                            sx={{
                                mt: 2,
                                width: "auto",
                                backgroundColor: loginLoading ? "#BDBDBD" : "#ba343b",
                                color: "white",
                                "&:hover": { backgroundColor: loginLoading ? "#BDBDBD" : "#9e2b31" },
                            }}
                            disabled={loginLoading}
                            variant="contained"
                        >
                            {loginLoading ? <CircularProgress size={24} sx={{ color: "#ba343b" }} /> : "Login"}
                        </Button>
                    </Sheet>
                </Box>

                <Dialog
                    open={loginOpen}
                    onClose={() => setLoginOpen(false)}
                    fullWidth
                    maxWidth="sm"
                    sx={{ "& .MuiDialog-paper": { width: "450px" } }}
                >
                    <DialogContent sx={{ textAlign: "center", p: 3 }}>
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ color: '#232323', fontSize: "18px", fontWeight: "bold" }}
                        >
                            {loginMessage}
                        </Typography>
                    </DialogContent>
                </Dialog>
            </Box>
            <ToastContainer />
        </>
    );
};

export default Login;