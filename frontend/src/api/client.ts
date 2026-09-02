// API client with auth token, localStorage caching (stale-while-revalidate), and offline fallback
const TOKEN_KEY = 'cyclone_token';
const CACHE_PREFIX = 'cyclone_cache_';

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string | null) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

function cacheKey(path: string, body?: any): string {
  return CACHE_PREFIX + path + (body ? JSON.stringify(body) : '');
}

function readCache(key: string): any {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCache(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full - ignore */
  }
}

export interface RequestOptions {
  method?: string;
  body?: any;
  cache?: boolean; // cache GET responses
  staleData?: boolean; // prefer stale cache first
}

let offlineFlag = false;
export function isOffline() {
  return offlineFlag;
}
export function setOfflineFlag(v: boolean) {
  offlineFlag = v;
}
export function onlineChangedHandler(cb: (online: boolean) => void) {
  window.addEventListener('online', () => cb(true));
  window.addEventListener('offline', () => cb(false));
}

export async function api(path: string, opts: RequestOptions = {}): Promise<any> {
  const method = opts.method || 'GET';
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (opts.body) headers['Content-Type'] = 'application/json';

  const key = cacheKey(path, opts.body);
  if (method === 'GET' && opts.cache && opts.staleData) {
    const cached = readCache(key);
    if (cached && !navigator.onLine) return cached;
  }

  const url = path.startsWith('http') ? path : path;

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = data?.error?.message || 'Something went wrong';
      const code = data?.error?.code || 'error';
      if (res.status === 401 && code !== 'unauthorized') {
        // session expired
      }
      throw new ApiError(message, res.status, code);
    }
    if (method === 'GET' && opts.cache) writeCache(key, data);
    offlineFlag = false;
    return data;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    // network failure - fall back to cache
    if (method === 'GET' && opts.cache) {
      const cached = readCache(key);
      if (cached) {
        offlineFlag = true;
        return cached;
      }
    }
    offlineFlag = true;
    throw new ApiError('You are offline. Showing saved data.', 0, 'offline');
  }
}

export const AuthApi = {
  login: (email: string, password: string) => api('/api/auth/login', { method: 'POST', body: { email, password } }),
  register: (name: string, email: string, password: string) => api('/api/auth/register', { method: 'POST', body: { name, email, password } }),
  logout: () => api('/api/auth/logout', { method: 'POST', cache: false }),
  me: () => api('/api/auth/me', { cache: true, staleData: true }),
};

export const UserApi = {
  me: () => api('/api/users/me', { cache: true, staleData: true }),
  updateProfile: (name: string) => api('/api/users/me', { method: 'PATCH', body: { name } }),
};

export const TicketApi = {
  list: () => api('/api/tickets', { cache: true, staleData: true }),
  add: (data: any) => api('/api/tickets', { method: 'POST', body: data }),
  addDemo: () => api('/api/tickets/demo', { method: 'POST', body: {} }),
  remove: (id: string) => api(`/api/tickets/${id}`, { method: 'DELETE' }),
};

export const JourneyApi = {
  get: () => api('/api/journey', { cache: true, staleData: true }),
  completeStep: (journeyId: string, stepId: string) =>
    api(`/api/journey/${journeyId}/steps/${stepId}/complete`, { method: 'POST', body: {} }),
};

export const AirportApi = {
  list: () => api('/api/airports', { cache: true, staleData: true }),
  get: (code: string) => api(`/api/airports/${code}`, { cache: true, staleData: true }),
  map: (code: string) => api(`/api/airports/${code}/map`, { cache: true, staleData: true }),
  locations: (code: string) => api(`/api/airports/locations?code=${code}`, { cache: true, staleData: true }),
  navigate: (code: string, from: string, to: string) =>
    api(`/api/airports/navigate?code=${code}&from=${from}&to=${to}`, { cache: true, staleData: true }),
};

export const FlightApi = {
  get: (id: string) => api(`/api/flights/${id}`, { cache: true, staleData: true }),
  byNumber: (num: string) => api(`/api/flights/number/${num}`, { cache: true, staleData: true }),
};

export const ItemApi = {
  list: () => api('/api/items', { cache: true, staleData: true }),
  create: (data: any) => api('/api/items', { method: 'POST', body: data }),
  get: (id: string) => api(`/api/items/${id}`, { cache: true, staleData: true }),
  update: (id: string, data: any) => api(`/api/items/${id}`, { method: 'PATCH', body: data }),
  lost: (id: string, data: any) => api(`/api/items/${id}/lost`, { method: 'POST', body: data }),
  recovered: (id: string) => api(`/api/items/${id}/recovered`, { method: 'POST', body: {} }),
  qr: (id: string) => api(`/api/items/${id}/qr`, { method: 'POST', body: {} }),
  regenerateQr: (id: string) => api(`/api/items/${id}/qr/regenerate`, { method: 'POST', body: {} }),
};

export const QrApi = {
  verify: (identifier: string) => api('/api/qr/verify', { method: 'POST', body: { identifier } }),
  reportFound: (identifier: string) => api('/api/qr/found', { method: 'POST', body: { identifier } }),
};

export const LoyaltyApi = {
  get: () => api('/api/loyalty', { cache: true, staleData: true }),
};

export const RewardsApi = {
  list: () => api('/api/rewards', { cache: true, staleData: true }),
  redeem: (id: string) => api(`/api/rewards/${id}/redeem`, { method: 'POST', body: {} }),
  history: () => api('/api/rewards/history/mine', { cache: true, staleData: true }),
};

export const ServiceApi = {
  list: () => api('/api/services', { cache: true, staleData: true }),
  use: (id: string) => api(`/api/services/${id}/use`, { method: 'POST', body: {} }),
  history: () => api('/api/services/history/mine', { cache: true, staleData: true }),
};

export const PremiumApi = {
  get: () => api('/api/premium', { cache: true, staleData: true }),
  activate: (months = 1) => api('/api/premium/activate', { method: 'POST', body: { months } }),
};

export const NotificationApi = {
  list: () => api('/api/notifications', { cache: true, staleData: true }),
  markRead: (id: string) => api(`/api/notifications/${id}/read`, { method: 'POST', body: {} }),
};