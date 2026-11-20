import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

type Retryable = InternalAxiosRequestConfig & { _retry?: boolean }
const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";
let accessToken: string | null = null;

//instance
export const setAccessToken = (token: string | null) => {
    accessToken = token;
}
export const getAccessToken = () => accessToken;

export const api = axios.create({ baseURL, withCredentials: true })

//request interceptor
api.interceptors.request.use((config) => {
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
})

// response interceptor
let refreshing: Promise<string> | null = null;

const doRefresh = async (): Promise<string> => {
    const res = await axios.post(`${baseURL}/auth/refresh`, null, { withCredentials: true })
    return res.data.accessToken as string;
}

// everyone who needs a refresh shares the SAME in-flight call
export const refreshSession = (): Promise<string> => {
    refreshing ??= doRefresh().finally(() => {
        refreshing = null;
    });
    return refreshing;
};

const SKIP_REFRESH = ['/auth/login', '/auth/register', "/auth/refresh"];
api.interceptors.response.use((response) => response, async (error: AxiosError) => {

    const original = error.config as Retryable;
    const skip = SKIP_REFRESH.some(p => original?.url?.startsWith(p));

    if (error.response?.status === 401 && original && !original._retry && !skip) {
        original._retry = true;
        try {

            const token = await refreshSession();
            setAccessToken(token);
            original.headers.Authorization = `Bearer ${token}`;
            return api(original)// saved and retry

        } catch {
            setAccessToken(null);
            window.dispatchEvent(new Event("auth:logout"));
        }
    }
    return Promise.reject(error)

})


