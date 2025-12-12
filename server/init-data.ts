import { getStorage } from "./storage/index";
import { logger } from "./utils/logger";
import { log } from "./index";
import { USER_IDS, CONTENT_STATUS } from "@shared/constants";

// Import static data
const staticPrompts = [
  {
    title: 'Experto en React Performance',
    category: 'Desarrollo',
    content: 'Actúa como un experto en React Performance. Analiza el siguiente componente y sugiere optimizaciones usando useMemo, useCallback o React.memo donde sea apropiado. Explica por qué cada cambio mejora el rendimiento.',
    tags: ['react', 'performance', 'optimization']
  },
  {
    title: 'Generador de Tests Unitarios con Vitest',
    category: 'Testing',
    content: 'Genera una suite de pruebas unitarias completa para la siguiente función/componente usando Vitest y React Testing Library. Incluye casos de éxito, casos de borde y manejo de errores.',
    tags: ['testing', 'vitest', 'react']
  },
  {
    title: 'Diseñador de UI/UX Moderno',
    category: 'Diseño',
    content: 'Actúa como un diseñador UI/UX senior. Critica el diseño actual de esta interfaz y propón 3 mejoras visuales basadas en principios de diseño moderno (espaciado, tipografía, jerarquía visual).',
    tags: ['ui', 'ux', 'design']
  },
  {
    title: 'Refactorización a Clean Code',
    category: 'Refactor',
    content: 'Refactoriza el siguiente código siguiendo los principios SOLID y Clean Code. Extrae funciones auxiliares, mejora el nombrado de variables y reduce la complejidad ciclomática.',
    tags: ['refactor', 'clean-code', 'solid']
  },
  {
    title: 'Generador de Documentación Técnica',
    category: 'Documentación',
    content: 'Escribe documentación técnica detallada para el siguiente módulo. Incluye una descripción general, ejemplos de uso, descripción de props/parámetros y posibles valores de retorno.',
    tags: ['docs', 'markdown']
  },
  {
    title: 'Experto en Tailwind CSS',
    category: 'Diseño',
    content: 'Convierte el siguiente CSS personalizado a clases utilitarias de Tailwind CSS. Mantén el diseño visualmente idéntico pero optimiza el uso de clases.',
    tags: ['css', 'tailwind']
  },
  {
    title: 'Arquitecto de Sistemas Mobile',
    category: 'Mobile',
    content: 'Diseña la arquitectura de carpetas y navegación para una app React Native que debe escalar a 50+ pantallas. Sugiere librerías para manejo de estado y navegación.',
    tags: ['mobile', 'react-native', 'architecture']
  }
];

const staticSnippets = [
  {
    title: 'React Functional Component',
    language: 'tsx',
    description: 'Basic structure for a TypeScript React component',
    tags: ['react', 'component'],
    code: `import React from 'react';

interface Props {
  title: string;
  children?: React.ReactNode;
}

export const MyComponent: React.FC<Props> = ({ title, children }) => {
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <div>{children}</div>
    </div>
  );
};`
  },
  {
    title: 'Custom Hook: useLocalStorage',
    language: 'typescript',
    description: 'Hook to persist state in localStorage',
    tags: ['react', 'hook', 'storage'],
    code: `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}`
  },
  {
    title: 'Tailwind Card',
    language: 'tsx',
    description: 'A responsive card component with hover effects',
    tags: ['tailwind', 'ui'],
    code: `<div className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
  <div className="p-6">
    <h3 className="text-lg font-semibold leading-none tracking-tight">Card Title</h3>
    <p className="mt-2 text-sm text-muted-foreground">Card description goes here.</p>
  </div>
  <div className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
</div>`
  },
  {
    title: 'Vite Config Alias',
    language: 'javascript',
    description: 'Common path aliases for Vite projects',
    tags: ['vite', 'config'],
    code: `import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
  },
});`
  },
  {
    title: 'Custom Hook: useDebounce',
    language: 'typescript',
    description: 'Hook to debounce a value',
    tags: ['react', 'hook', 'performance'],
    code: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}`
  },
  {
    title: 'Custom Hook: useFetch',
    language: 'typescript',
    description: 'Hook for fetching data with loading and error states',
    tags: ['react', 'hook', 'api'],
    code: `import { useState, useEffect } from 'react';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData };
}`
  },
  {
    title: 'Custom Hook: useClickOutside',
    language: 'typescript',
    description: 'Hook to detect clicks outside an element',
    tags: ['react', 'hook', 'ui'],
    code: `import { useEffect, useRef } from 'react';

export function useClickOutside<T extends HTMLElement>(
  handler: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handler]);

  return ref;
}`
  },
  {
    title: 'Custom Hook: useMediaQuery',
    language: 'typescript',
    description: 'Hook to detect media query matches',
    tags: ['react', 'hook', 'responsive'],
    code: `import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}`
  },
  {
    title: 'Custom Hook: useToggle',
    language: 'typescript',
    description: 'Simple hook to toggle boolean state',
    tags: ['react', 'hook', 'state'],
    code: `import { useState, useCallback } from 'react';

export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, { toggle, setTrue, setFalse }] as const;
}`
  },
  {
    title: 'Custom Hook: usePrevious',
    language: 'typescript',
    description: 'Hook to get previous value',
    tags: ['react', 'hook', 'state'],
    code: `import { useRef, useEffect } from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}`
  },
  {
    title: 'Async/Await Error Handler',
    language: 'typescript',
    description: 'Utility function to handle async errors safely',
    tags: ['javascript', 'async', 'error-handling'],
    code: `export async function safeAsync<T>(
  promise: Promise<T>
): Promise<[Error | null, T | null]> {
  try {
    const data = await promise;
    return [null, data];
  } catch (error) {
    return [error as Error, null];
  }
}

