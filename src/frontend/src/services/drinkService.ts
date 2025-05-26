import axios, { type AxiosInstance } from 'axios';
import type { Drink, DrinkType } from '../types/app';

class DrinkService {
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

  async getDrinkTypes(): Promise<DrinkType[]> {
    const response = await this.api.get('/drink_types');
    return response.data;
  }

  async getSessionDrinks(sessionId: string): Promise<Drink[]> {
    const response = await this.api.get(`/drinks?session_id=eq.${sessionId}&select=*,drink_types(*),users(username)`);
    return response.data;
  }

  async addDrink(drinkData: Partial<Drink>): Promise<Drink> {
    const response = await this.api.post('/drinks', drinkData, {
      headers: { 'Prefer': 'return=representation' }
    });
    return response.data[0];
  }

  async updateDrink(drinkId: string, updates: Partial<Drink>): Promise<Drink> {
    const response = await this.api.patch(`/drinks?drink_id=eq.${drinkId}`, updates, {
      headers: { 'Prefer': 'return=representation' }
    });
    return response.data[0];
  }

  async deleteDrink(drinkId: string): Promise<void> {
    await this.api.delete(`/drinks?drink_id=eq.${drinkId}`);
  }

  async getUserDrinkStats(userId: string, sessionId: string): Promise<any> {
    const response = await this.api.get(`/drinks?user_id=eq.${userId}&session_id=eq.${sessionId}&select=amount_ml,drink_types(alcohol_percentage)`);
    return response.data;
  }
}

export const drinkService = new DrinkService();
