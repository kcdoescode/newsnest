// 🌙 Dark/Light Theme Toggle
const themeToggle = document.getElementById("theme-toggle");
const htmlTag = document.documentElement;

if (localStorage.getItem("theme") === "dark") {
  htmlTag.classList.add("dark");
  htmlTag.setAttribute("data-theme", "dark");
} else {
  htmlTag.classList.remove("dark");
  htmlTag.setAttribute("data-theme", "light");
}

themeToggle.addEventListener("click", () => {
  htmlTag.classList.toggle("dark");
  const isDark = htmlTag.classList.contains("dark");
  htmlTag.setAttribute("data-theme", isDark ? "dark" : "light");
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// 📡 GNews API Setup
const API_KEY = "9819a423b6539f1daf829df6ec1b23cb";
const newsContainer = document.getElementById("news-container");

// 📰 Fetch & Display News
async function fetchNews(query = "top headlines") {
  try {
    showLoadingPlaceholders(); // ✨ shimmer while loading
    await new Promise(r => setTimeout(r, 1000)); // 1 sec delay before fetching

    newsContainer.innerHTML = "";

    // ----------------------------------------------------
    // 🔑 START OF CORS FIX (Changes are here)
    // ----------------------------------------------------

    // 1. Construct the original GNews URL
    const originalGNewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=9&apikey=${API_KEY}`;

    // 2. Wrap the GNews URL with the allOrigins proxy and encode it
    // This bypasses the CORS block on your live link.
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(originalGNewsUrl)}`;

    const res = await fetch(proxyUrl); // Use the PROXY URL
    const proxyData = await res.json(); // Get the proxy's wrapper response

    // Check for proxy-level errors or if contents property is missing
    if (!proxyData.contents) {
      throw new Error("Could not retrieve contents from proxy. Check network status.");
    }

    // 3. Parse the 'contents' string to get the actual news JSON object
    const data = JSON.parse(proxyData.contents);

    // ----------------------------------------------------
    // 🔑 END OF CORS FIX
    // ----------------------------------------------------

    if (!data.articles || data.articles.length === 0) {
      newsContainer.innerHTML = `<p class="text-gray-500 dark:text-gray-300 col-span-full">No articles found 😞</p>`;
      return;
    }

    data.articles.forEach(article => createCard(article));
  } catch (err) {
    newsContainer.innerHTML = `<p class="text-red-500 col-span-full">Error fetching news!</p>`;
    console.error("News fetch error:", err);
  }
}
// 🗂 Category Button Clicks
document.querySelectorAll(".category-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const category = btn.getAttribute("data-category");
    if (category) {
      fetchNews(category);
    }
  });
});
function showLoadingPlaceholders(count = 6) {
  newsContainer.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const placeholder = document.createElement("div");
    placeholder.className = "bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 card-animation";

    placeholder.innerHTML = `
      <div class="w-full h-48 bg-gray-300 dark:bg-gray-700 shimmer rounded-md mb-4"></div>
      <div class="h-5 bg-gray-300 dark:bg-gray-700 shimmer rounded w-3/4 mb-2"></div>
      <div class="h-4 bg-gray-300 dark:bg-gray-700 shimmer rounded w-full mb-2"></div>
      <div class="h-4 bg-gray-300 dark:bg-gray-700 shimmer rounded w-5/6"></div>
    `;

    newsContainer.appendChild(placeholder);
  }
}

// 🧱 Create News Card
function createCard(article) {
  const savedArticles = JSON.parse(localStorage.getItem("savedArticles")) || [];
  const articleId = article.url;

  const alreadySaved = savedArticles.some(item => item.id === articleId);

  const card = document.createElement("div");
  card.className = "bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition hover:shadow-lg card-animation";
  card.setAttribute("data-id", articleId);

  card.innerHTML = `
    <img src="${article.image || 'https://source.unsplash.com/random/600x300?news'}"
         alt="News Image" class="w-full h-48 object-cover" />
    <div class="p-4 flex flex-col gap-2">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-white">${article.title}</h2>
      <p class="text-sm text-gray-600 dark:text-gray-300">${article.description || "No description available."}</p>
      <div class="flex items-center justify-between mt-2">
        <a href="${article.url}" target="_blank" class="text-sm text-blue-600 hover:underline dark:text-blue-400">Read More</a>
        <button class="save-btn text-xl hover:scale-110 transition">
          ${alreadySaved ? '<span class="text-red-500">❤️</span>' : '<span class="text-gray-400">♡</span>'}
        </button>
      </div>
    </div>
  `;

  newsContainer.appendChild(card);
  attachSaveLogic(card); // ✅ attach heart logic
}

// 💖 Save/Unsave Logic (applied per card)
function attachSaveLogic(card) {
  const saveBtn = card.querySelector(".save-btn");
  const articleId = card.getAttribute("data-id");
  const title = card.querySelector("h2").textContent;
  const desc = card.querySelector("p").textContent;
  const img = card.querySelector("img").src;
  const link = card.querySelector("a").href;

  saveBtn.addEventListener("click", () => {
    let saved = JSON.parse(localStorage.getItem("savedArticles")) || [];

    if (saved.find(item => item.id === articleId)) {
      saved = saved.filter(item => item.id !== articleId);
      saveBtn.innerHTML = '<span class="text-gray-400">♡</span>';
      showToast("Removed from Saved");
    } else {
      saved.push({ id: articleId, title, desc, img, link });
      saveBtn.innerHTML = '<span class="text-red-500">❤️</span>';
      showToast("Article Saved!");
    }

    localStorage.setItem("savedArticles", JSON.stringify(saved));
  });
}

// 🔍 Search Bar
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query !== "") {
    fetchNews(query);
  }
});

// 🔔 Toast Notification
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2000);
}

// ⬆️ Back to Top Button
const backToTop = document.getElementById("backToTop");
if (backToTop) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTop.classList.remove("hidden");
    } else {
      backToTop.classList.add("hidden");
    }
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
// 🧠 Category Button Logic (Active State)
document.querySelectorAll(".category-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    // Remove active styles from all buttons
    document.querySelectorAll(".category-btn").forEach(b => {
      b.classList.remove("bg-blue-600", "text-white");
      b.classList.add("bg-gray-100", "dark:bg-gray-800", "text-gray-800", "dark:text-white");
    });

    // Add active styles to the clicked button
    btn.classList.add("bg-blue-600", "text-white");
    btn.classList.remove("bg-gray-100", "dark:bg-gray-800", "text-gray-800", "dark:text-white");

    // Fetch news for that category
    const category = btn.textContent.trim();
    fetchNews(category);
  });
});

// 🚀 Initial Load
fetchNews();