import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = "https://backend.vanurmedia.com"

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 🔥 REQUIRED
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Redirect to login (adjust path as needed)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ... re

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: UserData;
}

export interface RegisterResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: UserData;
}

export interface LogoutResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: any;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: string; // Reset token
}

export interface ResetPasswordRequest {
  new_password: string;
  confirm_password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    message: string;
  };
}

export const authApi = {
  /**
   * Register new user
   */
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const { data } = await axiosInstance.post<RegisterResponse>(
        '/api/v1/user/register',
        userData
      );

      // Store tokens in localStorage and cookies
      if (data.success && data.result) {
        localStorage.setItem('accessToken', data.result.accessToken);
        localStorage.setItem('refreshToken', data.result.refreshToken);
        localStorage.setItem('userData', JSON.stringify({
          _id: data.result._id,
          name: data.result.name,
          email: data.result.email,
          phone: data.result.phone,
          role: data.result.role,
        }));
        
        // Set cookie for middleware (expires in 7 days)
        document.cookie = `accessToken=${data.result.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
      }

      return data;
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  /**
   * Login user with email/phone and password
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const { data } = await axiosInstance.post<LoginResponse>(
        '/api/v1/user/login',
        credentials
      );

      // Store tokens in localStorage and cookies
      if (data.success && data.result) {
        localStorage.setItem('accessToken', data.result.accessToken);
        localStorage.setItem('refreshToken', data.result.refreshToken);
        localStorage.setItem('userData', JSON.stringify({
          _id: data.result._id,
          name: data.result.name,
          email: data.result.email,
          phone: data.result.phone,
          role: data.result.role,
        }));
        
        // Set cookie for middleware (expires in 7 days)
        document.cookie = `accessToken=${data.result.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
      }

      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<LogoutResponse> => {
    try {
      const { data } = await axiosInstance.get<LogoutResponse>(
        '/api/v1/user/logout'
      );

      // Clear tokens from localStorage and cookies regardless of response
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      
      // Clear cookie
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      return data;
    } catch (error: any) {
      // Even if API fails, clear local storage and cookies
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      
      // Clear cookie
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      console.error('Logout error:', error);
      throw error;
    }
  },

  /**
   * Get stored user data
   */
  getUserData: (): UserData | null => {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const accessToken = localStorage.getItem('accessToken');
    return !!accessToken;
  },

  /**
   * Get access token
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  /**
   * Forgot password - request password reset
   */
  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    try {
      const { data } = await axiosInstance.post<ForgotPasswordResponse>(
        '/api/v1/user/forgotPassword',
        { email }
      );
      return data;
    } catch (error: any) {
      console.error('Forgot password error:', error);
      throw new Error(error.response?.data?.message || 'Failed to send reset link');
    }
  },

  /**
   * Reset password using token
   */
  resetPassword: async (token: string, passwords: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    try {
      const { data } = await axiosInstance.post<ResetPasswordResponse>(
        `/api/v1/user/resetPassword/${token}`,
        passwords
      );
      return data;
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  },
};
