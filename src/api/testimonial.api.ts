import axios from 'axios';

const API_BASE_URL = "https://vanurtech-backend-admin-2-8vsl.onrender.com";

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interfaces
export interface Testimonial {
  _id: string;
  name: string;
  position: string;
  company: string;
  description: string;
  coverImage: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface TestimonialsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: Testimonial[];
}

export interface TestimonialResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: Testimonial;
}

export interface CreateTestimonialData {
  coverImage: File;
  name: string;
  position: string;
  company: string;
  description: string;
}

export interface UpdateTestimonialData {
  coverImage?: File;
  name?: string;
  position?: string;
  company?: string;
  description?: string;
}

// API functions
export const testimonialApi = {
  // Create testimonial
  createTestimonial: async (data: CreateTestimonialData): Promise<TestimonialResponse> => {
    try {
      const formData = new FormData();
      formData.append('coverImage', data.coverImage);
      formData.append('name', data.name);
      formData.append('position', data.position);
      formData.append('company', data.company);
      formData.append('description', data.description);

      const response = await apiClient.post('/api/v1/testimonial/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        
      });
      console.log("API RESPONSE 👉", response);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create testimonial');
    }
  },

  // Get all testimonials
  getAllTestimonials: async (): Promise<TestimonialsResponse> => {
    try {
      const response = await apiClient.get('/api/v1/testimonial/getAll');
     
      return response.data;

    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch testimonials');
    }
  },

  // Get testimonial by ID
  getTestimonialById: async (id: string): Promise<TestimonialResponse> => {
    try {
      const response = await apiClient.get(`/api/v1/testimonial/get/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch testimonial');
    }
  },

  // Update testimonial
  updateTestimonial: async (id: string, data: UpdateTestimonialData): Promise<TestimonialResponse> => {
    try {
      const formData = new FormData();
      
      if (data.coverImage) {
        formData.append('coverImage', data.coverImage);
      }
      if (data.name) {
        formData.append('name', data.name);
      }
      if (data.position) {
        formData.append('position', data.position);
      }
      if (data.company) {
        formData.append('company', data.company);
      }
      if (data.description) {
        formData.append('description', data.description);
      }

      const response = await apiClient.put(`/api/v1/testimonial/update/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update testimonial');
    }
  },

  // Delete testimonial
  deleteTestimonial: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete(`/api/v1/testimonial/delete/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete testimonial');
    }
  },
};
