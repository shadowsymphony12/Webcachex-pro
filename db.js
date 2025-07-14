const dbName = "WebCacheXDB";
const storeName = "pages";

function getDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onerror = () => reject("Failed to open DB");
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      db.createObjectStore(storeName, { keyPath: "url" });
    };
  });
}

async function savePage(url, content) {
  const db = await getDB();
  const tx = db.transaction(storeName, "readwrite");
  tx.objectStore(storeName).put({ url, content });
  return tx.complete;
}

async function getAllPages() {
  const db = await getDB();
  const tx = db.transaction(storeName, "readonly");
  return new Promise((resolve, reject) => {
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject("Failed to get data");
  });
}

async function deletePage(url) {
  const db = await getDB();
  const tx = db.transaction(storeName, "readwrite");
  tx.objectStore(storeName).delete(url);
  return tx.complete;
}

async function clearAllStoredPages() {
  const db = await getDB();
  const tx = db.transaction(storeName, "readwrite");
  tx.objectStore(storeName).clear();
  return tx.complete;
}
