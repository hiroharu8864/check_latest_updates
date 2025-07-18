// SSR対応のローカルストレージユーティリティ

export const isClient = typeof window !== 'undefined';

export const setItem = (key: string, value: any): void => {
  if (!isClient) return;
  
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.warn(`Failed to save to localStorage:`, error);
  }
};

export const getItem = (key: string): any => {
  if (!isClient) return null;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn(`Failed to read from localStorage:`, error);
    return null;
  }
};

export const removeItem = (key: string): void => {
  if (!isClient) return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove from localStorage:`, error);
  }
};