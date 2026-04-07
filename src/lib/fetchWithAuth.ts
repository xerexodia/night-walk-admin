/**
 * Wraps fetch with automatic JWT refresh.
 * If a request returns 401, silently refreshes the access token and retries once.
 * If refresh also fails, clears tokens and redirects to login.
 */

const isBrowser = typeof window !== 'undefined';

async function refreshAccessToken(): Promise<string | null> {
  if (!isBrowser) return null;
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const newToken = json.data?.accessToken;
    const newRefresh = json.data?.refreshToken;
    if (newToken) localStorage.setItem('token', newToken);
    if (newRefresh) localStorage.setItem('refreshToken', newRefresh);
    return newToken ?? null;
  } catch {
    return null;
  }
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = isBrowser ? localStorage.getItem('token') : null;
  const isFormData = options.body instanceof FormData;

  const authOptions: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      // Don't set Content-Type for FormData — browser sets it with the boundary
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  let res = await fetch(url, authOptions);

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      // Retry with new token
      res = await fetch(url, {
        ...authOptions,
        headers: {
          ...authOptions.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    } else if (isBrowser) {
      // Refresh failed — clear stored tokens so ProtectedRoutes redirects to login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  }

  return res;
}
