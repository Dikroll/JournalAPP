/**
 * Утилита для определения платформы.
 *
 * VITE_PLATFORM задаётся при сборке:
 *   - "web"    → сборка для веб-сайта (Docker / Dockploy)
 *   - не задан → мобильное приложение (Capacitor)
 *
 * Vite заменяет import.meta.env.VITE_PLATFORM на строковый литерал
 * во время сборки, поэтому мёртвые ветки полностью вырезаются
 * из итогового бандла (tree-shaking).
 */
import { Capacitor } from "@capacitor/core";

export const isWebPlatform = import.meta.env.VITE_PLATFORM === "web" && !Capacitor.isNativePlatform();

export const isNativePlatform = Capacitor.isNativePlatform();
