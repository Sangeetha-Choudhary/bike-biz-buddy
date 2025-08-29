const API_BASE_URL = import.meta.env.VITE_API_URL;

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

interface StoreData {
  storename: string;
  address: string;
  googlemaplink?: string;
  city: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  pancard?: string;
  state: string;
  gstnumber?: string;
  storeemail: string;
  whatsapp: string;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  status?: 'active' | 'inactive';
  password?: string;
}

// Update the UserData interface to match what you're using
interface UserData {
  username: string;
  email: string;
  password?: string;
  role: "global_admin" | "store_admin" | "sales_executive" | "procurement_admin" | "procurement_executive";
  store?: string;
  phone?: string;
  department?: string; 
  city?: string;
}

class ApiService {
  // Add token management methods
  private token: string | null = null;

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('bikebiz_token', token);
  }

  removeToken(): void {
    this.token = null;
    localStorage.removeItem('bikebiz_token');
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.token || localStorage.getItem('bikebiz_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Auth methods
  async login(credentials: { email: string; password: string }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return this.handleResponse(response);
  }

  // Store methods
  async getStores(): Promise<any[]> {
    const url = `${API_BASE_URL}/api/stores/getstores`;
      
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getStoreById(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/stores/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createStore(storeData: StoreData): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/stores/createstore`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(storeData),
    });
    return this.handleResponse(response);
  }

  async updateStore(id: string, storeData: Partial<StoreData>): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/stores/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(storeData),
    });
    return this.handleResponse(response);
  }

  async deleteStore(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/stores/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getStoreUsers(storeId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/stores/${storeId}/users`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }
  
  async restoreStore(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/stores/${id}/restore`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // User methods
  async getUsers(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/users/getusers`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createUser(userData: UserData): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/users/createuser`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async updateUser(id: string, userData: Partial<UserData>): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async deleteUser(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async healthCheck(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
export default apiService;