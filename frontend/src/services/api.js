import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
API.interceptors.request.use(
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

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');

// Issue APIs
export const getIssues = (params) => API.get('/issues', { params });
export const getIssue = (id) => API.get(`/issues/${id}`);
export const createIssue = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    if (key === 'images') {
      data.images.forEach(image => {
        formData.append('images', image);
      });
    } else if (key === 'location') {
      formData.append('location', data.location.join(','));
    } else {
      formData.append(key, data[key]);
    }
  });
  
  return API.post('/issues', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const updateIssueStatus = (id, status, comment) => 
  API.put(`/issues/${id}/status`, { status, comment });
export const upvoteIssue = (id) => API.post(`/issues/${id}/upvote`);
export const addComment = (id, text) => API.post(`/issues/${id}/comments`, { text });
export const getUserIssues = () => API.get('/issues/user/me');

export default API;