export class HttpError extends Error {
  status: number;
  statusText: string;
  bodySnippet?: string;

  constructor(message: string, init?: { status?: number; statusText?: string; bodySnippet?: string }) {
    super(message);
    this.name = 'HttpError';
    this.status = init?.status ?? 0;
    this.statusText = init?.statusText ?? '';
    this.bodySnippet = init?.bodySnippet;
  }
}

export async function fetchJson<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const contentType = res.headers.get('content-type') || '';

  // Try to read body only once
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new HttpError(
      `Beklenmeyen yanıt türü. JSON bekleniyordu fakat '${contentType || 'unknown'}' alındı`,
      { status: res.status, statusText: res.statusText, bodySnippet: text.slice(0, 200) }
    );
  }

  const data = await res.json();
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status} ${res.statusText}`;
    throw new HttpError(msg, { status: res.status, statusText: res.statusText });
  }
  return data as T;
}
