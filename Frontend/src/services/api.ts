const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  _id: string;
  username: string;
  email: string;
  role: string;
  redirectUrl: string;
  token: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: string;
  store?: string;
}

export interface CreateUserResponse {
  _id: string;
  username: string;
  email: string;
  role: string;
  store?: string;
  permissions?: string[];
  token: string;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('bikebiz_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Health check endpoint
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/`);
      if (response.ok) {
        return { status: 'ok', message: 'API is running' };
      } else {
        return { status: 'error', message: 'API is not responding' };
      }
    } catch (error) {
      return { status: 'error', message: 'Cannot connect to API' };
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    return this.request<CreateUserResponse>('/users/createUser', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Helper method to get auth token
  getToken(): string | null {
    return localStorage.getItem('bikebiz_token');
  }

  // Helper method to set auth token
  setToken(token: string): void {
    localStorage.setItem('bikebiz_token', token);
  }

  // Helper method to remove auth token
  removeToken(): void {
    localStorage.removeItem('bikebiz_token');
  }

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const apiService = new ApiService();