// Usage:
// const [error, data] = await safeAsync(fetch('/api/data'));
// if (error) {
//   console.error('Error:', error);
//   return;
// }
// console.log('Data:', data);`
  },
  {
    title: 'Debounce Function',
    language: 'typescript',
    description: 'Debounce utility function',
    tags: ['javascript', 'performance', 'utility'],
    code: `export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Usage:
// const debouncedSearch = debounce((query: string) => {
//   console.log('Searching for:', query);
// }, 300);`
  },
  {
    title: 'Throttle Function',
    language: 'typescript',
    description: 'Throttle utility function',
    tags: ['javascript', 'performance', 'utility'],
    code: `export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Usage:
// const throttledScroll = throttle(() => {
//   console.log('Scrolling...');
// }, 100);`
  },
  {
    title: 'Format Date Utility',
    language: 'typescript',
    description: 'Format date to readable string',
    tags: ['javascript', 'date', 'utility'],
    code: `export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  return new Intl.DateTimeFormat('es-ES', options).format(new Date(date));
}

// Usage:
// formatDate(new Date()); // "15 de enero de 2024"
// formatDate(new Date(), { dateStyle: 'short' }); // "15/01/2024"
`,
  },
  {
    title: 'Format Currency Utility',
    language: 'typescript',
    description: 'Format number as currency',
    tags: ['javascript', 'currency', 'utility'],
    code: `export function formatCurrency(
  amount: number,
  currency: string = 'EUR',
  locale: string = 'es-ES'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

// Usage:
// formatCurrency(1234.56); // "1.234,56 €"
// formatCurrency(1234.56, 'USD', 'en-US'); // "$1,234.56"
`,
  },
  {
    title: 'Deep Clone Object',
    language: 'typescript',
    description: 'Deep clone an object',
    tags: ['javascript', 'object', 'utility'],
    code: `export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

// Usage:
// const cloned = deepClone(originalObject);
`,
  },
  {
    title: 'Sleep/Delay Utility',
    language: 'typescript',
    description: 'Create a delay/sleep function',
    tags: ['javascript', 'async', 'utility'],
    code: `export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Usage:
// await sleep(1000); // Wait 1 second
// console.log('After 1 second');
`,
  },
  {
    title: 'Generate Random ID',
    language: 'typescript',
    description: 'Generate random unique ID',
    tags: ['javascript', 'utility', 'id'],
    code: `export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return prefix ? \`\${prefix}-\${timestamp}-\${randomStr}\` : \`\${timestamp}-\${randomStr}\`;
}

// Usage:
// generateId(); // "lxyz123-abc456"
// generateId('user'); // "user-lxyz123-abc456"
`,
  },
  {
    title: 'Validate Email',
    language: 'typescript',
    description: 'Email validation function',
    tags: ['javascript', 'validation', 'email'],
    code: `export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}

// Usage:
// isValidEmail('user@example.com'); // true
// isValidEmail('invalid-email'); // false
`,
  },
  {
    title: 'Validate URL',
    language: 'typescript',
    description: 'URL validation function',
    tags: ['javascript', 'validation', 'url'],
    code: `export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Usage:
// isValidUrl('https://example.com'); // true
// isValidUrl('not-a-url'); // false
`,
  },
  {
    title: 'Copy to Clipboard',
    language: 'typescript',
    description: 'Copy text to clipboard utility',
    tags: ['javascript', 'clipboard', 'utility'],
    code: `export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

// Usage:
// await copyToClipboard('Text to copy');
`,
  },
  {
    title: 'Download File Utility',
    language: 'typescript',
    description: 'Download file from blob or URL',
    tags: ['javascript', 'file', 'utility'],
    code: `export function downloadFile(
  data: Blob | string,
  filename: string,
  mimeType?: string
): void {
  const blob = typeof data === 'string' 
    ? new Blob([data], { type: mimeType || 'text/plain' })
    : data;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Usage:
// downloadFile('Hello World', 'hello.txt', 'text/plain');
// downloadFile(blob, 'image.png', 'image/png');
`,
  },
  {
    title: 'Group Array by Key',
    language: 'typescript',
    description: 'Group array items by a key',
    tags: ['javascript', 'array', 'utility'],
    code: `export function groupBy<T>(
  array: T[],
  key: keyof T | ((item: T) => string)
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' 
      ? key(item) 
      : String(item[key]);
    
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

// Usage:
// const grouped = groupBy(users, 'role');
// const grouped = groupBy(users, user => user.role);
`,
  },
  {
    title: 'Sort Array by Key',
    language: 'typescript',
    description: 'Sort array by object key',
    tags: ['javascript', 'array', 'utility'],
    code: `export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// Usage:
// const sorted = sortBy(users, 'name', 'asc');
// const sortedDesc = sortBy(users, 'createdAt', 'desc');
`,
  },
  {
    title: 'Chunk Array',
    language: 'typescript',
    description: 'Split array into chunks of specified size',
    tags: ['javascript', 'array', 'utility'],
    code: `export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Usage:
// chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
`,
  },
  {
    title: 'Remove Duplicates from Array',
    language: 'typescript',
    description: 'Remove duplicate items from array',
    tags: ['javascript', 'array', 'utility'],
    code: `export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

// For objects, use with key:
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

// Usage:
// unique([1, 2, 2, 3]); // [1, 2, 3]
// uniqueBy(users, 'id'); // Remove duplicates by id
`,
  },
  {
    title: 'API Client with Axios',
    language: 'typescript',
    description: 'Configured axios instance with interceptors',
    tags: ['typescript', 'api', 'axios'],
    code: `import axios, { AxiosInstance, AxiosError } from 'axios';

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
`,
  },
  {
    title: 'React Query Hook Template',
    language: 'typescript',
    description: 'Template for React Query hooks',
    tags: ['react', 'react-query', 'api'],
    code: `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

// Query hook
export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const { data } = await apiClient.get('/items');
      return data;
    },
  });
}

// Mutation hook
export function useCreateItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newItem: any) => {
      const { data } = await apiClient.post('/items', newItem);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}
`,
  },
  {
    title: 'Form Validation with Zod',
    language: 'typescript',
    description: 'Form schema and validation with Zod',
    tags: ['typescript', 'validation', 'zod'],
    code: `import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'Must be at least 18 years old'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type UserFormData = z.infer<typeof userSchema>;

// Usage with React Hook Form:
// const { register, handleSubmit, formState: { errors } } = useForm<UserFormData>({
//   resolver: zodResolver(userSchema),
// });
`,
  },
  {
    title: 'Error Boundary Component',
    language: 'tsx',
    description: 'React Error Boundary component',
    tags: ['react', 'error-handling', 'component'],
    code: `import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-500 rounded-lg">
          <h2 className="text-lg font-semibold text-red-600">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}`
  },
  {
    title: 'Loading Spinner Component',
    language: 'tsx',
    description: 'Reusable loading spinner',
    tags: ['react', 'component', 'ui'],
    code: `import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={\`flex items-center justify-center \${className}\`}>
      <Loader2 className={\`animate-spin text-primary \${sizeClasses[size]}\`} />
    </div>
  );
}`
  },
  {
    title: 'Toast Notification Hook',
    language: 'typescript',
    description: 'Simple toast notification system',
    tags: ['react', 'hook', 'ui'],
    code: `import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}`
  },
  {
    title: 'Modal Component',
    language: 'tsx',
    description: 'Reusable modal component',
    tags: ['react', 'component', 'ui'],
    code: `import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        className="bg-card rounded-lg shadow-lg max-w-md w-full mx-4 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}`
  },
  {
    title: 'Pagination Hook',
    language: 'typescript',
    description: 'Hook for pagination logic',
    tags: ['react', 'hook', 'pagination'],
    code: `import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
  items: T[];
  itemsPerPage: number;
}

export function usePagination<T>({ items, itemsPerPage }: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}`
  },
  {
    title: 'Local Storage Hook with Expiry',
    language: 'typescript',
    description: 'Hook for localStorage with expiration',
    tags: ['react', 'hook', 'storage'],
    code: `import { useState, useEffect } from 'react';

interface StoredValue<T> {
  value: T;
  expiry: number;
}

export function useLocalStorageWithExpiry<T>(
  key: string,
  initialValue: T,
  expiryInMinutes: number = 60
) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      const parsed: StoredValue<T> = JSON.parse(item);
      const now = new Date().getTime();

      if (now > parsed.expiry) {
        window.localStorage.removeItem(key);
        return initialValue;
      }

      return parsed.value;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      const expiry = new Date().getTime() + expiryInMinutes * 60 * 1000;
      const item: StoredValue<T> = { value, expiry };
      window.localStorage.setItem(key, JSON.stringify(item));
      setStoredValue(value);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
}`
  },
  {
    title: 'Intersection Observer Hook',
    language: 'typescript',
    description: 'Hook for Intersection Observer API',
    tags: ['react', 'hook', 'observer'],
    code: `import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0%',
}: UseIntersectionObserverProps = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, hasIntersected]);

  return { elementRef, isIntersecting, hasIntersected };
}`
  },
  {
    title: 'React Context Provider Template',
    language: 'tsx',
    description: 'Template for React Context with Provider',
    tags: ['react', 'context', 'state'],
    code: `import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <AppContext.Provider value={{ user, setUser, theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}`
  },
  {
    title: 'Express Route Handler Template',
    language: 'typescript',
    description: 'Template for Express route handlers',
    tags: ['nodejs', 'express', 'api'],
    code: `import { Request, Response, NextFunction } from 'express';

export async function getItems(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const items = await db.getItems();
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
}

export async function createItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { title, description } = req.body;
    const item = await db.createItem({ title, description });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function updateItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const item = await db.updateItem(id, { title, description });
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function deleteItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    await db.deleteItem(id);
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    next(error);
  }
}`
  },
  {
    title: 'Express Error Handler Middleware',
    language: 'typescript',
    description: 'Centralized error handling middleware',
    tags: ['nodejs', 'express', 'error-handling'],
    code: `import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error('Error:', {
    statusCode,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const error: AppError = new Error(\`Route \${req.originalUrl} not found\`);
  error.statusCode = 404;
  error.isOperational = true;
  next(error);
}`
  },
  {
    title: 'JWT Authentication Middleware',
    language: 'typescript',
    description: 'JWT authentication middleware for Express',
    tags: ['nodejs', 'express', 'auth', 'jwt'],
    code: `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET!,
    (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }

      req.user = decoded as AuthRequest['user'];
      next();
    }
  );
}

// Usage:
// router.get('/protected', authenticateToken, (req, res) => {
//   res.json({ user: req.user });
// });
`,
  },
  {
    title: 'Drizzle ORM Query Examples',
    language: 'typescript',
    description: 'Common Drizzle ORM query patterns',
    tags: ['typescript', 'drizzle', 'database'],
    code: `import { eq, and, or, like, desc, asc } from 'drizzle-orm';
import { db } from './db';
import { users, posts } from './schema';

// Select all
const allUsers = await db.select().from(users);

// Select with where
const user = await db.select().from(users).where(eq(users.id, userId));

// Select with multiple conditions
const activeUsers = await db
  .select()
  .from(users)
  .where(and(eq(users.active, true), eq(users.verified, true)));

// Select with OR
const usersByName = await db
  .select()
  .from(users)
  .where(or(
    like(users.name, '%John%'),
    like(users.email, '%john%')
  ));

// Insert
const newUser = await db.insert(users).values({
  name: 'John Doe',
  email: 'john@example.com',
}).returning();

// Update
const updated = await db
  .update(users)
  .set({ name: 'Jane Doe' })
  .where(eq(users.id, userId))
  .returning();

// Delete
await db.delete(users).where(eq(users.id, userId));

// Join
const userPosts = await db
  .select()
  .from(users)
  .innerJoin(posts, eq(users.id, posts.userId))
  .where(eq(users.id, userId));
`,
  },
  {
    title: 'Environment Variables Type Safety',
    language: 'typescript',
    description: 'Type-safe environment variables',
    tags: ['typescript', 'env', 'config'],
    code: `// env.ts
interface Env {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  API_URL: string;
}

function getEnv(): Env {
  const env = {
    NODE_ENV: process.env.NODE_ENV as Env['NODE_ENV'],
    PORT: parseInt(process.env.PORT || '3000', 10),
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    API_URL: process.env.API_URL || 'http://localhost:3000',
  };

  // Validate required env vars
  const required: (keyof Env)[] = ['DATABASE_URL', 'JWT_SECRET'];
  for (const key of required) {
    if (!env[key]) {
      throw new Error(\`Missing required environment variable: \${key}\`);
    }
  }

  return env;
}

export const env = getEnv();
`,
  }
];

