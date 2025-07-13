const dbName = 'webcachex-pro';
const storeName = 'pages';

function openDb() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(dbName, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'url' });
      }
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

async function savePage({ url, html, timestamp }) {
  const db = await openDb();
  const tx = db.transaction(storeName, 'readwrite');
  tx.objectStore(storeName).put({ url, html, timestamp });
  return tx.complete;
}

async function getAllPages() {
  const db = await openDb();
  return new Promise((res, rej) => {
    const req = db.transaction(storeName).objectStore(storeName).getAll();
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

async function deletePage(url) {
  const db = await openDb();
  const tx = db.transaction(storeName, 'readwrite');
  tx.objectStore(storeName).delete(url);
  return tx.complete;
}
