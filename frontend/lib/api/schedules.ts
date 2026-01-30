import { apiClient } from './client';

export interface Schedule {
  id: number;
  sectionId: number;
  courseId: number;
  teacherId: number;
  roomId: number;
  timeSlotId: number;
  semesterId?: number;
  createdAt: string;
  updatedAt: string;
  section?: any;
  course?: any;
  teacher?: any;
  room?: any;
  timeSlot?: any;
  semester?: any;
}

export interface CreateScheduleData {
  sectionId: number;
  courseId: number;
  teacherId?: number;
  roomId: number;
  timeSlotId: number;
  semesterId?: number;
}

export interface Conflict {
  type: string;
  severity: string;
  description: string;
  details?: any;
}

export const schedulesApi = {
  async getAll(filters?: {
    sectionId?: number;
    teacherId?: number;
    roomId?: number;
  }): Promise<Schedule[]> {
    const params: any = { ...filters };
    return apiClient.get<Schedule[]>('/schedules', { params });
  },

  async getOne(id: number): Promise<Schedule> {
    return apiClient.get<Schedule>(`/schedules/${id}`);
  },

  async create(scheduleData: CreateScheduleData): Promise<Schedule> {
    return apiClient.post<Schedule>('/schedules', scheduleData);
  },

  async checkConflicts(data: {
    sectionId?: number;
    courseId?: number;
    roomId: number;
    timeSlotId: number;
  }): Promise<string[]> {
    return apiClient.post('/schedules/check-conflicts', data);
  },

  async getConflicts(): Promise<{
    totalConflicts: number;
    conflicts: Conflict[];
  }> {
    return apiClient.get('/schedules/conflicts');
  },

  async update(id: number, scheduleData: Partial<CreateScheduleData>): Promise<Schedule> {
    return apiClient.put<Schedule>(`/schedules/${id}`, scheduleData);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/schedules/${id}`);
  },
};