const staticLinks = [
  // AI Coding Tools
  {
    title: 'Replit',
    url: 'https://replit.com',
    icon: 'Terminal',
    category: 'Dev',
    description: 'Collaborative browser-based IDE'
  },
  {
    title: 'Cursor',
    url: 'https://cursor.sh',
    icon: 'Code2',
    category: 'Dev',
    description: 'The AI-first Code Editor'
  },
  {
    title: 'GitHub Copilot',
    url: 'https://github.com/features/copilot',
    icon: 'Code2',
    category: 'Dev',
    description: 'AI pair programmer'
  },
  {
    title: 'GitHub Copilot Chat',
    url: 'https://github.com/features/copilot/copilot-chat',
    icon: 'Code2',
    category: 'Dev',
    description: 'AI coding assistant chat'
  },
  {
    title: 'v0.dev',
    url: 'https://v0.dev',
    icon: 'Palette',
    category: 'Design',
    description: 'AI-powered UI component generator'
  },
  {
    title: 'Lovable',
    url: 'https://lovable.dev',
    icon: 'Palette',
    category: 'Design',
    description: 'Design to Code AI'
  },
  {
    title: 'Claude',
    url: 'https://claude.ai',
    icon: 'Code2',
    category: 'Dev',
    description: 'AI assistant by Anthropic'
  },
  {
    title: 'ChatGPT',
    url: 'https://chat.openai.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'AI chatbot by OpenAI'
  },
  {
    title: 'OpenAI API',
    url: 'https://platform.openai.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'OpenAI API platform and keys'
  },
  {
    title: 'Anthropic API',
    url: 'https://console.anthropic.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Claude API keys and console'
  },
  {
    title: 'Google Gemini',
    url: 'https://gemini.google.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Google AI assistant'
  },
  {
    title: 'Google AI Studio',
    url: 'https://makersuite.google.com/app/apikey',
    icon: 'Code2',
    category: 'Dev',
    description: 'Get Gemini API keys'
  },
  {
    title: 'Perplexity',
    url: 'https://www.perplexity.ai',
    icon: 'Code2',
    category: 'Dev',
    description: 'AI-powered search engine'
  },
  {
    title: 'Codeium',
    url: 'https://codeium.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Free AI code completion'
  },
  {
    title: 'Tabnine',
    url: 'https://www.tabnine.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'AI code completion tool'
  },
  {
    title: 'Continue',
    url: 'https://continue.dev',
    icon: 'Code2',
    category: 'Dev',
    description: 'Open-source AI coding assistant'
  },
  {
    title: 'Aider',
    url: 'https://aider.chat',
    icon: 'Code2',
    category: 'Dev',
    description: 'AI pair programmer CLI'
  },
  {
    title: 'Bolt.new',
    url: 'https://bolt.new',
    icon: 'Code2',
    category: 'Dev',
    description: 'AI-powered code editor'
  },
  {
    title: 'Replit Agent',
    url: 'https://replit.com/site/ghostwriter',
    icon: 'Terminal',
    category: 'Dev',
    description: 'AI coding assistant in Replit'
  },
  
  // Code Hosting & Collaboration
  {
    title: 'GitHub',
    url: 'https://github.com',
    icon: 'Github',
    category: 'Dev',
    description: 'Code hosting and collaboration'
  },
  {
    title: 'GitLab',
    url: 'https://gitlab.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Complete DevOps platform'
  },
  {
    title: 'Bitbucket',
    url: 'https://bitbucket.org',
    icon: 'Code2',
    category: 'Dev',
    description: 'Git code management'
  },
  
  // Deployment & Infrastructure
  {
    title: 'Vercel',
    url: 'https://vercel.com',
    icon: 'Globe',
    category: 'Infrastructure',
    description: 'Develop. Preview. Ship.'
  },
  {
    title: 'Netlify',
    url: 'https://netlify.com',
    icon: 'Globe',
    category: 'Infrastructure',
    description: 'Build and deploy modern web projects'
  },
  {
    title: 'Railway',
    url: 'https://railway.app',
    icon: 'Cloud',
    category: 'Infrastructure',
    description: 'Deploy apps with ease'
  },
  {
    title: 'Render',
    url: 'https://render.com',
    icon: 'Cloud',
    category: 'Infrastructure',
    description: 'Cloud platform for apps'
  },
  {
    title: 'Fly.io',
    url: 'https://fly.io',
    icon: 'Cloud',
    category: 'Infrastructure',
    description: 'Run your full stack apps'
  },
  {
    title: 'Supabase',
    url: 'https://supabase.com',
    icon: 'Database',
    category: 'Infrastructure',
    description: 'Open Source Firebase Alternative'
  },
  {
    title: 'Supabase Dashboard',
    url: 'https://app.supabase.com',
    icon: 'Database',
    category: 'Infrastructure',
    description: 'Panel de control de Supabase'
  },
  {
    title: 'Supabase SQL Editor',
    url: 'https://app.supabase.com/project/_/sql',
    icon: 'Database',
    category: 'Infrastructure',
    description: 'Editor SQL de Supabase'
  },
  {
    title: 'Supabase Table Editor',
    url: 'https://app.supabase.com/project/_/editor',
    icon: 'Database',
    category: 'Infrastructure',
    description: 'Editor visual de tablas'
  },
  {
    title: 'Supabase Auth',
    url: 'https://supabase.com/docs/guides/auth',
    icon: 'Database',
    category: 'Documentation',
    description: 'Documentación de autenticación'
  },
  {
    title: 'Supabase Storage',
    url: 'https://supabase.com/docs/guides/storage',
    icon: 'Database',
    category: 'Documentation',
    description: 'Documentación de almacenamiento'
  },
  {
    title: 'Supabase Database',
    url: 'https://supabase.com/docs/guides/database',
    icon: 'Database',
    category: 'Documentation',
    description: 'Guía de creación de bases de datos'
  },
  {
    title: 'Supabase Migrations',
    url: 'https://supabase.com/docs/guides/cli/local-development',
    icon: 'Database',
    category: 'Documentation',
    description: 'Migraciones de base de datos'
  },
  {
    title: 'Supabase Realtime',
    url: 'https://supabase.com/docs/guides/realtime',
    icon: 'Database',
    category: 'Documentation',
    description: 'Suscripciones en tiempo real'
  },
  {
    title: 'n8n',
    url: 'https://n8n.io',
    icon: 'Code2',
    category: 'Dev',
    description: 'Workflow automation platform'
  },
  {
    title: 'n8n Cloud',
    url: 'https://app.n8n.cloud',
    icon: 'Cloud',
    category: 'Infrastructure',
    description: 'n8n cloud hosting'
  },
  {
    title: 'n8n Self-hosted',
    url: 'https://docs.n8n.io/hosting/installation/',
    icon: 'Code2',
    category: 'Documentation',
    description: 'Instalación self-hosted de n8n'
  },
  {
    title: 'Airtable',
    url: 'https://airtable.com',
    icon: 'Database',
    category: 'Infrastructure',
    description: 'Database and collaboration platform'
  },
  {
    title: 'Airtable API',
    url: 'https://airtable.com/api',
    icon: 'Code2',
    category: 'Dev',
    description: 'Airtable API documentation'
  },
  {
    title: 'Airtable Base Creator',
    url: 'https://airtable.com/create',
    icon: 'Database',
    category: 'Infrastructure',
    description: 'Crear nueva base de datos'
  },
  
  // VPS & Server Platforms
  {
    title: 'DigitalOcean',
    url: 'https://www.digitalocean.com',
    icon: 'Cloud',
    category: 'VPS',
    description: 'Cloud infrastructure and VPS'
  },
  {
    title: 'Linode',
    url: 'https://www.linode.com',
    icon: 'Cloud',
    category: 'VPS',
    description: 'Cloud hosting and VPS'
  },
  {
    title: 'Vultr',
    url: 'https://www.vultr.com',
    icon: 'Cloud',
    category: 'VPS',
    description: 'High performance cloud VPS'
  },
  {
    title: 'Hetzner',
    url: 'https://www.hetzner.com',
    icon: 'Cloud',
    category: 'VPS',
    description: 'European cloud and VPS provider'
  },
  {
    title: 'AWS EC2',
    url: 'https://aws.amazon.com/ec2',
    icon: 'Cloud',
    category: 'VPS',
    description: 'Amazon Elastic Compute Cloud'
  },
  {
    title: 'Google Cloud Compute',
    url: 'https://cloud.google.com/compute',
    icon: 'Cloud',
    category: 'VPS',
    description: 'Google Cloud VMs'
  },
  {
    title: 'Azure Virtual Machines',
    url: 'https://azure.microsoft.com/services/virtual-machines',
    icon: 'Cloud',
    category: 'VPS',
    description: 'Microsoft Azure VMs'
  },
  {
    title: 'Contabo',
    url: 'https://www.contabo.com',
    icon: 'Cloud',
    category: 'VPS',
    description: 'Affordable VPS hosting'
  },
  {
    title: 'Scaleway',
    url: 'https://www.scaleway.com',
    icon: 'Cloud',
    category: 'VPS',
    description: 'European cloud provider'
  },
  {
    title: 'Firebase',
    url: 'https://firebase.google.com',
    icon: 'Cloud',
    category: 'Infrastructure',
    description: 'Google application development platform'
  },
  {
    title: 'MongoDB Atlas',
    url: 'https://www.mongodb.com/cloud/atlas',
    icon: 'Database',
    category: 'Infrastructure',
    description: 'Cloud database service'
  },
  {
    title: 'PlanetScale',
    url: 'https://planetscale.com',
    icon: 'Database',
    category: 'Infrastructure',
    description: 'MySQL-compatible serverless database'
  },
  {
    title: 'NocoDB',
    url: 'https://www.nocodb.com',
    icon: 'Database',
    category: 'Infrastructure',
    description: 'Open source Airtable alternative'
  },
  {
    title: 'NocoDB Docs',
    url: 'https://docs.nocodb.com',
    icon: 'BookOpen',
    category: 'Documentation',
    description: 'NocoDB documentation'
  },
  {
    title: 'Base44',
    url: 'https://www.base44.com',
    icon: 'BarChart3',
    category: 'Dev',
    description: 'AI-powered dashboard builder for everyone. No coding experience needed'
  },
  {
    title: 'Database.build',
    url: 'https://database.build',
    icon: 'Database',
    category: 'Infrastructure',
    description: 'Build and manage databases easily'
  },
  
  // Design & UI Tools
  {
    title: 'Figma',
    url: 'https://figma.com',
    icon: 'Palette',
    category: 'Design',
    description: 'Collaborative design tool'
  },
  {
    title: 'Figma Community',
    url: 'https://www.figma.com/community',
    icon: 'Palette',
    category: 'Design',
    description: 'Figma plugins, templates and resources'
  },
  {
    title: 'Figma Dev Mode',
    url: 'https://www.figma.com/dev-mode',
    icon: 'Palette',
    category: 'Design',
    description: 'Developer handoff in Figma'
  },
  {
    title: 'Figma Plugins',
    url: 'https://www.figma.com/community/plugins',
    icon: 'Palette',
    category: 'Design',
    description: 'Figma plugin marketplace'
  },
  {
    title: 'Figma to Code',
    url: 'https://www.figma.com/developers/api',
    icon: 'Code2',
    category: 'Dev',
    description: 'Figma API for code generation'
  },
  {
    title: 'Replit',
    url: 'https://replit.com',
    icon: 'Terminal',
    category: 'Dev',
    description: 'Collaborative browser-based IDE'
  },
  {
    title: 'Replit Deploy',
    url: 'https://replit.com/deployments',
    icon: 'Cloud',
    category: 'Infrastructure',
    description: 'Deploy apps from Replit'
  },
  {
    title: 'Replit Database',
    url: 'https://docs.replit.com/hosting/databases',
    icon: 'Database',
    category: 'Documentation',
    description: 'Replit database documentation'
  },
  {
    title: 'Replit Templates',
    url: 'https://replit.com/templates',
    icon: 'Code2',
    category: 'Dev',
    description: 'Starter templates for Replit'
  },
  {
    title: 'Tailwind CSS',
    url: 'https://tailwindcss.com',
    icon: 'Palette',
    category: 'Design',
    description: 'Utility-first CSS framework'
  },
  {
    title: 'shadcn/ui',
    url: 'https://ui.shadcn.com',
    icon: 'Palette',
    category: 'Design',
    description: 'Beautifully designed components'
  },
  {
    title: 'Radix UI',
    url: 'https://radix-ui.com',
    icon: 'Palette',
    category: 'Design',
    description: 'Unstyled, accessible components'
  },
  
  // Documentation & Learning
  {
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    icon: 'BookOpen',
    category: 'Documentation',
    description: 'Web development documentation'
  },
  {
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    icon: 'Code2',
    category: 'Documentation',
    description: 'Q&A for developers'
  },
  {
    title: 'Dev.to',
    url: 'https://dev.to',
    icon: 'Code2',
    category: 'Documentation',
    description: 'Community for developers'
  },
  
  // Utilities
  {
    title: 'Can I Use',
    url: 'https://caniuse.com',
    icon: 'Globe',
    category: 'Dev',
    description: 'Browser compatibility tables'
  },
  {
    title: 'Regex101',
    url: 'https://regex101.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Regex tester and debugger'
  },
  {
    title: 'JSONLint',
    url: 'https://jsonlint.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'JSON validator and formatter'
  },
  
  // Google Notebooks & Colab
  {
    title: 'Google Colab',
    url: 'https://colab.research.google.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Free Jupyter notebook environment'
  },
  {
    title: 'Google Notebooks',
    url: 'https://notebooks.google.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Google Cloud Notebooks'
  },
  {
    title: 'Google Gravity',
    url: 'https://mrdoob.com/projects/chromeexperiments/google-gravity',
    icon: 'Globe',
    category: 'Dev',
    description: 'Google Gravity experiment - interactive physics'
  },
  {
    title: 'Google Gravity (Alternative)',
    url: 'https://www.google.com/search?q=google+gravity',
    icon: 'Globe',
    category: 'Dev',
    description: 'Search for "google gravity" to see the effect'
  },
  {
    title: 'Google Pacman',
    url: 'https://www.google.com/doodles/30th-anniversary-of-pac-man',
    icon: 'Globe',
    category: 'Dev',
    description: 'Play Pacman on Google homepage'
  },
  {
    title: 'Google Experiments',
    url: 'https://experiments.withgoogle.com',
    icon: 'Globe',
    category: 'Dev',
    description: 'Collection of Google experiments and demos'
  },
  {
    title: 'Chrome Experiments',
    url: 'https://www.chromeexperiments.com',
    icon: 'Globe',
    category: 'Dev',
    description: 'Creative web experiments'
  },
  {
    title: 'Jupyter Notebook',
    url: 'https://jupyter.org',
    icon: 'Code2',
    category: 'Dev',
    description: 'Open-source notebook environment'
  },
  
  // Information Sources & Infographics
  {
    title: 'State of JS',
    url: 'https://stateofjs.com',
    icon: 'Globe',
    category: 'Documentation',
    description: 'Annual JavaScript survey and trends'
  },
  {
    title: 'State of CSS',
    url: 'https://stateofcss.com',
    icon: 'Palette',
    category: 'Documentation',
    description: 'Annual CSS survey and trends'
  },
  {
    title: 'GitHub Octoverse',
    url: 'https://octoverse.github.com',
    icon: 'Github',
    category: 'Documentation',
    description: 'Annual GitHub statistics and trends'
  },
  {
    title: 'Stack Overflow Survey',
    url: 'https://survey.stackoverflow.co',
    icon: 'Code2',
    category: 'Documentation',
    description: 'Annual developer survey results'
  },
  {
    title: 'Web.dev',
    url: 'https://web.dev',
    icon: 'Globe',
    category: 'Documentation',
    description: 'Web development guides and best practices'
  },
  {
    title: 'Can I Use',
    url: 'https://caniuse.com',
    icon: 'Globe',
    category: 'Documentation',
    description: 'Browser compatibility tables'
  },
  {
    title: 'CSS-Tricks',
    url: 'https://css-tricks.com',
    icon: 'Palette',
    category: 'Documentation',
    description: 'CSS tutorials and guides'
  },
  {
    title: 'Smashing Magazine',
    url: 'https://www.smashingmagazine.com',
    icon: 'Palette',
    category: 'Documentation',
    description: 'Web design and development articles'
  },
  {
    title: 'A List Apart',
    url: 'https://alistapart.com',
    icon: 'Palette',
    category: 'Documentation',
    description: 'Web design and development articles'
  },
  {
    title: 'Frontend Masters',
    url: 'https://frontendmasters.com',
    icon: 'Code2',
    category: 'Documentation',
    description: 'Advanced frontend training courses'
  },
  {
    title: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org',
    icon: 'Code2',
    category: 'Documentation',
    description: 'Free coding tutorials and courses'
  },
  {
    title: 'JavaScript.info',
    url: 'https://javascript.info',
    icon: 'Code2',
    category: 'Documentation',
    description: 'Modern JavaScript tutorial'
  },
  {
    title: 'React Docs',
    url: 'https://react.dev',
    icon: 'Code2',
    category: 'Documentation',
    description: 'Official React documentation'
  },
  {
    title: 'Next.js Docs',
    url: 'https://nextjs.org/docs',
    icon: 'Code2',
    category: 'Documentation',
    description: 'Next.js framework documentation'
  },
  {
    title: 'Vue.js Docs',
    url: 'https://vuejs.org',
    icon: 'Code2',
    category: 'Documentation',
    description: 'Vue.js framework documentation'
  },
  {
    title: 'TypeScript Handbook',
    url: 'https://www.typescriptlang.org/docs',
    icon: 'Code2',
    category: 'Documentation',
    description: 'TypeScript official documentation'
  },
  {
    title: 'Node.js Docs',
    url: 'https://nodejs.org/docs',
    icon: 'Code2',
    category: 'Documentation',
    description: 'Node.js runtime documentation'
  },
  {
    title: 'Express.js Guide',
    url: 'https://expressjs.com',
    icon: 'Code2',
    category: 'Documentation',
    description: 'Express.js web framework'
  },
  {
    title: 'Docker Docs',
    url: 'https://docs.docker.com',
    icon: 'Cloud',
    category: 'Documentation',
    description: 'Docker containerization docs'
  },
  {
    title: 'Kubernetes Docs',
    url: 'https://kubernetes.io/docs',
    icon: 'Cloud',
    category: 'Documentation',
    description: 'Kubernetes orchestration docs'
  },
  {
    title: 'PostgreSQL Docs',
    url: 'https://www.postgresql.org/docs',
    icon: 'Database',
    category: 'Documentation',
    description: 'PostgreSQL database documentation'
  },
  {
    title: 'MongoDB Docs',
    url: 'https://www.mongodb.com/docs',
    icon: 'Database',
    category: 'Documentation',
    description: 'MongoDB database documentation'
  },
  {
    title: 'Redis Docs',
    url: 'https://redis.io/docs',
    icon: 'Database',
    category: 'Documentation',
    description: 'Redis in-memory database docs'
  },
  {
    title: 'GraphQL Docs',
    url: 'https://graphql.org/learn',
    icon: 'Code2',
    category: 'Documentation',
    description: 'GraphQL query language docs'
  },
  {
    title: 'REST API Tutorial',
    url: 'https://restfulapi.net',
    icon: 'Code2',
    category: 'Documentation',
    description: 'REST API design best practices'
  },
  {
    title: 'OWASP Top 10',
    url: 'https://owasp.org/www-project-top-ten',
    icon: 'Code2',
    category: 'Documentation',
    description: 'Top 10 web application security risks'
  },
  {
    title: 'Web Accessibility Guidelines',
    url: 'https://www.w3.org/WAI/WCAG21/quickref',
    icon: 'Globe',
    category: 'Documentation',
    description: 'WCAG accessibility guidelines'
  },
  {
    title: 'HTTP Status Codes',
    url: 'https://httpstatuses.com',
    icon: 'Code2',
    category: 'Documentation',
    description: 'Complete HTTP status code reference'
  },
  {
    title: 'Regex101',
    url: 'https://regex101.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Regex tester and debugger'
  },
  {
    title: 'Carbon',
    url: 'https://carbon.now.sh',
    icon: 'Code2',
    category: 'Design',
    description: 'Create beautiful code screenshots'
  },
  {
    title: 'Ray.so',
    url: 'https://ray.so',
    icon: 'Code2',
    category: 'Design',
    description: 'Create beautiful code images'
  },
  {
    title: 'Excalidraw',
    url: 'https://excalidraw.com',
    icon: 'Palette',
    category: 'Design',
    description: 'Virtual whiteboard for sketching'
  },
  {
    title: 'Draw.io',
    url: 'https://app.diagrams.net',
    icon: 'Palette',
    category: 'Design',
    description: 'Free diagramming tool'
  },
  {
    title: 'Mermaid Live Editor',
    url: 'https://mermaid.live',
    icon: 'Code2',
    category: 'Design',
    description: 'Create diagrams from text'
  },
  
  // More Design Tools
  {
    title: 'Adobe XD',
    url: 'https://www.adobe.com/products/xd.html',
    icon: 'Palette',
    category: 'Design',
    description: 'UI/UX design and prototyping'
  },
  {
    title: 'Sketch',
    url: 'https://www.sketch.com',
    icon: 'Palette',
    category: 'Design',
    description: 'Digital design toolkit'
  },
  {
    title: 'Framer',
    url: 'https://www.framer.com',
    icon: 'Palette',
    category: 'Design',
    description: 'Interactive design and prototyping'
  },
  {
    title: 'InVision',
    url: 'https://www.invisionapp.com',
    icon: 'Palette',
    category: 'Design',
    description: 'Digital product design platform'
  },
  {
    title: 'Zeplin',
    url: 'https://zeplin.io',
    icon: 'Palette',
    category: 'Design',
    description: 'Design handoff and collaboration'
  },
  {
    title: 'Abstract',
    url: 'https://www.abstract.com',
    icon: 'Palette',
    category: 'Design',
    description: 'Version control for design files'
  },
  
  // More Development Platforms
  {
    title: 'CodeSandbox',
    url: 'https://codesandbox.io',
    icon: 'Code2',
    category: 'Dev',
    description: 'Online code editor and IDE'
  },
  {
    title: 'StackBlitz',
    url: 'https://stackblitz.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Online IDE for web development'
  },
  {
    title: 'Glitch',
    url: 'https://glitch.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Build and deploy web apps'
  },
  {
    title: 'CodePen',
    url: 'https://codepen.io',
    icon: 'Code2',
    category: 'Dev',
    description: 'Frontend code playground'
  },
  {
    title: 'JSFiddle',
    url: 'https://jsfiddle.net',
    icon: 'Code2',
    category: 'Dev',
    description: 'Online code editor and tester'
  },
  {
    title: 'RunKit',
    url: 'https://runkit.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Node.js playground'
  },
  {
    title: 'Observable',
    url: 'https://observablehq.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Data visualization notebooks'
  },
  
  // More Collaboration Tools
  {
    title: 'Notion',
    url: 'https://www.notion.so',
    icon: 'BookOpen',
    category: 'Dev',
    description: 'All-in-one workspace'
  },
  {
    title: 'Linear',
    url: 'https://linear.app',
    icon: 'Code2',
    category: 'Dev',
    description: 'Issue tracking and project management'
  },
  {
    title: 'Jira',
    url: 'https://www.atlassian.com/software/jira',
    icon: 'Code2',
    category: 'Dev',
    description: 'Project management and tracking'
  },
  {
    title: 'Trello',
    url: 'https://trello.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Visual project management'
  },
  {
    title: 'Asana',
    url: 'https://asana.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Team collaboration and planning'
  },
  {
    title: 'Slack',
    url: 'https://slack.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Team communication platform'
  },
  {
    title: 'Discord',
    url: 'https://discord.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Voice and text chat for developers'
  },
  
  // Code Development Tools
  {
    title: 'Visual Studio Code',
    url: 'https://code.visualstudio.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Free source code editor by Microsoft'
  },
  {
    title: 'CMake',
    url: 'https://cmake.org',
    icon: 'Code2',
    category: 'Dev',
    description: 'Cross-platform build automation tool'
  },
  {
    title: 'SonarQube',
    url: 'https://www.sonarqube.org',
    icon: 'Code2',
    category: 'Dev',
    description: 'Code quality and security analysis platform'
  },
  {
    title: 'Code::Blocks',
    url: 'https://www.codeblocks.org',
    icon: 'Code2',
    category: 'Dev',
    description: 'Open source C/C++ IDE'
  },
  {
    title: 'SharpDevelop',
    url: 'https://github.com/icsharpcode/SharpDevelop',
    icon: 'Code2',
    category: 'Dev',
    description: 'Open source IDE for .NET languages'
  },
  {
    title: 'Light Table',
    url: 'http://lighttable.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'IDE with real-time feedback'
  },
  
  // Low-Code / No-Code Platforms
  {
    title: 'Microsoft Power Apps',
    url: 'https://powerapps.microsoft.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Build custom business apps without code'
  },
  {
    title: 'Microsoft Power Platform',
    url: 'https://powerplatform.microsoft.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Low-code platform for apps, automation, and analytics'
  },
  {
    title: 'Mendix',
    url: 'https://www.mendix.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Low-code application development platform'
  },
  {
    title: 'OutSystems',
    url: 'https://www.outsystems.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Low-code platform for enterprise applications'
  },
  {
    title: 'Appian',
    url: 'https://www.appian.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Low-code automation platform'
  },
  {
    title: 'Bubble',
    url: 'https://bubble.io',
    icon: 'Code2',
    category: 'Dev',
    description: 'Visual programming platform for web apps'
  },
  {
    title: 'Retool',
    url: 'https://retool.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Build internal tools with visual interface'
  },
  {
    title: 'Glide',
    url: 'https://www.glideapps.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Turn Google Sheets into mobile apps'
  },
  {
    title: 'Adalo',
    url: 'https://www.adalo.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Build mobile and web apps without code'
  },
  {
    title: 'Thunkable',
    url: 'https://thunkable.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Create native mobile apps visually'
  },
  {
    title: 'Zoho Creator',
    url: 'https://www.zoho.com/creator',
    icon: 'Code2',
    category: 'Dev',
    description: 'Build custom business applications'
  },
  {
    title: 'AppMaster',
    url: 'https://appmaster.io',
    icon: 'Code2',
    category: 'Dev',
    description: 'No-code platform for backend, web, and mobile apps'
  },
  {
    title: 'Oracle Visual Builder',
    url: 'https://www.oracle.com/application-development/visual-builder',
    icon: 'Code2',
    category: 'Dev',
    description: 'Visual drag-and-drop application builder'
  },
  {
    title: 'Zapier',
    url: 'https://zapier.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Automate workflows between 6000+ apps'
  },
  {
    title: 'Notion',
    url: 'https://www.notion.so',
    icon: 'BookOpen',
    category: 'Dev',
    description: 'All-in-one workspace with database capabilities'
  },
  {
    title: 'Webflow',
    url: 'https://webflow.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Visual web design and development platform'
  },
  {
    title: 'Framer',
    url: 'https://www.framer.com',
    icon: 'Palette',
    category: 'Design',
    description: 'Interactive design and prototyping platform'
  },
  {
    title: 'Wix',
    url: 'https://www.wix.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Website builder with drag-and-drop interface'
  },
  {
    title: 'Squarespace',
    url: 'https://www.squarespace.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Website builder and hosting platform'
  },
  {
    title: 'WordPress',
    url: 'https://wordpress.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Content management system and website builder'
  },
  {
    title: 'Shopify',
    url: 'https://www.shopify.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'E-commerce platform builder'
  },
  {
    title: 'Airtable',
    url: 'https://www.airtable.com',
    icon: 'Database',
    category: 'Infrastructure',
    description: 'Database and app builder platform'
  },
  {
    title: 'Monday.com',
    url: 'https://monday.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Work management and automation platform'
  },
  {
    title: 'ClickUp',
    url: 'https://clickup.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Productivity platform with custom views'
  },
  {
    title: 'Smartsheet',
    url: 'https://www.smartsheet.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Work management and collaboration platform'
  },
  {
    title: 'Coda',
    url: 'https://coda.io',
    icon: 'FileText',
    category: 'Dev',
    description: 'All-in-one doc with database and automation'
  },
  {
    title: 'Softr',
    url: 'https://www.softr.io',
    icon: 'Code2',
    category: 'Dev',
    description: 'Build web apps from Airtable and Google Sheets'
  },
  {
    title: 'Carrd',
    url: 'https://carrd.co',
    icon: 'Code2',
    category: 'Dev',
    description: 'Simple one-page website builder'
  },
  {
    title: 'Landen',
    url: 'https://www.landen.co',
    icon: 'Code2',
    category: 'Dev',
    description: 'Landing page builder for startups'
  },
  {
    title: 'Universe',
    url: 'https://onuniverse.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Build websites from your phone'
  },
  {
    title: 'Voiceflow',
    url: 'https://www.voiceflow.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Build conversational AI experiences visually'
  },
  {
    title: 'Integromat (Make)',
    url: 'https://www.make.com',
    icon: 'Code2',
    category: 'Dev',
    description: 'Visual automation platform'
  },
  {
    title: 'n8n',
    url: 'https://n8n.io',
    icon: 'Code2',
    category: 'Dev',
    description: 'Open source workflow automation tool'
  }
];

