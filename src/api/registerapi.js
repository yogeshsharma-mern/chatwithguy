// api/registerApi.js (optional but recommended)
import { apiPost } from "../api/apiFetch";
import apiPath from "../api/apipath";

export const registerUser = async (data) => {
  return apiPost(apiPath.registerUser, data);
};
