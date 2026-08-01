// API configuration for both local and deployed environments
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

const LOCAL_API_BASE = '/api/v1'; // Proxied to localhost:3141 in development
const DEPLOYED_API_BASE = 'https://quizgenerator-backend-vafs.onrender.com/api/v1';

// Use relative path in development (proxied), full URL in production
export const API_BASE_URL = isDevelopment ? LOCAL_API_BASE : DEPLOYED_API_BASE;

// For cases where you need the full URL even in development (like redirects)
export const getFullApiUrl = (path) => {
  if (isDevelopment) {
    return `http://localhost:3141/api/v1${path}`;
  }
  return `${DEPLOYED_API_BASE}${path}`;
};