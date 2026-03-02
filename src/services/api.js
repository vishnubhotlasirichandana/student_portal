import axios from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Silent token refresh on 401
const refreshAuthLogic = (failedRequest) =>
    axios
        .post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: localStorage.getItem('refreshToken'),
        })
        .then((res) => {
            const { accessToken, refreshToken } = res.data.tokens;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            failedRequest.response.config.headers.Authorization = `Bearer ${accessToken}`;
            return Promise.resolve();
        })
        .catch((err) => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('streamToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(err);
        });

createAuthRefreshInterceptor(api, refreshAuthLogic);

/* ───────────── Auth API ───────────── */
export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
    verifyEmail: (data) => api.post('/auth/verify-email', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
};

/* ───────────── Student Profile API ───────────── */
export const studentApi = {
    getProfile: () => api.get('/students/me'),
    updateProfile: (data) => api.put('/students/me', data),
    listPortfolio: (page = 1, limit = 20) =>
        api.get('/students/me/portfolio', { params: { page, limit } }),
    addPortfolioItem: (formData) =>
        api.post('/students/me/portfolio', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    addPortfolioLink: (data) => api.post('/students/me/portfolio', data),
    deletePortfolioItem: (itemId) => api.delete(`/students/me/portfolio/${itemId}`),
    downloadPortfolioItem: (itemId) =>
        api.get(`/students/me/portfolio/${itemId}/download`, { responseType: 'blob' }),
    getPublicProfile: (userId) => api.get(`/students/${userId}/profile`),
};

/* ───────────── Projects API ───────────── */
export const projectApi = {
    list: (params = {}) => api.get('/projects', { params }),
    getOne: (id) => api.get(`/projects/${id}`),
    apply: (id) => api.post(`/projects/${id}/apply`),
    withdraw: (id) => api.post(`/projects/${id}/withdraw`),
    getMyProjects: () => api.get('/projects/me'),
    downloadDocument: (fileId) =>
        api.get(`/projects/document/${fileId}`, { responseType: 'blob' }),
};

/* ───────────── Notifications API ───────────── */
export const notificationApi = {
    getNotifications: (page = 1, limit = 20, unreadOnly = false) =>
        api.get('/api/notifications', { params: { page, limit, unreadOnly } }),
    markAsRead: (ids) => api.post('/api/notifications/mark-read', { ids }),
};

export default api;
