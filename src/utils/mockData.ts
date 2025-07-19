import { URLItem, UpdateDiff } from '../types';

// テスト用のサンプルデータ生成
export const generateMockUpdatedURL = (): URLItem => {
  return {
    id: 'mock-updated-1',
    url: 'https://example.com/news',
    title: 'ニュースサイト（更新あり）',
    lastChecked: new Date(),
    lastModified: new Date(Date.now() - 30 * 60 * 1000), // 30分前
    status: 'updated',
    checkInterval: 60,
    updateSummary: '新しい記事が3件追加され、トップページのレイアウトが変更されました。メインナビゲーションにカテゴリが追加されています。',
    changeType: 'content'
  };
};

export const generateMockUpdateDiffs = (): UpdateDiff[] => {
  return [
    {
      id: 'diff-1',
      urlId: 'mock-updated-1',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      changeType: 'content',
      summary: '新しい記事が3件追加され、トップページのレイアウトが変更されました',
      details: {
        added: [
          '「新技術トレンド2024」記事',
          '「AI開発の最新動向」記事',
          '「サステナビリティへの取り組み」記事',
          'カテゴリナビゲーション'
        ],
        modified: [
          'ヘッダーレイアウト',
          'フッターデザイン',
          'サイドバー構成'
        ],
        removed: [
          '古いバナー広告',
          '使用されていないリンク'
        ],
        metadata: {
          titleChanged: true,
          descriptionUpdated: true,
          lastModified: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        }
      }
    },
    {
      id: 'diff-2',
      urlId: 'mock-updated-1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2時間前
      changeType: 'structure',
      summary: 'サイト構造の大幅な改修が行われました',
      details: {
        added: [
          '新しいセクション「特集記事」',
          'ソーシャルメディア連携ボタン'
        ],
        modified: [
          'メインコンテンツエリア',
          'ナビゲーション構造'
        ],
        removed: [
          '古いプロモーションセクション'
        ]
      }
    },
    {
      id: 'diff-3',
      urlId: 'mock-updated-1',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6時間前
      changeType: 'metadata',
      summary: 'SEOメタデータが更新されました',
      details: {
        modified: [
          'ページタイトル',
          'メタディスクリプション',
          'キーワード'
        ],
        metadata: {
          seoOptimization: true,
          schemaMarkup: 'updated'
        }
      }
    }
  ];
};

// Admin.tsxでテスト用のURLを追加するためのヘルパー
export const addMockDataToUrls = (existingUrls: URLItem[]): URLItem[] => {
  const mockUrl = generateMockUpdatedURL();
  
  // 既に同じIDのURLがある場合は追加しない
  if (existingUrls.some(url => url.id === mockUrl.id)) {
    return existingUrls;
  }
  
  return [...existingUrls, mockUrl];
};