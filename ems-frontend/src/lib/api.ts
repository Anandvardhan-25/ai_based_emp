import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? import.meta.env.REACT_APP_API_URL ?? "https://ai-based-emp.onrender.com",
  withCredentials: true
});


