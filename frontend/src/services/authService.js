import axios from "axios";

const API_URL = "/api/auth";

export async function login(email, password) {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data; // { token, user, ... }
}
