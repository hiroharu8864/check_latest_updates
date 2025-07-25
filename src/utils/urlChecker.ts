import { URLItem } from '../types';

export class URLChecker {
  private static instance: URLChecker;
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private updateCallbacks: Map<string, (item: URLItem) => void> = new Map();
  private isDestroyed: boolean = false;

  static getInstance(): URLChecker {
    if (!URLChecker.instance) {
      URLChecker.instance = new URLChecker();
    }
    return URLChecker.instance;
  }

  static resetInstance(): void {
    if (URLChecker.instance) {
      URLChecker.instance.destroy();
      URLChecker.instance = new URLChecker();
    }
  }

  // URLの更新をチェックする（簡易版 - 実際のプロジェクトではサーバーサイドで実装）
  async checkURL(url: string): Promise<{ lastModified: Date | null; status: 'updated' | 'unchanged' | 'error' }> {
    try {
      // CORSの問題により、実際のHTTPリクエストはできないため、
      // ここではランダムに更新状態をシミュレート
      const isUpdated = Math.random() < 0.3; // 30%の確率で更新
      
      return {
        lastModified: isUpdated ? new Date() : null,
        status: isUpdated ? 'updated' : 'unchanged'
      };
    } catch (error) {
      return {
        lastModified: null,
        status: 'error'
      };
    }
  }

  startMonitoring(item: URLItem, onUpdate: (item: URLItem) => void): void {
    if (this.isDestroyed) return;
    
    // 既存の監視を停止
    this.stopMonitoring(item.id);
    
    this.updateCallbacks.set(item.id, onUpdate);
    
    const interval = setInterval(async () => {
      if (this.isDestroyed) return;
      
      const callback = this.updateCallbacks.get(item.id);
      if (!callback) return;
      
      try {
        const result = await this.checkURL(item.url);
        
        const updatedItem: URLItem = {
          ...item,
          lastChecked: new Date(),
          lastModified: result.lastModified || item.lastModified,
          status: result.status
        };
        
        if (!this.isDestroyed && callback) {
          callback(updatedItem);
        }
      } catch (error) {
        // console.error('Monitoring error:', error);
      }
    }, Math.max(item.checkInterval * 1000, 5000)); // 最小5秒間隔に変更
    
    this.intervals.set(item.id, interval);
  }

  stopMonitoring(itemId: string): void {
    const interval = this.intervals.get(itemId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(itemId);
    }
    this.updateCallbacks.delete(itemId);
  }

  stopAllMonitoring(): void {
    // console.log('Stopping all monitoring, clearing', this.intervals.size, 'intervals');
    this.intervals.forEach((interval, id) => {
      // console.log('Clearing interval for', id);
      clearInterval(interval);
    });
    this.intervals.clear();
    this.updateCallbacks.clear();
  }

  destroy(): void {
    this.stopAllMonitoring();
    this.isDestroyed = true;
  }
}