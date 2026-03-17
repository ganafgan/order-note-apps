import { API_BASE_URL } from './config';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    fullname: string;
    email: string;
  };
}

export interface ApiError {
  message: string;
}

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Terjadi kesalahan pada server.');
  }

  return data as LoginResponse;
}

export async function registerUser(
  fullname: string,
  email: string,
  password: string
): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullname, email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Terjadi kesalahan saat pendaftaran.');
  }

  return data;
}
