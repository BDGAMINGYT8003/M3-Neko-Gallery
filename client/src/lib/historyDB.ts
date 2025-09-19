import { openDB, DBSchema } from 'idb';
import type { GalleryImage } from '../pages/Gallery';

const DB_NAME = 'neko-gallery-history';
const STORE_NAME = 'viewed-images';
const MAX_HISTORY_ITEMS = 50;

interface HistoryDB extends DBSchema {
  [STORE_NAME]: {
    key: string;
    value: GalleryImage & { timestamp: number };
  };
}

const dbPromise = openDB<HistoryDB>(DB_NAME, 1, {
  upgrade(db) {
    const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
    store.createIndex('timestamp', 'timestamp');
  },
});

export async function addImageToHistory(image: GalleryImage) {
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  // Add a timestamp to the image object
  const imageWithTimestamp = { ...image, timestamp: Date.now() };

  // Add the new image
  await store.put(imageWithTimestamp);

  // Enforce the history limit
  const count = await store.count();
  if (count > MAX_HISTORY_ITEMS) {
    let cursor = await store.index('timestamp').openCursor();
    if (cursor) {
      await store.delete(cursor.primaryKey);
    }
  }

  await tx.done;
}

export async function getHistory(): Promise<GalleryImage[]> {
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const allItems = await store.getAll();
  // Sort by timestamp descending to get the most recent items first
  return allItems.sort((a, b) => b.timestamp - a.timestamp);
}
