
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

export interface CreateUserData {
    username: string;
    email: string;
    password?: string;
    role: 'admin' | 'teacher' | 'student';
    isActive?: boolean;
}

export const usersApi = {
    async getAll(search?: string, role?: string): Promise<User[]> {
        const params: any = {};
        if (search) params.search = search;
        if (role && role !== 'all') params.role = role;

        return apiClient.get<User[]>('/users', { params });
    },

    async getOne(id: number): Promise<User> {
        return apiClient.get<User>(`/users/${id}`);
    },

    async create(userData: CreateUserData): Promise<User> {
        return apiClient.post<User>('/users', userData);
    },

    async update(id: number, userData: Partial<CreateUserData>): Promise<User> {
        return apiClient.patch<User>(`/users/${id}`, userData);
    },

    async delete(id: number): Promise<void> {
        return apiClient.delete<void>(`/users/${id}`);
    },
};
