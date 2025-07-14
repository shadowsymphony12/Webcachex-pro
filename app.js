// Detect dark mode toggle
document.getElementById("toggleTheme").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

// Apply saved theme on load
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }
});

// Handle URL caching
async function cacheURL() {
  const url = document.getElementById("urlInput").value.trim();
  const output = document.getElementById("output");
  output.innerText = "Fetching and caching...";

  try {
    const response = await fetch(url);
    const contentType = response.headers.get("Content-Type");
    const blob = await response.blob();

    if (contentType.includes("text/html")) {
      const text = await blob.text();
      await savePage(url, text);
    } else {
      await savePage(url, { blob, type: contentType });
    }

    output.innerText = "✅ Cached successfully!";
  } catch (err) {
    output.innerText = "❌ Error fetching the page.";
    console.error(err);
  }
}

// Display all cached content
async function viewCachedPages() {
  const output = document.getElementById("output");
  const pages = await getAllPages();
  output.innerHTML = "<h3>📦 Cached Pages:</h3>";

  if (!pages.length) {
    output.innerHTML += "<p>No cached content yet.</p>";
    return;
  }

  for (const p of pages) {
    const container = document.createElement("div");
    container.style.marginBottom = "20px";

    const title = document.createElement("strong");
    title.innerText = p.url;
    container.appendChild(title);

    container.appendChild(document.createElement("br"));

    if (typeof p.content === "string") {
      // Text/HTML content
      const ta = document.createElement("textarea");
      ta.rows = 10;
      ta.value = p.content;
      container.appendChild(ta);
    } else if (p.content.blob && p.content.type) {
      const fileURL = URL.createObjectURL(new Blob([p.content.blob]));
      if (p.content.type.includes("pdf")) {
        const pdfLink = document.createElement("a");
        pdfLink.href = fileURL;
        pdfLink.innerText = "Open PDF";
        pdfLink.target = "_blank";
        container.appendChild(pdfLink);
      } else if (p.content.type.includes("image")) {
        const img = document.createElement("img");
        img.src = fileURL;
        img.style.maxWidth = "100%";
        container.appendChild(img);
      } else if (p.content.type.includes("video")) {
        const vid = document.createElement("video");
        vid.src = fileURL;
        vid.controls = true;
        vid.style.maxWidth = "100%";
        container.appendChild(vid);
      } else {
        const download = document.createElement("a");
        download.href = fileURL;
        download.download = "cached-file";
        download.innerText = "Download File";
        container.appendChild(download);
      }
    }

    container.appendChild(document.createElement("br"));
    const delBtn = document.createElement("button");
    delBtn.innerText = "🗑 Delete";
    delBtn.onclick = async () => {
      await deletePage(p.url);
      viewCachedPages();
    };
    container.appendChild(delBtn);

    output.appendChild(container);
  }
}

// Clear everything
async function clearAllPages() {
  await clearAllStoredPages();
  document.getElementById("output").innerText = "All cached data cleared.";
}

// Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
