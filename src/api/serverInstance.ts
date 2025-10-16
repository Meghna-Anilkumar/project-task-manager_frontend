import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const serverInstance = axios.create({
    baseURL: API_URL,
});

// Request interceptor (e.g., add auth token if needed)
serverInstance.interceptors.request.use(
    (config) => {
        // const token = localStorage.getItem('token'); // If auth is added later
        // if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor (e.g., handle global errors)
serverInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle errors globally, e.g., log or dispatch Redux error action
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);