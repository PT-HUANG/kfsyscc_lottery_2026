/**
 * IndexedDB 图片存储工具
 * 用于在浏览器本地存储自定义背景图片
 */

const DB_NAME = "LotteryImageDB";
const STORE_NAME = "backgroundImages";
const DB_VERSION = 1;
const IMAGE_KEY = "customBackground";

interface StoredImage {
  key: string;
  blob: Blob;
  width: number;
  height: number;
  aspectRatio: number;
  uploadedAt: number;
}

/**
 * 初始化 IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
  });
}

/**
 * 获取图片尺寸
 */
function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("无法加载图片"));
    };

    img.src = url;
  });
}

/**
 * 保存背景图片到 IndexedDB
 */
export async function saveBackgroundImage(file: File): Promise<void> {
  // 验证文件类型
  if (!file.type.startsWith("image/")) {
    throw new Error("请上传图片文件（PNG, JPG, JPEG, WebP）");
  }

  // 验证文件大小（限制 10MB）
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("图片文件太大，请上传小于 10MB 的图片");
  }

  // 获取图片尺寸
  const { width, height } = await getImageDimensions(file);
  const aspectRatio = width / height;

  // 存储图片
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  const imageData: StoredImage = {
    key: IMAGE_KEY,
    blob: file,
    width,
    height,
    aspectRatio,
    uploadedAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const request = store.put(imageData);
    request.onsuccess = () => {
      db.close();
      resolve();
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

/**
 * 从 IndexedDB 读取背景图片
 */
export async function getBackgroundImage(): Promise<StoredImage | null> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.get(IMAGE_KEY);
    request.onsuccess = () => {
      db.close();
      resolve(request.result || null);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

/**
 * 删除背景图片
 */
export async function deleteBackgroundImage(): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.delete(IMAGE_KEY);
    request.onsuccess = () => {
      db.close();
      resolve();
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

/**
 * 将 Blob 转换为 Data URL（用于 Three.js texture）
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
