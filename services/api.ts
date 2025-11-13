// API Configuration
const API_URL = __DEV__ 
  ? 'http://localhost:3001' // Development - change to your IP if testing on device
  : 'https://your-production-url.vercel.app'; // Production

// API Response Type
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  timestamp: string;
}

// Generic API fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// User API
export const userApi = {
  getAll: (page = 1, limit = 10) =>
    apiFetch<{ users: any[]; pagination: any }>(`/api/users?page=${page}&limit=${limit}`),
  
  getById: (id: string) =>
    apiFetch<any>(`/api/users/${id}`),
  
  create: (data: { email: string; name?: string }) =>
    apiFetch<any>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: { email?: string; name?: string }) =>
    apiFetch<any>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiFetch<any>(`/api/users/${id}`, {
      method: 'DELETE',
    }),
};

// Post API
export const postApi = {
  getAll: (page = 1, limit = 10, published?: boolean) => {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(published !== undefined && { published: published.toString() }),
    });
    return apiFetch<{ posts: any[]; pagination: any }>(`/api/posts?${query}`);
  },
  
  getById: (id: string) =>
    apiFetch<any>(`/api/posts/${id}`),
  
  create: (data: { title: string; content?: string; authorId: string; published?: boolean }) =>
    apiFetch<any>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: { title?: string; content?: string; published?: boolean }) =>
    apiFetch<any>(`/api/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiFetch<any>(`/api/posts/${id}`, {
      method: 'DELETE',
    }),
};

// Health Check
export const healthApi = {
  check: () => apiFetch<any>('/api/health'),
};

export default {
  userApi,
  postApi,
  healthApi,
};
