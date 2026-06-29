export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
export const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10);
export const API_RETRY_COUNT = parseInt(process.env.NEXT_PUBLIC_API_RETRY_COUNT || '3', 10);
