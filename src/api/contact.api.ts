import axios from 'axios';

const API_BASE_URL = "https://vanurtech-backend-admin-2-8vsl.onrender.com";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone:string;
  company: string;
  services: string[];
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    data: Contact[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const contactApi = {
  /**
   * Get all contacts with pagination and search
   */
  getAllContacts: async (page: number = 1, limit: number = 10, search?: string): Promise<ContactsResponse> => {
    try {
      const params: any = { page, limit };
      if (search && search.trim()) {
        params.search = search.trim();
      }

      const { data } = await axiosInstance.get<ContactsResponse>(
        `/api/v1/user/getAllContacts`,
        { params }
      );

      return data;
    } catch (error: any) {
      console.error('Get contacts error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch contacts');
    }
  },
};
