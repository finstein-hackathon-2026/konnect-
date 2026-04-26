import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// ─── Single source of truth for the backend URL ───
const BASE_URL = 'https://ceremony-savior-security.ngrok-free.dev';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true' 
  },
});

// ─── Token helpers ───
export const getToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem('token');
};

export const getUser = async () => {
  const raw = await AsyncStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
};

export const saveAuth = async (data: {
  id: string;
  name: string;
  email: string;
  token: string;
}) => {
  await AsyncStorage.setItem('token', data.token);
  await AsyncStorage.setItem(
    'user',
    JSON.stringify({ id: data.id, name: data.name, email: data.email })
  );
};

export const clearAuth = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

export const authHeaders = async () => {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── URL builder ───
export const apiUrl = (path: string) => `${BASE_URL}${path}`;

export const SOCKET_URL = BASE_URL;

export default api;
