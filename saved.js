// 🌙 Dark/Light Theme Toggle
const htmlTag = document.documentElement;

if (localStorage.getItem("theme") === "dark") {
  htmlTag.classList.add("dark");
  htmlTag.setAttribute("data-theme", "dark");
} else {
  htmlTag.classList.remove("dark");
  htmlTag.setAttribute("data-theme", "light");
}
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("saved-container");
  const emptyMessage = document.getElementById("empty-message");

  const savedArticles = JSON.parse(localStorage.getItem("savedArticles")) || [];

  if (savedArticles.length === 0) {
    emptyMessage.classList.remove("hidden");
    return;
  }

  savedArticles.forEach(article => {
    const card = document.createElement("div");
    card.className = "bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition hover:shadow-lg card-animation";
    card.setAttribute("data-id", article.id);

    card.innerHTML = `
      <img src="${article.img}" alt="News Image" class="w-full h-48 object-cover" />
      <div class="p-4 flex flex-col gap-2">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-white">${article.title}</h2>
        <p class="text-sm text-gray-600 dark:text-gray-300">${article.desc}</p>
        <div class="flex items-center justify-between mt-2">
          <a href="${article.link}" class="text-sm text-blue-600 dark:text-blue-400 hover:underline" target="_blank">Read More</a>
          <button class="remove-btn text-xl text-red-500 hover:scale-110 transition">💔</button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  container.addEventListener("click", e => {
    if (e.target.classList.contains("remove-btn")) {
      const card = e.target.closest(".card-animation");
      const id = card.getAttribute("data-id");

      let saved = JSON.parse(localStorage.getItem("savedArticles")) || [];
      saved = saved.filter(article => article.id !== id);
      localStorage.setItem("savedArticles", JSON.stringify(saved));

      card.remove();

      if (saved.length === 0) {
        emptyMessage.classList.remove("hidden");
      }
    }
  });
});
