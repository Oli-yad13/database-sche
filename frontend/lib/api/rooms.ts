import { apiClient } from './client';

export interface Room {
  id: number;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  type: string;
  hasProjector: boolean;
  hasComputers: boolean;
  computerCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    schedules: number;
  };
}

export interface CreateRoomData {
  name: string;
  building: string;
  floor: number;
  capacity: number;
  type: string;
  hasProjector?: boolean;
  hasComputers?: boolean;
  computerCount?: number;
}

export const roomsApi = {
  async getAll(building?: string, type?: string): Promise<Room[]> {
    const params: any = {};
    if (building) params.building = building;
    if (type) params.type = type;

    return apiClient.get<Room[]>('/rooms', { params });
  },

  async getOne(id: number): Promise<Room> {
    return apiClient.get<Room>(`/rooms/${id}`);
  },

  async create(roomData: CreateRoomData): Promise<Room> {
    return apiClient.post<Room>('/rooms', roomData);
  },

  async update(id: number, roomData: Partial<CreateRoomData>): Promise<Room> {
    return apiClient.put<Room>(`/rooms/${id}`, roomData);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/rooms/${id}`);
  },
};
