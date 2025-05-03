import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// API base URL from environment or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Utility function to merge class names with Tailwind CSS
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Utility function to get the full URL for a file
 * @param {string} url - The file URL or path
 * @returns {string} The full URL for the file
 */
export function getFileUrl(url) {
  // If the URL is null, undefined, or empty, return a default avatar
  if (!url) return '/placeholder.svg';
  
  // If the URL starts with http:// or https://, it's already a full URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Get the base URL without /api
  const baseUrl = API_URL.replace('/api', '');
  
  // If the URL starts with a slash, append it to the base URL
  if (url.startsWith('/')) {
    return `${baseUrl}${url}`;
  }
  
  // Otherwise, treat it as a relative path
  return `${baseUrl}/${url}`;
}
