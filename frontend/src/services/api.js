import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

export const registerUser = (email, password) => API.post('/auth/register', { email, password });
export const loginUser = (email, password) => API.post('/auth/login', { email, password });
export const logoutUser = () => API.post('/auth/logout');
export const getCurrentUser = () => API.get('/me');

export const startXLogin = () => API.get('/auth/x/start'); // returns redirect
export const getXUser = () => API.get('/api/x/me');
export const getXPosts = () => API.get('/api/x/posts');

export const startTumblrLogin = () => API.get('/auth/tumblr/start');
export const getTumblrPosts = () => API.get('/api/tumblr/posts');

// Youtube API
export const startYouTubeLogin = () => {
  window.location.href = 'http://localhost:3000/auth/youtube/start';
};
export const getYouTubeUser = () => API.get('/api/youtube/me');
export const getYouTubeFeed = () => API.get('/api/youtube/feed');


