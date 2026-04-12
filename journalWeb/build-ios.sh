#!/bin/bash
set -euo pipefail

# ─── Цвета ───────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

step() { echo -e "\n${BLUE}▸${NC} ${BOLD}$1${NC}"; }
ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}!${NC} $1"; }
fail() { echo -e "\n${RED}✗ $1${NC}" >&2; exit 1; }

# ─── Проверка: macOS ─────────────────────────────────────
[[ "$(uname)" == "Darwin" ]] || fail "Этот скрипт только для macOS"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BOLD}"
echo "  ╔══════════════════════════════════════╗"
echo "  ║     Journal — сборка для iOS         ║"
echo "  ╚══════════════════════════════════════╝"
echo -e "${NC}"
echo "  Скрипт автоматически установит всё необходимое,"
echo "  соберёт проект и откроет его в Xcode."
echo ""

# ─── 1. Xcode ────────────────────────────────────────────
step "Проверка Xcode..."

if ! xcode-select -p &>/dev/null; then
    warn "Xcode Command Line Tools не найдены, устанавливаю..."
    xcode-select --install 2>/dev/null || true
    echo ""
    echo "  Откроется окно установки Xcode Command Line Tools."
    echo "  После завершения установки запустите этот скрипт снова."
    echo ""
    exit 0
fi
ok "Xcode Command Line Tools"

if ! [ -d "/Applications/Xcode.app" ]; then
    fail "Xcode не найден. Установите его из App Store:
    https://apps.apple.com/app/xcode/id497799835

    После установки запустите Xcode один раз,
    примите лицензию и запустите этот скрипт снова."
fi
ok "Xcode.app"

# Принять лицензию Xcode (если ещё не принята)
if ! /usr/bin/xcrun clang 2>&1 | grep -q "no input files"; then
    step "Принимаю лицензию Xcode (может потребоваться пароль)..."
    sudo xcodebuild -license accept 2>/dev/null || warn "Не удалось автоматически принять лицензию. Откройте Xcode вручную и примите."
fi

# ─── 2. Bun ──────────────────────────────────────────────
step "Проверка bun..."

if command -v bun &>/dev/null; then
    ok "bun $(bun --version)"
else
    warn "bun не найден, устанавливаю..."
    curl -fsSL https://bun.sh/install | bash
    # Добавить bun в PATH для текущей сессии
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"

    if command -v bun &>/dev/null; then
        ok "bun $(bun --version) установлен"
    else
        fail "Не удалось установить bun. Установите вручную: https://bun.sh"
    fi
fi

# ─── 3. Зависимости (node_modules) ──────────────────────
step "Установка зависимостей..."
bun install --frozen-lockfile 2>/dev/null || bun install
ok "Зависимости установлены"

# ─── 4. Сборка веб-приложения ────────────────────────────
step "Сборка веб-приложения..."
bun run build
ok "dist/ собран"

# ─── 5. Генерация иконок и сплеш-скринов ────────────────
step "Генерация ассетов iOS (иконки, сплеш)..."
bunx @capacitor/assets generate --ios 2>/dev/null && ok "Ассеты сгенерированы" || warn "Генерация ассетов пропущена (иконки уже на месте)"

# ─── 6. Синхронизация с iOS-проектом ─────────────────────
step "Синхронизация Capacitor → iOS..."
bunx cap sync ios
ok "iOS-проект синхронизирован"

# ─── 7. Открытие в Xcode ────────────────────────────────
step "Открываю проект в Xcode..."
open ios/App/App.xcodeproj

echo ""
echo -e "${GREEN}${BOLD}  ✓ Готово!${NC}"
echo ""
echo "  Что дальше в Xcode:"
echo "  ┌─────────────────────────────────────────────────┐"
echo "  │ 1. Выберите ваше устройство или симулятор       │"
echo "  │    (вверху, рядом с кнопкой ▶)                  │"
echo "  │                                                 │"
echo "  │ 2. Signing & Capabilities:                      │"
echo "  │    • Нажмите на «App» в навигаторе слева        │"
echo "  │    • Вкладка «Signing & Capabilities»           │"
echo "  │    • Поставьте галку «Automatically manage»     │"
echo "  │    • Выберите свой Apple ID как Team             │"
echo "  │      (Personal Team — бесплатный)               │"
echo "  │                                                 │"
echo "  │ 3. Нажмите ▶ (Cmd+R) для запуска                │"
echo "  └─────────────────────────────────────────────────┘"
echo ""
echo "  Примечание: для установки на реальное устройство"
echo "  без Apple Developer аккаунта (\$99/год) приложение"
echo "  будет работать 7 дней, после чего нужно пересобрать."
echo ""