const staticAffiliates = [
  {
    name: "Hostinger",
    category: "Hosting",
    url: "https://hostinger.com/?ref=TU-ID",
    code: null,
    commission: "60%",
    icon: "Server",
    utm: "?utm_source=codekit&utm_medium=affiliate"
  },
  {
    name: "Vercel",
    category: "Deployment",
    url: "https://vercel.com/partners/affiliate?ref=TU-ID",
    code: null,
    commission: "25% recurrente",
    icon: "Rocket",
    utm: "?utm_source=codekit"
  },
  {
    name: "DigitalOcean",
    category: "Cloud",
    url: "https://digitalocean.com/?refcode=TU-ID",
    code: null,
    commission: "$25 por registro",
    icon: "Cloud",
    utm: "?utm_source=codekit"
  },
  {
    name: "Replit",
    category: "IA & DevTools",
    url: "https://replit.com/ambassadors/TU-ID",
    code: null,
    commission: "20-30%",
    icon: "Terminal",
    utm: null
  },
  {
    name: "GitHub Copilot",
    category: "IA",
    url: "https://github.com/features/copilot?aff=TU-ID",
    code: null,
    commission: "20%",
    icon: "Github",
    utm: null
  },
  {
    name: "TailwindUI",
    category: "UI Kits",
    url: "https://tailwindui.com/?ref=TU-ID",
    code: null,
    commission: "25%",
    icon: "LayoutGrid",
    utm: null
  },
  {
    name: "Notion",
    category: "Productividad",
    url: "https://affiliate.notion.com/TU-ID",
    code: null,
    commission: "50%",
    icon: "Notebook",
    utm: null
  },
  {
    name: "Jasper AI",
    category: "IA",
    url: "https://jasper.ai?fpr=TU-ID",
    code: null,
    commission: "30% recurrente",
    icon: "Sparkles",
    utm: null
  },
  {
    name: "Canva",
    category: "Diseño",
    url: "https://partner.canva.com/TU-ID",
    code: "CODEKIT80",
    commission: "80%",
    icon: "Brush",
    utm: null
  }
];

