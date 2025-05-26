import axios, { type AxiosInstance } from 'axios';
import type { Session, SessionParticipant } from '../types/app';

class SessionService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_POSTGREST_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Profile': 'alc',
        'Content-Profile': 'alc'
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async createSession(sessionData: Partial<Session>): Promise<Session> {
    const response = await this.api.post('/sessions', sessionData, {
      headers: { 'Prefer': 'return=representation' }
    });
    return response.data[0];
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    const response = await this.api.get(`/sessions?or=(created_by.eq.${userId},session_participants.user_id.eq.${userId})&select=*`);
    return response.data;
  }

  async getSession(sessionId: string): Promise<Session> {
    const response = await this.api.get(`/sessions?session_id=eq.${sessionId}&select=*`);
    return response.data[0];
  }

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session> {
    const response = await this.api.patch(`/sessions?session_id=eq.${sessionId}`, updates, {
      headers: { 'Prefer': 'return=representation' }
    });
    return response.data[0];
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.api.delete(`/sessions?session_id=eq.${sessionId}`);
  }

  async getSessionParticipants(sessionId: string): Promise<SessionParticipant[]> {
    const response = await this.api.get(`/session_participants?session_id=eq.${sessionId}&select=*,users(username)`);
    return response.data;
  }

  async joinSession(sessionId: string, userId: string): Promise<void> {
    await this.api.post('/session_participants', {
      session_id: sessionId,
      user_id: userId
    });
  }
}

export const sessionService = new SessionService();
