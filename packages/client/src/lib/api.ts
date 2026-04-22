import axios, { AxiosError } from "axios";
import type { APIResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface ErrorResponse {
  error: string;
  errorCode: string;
  message: string;
  details?: string;
}

export async function uploadReport(file: File): Promise<APIResponse> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post<APIResponse>(
      `${API_BASE_URL}/api/report/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000, // 60 second timeout
      }
    );

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data as ErrorResponse;
      // Throw the user-friendly message from the server
      throw new Error(errorData.message || errorData.error || "Failed to upload report");
    }
    
    // Handle network/timeout errors
    if (error instanceof AxiosError) {
      if (error.code === "ECONNABORTED") {
        throw new Error("Request timeout. The server took too long to respond. Please try again.");
      }
      if (error.code === "ERR_NETWORK") {
        throw new Error("Network error. Please check your connection and try again.");
      }
    }
    
    throw new Error("Failed to upload report. Please try again.");
  }
}
