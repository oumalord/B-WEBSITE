type ApiResult = { data: any };

const SESSION_KEY = 'braidy-admin-token';

async function request(method: string, path: string, body?: unknown): Promise<ApiResult> {
  const token = localStorage.getItem(SESSION_KEY);
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) throw new Error('The local API returned an invalid response');
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data?.message ?? 'API request failed'), { data, status: response.status });
  return { data };
}

async function authenticate(path: string, email: string, password: string) {
  const { data } = await request('POST', path, { email, password });
  localStorage.setItem(SESSION_KEY, data.token);
}

export const api = {
  get: (path: string) => request('GET', path),
  post: (path: string, body?: unknown) => request('POST', path, body),
  put: (path: string, body?: unknown) => request('PUT', path, body),
  delete: (path: string) => request('DELETE', path),
};

export const auth = {
  isSignedIn: () => !!localStorage.getItem(SESSION_KEY),
  signIn: (email: string, password: string) => authenticate('/api/auth/signin', email, password),
  setup: (email: string, password: string) => authenticate('/api/auth/setup', email, password),
  signOut: async () => {
    try {
      await request('POST', '/api/auth/signout');
    } catch {
      // Clear the local token even if the API is unavailable.
    }
    localStorage.removeItem(SESSION_KEY);
  },
};