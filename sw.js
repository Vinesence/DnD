// SAVE AS sw.js
const CACHE_NAME = 'dnd-sheet-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(clients.claim());
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cached => {
      if (cached) return cached;
      return fetch(evt.request).then(resp => {
        // кешируем новые ресурсы
        return caches.open(CACHE_NAME).then(cache => {
          try { cache.put(evt.request, resp.clone()); } catch(e){}
          return resp;
        });
      }).catch(()=>{
        // fallback: если запрос был навигацией, отдаём index.html из кеша
        return caches.match('./index.html');
      });
    })
  );
});

function saveAttacks() {
  const data = [];
  document.querySelectorAll(".attack-row").forEach(row => {
    data.push({
      name: row.querySelector(".atk-name").value,
      bonus: row.querySelector(".atk-bonus").value,
      damage: row.querySelector(".atk-damage").value
    });
  });
  localStorage.setItem("dnd_attacks", JSON.stringify(data));
}

function loadAttacks() {
  const saved = localStorage.getItem("dnd_attacks");
  if (!saved) return;
  const data = JSON.parse(saved);
  data.forEach(a => addAttack(a.name, a.bonus, a.damage));
}

function addAttack(name = "", bonus = "", damage = "") {
  const container = document.getElementById("attacks");
  const row = document.createElement("div");
  row.className = "attack-row";
  row.style.display = "grid";
  row.style.gridTemplateColumns = "2fr 1fr 2fr auto";
  row.style.gap = "5px";
  row.style.marginBottom = "5px";

  row.innerHTML = `
    <input class="atk-name" placeholder="Название" value="${name}">
    <input class="atk-bonus" placeholder="Бонус" value="${bonus}">
    <input class="atk-damage" placeholder="Урон/Тип" value="${damage}">
    <button type="button" class="del-btn">❌</button>
  `;

  row.querySelectorAll("input").forEach(inp => inp.addEventListener("input", saveAttacks));
  row.querySelector(".del-btn").addEventListener("click", () => {
    row.remove();
    saveAttacks();
  });

  container.appendChild(row);
  saveAttacks();
}

window.addEventListener("DOMContentLoaded", loadAttacks);

