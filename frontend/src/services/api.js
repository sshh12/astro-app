import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
});

apiClient.interceptors.request.use(
  (config) => {
    const storedAuth = JSON.parse(localStorage.getItem("auth"));
    if (storedAuth && storedAuth.token) {
      config.headers.Authorization = `Bearer ${storedAuth.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized, redirecting to login");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
