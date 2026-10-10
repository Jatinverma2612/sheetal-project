import axios from "axios";
import { API_BASE_URL } from "./api";

const buildHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {};

  if (token && token.trim()) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const getBasicInfo = async () => {
  const response = await axios.get(`${API_BASE_URL}/basic-info`, {
    headers: buildHeaders(),
    withCredentials: true,
  });
  return response.data;
};

export const updateBasicInfo = async (data) => {
  const response = await axios.put(`${API_BASE_URL}/basic-info`, data, {
    headers: buildHeaders(),
    withCredentials: true,
  });
  return response.data;
};
