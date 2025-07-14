async function cacheURL() {
  const url = document.getElementById("urlInput").value;
  const output = document.getElementById("output");
  output.innerText = "Caching...";

  try {
    const response = await fetch(url);
    const content = await response.text();
    localStorage.setItem(url, content);
    output.innerText = "Cached successfully!";
  } catch (err) {
    output.innerText = "Error: Failed to fetch";
    console.error(err);
  }
}

function viewCachedPages() {
  const output = document.getElementById("output");
  output.innerHTML = "<h3>Cached Pages:</h3>";

  if (localStorage.length === 0) {
    output.innerHTML += "No pages cached.";
    return;
  }

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    output.innerHTML += <p><strong>${key}</strong><br/><textarea rows="8" cols="80">${localStorage.getItem(key)}</textarea></p>;
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
