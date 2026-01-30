import { apiClient } from './client';

export interface TimeSlot {
  id: number;
  code: string;
  startTime: string;
  endTime: string;
  days: string[];
  duration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    schedules: number;
  };
}

export interface CreateTimeSlotData {
  code: string;
  startTime: string;
  endTime: string;
  days: string[];
}

export const timeSlotsApi = {
  async getAll(day?: string): Promise<TimeSlot[]> {
    const params: any = {};
    if (day) params.day = day;

    return apiClient.get<TimeSlot[]>('/timeslots', { params });
  },

  async getOne(id: number): Promise<TimeSlot> {
    return apiClient.get<TimeSlot>(`/timeslots/${id}`);
  },

  async create(timeSlotData: CreateTimeSlotData): Promise<TimeSlot> {
    return apiClient.post<TimeSlot>('/timeslots', timeSlotData);
  },

  async update(id: number, timeSlotData: Partial<CreateTimeSlotData>): Promise<TimeSlot> {
    return apiClient.put<TimeSlot>(`/timeslots/${id}`, timeSlotData);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/timeslots/${id}`);
  },
};
