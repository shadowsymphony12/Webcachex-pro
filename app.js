// 🌙 Dark Mode Toggle
document.getElementById("toggleTheme").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }
});

// 🔄 Cache any URL with CORS support
async function cacheURL() {
  const url = document.getElementById("urlInput").value.trim();
  const output = document.getElementById("output");
  output.innerText = "Fetching and caching...";

  if (!url) {
    output.innerText = "❌ Please enter a valid URL.";
    return;
  }

  try {
    const result = await fetchPageThroughProxy(url);

    if (typeof result === "string") {
      await savePage(url, result); // HTML/text
    } else {
      await savePage(url, { blob: result.blob, type: result.type }); // File
    }

    output.innerText = "✅ Cached successfully!";
  } catch (err) {
    output.innerText = ❌ Error: ${err.message};
    console.error(err);
  }
}

// 🔗 Fetch page content through CORS proxy
async function fetchPageThroughProxy(url) {
  const proxy = "https://thingproxy.freeboard.io/fetch/" + encodeURIComponent(url);
  const response = await fetch(proxy);

  if (!response.ok) throw new Error("Failed to fetch through CORS proxy");

  const contentType = response.headers.get("Content-Type") || "";

  if (contentType.includes("text/html") || contentType.includes("text/plain")) {
    return await response.text(); // HTML content
  } else {
    const blob = await response.blob(); // Binary content
    return { blob, type: contentType };
  }
}

// 📂 View cached pages
async function viewCachedPages() {
  const output = document.getElementById("output");
  const pages = await getAllPages();
  output.innerHTML = "<h3>📦 Cached Pages:</h3>";

  if (!pages.length) {
    output.innerHTML += "<p>No cached pages found.</p>";
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

    // 🗑 Delete Button
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

// 🧼 Clear all cached data
async function clearAllPages() {
  await clearAllStoredPages();
  document.getElementById("output").innerText = "🧹 All cached data cleared.";
}

// ⚙️ Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
