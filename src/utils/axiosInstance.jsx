import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:9191/", // Replace with your actual API URL
    
});

export default axiosInstance;
