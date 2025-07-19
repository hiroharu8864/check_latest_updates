export interface URLItem {
  id: string;
  url: string;
  title: string;
  lastChecked: Date;
  lastModified: Date | null;
  status: 'checking' | 'updated' | 'unchanged' | 'error';
  checkInterval: number; // minutes
  updateSummary?: string; // 更新内容の概要
  changeType?: 'content' | 'structure' | 'metadata' | 'unknown'; // 変更の種類
}

export interface UpdateNotification {
  id: string;
  urlId: string;
  title: string;
  url: string;
  timestamp: Date;
  read: boolean;
  updateSummary?: string; // 更新内容の概要
  changeType?: 'content' | 'structure' | 'metadata' | 'unknown'; // 変更の種類
}

export interface UpdateDiff {
  id: string;
  urlId: string;
  timestamp: Date;
  changeType: 'content' | 'structure' | 'metadata' | 'unknown';
  summary: string;
  details: {
    added?: string[];
    removed?: string[];
    modified?: string[];
    metadata?: Record<string, any>;
  };
}