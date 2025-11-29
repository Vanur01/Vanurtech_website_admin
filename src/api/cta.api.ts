import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.vanurmedia.com';

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

export interface CTA {
  _id: string;
  mobile: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface CTAResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: CTA;
}

export interface CTAsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: CTA[];
}

export interface CreateCTAData {
  mobile: string;
  message: string;
}

export interface UpdateCTAData {
  mobile?: string;
  message?: string;
}

export const ctaApi = {
  /**
   * Create a new CTA
   */
  createCTA: async (data: CreateCTAData): Promise<CTAResponse> => {
    try {
      const { data: response } = await axiosInstance.post<CTAResponse>(
        `/api/v1/cta/create`,
        data
      );

      return response;
    } catch (error: any) {
      console.error('Create CTA error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create CTA');
    }
  },

  /**
   * Get all CTAs
   */
  getAllCTAs: async (): Promise<CTAsResponse> => {
    try {
      const { data } = await axiosInstance.get<CTAsResponse>(
        `/api/v1/cta/getAll`
      );

      return data;
    } catch (error: any) {
      console.error('Get CTAs error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch CTAs');
    }
  },

  /**
   * Get CTA by ID
   */
  getCTAById: async (id: string): Promise<CTAResponse> => {
    try {
      const { data } = await axiosInstance.get<CTAResponse>(
        `/api/v1/cta/get/${id}`
      );

      return data;
    } catch (error: any) {
      console.error('Get CTA error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch CTA');
    }
  },

  /**
   * Update CTA
   */
  updateCTA: async (id: string, data: UpdateCTAData): Promise<CTAResponse> => {
    try {
      const { data: response } = await axiosInstance.put<CTAResponse>(
        `/api/v1/cta/update/${id}`,
        data
      );

      return response;
    } catch (error: any) {
      console.error('Update CTA error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update CTA');
    }
  },

  /**
   * Delete CTA
   */
  deleteCTA: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { data } = await axiosInstance.delete(
        `/api/v1/cta/delete/${id}`
      );

      return data;
    } catch (error: any) {
      console.error('Delete CTA error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete CTA');
    }
  },
};
