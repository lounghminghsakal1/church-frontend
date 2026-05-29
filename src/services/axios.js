import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true
});

export const apiGet = async (apiEndpoint, params = {}) => {
  const response = await api.get(apiEndpoint, { params });
  return response.data;
}

export const apiPost = async (apiEndpoint, payload, params = {}) => {
  const response = await api.post(apiEndpoint, payload, {withCredentials: true});
  return response.data;
}