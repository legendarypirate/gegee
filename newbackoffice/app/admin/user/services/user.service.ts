import { User, CreateUserPayload } from '../types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function apiGet<T = any>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_URL}/api${endpoint}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).message || `Request failed: ${res.status}`);
  return data as T;
}

async function apiPost<T = any>(endpoint: string, body?: any): Promise<T> {
  const res = await fetch(`${API_URL}/api${endpoint}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).message || `Request failed: ${res.status}`);
  return data as T;
}

async function apiPut<T = any>(endpoint: string, body?: any): Promise<T> {
  const res = await fetch(`${API_URL}/api${endpoint}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).message || `Request failed: ${res.status}`);
  return data as T;
}

async function apiDelete<T = any>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_URL}/api${endpoint}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).message || `Request failed: ${res.status}`);
  return data as T;
}

// Fetch users (plain email/phone from backend - no encryption)
export const fetchUsers = async (): Promise<User[]> => {
  const result = await apiGet<{ success: boolean; data: User[]; message?: string }>('/user');
  
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to fetch users');
};

// Create user
export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const result = await apiPost<{ success: boolean; data: User; message?: string }>('/user', payload);
  
  if (result.success) {
    return result.data;
  }
  
  throw new Error(result.message || 'Failed to create user');
};

// Update user
export const updateUser = async (userId: number, payload: Partial<CreateUserPayload>): Promise<User> => {
  const result = await apiPut<{ success: boolean; data: User; message?: string }>(`/user/${userId}`, payload);
  
  if (result.success) {
    return result.data;
  }
  
  throw new Error(result.message || 'Failed to update user');
};

// Delete user
export const deleteUser = async (userId: number): Promise<void> => {
  const result = await apiDelete<{ success: boolean; message?: string }>(`/user/${userId}`);
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to delete user');
  }
};
