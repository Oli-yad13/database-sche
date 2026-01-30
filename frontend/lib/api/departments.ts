import { apiClient } from './client';

export interface Department {
  id: number;
  code: string;
  name: string;
  description?: string;
  faculty?: string;
  headOfDepartment?: string;
  headEmail?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentData {
  code: string;
  name: string;
  description?: string;
  faculty?: string;
  headOfDepartment?: string;
  headEmail?: string;
}

export const departmentsApi = {
  async getAll(search?: string): Promise<Department[]> {
    const params = search ? { search } : {};
    return apiClient.get<Department[]>('/departments', { params });
  },

  async getOne(id: number): Promise<Department> {
    return apiClient.get<Department>(`/departments/${id}`);
  },

  async create(departmentData: CreateDepartmentData): Promise<Department> {
    return apiClient.post<Department>('/departments', departmentData);
  },

  async update(id: number, departmentData: Partial<CreateDepartmentData>): Promise<Department> {
    return apiClient.put<Department>(`/departments/${id}`, departmentData);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/departments/${id}`);
  },
};
