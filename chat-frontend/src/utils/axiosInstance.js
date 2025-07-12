import axios from "axios";

const serverUrl = import.meta.env.VITE_SERVER_URL;

const axiosInstance = axios.create({
  baseURL: serverUrl,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;