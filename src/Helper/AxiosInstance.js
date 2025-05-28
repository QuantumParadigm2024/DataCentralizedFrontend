import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:9191/",
    // baseURL:"https://backend.planotechevents.com:9191/",
});

export default axiosInstance;