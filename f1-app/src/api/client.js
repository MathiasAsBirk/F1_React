import axios from "axios";
import { API_URL } from "../constants";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 12_000,
  headers: { Accept: "application/json" },
});

export function apiErrorMessage(error, fallback = "Something went wrong while contacting the API.") {
  if (error?.code === "ECONNABORTED") return "The API took too long to respond.";
  return error?.response?.data?.message || fallback;
}
