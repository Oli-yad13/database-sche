import { apiClient } from './client';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
}

export interface LoginData {
  usernameOrEmail: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authApi = {
  register: async (data: RegisterData) => {
    return apiClient.post<{ message: string; user: User }>('/auth/register', data);
  },

  login: async (data: LoginData) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);

    // Save tokens and user
    apiClient.setTokens(response.accessToken, response.refreshToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  logout: async (refreshToken?: string) => {
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } finally {
      apiClient.clearTokens();
    }
  },

  getProfile: async () => {
    return apiClient.get<User>('/auth/profile');
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiClient.patch<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  requestPasswordReset: async (email: string) => {
    return apiClient.post<{ message: string }>('/auth/request-reset', { email });
  },

  resetPassword: async (resetToken: string, newPassword: string) => {
    return apiClient.post<{ message: string }>('/auth/reset-password', {
      resetToken,
      newPassword,
    });
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken }
    );
    apiClient.setTokens(response.accessToken, response.refreshToken);
    return response;
  },
};
