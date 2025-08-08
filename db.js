let db;
const request = indexedDB.open('WebCacheXDB', 1);

request.onsuccess = () => (db = request.result);
request.onupgradeneeded = e => {
  db = e.target.result;
  db.createObjectStore('cache', { keyPath: 'id' });
};

async function saveToDB(entry) {
  return new Promise(resolve => {
    const tx = db.transaction('cache', 'readwrite');
    const store = tx.objectStore('cache');
    store.put(entry);
    tx.oncomplete = resolve;
  });
}

async function getAllFromDB() {
  return new Promise(resolve => {
    const tx = db.transaction('cache', 'readonly');
    const store = tx.objectStore('cache');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
  });
}
