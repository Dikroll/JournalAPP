/**
 * Service Worker для PWA.
 *
 * Стратегия: Network-First с offline-fallback.
 * - Всегда пытаемся загрузить из сети (свежие данные).
 * - Если сеть недоступна — отдаём кэшированную версию.
 * - При установке кэшируем app shell (HTML, иконки).
 */

const CACHE_NAME = "journal-v2";

// App shell — минимум файлов для работы offline
const APP_SHELL = ["/", "/index.html"];

// Установка: кэшируем app shell
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
	);
	self.skipWaiting();
});

// Активация: чистим старые кэши
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(
				keys
					.filter((key) => key !== CACHE_NAME)
					.map((key) => caches.delete(key)),
			),
		),
	);
	self.clients.claim();
});

// Fetch: Network-First для навигации и JS/CSS, Cache-First для медиа
self.addEventListener("fetch", (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Пропускаем не-GET запросы и API
	if (request.method !== "GET" || request.url.includes("/api/")) {
		return;
	}

	// Vite/dev-server ресурсы не должны попадать в PWA cache.
	if (
		url.pathname.startsWith("/src/") ||
		url.pathname.startsWith("/@vite") ||
		url.pathname.startsWith("/@react-refresh") ||
		url.pathname.startsWith("/node_modules/")
	) {
		return;
	}

	// Навигация (HTML) — Network-First
	if (request.mode === "navigate") {
		event.respondWith(
			fetch(request, { cache: "no-store" })
				.then((response) => {
					const clone = response.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", clone));
					return response;
				})
				.catch(() => caches.match("/index.html")),
		);
		return;
	}

	// JS/CSS должны проверяться в сети первыми, иначе после pull/deploy
	// браузер может продолжать отдавать старые чанки из cache storage.
	if (
		request.destination === "script" ||
		request.destination === "style" ||
		url.pathname.endsWith(".js") ||
		url.pathname.endsWith(".css")
	) {
		event.respondWith(
			fetch(request, { cache: "no-store" })
				.then((response) => {
					if (response.ok && url.protocol.startsWith("http")) {
						const clone = response.clone();
						caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
					}
					return response;
				})
				.catch(() => caches.match(request)),
		);
		return;
	}

	// Медиа и иконки — Cache-First
	event.respondWith(
		caches.match(request).then((cached) => {
			if (cached) return cached;
			return fetch(request).then((response) => {
				// Кэшируем только успешные ответы и только http/https (чтобы избежать ошибки chrome-extension)
				if (response.ok && url.protocol.startsWith("http")) {
					const clone = response.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
				}
				return response;
			});
		}),
	);
});
