// Centralized API configuration for LuxeHome
// Uses VITE_API_URL if defined, otherwise falls back to empty string for relative paths in unified production or localhost in dev
const envUrl = import.meta.env.VITE_API_URL;

export const API_BASE_URL = envUrl !== undefined 
  ? envUrl 
  : (import.meta.env.DEV ? 'http://localhost:5000' : '');

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