const staticGuides = [
  {
    title: "Naming Convention Guide",
    description: "Guía definitiva para nombrar componentes, funciones y variables en proyectos React grandes.",
    content: `# Naming Conventions para React

## Componentes
- Usar PascalCase: \`UserProfile.tsx\`
- Nombres descriptivos: \`Button\` no \`Btn\`

## Funciones
- Usar camelCase: \`handleSubmit\`
- Verbos de acción: \`getUserData\`, \`updateProfile\`

## Variables
- camelCase para variables: \`userName\`
- UPPER_CASE para constantes: \`API_BASE_URL\`

## Hooks
- Prefijo "use": \`useAuth\`, \`useLocalStorage\``,
    type: "manual",
    tags: ["best-practices", "clean-code", "react"],
  },
  {
    title: "Tailwind Design Patterns",
    description: "Patrones comunes de UI construidos con Tailwind CSS para copiar y pegar.",
    content: `# Tailwind Design Patterns

## Card Pattern
\`\`\`tsx
<div className="rounded-lg border bg-card p-6 shadow-sm">
  <h3 className="text-lg font-semibold">Card Title</h3>
  <p className="text-muted-foreground">Card content</p>
</div>
\`\`\`

## Button Variants
\`\`\`tsx
<button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
  Primary
</button>
\`\`\``,
    type: "template",
    tags: ["css", "ui", "tailwind"],
  },
  {
    title: "Component Architecture",
    description: "Mejores prácticas para estructurar componentes React escalables.",
    content: `# Component Architecture

## Estructura de Carpetas
\`\`\`
src/
  components/
    Button/
      Button.tsx
      Button.test.tsx
      Button.stories.tsx
      index.ts
    Card/
      Card.tsx
      CardHeader.tsx
      CardContent.tsx
\`\`\`

## Principios
- Un componente por archivo
- Componentes pequeños y enfocados
- Props tipadas con TypeScript
- Separar lógica de presentación`,
    type: "ui",
    tags: ["architecture", "react", "patterns"],
  },
  {
    title: "Material Design System",
    description: "Guía completa del sistema de diseño de Google Material Design.",
    content: `# Material Design System

## Principios Fundamentales
1. **Material is the metaphor**: Las superficies y sombras crean jerarquía
2. **Bold, graphic, intentional**: Uso audaz de tipografía, color y espacio
3. **Motion provides meaning**: Las animaciones guían al usuario

## Componentes Principales
- **Buttons**: Contained, Outlined, Text
- **Cards**: Elevación y sombras
- **Navigation**: Drawer, Bottom Navigation, Tabs
- **Inputs**: Text fields, Selects, Checkboxes

## Espaciado
- Base unit: 8dp
- Grid system: 8dp, 16dp, 24dp, 32dp, 48dp

## Colores
- Primary: Color principal de la marca
- Secondary: Color secundario
- Surface: Color de fondo
- Error: Para estados de error`,
    type: "ui",
    tags: ["design-system", "material", "google"],
  },
  {
    title: "Ant Design Guidelines",
    description: "Sistema de diseño empresarial de Ant Design con componentes y patrones.",
    content: `# Ant Design Guidelines

## Principios de Diseño
1. **Natural**: Diseño natural y predecible
2. **Certain**: Interfaz clara y determinada
3. **Meaningful**: Cada elemento tiene propósito
4. **Growing**: Sistema escalable y evolutivo

## Componentes Clave
- **Layout**: Grid, Layout, Space
- **Navigation**: Menu, Breadcrumb, Pagination
- **Data Entry**: Form, Input, Select, DatePicker
- **Data Display**: Table, List, Card, Descriptions
- **Feedback**: Message, Notification, Modal

## Espaciado
- Base spacing: 8px
- Common sizes: 8, 12, 16, 24, 32, 48, 64px

## Tipografía
- Font families: -apple-system, BlinkMacSystemFont, 'Segoe UI'
- Font sizes: 12, 14, 16, 20, 24, 30, 38, 46, 56px`,
    type: "ui",
    tags: ["design-system", "ant-design", "components"],
  },
  {
    title: "Color System Guide",
    description: "Guía completa sobre sistemas de color para interfaces modernas.",
    content: `# Color System Guide

## Paleta de Colores
### Colores Primarios
- **Primary**: Color principal de la marca (#3B82F6)
- **Primary Dark**: Variante oscura (#2563EB)
- **Primary Light**: Variante clara (#60A5FA)

### Colores Semánticos
- **Success**: Verde (#10B981)
- **Warning**: Amarillo (#F59E0B)
- **Error**: Rojo (#EF4444)
- **Info**: Azul (#3B82F6)

## Escala de Grises
- **50**: Más claro (#F9FAFB)
- **100-400**: Grises claros
- **500**: Gris medio (#6B7280)
- **600-900**: Grises oscuros
- **950**: Más oscuro (#030712)

## Contraste
- Texto sobre fondo claro: mínimo 4.5:1
- Texto sobre fondo oscuro: mínimo 4.5:1
- Texto grande: mínimo 3:1

## Modo Oscuro
- Invertir escala de grises
- Ajustar saturación de colores
- Mantener contraste adecuado`,
    type: "ui",
    tags: ["colors", "design", "accessibility"],
  },
  {
    title: "Typography System",
    description: "Sistema tipográfico completo para interfaces digitales.",
    content: `# Typography System

## Escala Tipográfica
### Headings
- **H1**: 2.5rem (40px) - Títulos principales
- **H2**: 2rem (32px) - Secciones principales
- **H3**: 1.75rem (28px) - Subsecciones
- **H4**: 1.5rem (24px) - Títulos menores
- **H5**: 1.25rem (20px) - Subtítulos
- **H6**: 1rem (16px) - Títulos pequeños

### Body Text
- **Large**: 1.125rem (18px)
- **Base**: 1rem (16px) - Tamaño estándar
- **Small**: 0.875rem (14px)
- **XSmall**: 0.75rem (12px)

## Pesos de Fuente
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

## Altura de Línea
- Headings: 1.2
- Body: 1.5-1.75
- Tight: 1.25

## Espaciado
- Letter spacing: -0.01em a 0.05em
- Word spacing: normal`,
    type: "ui",
    tags: ["typography", "design", "text"],
  },
  {
    title: "Spacing & Layout System",
    description: "Sistema de espaciado y layout para interfaces consistentes.",
    content: `# Spacing & Layout System

## Sistema de Espaciado
### Base Unit: 4px
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px
- **3xl**: 64px
- **4xl**: 96px

## Padding
- **Component padding**: 12px, 16px, 24px
- **Section padding**: 24px, 32px, 48px, 64px
- **Container padding**: 16px (mobile), 24px (tablet), 32px (desktop)

## Margin
- **Between elements**: 8px, 16px, 24px
- **Between sections**: 32px, 48px, 64px
- **Page margins**: 16px (mobile), 24px (tablet), 32px (desktop)

## Grid System
- **Columns**: 12 columnas
- **Gutter**: 16px (mobile), 24px (desktop)
- **Max width**: 1280px (container)

## Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px`,
    type: "ui",
    tags: ["spacing", "layout", "grid"],
  },
  {
    title: "Button Design Patterns",
    description: "Patrones y variantes de botones para diferentes contextos.",
    content: `# Button Design Patterns

## Variantes de Botones
### Primary Button
\`\`\`tsx
<button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90">
  Primary Action
</button>
\`\`\`

### Secondary Button
\`\`\`tsx
<button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md border hover:bg-secondary/80">
  Secondary Action
</button>
\`\`\`

### Outline Button
\`\`\`tsx
<button className="border border-border px-4 py-2 rounded-md hover:bg-accent">
  Outline
</button>
\`\`\`

### Ghost Button
\`\`\`tsx
<button className="px-4 py-2 rounded-md hover:bg-accent">
  Ghost
</button>
\`\`\`

## Tamaños
- **sm**: px-2 py-1 text-sm
- **md**: px-4 py-2 text-base (default)
- **lg**: px-6 py-3 text-lg

## Estados
- **Default**: Estado normal
- **Hover**: Cambio de color/opacidad
- **Active**: Estado presionado
- **Disabled**: Opacidad 50%, cursor not-allowed
- **Loading**: Spinner + texto deshabilitado`,
    type: "template",
    tags: ["buttons", "components", "ui"],
  },
  {
    title: "Form Design Patterns",
    description: "Mejores prácticas para diseñar formularios accesibles y usables.",
    content: `# Form Design Patterns

## Estructura de Formulario
\`\`\`tsx
<form className="space-y-6">
  <div className="space-y-2">
    <label htmlFor="email" className="text-sm font-medium">
      Email
    </label>
    <input
      id="email"
      type="email"
      className="w-full px-3 py-2 border rounded-md"
      placeholder="tu@email.com"
    />
    <p className="text-xs text-muted-foreground">
      No compartiremos tu email
    </p>
  </div>
</form>
\`\`\`

## Mejores Prácticas
1. **Labels siempre visibles**: No usar placeholders como labels
2. **Agrupación lógica**: Agrupar campos relacionados
3. **Validación en tiempo real**: Mostrar errores mientras el usuario escribe
4. **Mensajes claros**: Errores específicos y accionables
5. **Campos requeridos**: Marcar claramente con asterisco

## Estados de Input
- **Default**: Borde gris
- **Focus**: Borde primary, outline
- **Error**: Borde rojo, mensaje de error
- **Success**: Borde verde (opcional)
- **Disabled**: Fondo gris, cursor not-allowed

## Tipos de Input
- Text, Email, Password, Number, Tel
- Select, Checkbox, Radio, Switch
- Date, Time, File Upload`,
    type: "ui",
    tags: ["forms", "inputs", "ux"],
  },
  {
    title: "Card Component Patterns",
    description: "Patrones para crear cards efectivas y reutilizables.",
    content: `# Card Component Patterns

## Card Básica
\`\`\`tsx
<div className="rounded-lg border bg-card p-6 shadow-sm">
  <h3 className="text-lg font-semibold mb-2">Card Title</h3>
  <p className="text-muted-foreground">Card content goes here</p>
</div>
\`\`\`

## Card con Imagen
\`\`\`tsx
<div className="rounded-lg border bg-card overflow-hidden shadow-sm">
  <img src="..." alt="..." className="w-full h-48 object-cover" />
  <div className="p-6">
    <h3 className="text-lg font-semibold mb-2">Title</h3>
    <p className="text-muted-foreground">Description</p>
  </div>
</div>
\`\`\`

## Card Interactiva
\`\`\`tsx
<div className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
  <h3 className="text-lg font-semibold mb-2">Interactive Card</h3>
  <p className="text-muted-foreground">Hover me</p>
</div>
\`\`\`

## Card con Acciones
\`\`\`tsx
<div className="rounded-lg border bg-card p-6 shadow-sm">
  <div className="flex items-start justify-between mb-4">
    <h3 className="text-lg font-semibold">Card Title</h3>
    <button className="text-muted-foreground hover:text-foreground">
      ⋮
    </button>
  </div>
  <p className="text-muted-foreground mb-4">Content</p>
  <div className="flex gap-2">
    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
      Action
    </button>
  </div>
</div>
\`\`\``,
    type: "template",
    tags: ["cards", "components", "ui"],
  },
  {
    title: "Navigation Patterns",
    description: "Patrones de navegación para aplicaciones web y móviles.",
    content: `# Navigation Patterns

## Top Navigation
\`\`\`tsx
<nav className="border-b bg-background">
  <div className="container mx-auto px-4">
    <div className="flex items-center justify-between h-16">
      <div className="flex items-center gap-8">
        <Logo />
        <div className="flex gap-4">
          <a href="/" className="text-sm font-medium">Home</a>
          <a href="/about" className="text-sm font-medium">About</a>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button>Sign In</Button>
      </div>
    </div>
  </div>
</nav>
\`\`\`

## Sidebar Navigation
\`\`\`tsx
<aside className="w-64 border-r bg-card h-screen">
  <nav className="p-4 space-y-1">
    <a href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent">
      <Icon /> Dashboard
    </a>
    <a href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent">
      <Icon /> Settings
    </a>
  </nav>
</aside>
\`\`\`

## Breadcrumbs
\`\`\`tsx
<nav className="flex items-center gap-2 text-sm">
  <a href="/" className="text-muted-foreground hover:text-foreground">Home</a>
  <span>/</span>
  <a href="/category" className="text-muted-foreground hover:text-foreground">Category</a>
  <span>/</span>
  <span className="text-foreground">Current Page</span>
</nav>
\`\`\`

## Tabs
\`\`\`tsx
<div className="border-b">
  <div className="flex gap-4">
    <button className="px-4 py-2 border-b-2 border-primary font-medium">
      Tab 1
    </button>
    <button className="px-4 py-2 text-muted-foreground hover:text-foreground">
      Tab 2
    </button>
  </div>
</div>
\`\`\``,
    type: "template",
    tags: ["navigation", "menu", "ui"],
  },
  {
    title: "Modal & Dialog Patterns",
    description: "Patrones para modales y diálogos efectivos.",
    content: `# Modal & Dialog Patterns

## Modal Básico
\`\`\`tsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold">Modal Title</h2>
      <button className="text-muted-foreground hover:text-foreground">×</button>
    </div>
    <p className="text-muted-foreground mb-6">Modal content</p>
    <div className="flex justify-end gap-2">
      <button className="px-4 py-2 border rounded-md">Cancel</button>
      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Confirm</button>
    </div>
  </div>
</div>
\`\`\`

## Tipos de Modales
- **Confirmation**: Confirmar acción destructiva
- **Form**: Formulario en modal
- **Information**: Mostrar información importante
- **Fullscreen**: Modal a pantalla completa

## Mejores Prácticas
1. **Focus trap**: Mantener focus dentro del modal
2. **Escape key**: Cerrar con ESC
3. **Backdrop click**: Opción de cerrar al hacer click fuera
4. **Scroll**: Si el contenido es largo, permitir scroll
5. **Focus management**: Devolver focus al elemento que abrió el modal`,
    type: "template",
    tags: ["modal", "dialog", "ui"],
  },
  {
    title: "Loading States & Skeletons",
    description: "Patrones para estados de carga y skeleton screens.",
    content: `# Loading States & Skeletons

## Spinner
\`\`\`tsx
<div className="flex items-center justify-center">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
</div>
\`\`\`

## Skeleton Card
\`\`\`tsx
<div className="rounded-lg border bg-card p-6 animate-pulse">
  <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
  <div className="h-4 bg-muted rounded w-full mb-2"></div>
  <div className="h-4 bg-muted rounded w-5/6"></div>
</div>
\`\`\`

## Skeleton List
\`\`\`tsx
<div className="space-y-4">
  {[1, 2, 3].map((i) => (
    <div key={i} className="flex gap-4 animate-pulse">
      <div className="h-12 w-12 bg-muted rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    </div>
  ))}
</div>
\`\`\`

## Estados de Carga
- **Initial**: Skeleton o spinner
- **Loading**: Mostrar progreso si es posible
- **Success**: Contenido cargado
- **Error**: Mensaje de error con retry`,
    type: "template",
    tags: ["loading", "skeleton", "ux"],
  },
  {
    title: "Accessibility Guidelines",
    description: "Guía completa de accesibilidad web (WCAG 2.1).",
    content: `# Accessibility Guidelines (WCAG 2.1)

## Principios Fundamentales
1. **Perceptible**: La información debe ser presentable a los usuarios
2. **Operable**: Los componentes deben ser operables
3. **Comprensible**: La información debe ser comprensible
4. **Robusto**: El contenido debe ser interpretable por tecnologías asistivas

## Contraste de Color
- **Texto normal**: Mínimo 4.5:1
- **Texto grande**: Mínimo 3:1
- **Componentes UI**: Mínimo 3:1

## Navegación por Teclado
- **Tab order**: Orden lógico de navegación
- **Focus visible**: Indicador de focus claro
- **Skip links**: Enlaces para saltar contenido repetitivo
- **Keyboard shortcuts**: Atajos de teclado documentados

## ARIA Labels
\`\`\`tsx
<button aria-label="Close dialog">×</button>
<div role="alert" aria-live="polite">Error message</div>
<nav aria-label="Main navigation">...</nav>
\`\`\`

## Imágenes
- **Alt text**: Siempre proporcionar texto alternativo
- **Decorative images**: alt=""
- **Informative images**: Descripción clara

## Formularios
- **Labels**: Asociar labels con inputs
- **Error messages**: Mensajes claros y accionables
- **Required fields**: Indicar claramente`,
    type: "manual",
    tags: ["accessibility", "a11y", "wcag"],
  },
  {
    title: "Dark Mode Implementation",
    description: "Guía para implementar modo oscuro en aplicaciones.",
    content: `# Dark Mode Implementation

## Variables CSS
\`\`\`css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
}
\`\`\`

## Tailwind Dark Mode
\`\`\`tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
\`\`\`

## Toggle Component
\`\`\`tsx
const [darkMode, setDarkMode] = useState(false);

useEffect(() => {
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [darkMode]);
\`\`\`

## Consideraciones
- **Contraste**: Mantener contraste adecuado
- **Imágenes**: Ajustar opacidad o usar filtros
- **Sombras**: Usar sombras más sutiles en modo oscuro
- **Colores**: Reducir saturación en modo oscuro`,
    type: "manual",
    tags: ["dark-mode", "theming", "css"],
  },
  {
    title: "Responsive Design Patterns",
    description: "Patrones de diseño responsive para diferentes dispositivos.",
    content: `# Responsive Design Patterns

## Mobile First
\`\`\`tsx
// Mobile: 1 columna
// Tablet: 2 columnas
// Desktop: 3 columnas
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
\`\`\`

## Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## Container Queries
\`\`\`css
.card {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card-content {
    display: flex;
  }
}
\`\`\`

## Imágenes Responsive
\`\`\`tsx
<img
  srcSet="image-small.jpg 640w, image-medium.jpg 1024w, image-large.jpg 1920w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  src="image-medium.jpg"
  alt="..."
/>
\`\`\`

## Tipografía Responsive
\`\`\`css
h1 {
  font-size: clamp(1.5rem, 4vw, 3rem);
}
\`\`\``,
    type: "manual",
    tags: ["responsive", "mobile", "css"],
  },
  {
    title: "Animation & Transitions",
    description: "Guía de animaciones y transiciones para interfaces modernas.",
    content: `# Animation & Transitions

## Principios
- **Purpose**: Cada animación debe tener propósito
- **Duration**: 150-300ms para interacciones, 300-500ms para transiciones
- **Easing**: Usar easing natural (ease-in-out)

## Transiciones CSS
\`\`\`css
.button {
  transition: all 0.2s ease-in-out;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
\`\`\`

## Framer Motion (React)
\`\`\`tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
\`\`\`

## Micro-interacciones
- **Hover**: Elevación sutil, cambio de color
- **Click**: Feedback inmediato (ripple, scale)
- **Loading**: Spinner, skeleton, progress bar
- **Success**: Checkmark animation, toast notification

## Performance
- Usar \`transform\` y \`opacity\` para animaciones suaves
- Evitar animar \`width\`, \`height\`, \`top\`, \`left\`
- Usar \`will-change\` con precaución`,
    type: "manual",
    tags: ["animation", "transitions", "ux"],
  },
];

