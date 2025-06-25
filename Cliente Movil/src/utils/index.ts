// Utilidades para formateo de fechas
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Utilidades para validación
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidCardId = (cardId: string): boolean => {
  return !!(cardId && cardId.length > 0);
};

// Utilidades para formateo de números
export const formatNumber = (num: number): string => {
  return num.toLocaleString('es-ES');
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage.toFixed(1)}%`;
};

// Utilidades para manejo de errores
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Ha ocurrido un error desconocido';
};

// Utilidades para debounce (útil para búsquedas)
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Utilidades para generar IDs únicos
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Utilidades para conversión de imágenes
export const convertImageToBase64 = async (uri: string): Promise<string> => {
  try {
    // Esta función se implementará según las necesidades específicas
    // Por ahora retorna la URI como está
    return uri;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('No se pudo convertir la imagen');
  }
};

// Utilidades para logging
export const log = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error || '');
  },
  debug: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  },
};

// Utilidades para colores de rareza
export const getRarityColor = (rarity: string): string => {
  switch (rarity.toLowerCase()) {
    case 'common':
      return '#9E9E9E'; // Gris
    case 'uncommon':
      return '#4CAF50'; // Verde
    case 'rare':
      return '#2196F3'; // Azul
    case 'legendary':
      return '#FF9800'; // Naranja
    case 'special':
      return '#9C27B0'; // Púrpura
    default:
      return '#757575'; // Gris por defecto
  }
};

// Utilidades para validación de network
export const isNetworkAvailable = async (): Promise<boolean> => {
  try {
    // Esta función se implementará con react-native-netinfo si es necesario
    // Por ahora asume que hay conexión
    return true;
  } catch (error) {
    return false;
  }
};

// Re-exportar hooks
export { useCamera } from './useCamera';
