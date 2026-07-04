export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  wsUrl: import.meta.env.VITE_WS_URL || 'http://localhost:5000',
} as const;