export async function initializeData() {
  try {
    const storage = getStorage();
    
    // Create or get system user for initial data
    let systemUser = await storage.getUserByEmail("system@codekit.pro");
    if (!systemUser) {
      // Create system user
      systemUser = await storage.createUser({
        username: "system",
        email: "system@codekit.pro",
        password: "system-password-not-used", // Not used for authentication
        plan: "enterprise" as const,
      });
      log("Created system user for initial data", "init");
    }
    const systemUserId = systemUser.id;
    
    // Initialize prompts
    const existingPrompts = await storage.getPrompts();
    if (existingPrompts.length === 0) {
      log("Initializing prompts...", "init");
      for (const prompt of staticPrompts) {
        await storage.createPrompt({
          ...prompt,
          userId: systemUserId,
          status: CONTENT_STATUS.APPROVED, // System user content is auto-approved
        });
      }
      log(`Initialized ${staticPrompts.length} prompts`, "init");
    }

    // Initialize snippets
    const existingSnippets = await storage.getSnippets();
    if (existingSnippets.length === 0) {
      log("Initializing snippets...", "init");
      for (const snippet of staticSnippets) {
        await storage.createSnippet({
          ...snippet,
          userId: systemUserId,
          status: CONTENT_STATUS.APPROVED, // System user content is auto-approved
        });
      }
      log(`Initialized ${staticSnippets.length} snippets`, "init");
    }

    // Initialize links
    const existingLinks = await storage.getLinks();
    if (existingLinks.length === 0) {
      log("Initializing links...", "init");
      for (const link of staticLinks) {
        await storage.createLink({
          ...link,
          userId: systemUserId,
          status: CONTENT_STATUS.APPROVED, // System user content is auto-approved
        });
      }
      log(`Initialized ${staticLinks.length} links`, "init");
    }

    // Initialize guides
    const existingGuides = await storage.getGuides();
    const existingGuideTitles = new Set(existingGuides.map(g => g.title));
    
    if (existingGuides.length === 0) {
      log("Initializing guides...", "init");
      for (const guide of staticGuides) {
        await storage.createGuide({
          ...guide,
          userId: systemUserId,
        });
      }
      log(`Initialized ${staticGuides.length} guides`, "init");
    } else {
      // Add missing guides
      let addedCount = 0;
      for (const guide of staticGuides) {
        if (!existingGuideTitles.has(guide.title)) {
          await storage.createGuide({
            ...guide,
            userId: systemUserId,
            status: CONTENT_STATUS.APPROVED, // System user content is auto-approved
          });
          addedCount++;
        }
      }
      if (addedCount > 0) {
        log(`Added ${addedCount} new guides`, "init");
      }
    }
    // Initialize affiliates
    const existingAffiliates = await storage.getAffiliates();
    if (existingAffiliates.length === 0) {
      log("Initializing affiliates...", "init");
      for (const affiliate of staticAffiliates) {
        await storage.createAffiliate(affiliate);
      }
      log(`Initialized ${staticAffiliates.length} affiliates`, "init");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    log(`Error initializing data: ${message}`, "init");
  }
}

