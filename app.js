if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(() => {
    console.log('Service Worker Registered');
  });
}

async function syncContent() {
  if (navigator.onLine) {
    const response = await fetch('https://example.com/data'); // Could be any API
    const data = await response.text();

    localStorage.setItem('offlineData', data);
    document.getElementById('content').innerHTML = data;
  } else {
    const offlineData = localStorage.getItem('offlineData');
    document.getElementById('content').innerHTML = offlineData || 'No data available offline';
  }
}
