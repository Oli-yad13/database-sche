import { apiClient } from './client';

export interface Section {
  id: number;
  name: string;
  code: string;
  departmentId: number;
  yearLevel: number;
  capacity: number;
  advisor?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  department?: {
    id: number;
    code: string;
    name: string;
  };
  _count?: {
    enrollments: number;
    schedules: number;
  };
}

export interface CreateSectionData {
  name: string;
  code: string;
  departmentId: number;
  yearLevel: number;
  capacity: number;
  advisor?: string;
  description?: string;
}

export const sectionsApi = {
  async getAll(departmentId?: number, yearLevel?: number): Promise<Section[]> {
    const params: any = {};
    if (departmentId) params.departmentId = departmentId;
    if (yearLevel) params.yearLevel = yearLevel;

    return apiClient.get<Section[]>('/sections', { params });
  },

  async getOne(id: number): Promise<Section> {
    return apiClient.get<Section>(`/sections/${id}`);
  },

  async create(sectionData: CreateSectionData): Promise<Section> {
    return apiClient.post<Section>('/sections', sectionData);
  },

  async update(id: number, sectionData: Partial<CreateSectionData>): Promise<Section> {
    return apiClient.put<Section>(`/sections/${id}`, sectionData);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/sections/${id}`);
  },
};
