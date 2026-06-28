import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/", // backend url
});

//api.interceptors.request.use is a hook that runs before every http request is sent
api.interceptors.request.use((config) => {
  //config => entire request object that Axios is about to send.
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If access token expired, refresh it automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status == 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        const res = await axios.post(
          "http://localhost:8000/api/auth/refresh/",
          { refresh },
        );
        localStorage.setItem("access", res.data.access);
        original.headers.Authorization = `Bearer ${res.data.access}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
