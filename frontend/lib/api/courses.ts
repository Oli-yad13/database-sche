import { apiClient } from './client';

export interface Course {
  id: number;
  code: string;
  name: string;
  description?: string;
  departmentId: number;
  creditHours: number;
  level: number;
  hasLab: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  department?: {
    id: number;
    code: string;
    name: string;
  };
}

export interface CreateCourseData {
  code: string;
  name: string;
  description?: string;
  departmentId: number;
  creditHours: number;
  level: number;
  hasLab?: boolean;
}

export const coursesApi = {
  async getAll(departmentId?: number, level?: number): Promise<Course[]> {
    const params: any = {};
    if (departmentId) params.departmentId = departmentId;
    if (level) params.level = level;

    return apiClient.get<Course[]>('/courses', { params });
  },

  async getOne(id: number): Promise<Course> {
    return apiClient.get<Course>(`/courses/${id}`);
  },

  async create(courseData: CreateCourseData): Promise<Course> {
    return apiClient.post<Course>('/courses', courseData);
  },

  async update(id: number, courseData: Partial<CreateCourseData>): Promise<Course> {
    return apiClient.put<Course>(`/courses/${id}`, courseData);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/courses/${id}`);
  },
};
