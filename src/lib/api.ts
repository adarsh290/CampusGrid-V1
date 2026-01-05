/**
 * API Configuration for CampusGrid
 * 
 * Uses relative URLs for production deployment:
 * - Development: Vite proxy will forward /api to backend
 * - Production: Nginx will proxy /api to backend
 */

// Use relative URL for production compatibility
// When visiting http://172.25.7.114, API calls go to http://172.25.7.114/api
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Helper function to make API requests
 */
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  return fetch(url, config);
}

export default {
  baseURL: API_BASE_URL,
  request: apiRequest,
};


