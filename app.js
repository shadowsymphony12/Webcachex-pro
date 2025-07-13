if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('SW registered'))
    .catch(console.error);
}

const statusEl = document.getElementById('status');
const urlInput = document.getElementById('urlInput');
const addUrlBtn = document.getElementById('addUrlBtn');
const pagesList = document.getElementById('pagesList');

function setStatus(msg) {
  statusEl.textContent = msg;
}

async function fetchAndStore(url) {
  setStatus(`Fetching ${url}...`);
  try {
    const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error('Fetch failed');
    const html = await res.text();
    await savePage({ url, html, timestamp: Date.now() });
    setStatus(`Cached ${url}`);
    renderList();
  } catch (err) {
    setStatus(`Error: ${err.message}`);
  }
}

function renderList() {
  getAllPages().then(pages => {
    pagesList.innerHTML = '';
    pages.forEach(p => {
      const li = document.createElement('li');
      const date = new Date(p.timestamp).toLocaleString();
      li.innerHTML = `
        <a href="#" data-url="${p.url}">${p.url}</a>
        <span> (cached: ${date})</span>
        <button data-del="${p.url}">🗑️</button>`;
      pagesList.appendChild(li);
    });
  });
}

pagesList.addEventListener('click', e => {
  if (e.target.dataset.url) {
    e.preventDefault();
    getAllPages().then(pages => {
      const page = pages.find(p => p.url === e.target.dataset.url);
      if (page) {
        const w = window.open();
        w.document.write(page.html);
      }
    });
  }
  if (e.target.dataset.del) {
    deletePage(e.target.dataset.del).then(renderList);
  }
});

addUrlBtn.addEventListener('click', () => {
  const url = urlInput.value.trim();
  if (url) fetchAndStore(url);
});

window.addEventListener('load', renderList);
