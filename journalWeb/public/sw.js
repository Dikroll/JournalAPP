/**
 * Service Worker для PWA.
 *
 * Стратегия: Network-First с offline-fallback.
 * - Всегда пытаемся загрузить из сети (свежие данные).
 * - Если сеть недоступна — отдаём кэшированную версию.
 * - При установке кэшируем app shell (HTML, иконки).
 */

const CACHE_NAME = "journal-v1";

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

// Fetch: Network-First для навигации, Cache-First для статики
self.addEventListener("fetch", (event) => {
	const { request } = event;

	// Пропускаем не-GET запросы и API
	if (request.method !== "GET" || request.url.includes("/api/")) {
		return;
	}

	// Навигация (HTML) — Network-First
	if (request.mode === "navigate") {
		event.respondWith(
			fetch(request)
				.then((response) => {
					const clone = response.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
					return response;
				})
				.catch(() => caches.match("/index.html")),
		);
		return;
	}

	// Статика (JS, CSS, иконки, шрифты) — Cache-First
	event.respondWith(
		caches.match(request).then((cached) => {
			if (cached) return cached;
			return fetch(request).then((response) => {
				// Кэшируем только успешные ответы и только http/https (чтобы избежать ошибки chrome-extension)
				if (response.ok && request.url.startsWith('http')) {
					const clone = response.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
				}
				return response;
			});
		}),
	);
});
