import { config } from '@/env';
import { Polygon, CreatePolygonRequest, ApiResponse, ApiError } from '@/types';

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = config.API_URL;
    this.timeout = config.API_TIMEOUT;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      const data: ApiResponse<T> = await response.json();

      if (!data.success) {
        throw new ApiError(data.error || 'API request failed', 400);
      }

      return data.data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('API Request failed:', { url, error });

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError(
            'Request timeout - API took too long to respond',
            408
          );
        }
        if (error.message.includes('Failed to fetch')) {
          throw new ApiError(
            'Cannot connect to server - please check if the backend is running',
            503
          );
        }
        throw new ApiError(error.message, 500);
      }

      throw new ApiError('Unknown error occurred', 500);
    }
  }

  async getPolygons(): Promise<Polygon[]> {
    return this.request<Polygon[]>('/api/polygons');
  }

  async createPolygon(polygon: CreatePolygonRequest): Promise<Polygon> {
    return this.request<Polygon>('/api/polygons', {
      method: 'POST',
      body: JSON.stringify(polygon),
    });
  }

  async deletePolygon(id: number): Promise<{ id: number }> {
    return this.request<{ id: number }>(`/api/polygons/${id}`, {
      method: 'DELETE',
    });
  }

  async getPolygonById(id: number): Promise<Polygon> {
    return this.request<Polygon>(`/api/polygons/${id}`);
  }

  // Health check
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
  }> {
    return this.request<{
      status: string;
      timestamp: string;
      uptime: number;
    }>('/health');
  }
}

export const apiService = new ApiService();
