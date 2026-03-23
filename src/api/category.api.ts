import axios from 'axios';

const API_BASE_URL = "https://vanurtech-backend-admin-3.onrender.com"
;

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
export interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CategoriesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: Category[];
}

export interface CategoryResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: Category;
}

export interface CreateCategoryData {
  name: string;
  description: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
}

// API functions
export const categoryApi = {
  // Create category
  createCategory: async (data: CreateCategoryData): Promise<CategoryResponse> => {
    try {
      const response = await apiClient.post('/api/v1/category/create', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create category');
    }
  },

  // Get all categories
  getAllCategories: async (): Promise<CategoriesResponse> => {
    try {
      const response = await apiClient.get('/api/v1/category/getAll');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<CategoryResponse> => {
    try {
      const response = await apiClient.get(`/api/v1/category/get/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch category');
    }
  },

  // Update category
  updateCategory: async (id: string, data: UpdateCategoryData): Promise<CategoryResponse> => {
    try {
      const response = await apiClient.put(`/api/v1/category/update/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update category');
    }
  },

  // Delete category
  deleteCategory: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete(`/api/v1/category/delete/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete category');
    }
  },
};
