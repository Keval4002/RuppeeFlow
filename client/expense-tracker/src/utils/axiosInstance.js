import axios from "axios"

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    headers:{
        "Content-Type":"application/json",
        Accept: "application/json"
    },
});

axiosInstance.interceptors.request.use(
    (config)=>{
        const accessToken = localStorage.getItem("token");
        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
)

axiosInstance.interceptors.response.use(
    (response)=>{
        return response;
    },
    error=>{
        //Handling errors globally
        if(error.response){
            if(error.response.status === 401){
                window.location.href = "/login";
            }
        } else if(error.response.status === 500){
            console.error("Server error. Please try again later.");
        } else if(error.code === "ECONNABORTED"){
            console.error("Request timeout. Please try again");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance