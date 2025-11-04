import axios from 'axios';

const BASE_URL = 'https://elitecafe.devsomeware.com';

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  token?: string;
  [key: string]: any;
}

export const sendOtp = async (email: string): Promise<ApiResponse> => {
  const url = `${BASE_URL}/api/auth/send-otp`;
  const res = await axios.post(url, { email });
  return res.data;
};

export const verifyOtp = async (email: string, otp: string): Promise<ApiResponse> => {
  const url = `${BASE_URL}/api/auth/verify-otp`;
  const res = await axios.post(url, { email, otp });
  return res.data;
};

export const verifyToken = async (token: string): Promise<ApiResponse> => {
  const url = `${BASE_URL}/api/auth/verify`;
  const res = await axios.get(url, { params: { token } });
  return res.data;
};

export const getEmployeeProfile = async (email: string, token: string): Promise<ApiResponse> => {
  const url = `${BASE_URL}/api/auth/profile`;
  const res = await axios.get(url, { 
    params: { email },
    headers: { Authorization: token }
  });
  return res.data;
};

export const updateEmployeeProfile = async (data: any, token: string): Promise<ApiResponse> => {
  const url = `${BASE_URL}/api/auth/profile`;
  const res = await axios.put(url, data, {
    headers: { Authorization: token }
  });
  return res.data;
};

export const getAllTables = async (token: string): Promise<ApiResponse> => {
  const url = `${BASE_URL}/api/tables`;
  const res = await axios.get(url, {
    headers: { Authorization: token }
  });
  return res.data;
};

export const getTablesByStatus = async (status: string, token: string): Promise<ApiResponse> => {
  const url = `${BASE_URL}/api/tables`;
  const res = await axios.get(url, {
    params: { status },
    headers: { Authorization: token }
  });
  return res.data;
};

export const getTableById = async (tableid: string, token: string): Promise<ApiResponse> => {
  const url = `${BASE_URL}/api/tables/${tableid}/status`;
  const res = await axios.get(url, {
    headers: { Authorization: token }
  });
  return res.data;
};

export const updateTableStatus = async (tableid: string, status: string, token: string): Promise<ApiResponse> => {
  const url = `${BASE_URL}/api/tables/${tableid}/status`;
  const res = await axios.put(url, { status }, {
    headers: { Authorization: token }
  });
  return res.data;
};

// Category APIs
export const getCategories = async (token: string): Promise<ApiResponse> => {
  const url = `${BASE_URL}/api/category`;
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Menu APIs
export const getMenuItems = async (token: string, categoryid?: string, status?: 'available' | 'unavailable', search?: string): Promise<ApiResponse> => {
  const url = `${BASE_URL}/api/menu`;
  const params: any = {};
  
  if (categoryid) params.categoryid = categoryid;
  if (status) params.status = status;
  if (search) params.search = search;
  
  const res = await axios.get(url, {
    params,
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getAllMenuItems = async (token: string): Promise<ApiResponse> => {
  const url = `${BASE_URL}/api/menu`;
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export default {
  sendOtp,
  verifyOtp,
  verifyToken,
  getEmployeeProfile,
  updateEmployeeProfile,
  getAllTables,
  getTablesByStatus,
  getTableById,
  updateTableStatus,
  getCategories,
  getMenuItems,
  getAllMenuItems,
};
