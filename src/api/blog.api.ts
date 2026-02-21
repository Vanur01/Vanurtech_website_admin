import axios from 'axios';

//api url
const API_BASE_URL = "https://backend.vanurmedia.com"

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ✅ IMPORTANT
});

/* ================= TYPES ================= */

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
  slug: string;
  content: string;
  category: string | Category;
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
  slug: string;
  status: 'draft' | 'published';
  content: string;
  category: string;
  tags: string[];
}

export interface UpdateBlogData {
  coverImage?: File;
  title?: string;
  slug?: string;
  status?: 'draft' | 'published';
  content?: string;
  category?: string;
  tags?: string[];
}

/* ================= API ================= */

export const blogApi = {
  /* ---------- CREATE BLOG ---------- */
  async createBlog(data: CreateBlogData): Promise<BlogResponse> {
    const formData = new FormData();
   const token = localStorage.getItem("accessToken")
   console.log(token)
    formData.append('coverImage', data.coverImage);
    formData.append('title', data.title);
    formData.append('slug', data.slug);
    formData.append('status', data.status);
    formData.append('content', data.content);
    formData.append('category', data.category);
    data.tags.forEach(tag => formData.append('tags', tag));

    const res = await axiosInstance.post<BlogResponse>(
      '/api/v1/blog/create',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data',
        "Authorization":`Bearer ${token}`
       },
      withCredentials:true }
    );

    return res.data;
  },

  /* ---------- GET ALL BLOGS ---------- */
  async getAllBlogs(
    page = 1,
    limit = 10,
    search?: string,
    category?: string
  ): Promise<BlogsResponse> {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (category && category !== 'All') params.category = category;

    const res = await axiosInstance.get<BlogsResponse>(
      '/api/v1/blog/getAll',
      { params }
    );

    return res.data;
  },

  /* ---------- GET BLOG BY ID ---------- */
  async getBlogById(id: string): Promise<BlogResponse> {
    const res = await axiosInstance.get<BlogResponse>(
      `/api/v1/blog/get/${id}`
    );
    return res.data;
  },

  /* ---------- GET BLOG BY SLUG ---------- */
  async getBlogBySlug(slug: string): Promise<BlogResponse> {
    const res = await axiosInstance.get<BlogResponse>(
      `/api/v1/blog/slug/${slug}`
    );
    return res.data;
  },

  /* ---------- UPDATE BLOG ---------- */
  async updateBlog(id: string, data: UpdateBlogData): Promise<BlogResponse> {
    const formData = new FormData();

    if (data.coverImage) formData.append('coverImage', data.coverImage);
    if (data.title) formData.append('title', data.title);
    if (data.slug) formData.append('slug', data.slug);
    if (data.status) formData.append('status', data.status);
    if (data.content) formData.append('content', data.content);
    if (data.category) formData.append('category', data.category);
    if (data.tags) data.tags.forEach(tag => formData.append('tags', tag));

    const res = await axiosInstance.put<BlogResponse>(
      `/api/v1/blog/update/${id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return res.data;
  },

  /* ---------- DELETE BLOG ---------- */
  async deleteBlog(id: string): Promise<{ success: boolean; message: string }> {
    const res = await axiosInstance.delete(
      `/api/v1/blog/delete/${id}`
    );
    return res.data;
  },
};
