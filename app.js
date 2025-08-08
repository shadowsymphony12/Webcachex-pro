document.addEventListener('DOMContentLoaded', () => {
  // Dark Mode Toggle
  document.getElementById('toggle-theme').onclick = () => {
    document.body.classList.toggle('dark');
  };

  // Cache Button
  document.getElementById('cache-btn').onclick = async () => {
    const input = document.getElementById('url-input').value.trim();
    if (!input) return;

    let content = '';
    try {
      if (input.startsWith('http')) {
        const res = await fetch(input);
        content = await res.text();
      } else {
        content = input;
      }

      const entry = { id: Date.now(), content };
      await saveToDB(entry);
      displayContent(entry);
    } catch (err) {
      alert('Error fetching content.');
      console.error(err);
    }
  };

  // Export ZIP Button
  document.getElementById('export-btn').onclick = async () => {
    const zip = new JSZip();
    const all = await getAllFromDB();
    all.forEach((item, i) => zip.file(entry-${i + 1}.html, item.content));
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'webcachex-backup.zip';
    a.click();
  };

  // Load saved content on startup
  window.onload = async () => {
    const all = await getAllFromDB();
    all.forEach(displayContent);
  };
});

function displayContent(entry) {
  const div = document.getElementById('content-display');
  const el = document.createElement('div');
  el.innerHTML = <hr><h3>Cached Entry</h3><div>${entry.content}</div>;
  div.prepend(el);
}
