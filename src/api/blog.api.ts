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

export interface Author {
  _id: string;
  name: string;
  email: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  slug?: string;
}

export interface Blog {
  _id: string;
  title: string;
  content: string;
  category: string | Category; // Can be string (ID) or populated Category object
  tags: string[];
  coverImage: string;
  readingTime: number;
  status: 'draft' | 'published';
  author: Author;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    pagination: {
      currentPage: number;
      totalPages: number;
      totalBlogs: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    blogs: Blog[];
  };
}

export interface BlogResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: Blog;
}

export interface CreateBlogData {
  coverImage: File;
  title: string;
  status: 'draft' | 'published';
  content: string;
  category: string;
  tags: string[];
}

export interface UpdateBlogData {
  coverImage?: File;
  title?: string;
  status?: 'draft' | 'published';
  content?: string;
  category?: string;
  tags?: string[];
}

export const blogApi = {
  /**
   * Create a new blog
   */
  createBlog: async (data: CreateBlogData): Promise<BlogResponse> => {
    try {
      const formData = new FormData();
      formData.append('coverImage', data.coverImage);
      formData.append('title', data.title);
      formData.append('status', data.status);
      formData.append('content', data.content);
      formData.append('categoryId', data.category);
      
      // Append tags as array
      data.tags.forEach((tag) => {
        formData.append('tags', tag);
      });

      const { data: response } = await axiosInstance.post<BlogResponse>(
        `/api/v1/blog/create`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response;
    } catch (error: any) {
      console.error('Create blog error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create blog');
    }
  },

  /**
   * Get all blogs with pagination, search, and filters
   */
  getAllBlogs: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string
  ): Promise<BlogsResponse> => {
    try {
      const params: any = { page, limit };
      if (search && search.trim()) {
        params.search = search.trim();
      }
      if (category && category.trim() && category !== 'All') {
        params.category = category.trim();
      }

      const { data } = await axiosInstance.get<BlogsResponse>(
        `/api/v1/blog/getAll`,
        { params }
      );

      return data;
    } catch (error: any) {
      console.error('Get blogs error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch blogs');
    }
  },

  /**
   * Get blog by ID
   */
  getBlogById: async (id: string): Promise<BlogResponse> => {
    try {
      const { data } = await axiosInstance.get<BlogResponse>(
        `/api/v1/blog/get/${id}`
      );

      return data;
    } catch (error: any) {
      console.error('Get blog error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch blog');
    }
  },

  /**
   * Update blog
   */
  updateBlog: async (id: string, data: UpdateBlogData): Promise<BlogResponse> => {
    try {
      const formData = new FormData();
      
      if (data.coverImage) {
        formData.append('coverImage', data.coverImage);
      }
      if (data.title) {
        formData.append('title', data.title);
      }
      if (data.status) {
        formData.append('status', data.status);
      }
      if (data.content) {
        formData.append('content', data.content);
      }
      if (data.category) {
        formData.append('categoryId', data.category);
      }
      if (data.tags) {
        data.tags.forEach((tag) => {
          formData.append('tags', tag);
        });
      }

      const { data: response } = await axiosInstance.put<BlogResponse>(
        `/api/v1/blog/update/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response;
    } catch (error: any) {
      console.error('Update blog error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update blog');
    }
  },

  /**
   * Delete blog
   */
  deleteBlog: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { data } = await axiosInstance.delete(
        `/api/v1/blog/delete/${id}`
      );

      return data;
    } catch (error: any) {
      console.error('Delete blog error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete blog');
    }
  },
};
