import axios from "axios";
import { logoutEvent } from "../utils/logoutEvent";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

// 🔥 INTERCEPTOR GLOBAL
api.interceptors.response.use(
    (response) => response,
    (error) => {

        if (error.response?.status === 401 || error.response?.status === 403) {
            logoutEvent.dispatch();
        }

        return Promise.reject(error);
    }
);

export default api;