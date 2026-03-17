const API_BASE = 'http://localhost:5000/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface ClothesTypeItem {
  id: string;
  name: string;
  sizes: string[];
  basePrice: number;
  sellingPrice: number;
  createdAt: string;
}

export async function createClothesType(data: {
  name: string;
  sizes: string[];
  basePrice: number;
  sellingPrice: number;
}): Promise<{ message: string; clothesType: ClothesTypeItem }> {
  const res = await fetch(`${API_BASE}/clothes-types`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal menyimpan jenis pakaian.');
  return json;
}

export async function getClothesTypes(): Promise<ClothesTypeItem[]> {
  const res = await fetch(`${API_BASE}/clothes-types`, { headers: getHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal mengambil data jenis pakaian.');
  return json;
}

export async function updateClothesType(id: string, data: Partial<ClothesTypeItem>): Promise<ClothesTypeItem> {
  const res = await fetch(`${API_BASE}/clothes-types/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memperbarui jenis pakaian.');
  return json.clothesType;
}

export async function deleteClothesType(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/clothes-types/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal menghapus jenis pakaian.');
}
