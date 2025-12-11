/**
 * Application-wide constants
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// LocalStorage Keys
export const STORAGE_KEYS = {
  FAVORITES: 'codekit_favorites',
  ADMIN_SESSION: 'admin_authenticated',
  THEME: 'codekit_theme',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Debounce delays
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  INPUT: 500,
} as const;

// Validation limits
export const VALIDATION_LIMITS = {
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 500,
  CONTENT_MAX_LENGTH: 10000,
  TAG_MAX_LENGTH: 50,
  MAX_TAGS: 10,
} as const;

// Categories
export const PROMPT_CATEGORIES = [
  'IA',
  'Desarrollo',
  'Testing',
  'Diseño',
  'Mobile',
  'Refactor',
  'Documentación',
] as const;

export const LINK_CATEGORIES = [
  'Dev',
  'Design',
  'Infrastructure',
  'Documentation',
  'VPS',
] as const;

export const GUIDE_TYPES = [
  'manual',
  'template',
  'ui',
] as const;

// Languages
export const CODE_LANGUAGES = [
  'javascript',
  'typescript',
  'tsx',
  'jsx',
  'python',
  'bash',
  'json',
  'yaml',
  'html',
  'css',
  'sql',
] as const;

