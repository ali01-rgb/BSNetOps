export const API_URL = import.meta.env.VITE_API_URL || 'https://bsnetops-production.up.railway.app';

// 🔒 GLOBAL FETCH INTERCEPTOR
// Nyadap SEMUA pemanggilan fetch() di seluruh aplikasi, tanpa perlu ubah tiap halaman.
// Kalau ada request yang pakai token (Authorization: Bearer ...) dan hasilnya 401
// (token expired / invalid), otomatis logout & redirect ke halaman login.
export function setupAuthInterceptor() {
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const response = await originalFetch(...args);

    const [, config] = args;
    const headers = config?.headers || {};
    const hasAuthHeader =
      headers['Authorization'] || headers['authorization'] ||
      (headers instanceof Headers && (headers.get('Authorization') || headers.get('authorization')));

    if (response.status === 401 && hasAuthHeader) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userProfile');

        window.location.href = '/login';
      }
    }

    return response;
  };
}