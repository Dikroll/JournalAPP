# Changelog

Все заметные изменения этого проекта будут документированы в этом файле.

## [Unreleased]

## Sun 5 Apr.

### Added

#### Photo Viewer Feature

- Создан новый хук `usePhotoViewer()` в `src/shared/hooks/usePhotoViewer.tsx` для переиспользуемой логики просмотра фотографий
  - Управляет состоянием открытости модали
  - Методы: `open(src, alt)`, `close()`, `renderModal(src, alt)`
  - Возвращает портал с `PhotoViewerModal`
- Добавлена функционалость просмотра фотографий аватарок в:
  - `src/widgets/Profile/ProfileHeader/ui/ProfileHeader.tsx` - фото профиля в шапке
  - `src/widgets/Profile/ProfileDetails/ui/ProfileAvatar.tsx` - фото в карточке профиля
  - `src/widgets/Leaderboard/ui/LeaderboardRow.tsx` - аватары в лидерборде

#### Library Store Enhancement

- Добавлены глобальные поля в `useLibraryStore`:
  - `status: LoadingState` - статус загрузки ('idle' | 'loading' | 'success' | 'error')
  - `error: string | null` - сообщение об ошибке

- Добавлены методы в `useLibraryStore`:
  - `setStatus(s: LoadingState)` - установка статуса загрузки
  - `setGlobalError(msg: string | null)` - установка глобальной ошибки

### Changed

#### Library Hook Updates

- `useLibrary()` теперь устанавливает глобальный `status` при загрузке материалов:
  - При старте: `setStatus('loading')`
  - На успех: `setStatus('success')`
  - На ошибку: `setStatus('error')`

- Обновлена архитектура управления состоянием libraryStore для совместимости с паттерном homework

#### Refresh Library Hook

- `useRefreshLibrary()` переписан для использования глобального `status`:
  - Был: `status === 'loading'` из комбинации `selectedSpecId`, `selectedMaterialType`
  - Теперь: `status === 'loading'` прямо из store
  - Упрощена логика благодаря унификации с homework архитектурой

### Technical Details

- **Pattern Unification**: Library и Homework теперь используют одинаковую архитектуру управления загрузкой
- **Code Reusability**: Photo viewer логика централизована в хуке, исключено дублирование кода
- **State Management**: Глобальный статус упрощает отслеживание состояния загрузки для UI компонентов

---

## Notes

- Все изменения сосредоточены на улучшении архитектуры и переиспользуемости кода
- Удалено дублирование логики просмотра фотографий
- Архитектура library унифицирована с homework паттерном
