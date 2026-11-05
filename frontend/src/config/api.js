/**
 * Dynamic API configuration for CredAlt Frontend
 * In production or cloud deployments where VITE_API_URL is configured,
 * requests route directly to the backend URL.
 * When VITE_API_URL is unset, it defaults to '' allowing local Vite proxying
 * (or relative routing) without breaking changes.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const apiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export default { API_BASE_URL, apiUrl };

