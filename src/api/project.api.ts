import axios from "axios";

//api url
const API_BASE_URL = "https://backend.vanurmedia.com";

// Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Auth interceptor
apiClient.interceptors.request.use(
  (config) => {
    // ✅ FIX: Use "accessToken" to match what's stored during login
    const token = localStorage.getItem("accessToken");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      
      // Redirect to login (if in browser)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// ================== TYPES ==================

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
  category: string | Category;
  tags: string[];
  website?: string;
  createdAt: string;
  updatedAt: string;
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
  title: string;
  description: string;
  category: string;
  tags: string[];
  website?: string;
}

export interface UpdateProjectData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  website?: string;
}

// ================== API ==================

export const projectApi = {
  createProject: async (
    data: CreateProjectData,
    image: File | null
  ): Promise<ProjectResponse> => {
    const formData = new FormData();

    // Image is required for create
    if (!image) {
      throw new Error("Image is required");
    }

    formData.append("image", image);
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("website", data.website || "");

    data.tags.forEach((tag) => formData.append("tags", tag));

    const response = await apiClient.post("/api/v1/project/create", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  getAllProjects: async (
    page = 1,
    limit = 10,
    search?: string,
    category?: string
  ): Promise<ProjectsResponse> => {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (category && category !== "All") params.category = category;

    const response = await apiClient.get("/api/v1/project/getAll", { params });

    return response.data;
  },

  getProjectById: async (id: string): Promise<ProjectResponse> => {
    const response = await apiClient.get(`/api/v1/project/get/${id}`);
    return response.data;
  },

  updateProject: async (
    id: string,
    data: UpdateProjectData,
    image?: File | null
  ): Promise<ProjectResponse> => {
    const formData = new FormData();

    // Only append image if a new one is provided
    if (image) {
      formData.append("image", image);
    }

    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("website", data.website || "");

    data.tags.forEach((tag) => formData.append("tags", tag));

    const response = await apiClient.put(
      `/api/v1/project/update/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  deleteProject: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/api/v1/project/delete/${id}`);
    return response.data;
  },
};
