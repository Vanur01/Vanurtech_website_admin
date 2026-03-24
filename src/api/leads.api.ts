import axios from "axios";

/**
 * Base API URL
 */
const API_BASE_URL = "https://vanurtech-backend-admin-2-8vsl.onrender.com";

/**
 * Axios instance
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attach Bearer token (admin)
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =======================
   TYPES
======================= */

export interface LeadsProject {
  _id: string;
  phone: string;
  name: string;
  createdAt: string;
}

/* =======================
   ADMIN LEAD API
======================= */

export const leadsprojectApi = {
  /**
   * Create lead (public)
   */
  createLead: async (data: {
    phone: string;
    name?: string;
  }): Promise<{ success: boolean }> => {
    const response = await axiosInstance.post(
      "/api/v1/lead",
      data
    );
    return response.data;
  },

  /**
   * Check lead access (24h logic)
   */
  checkLeadAccess: async (
    phone: string
  ): Promise<{ access: boolean }> => {
    const response = await axiosInstance.get(
      "/api/v1/lead/check",
      {
        headers: {
          "x-phone": phone.trim(),
        },
      }
    );
    return response.data;
  },

  /**
   * ADMIN: Get all project leads
   */
  getAllLeads: async (): Promise<LeadsProject[]> => {
    const response = await axiosInstance.get(
      "/api/v1/lead/alllead"
    );
    return response.data;
  },
};
