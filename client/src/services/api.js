import axios from 'axios';
import { auth } from '../config/firebase';
import { getApiOrigin } from '../utils/runtimeConfig';

const api = axios.create({
  baseURL: getApiOrigin(),
  withCredentials: false,
});

api.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;

  if (currentUser) {
    const token = await currentUser.getIdToken();
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});

export default api;
