import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.vanurmedia.com';

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
  description?: string;
  slug?: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  image: string;
  category: string | Category; // Can be string (ID) or populated Category object
  tags: string[];
  website?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProjectsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    projects: Project[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProjects: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface ProjectResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: Project;
}

export interface CreateProjectData {
  image: File;
  title: string;
  description: string;
  category: string;
  tags: string[];
  website?: string;
}

export interface UpdateProjectData {
  image?: File;
  title: string;
  description: string;
  category: string;
  tags: string[];
  website?: string;
}

// API functions
export const projectApi = {
  // Create project
  createProject: async (data: CreateProjectData): Promise<ProjectResponse> => {
    try {
      const formData = new FormData();
      formData.append('image', data.image);
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('categoryId', data.category);
      formData.append('website', data.website || '');
      
      // Append tags as array
      data.tags.forEach((tag) => {
        formData.append('tags', tag);
      });

      const response = await apiClient.post('/api/v1/project/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create project');
    }
  },

  // Get all projects
  getAllProjects: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string
  ): Promise<ProjectsResponse> => {
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;

      const response = await apiClient.get('/api/v1/project/getAll', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch projects');
    }
  },

  // Get project by ID
  getProjectById: async (id: string): Promise<ProjectResponse> => {
    try {
      const response = await apiClient.get(`/api/v1/project/get/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch project');
    }
  },

  // Update project
  updateProject: async (id: string, data: UpdateProjectData): Promise<ProjectResponse> => {
    try {
      const formData = new FormData();
      if (data.image) {
        formData.append('image', data.image);
      }
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('categoryId', data.category);
      formData.append('website', data.website || '');

      // Append tags as array
      data.tags.forEach((tag) => {
        formData.append('tags', tag);
      });

      const response = await apiClient.put(`/api/v1/project/update/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update project');
    }
  },

  // Delete project
  deleteProject: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete(`/api/v1/project/delete/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete project');
    }
  },
};
