// 🌙 Theme toggle
document.getElementById("toggleTheme").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

// Load saved theme
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }
});

// 🔄 Fetch and cache logic
async function cacheURL() {
  const url = document.getElementById("urlInput").value.trim();
  const output = document.getElementById("output");
  output.innerText = "Fetching and caching...";

  try {
    const result = await fetchPageContent(url);

    if (typeof result === "string") {
      await savePage(url, result);
    } else {
      await savePage(url, { blob: result, type: result.type });
    }

    output.innerText = "✅ Cached successfully!";
  } catch (err) {
    output.innerText = ❌ Error: ${err.message};
    console.error(err);
  }
}

// 🌐 Intelligent fetch based on type
async function fetchPageContent(url) {
  // Handle Wikipedia with CORS proxy
  if (url.includes("wikipedia.org/wiki")) {
    const proxy = https://api.allorigins.win/raw?url=${encodeURIComponent(url)};
    const res = await fetch(proxy);
    if (!res.ok) throw new Error("Wikipedia fetch failed");
    return await res.text();
  }

  // Normal fetch
  const res = await fetch(url);
  if (!res.ok) throw new Error("Fetch failed");

  const type = res.headers.get("Content-Type") || "";

  if (type.includes("text/html")) {
    return await res.text();
  } else {
    return await res.blob(); // for files like PDF, image, video
  }
}

// 📦 Display all cached content
async function viewCachedPages() {
  const output = document.getElementById("output");
  const pages = await getAllPages();
  output.innerHTML = "<h3>📦 Cached Pages:</h3>";

  if (!pages.length) {
    output.innerHTML += "<p>No cached content yet.</p>";
    return;
  }

  for (const p of pages) {
    const box = document.createElement("div");
    box.style.marginBottom = "20px";

    const title = document.createElement("strong");
    title.innerText = p.url;
    box.appendChild(title);
    box.appendChild(document.createElement("br"));

    if (typeof p.content === "string") {
      const ta = document.createElement("textarea");
      ta.rows = 10;
      ta.value = p.content;
      box.appendChild(ta);
    } else if (p.content.blob && p.content.type) {
      const blob = new Blob([p.content.blob], { type: p.content.type });
      const fileURL = URL.createObjectURL(blob);

      if (p.content.type.includes("pdf")) {
        const link = document.createElement("a");
        link.href = fileURL;
        link.textContent = "📄 Open PDF";
        link.target = "_blank";
        box.appendChild(link);
      } else if (p.content.type.includes("image")) {
        const img = document.createElement("img");
        img.src = fileURL;
        img.style.maxWidth = "100%";
        box.appendChild(img);
      } else if (p.content.type.includes("video")) {
        const vid = document.createElement("video");
        vid.src = fileURL;
        vid.controls = true;
        vid.style.maxWidth = "100%";
        box.appendChild(vid);
      } else {
        const download = document.createElement("a");
        download.href = fileURL;
        download.download = "cached-file";
        download.textContent = "⬇️ Download File";
        box.appendChild(download);
      }
    }

    // 🗑 Delete button
    const del = document.createElement("button");
    del.innerText = "🗑 Delete";
    del.onclick = async () => {
      await deletePage(p.url);
      viewCachedPages();
    };

    box.appendChild(document.createElement("br"));
    box.appendChild(del);
    output.appendChild(box);
  }
}

// 🧼 Clear all pages
async function clearAllPages() {
  await clearAllStoredPages();
  document.getElementById("output").innerText = "🧹 All cached pages cleared.";
}

// ⚙️ Service worker registration
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
