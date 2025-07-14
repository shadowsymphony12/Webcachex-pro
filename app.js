async function cacheURL() {
  const url = document.getElementById("urlInput").value;
  const output = document.getElementById("output");
  output.innerText = "Caching...";

  try {
    const response = await fetch(url);
    const content = await response.text();
    await savePage(url, content);
    output.innerText = "Page cached successfully!";
  } catch (err) {
    output.innerText = "Error fetching the page.";
    console.error(err);
  }
}

async function viewCachedPages() {
  const output = document.getElementById("output");
  const pages = await getAllPages();
  output.innerHTML = "<h3>Cached Pages:</h3>";

  if (pages.length === 0) {
    output.innerHTML += "<p>No cached pages found.</p>";
    return;
  }

  pages.forEach(p => {
    output.innerHTML += `
      <div style="margin-bottom: 20px;">
        <strong>${p.url}</strong>
        <textarea rows="10" cols="80">${p.content}</textarea>
        <br/>
        <button onclick="deletePage('${p.url}')">Delete</button>
      </div>
    `;
  });
}

async function clearAllPages() {
  await clearAllStoredPages();
  document.getElementById("output").innerText = "All pages cleared.";
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
