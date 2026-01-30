import { apiClient } from './client';

export interface Event {
    id: number;
    title: string;
    description: string | null;
    eventType: string;
    startDate: string;
    endDate: string;
    isAllDay: boolean;
    affectsSchedule: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateEventData {
    title: string;
    description?: string;
    eventType: string;
    startDate: string;
    endDate: string;
    isAllDay?: boolean;
    affectsSchedule?: boolean;
}

export const eventsApi = {
    getAll: async () => {
        return apiClient.get<Event[]>('/events');
    },

    create: async (data: CreateEventData) => {
        return apiClient.post<Event>('/events', data);
    },

    update: async (id: number, data: Partial<CreateEventData>) => {
        return apiClient.patch<Event>(`/events/${id}`, data);
    },

    delete: async (id: number) => {
        return apiClient.delete(`/events/${id}`);
    },
};
