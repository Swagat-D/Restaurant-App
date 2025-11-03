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

export default {
  sendOtp,
  verifyOtp,
  verifyToken,
};
