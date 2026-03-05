const API_URL = import.meta.env.VITE_API_URL || '/api';

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  post: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
};

// ------ Shared types ------

export interface BillItem {
  id?: string;
  _id?: string;
  item_name: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Bill {
  id?: string;
  _id?: string;
  bill_number: string;
  bill_type: string;
  date: string;
  time: string;
  customer_name: string | null;
  total_amount: number;
  created_by?: string;
  created_at?: string;
  bill_items: BillItem[];
}
