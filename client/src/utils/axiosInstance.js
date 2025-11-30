import axios from "axios";

const instance = axios.create({
    baseURL : import.meta.env.VITE_BACKEND_API
})

instance.interceptors.request.use(reqConfig => {
    const token = localStorage.getItem("token");
    if(token) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
    }

    return reqConfig;
})

export default instance;