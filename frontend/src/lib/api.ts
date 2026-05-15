import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for API calls
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor — silently renews the access token on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error('No refresh token available');

                const { data } = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/refresh`,
                    { refreshToken }
                );

                // Persist both the new access token AND the rotated refresh token.
                // The backend invalidates the old refresh token on use — failing to store
                // the new one means the next silent refresh will always fail.
                localStorage.setItem('token', data.token);
                if (data.refreshToken) {
                    localStorage.setItem('refreshToken', data.refreshToken);
                }

                // Sync the new access token into the Authorization header and retry
                originalRequest.headers.Authorization = `Bearer ${data.token}`;
                return axios(originalRequest);
            } catch (refreshError) {
                // Refresh token expired / invalid — log out cleanly via event
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                // Dispatch event so AuthContext / Zustand can clear state before redirect
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('auth:logout'));
                }
                return Promise.reject(refreshError);
            }
        }

        
        // Dispatch custom global event for unhandled server / network errors
        if (typeof window !== "undefined") {
            const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "API Error";
            const event = new CustomEvent("api-error", { detail: { message: errorMsg, status: error.response?.status } });
            window.dispatchEvent(event);
        }

        return Promise.reject(error);
    }
);

export default api;

export const recordActivity = async (action: string, courseId?: string, metadata?: any) => {
    try {
        await api.post('/activity/log', { action, courseId, metadata });
    } catch (err) {
        console.warn('Failed to log activity:', err);
    }
};
