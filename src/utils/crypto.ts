// ブラウザ環境でのパスワード暗号化ユーティリティ

// SHA-256を使用したハッシュ関数
export const hashPassword = async (password: string, salt: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.prototype.map.call(hashArray, (b: number) => b.toString(16).padStart(2, '0')).join('');
};

// ランダムソルト生成
export const generateSalt = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.prototype.map.call(array, (byte: number) => byte.toString(16).padStart(2, '0')).join('');
};

// パスワード検証
export const verifyPassword = async (password: string, hash: string, salt: string): Promise<boolean> => {
  const inputHash = await hashPassword(password, salt);
  return inputHash === hash;
};

// 簡単なAES暗号化（localStorage用）
export const encryptData = async (data: string, password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const salt = generateSalt();
  
  // パスワードからキーを導出
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encoder.encode(data)
  );
  
  // salt + iv + encrypted data を結合
  const result = new Uint8Array(salt.length / 2 + iv.length + encrypted.byteLength);
  const saltBytes = new Uint8Array(salt.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  result.set(saltBytes);
  result.set(iv, saltBytes.length);
  result.set(new Uint8Array(encrypted), saltBytes.length + iv.length);
  
  const resultArray: number[] = [];
  for (let i = 0; i < result.length; i++) {
    resultArray.push(result[i]);
  }
  return btoa(String.fromCharCode.apply(null, resultArray));
};

// AES復号化
export const decryptData = async (encryptedData: string, password: string): Promise<string> => {
  try {
    const data = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // データを分割
    const salt = Array.prototype.map.call(data.slice(0, 32), (byte: number) => byte.toString(16).padStart(2, '0')).join('');
    const iv = data.slice(32, 44);
    const encrypted = data.slice(44);
    
    // パスワードからキーを導出
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted
    );
    
    return decoder.decode(decrypted);
  } catch (error) {
    throw new Error('復号化に失敗しました');
  }
};

// パスワード強度チェック
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  isValid: boolean;
} => {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('8文字以上にしてください');
  }
  
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('大文字を含めてください');
  }
  
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('小文字を含めてください');
  }
  
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('数字を含めてください');
  }
  
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('記号を含めてください');
  }
  
  return {
    score,
    feedback,
    isValid: score >= 3
  };
};