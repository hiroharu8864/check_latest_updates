export interface URLItem {
  id: string;
  url: string;
  title: string;
  lastChecked: Date;
  lastModified: Date | null;
  status: 'checking' | 'updated' | 'unchanged' | 'error';
  checkInterval: number; // minutes
}

export interface UpdateNotification {
  id: string;
  urlId: string;
  title: string;
  url: string;
  timestamp: Date;
  read: boolean;
}