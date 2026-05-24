# JournalAPP Source Code Structure

Complete breakdown of all TypeScript/TSX files with exports and function signatures.

---

## Application Entry Points

### `src/main.tsx`

**Exports:** Direct React app initialization (no named exports)
**Functions:**

- Mounts React app on DOM element with id="root"
- Imports CSS styles and App component

### `src/app/App.tsx`

**Exports:** `App` component
**Functions:**

- `App()`: Main application component (theme toggle + router)
- Uses: `useInitUser()`, `useState()`
- Features: Dark/Light theme toggle button, AppRouter integration

### `src/app/router/index.tsx`

**Exports:** `AppRouter` component
**Functions:**

- `AppRouter()`: Main routing component with protected/public routes
- `ProtectedRoute({ children })`: Wrapper for authenticated routes
- `PublicRoute({ children })`: Wrapper for login/public routes
- Uses: `useAuthStore()`, `useHydrationStore()`, `react-router-dom`

### `src/app/hooks/index.ts`

**Exports:** `useMidnightRefresh`

### `src/app/hooks/useMidnightRefresh.ts`

**Exports:** `useMidnightRefresh` hook
**Function Signature:**

```typescript
useMidnightRefresh(): void
```

**Functionality:**

- Handles daily data invalidation at midnight
- Monitors visibility changes
- Auto-refreshes grades and schedule data

---

## ENTITIES - Core Business Logic

### Entity: Exam (`src/entities/exam/`)

#### `index.ts`

**Exports:**

- Hook: `useExamResults`
- Hook: `useFutureExams`
- Types: `ExamResult`, `FutureExamItem`

#### `hooks/useFutureExams.ts`

**Function Signature:**

```typescript
useFutureExams(): {
  exams: FutureExamItem[]
  status: LoadingState
}
```

**Features:** Caches with TTL, manages loading state

#### `model/store.ts`

**Exports:** `useExamStore` (Zustand store)
**State:** exams, status, loadedAt, setters

---

### Entity: Grades (`src/entities/grades/`)

#### `index.ts`

**Exports:**

- Hooks: `useGrades`, `useGradesBySubject`, `useGradesGroups`
- Store: `useGradesStore`
- Config: `getGradeColor`, `getGradeStyle`, `GRADE_TYPE_CONFIG`, `gradeCircleStyle`
- Utils: `getGradeDotColor`, `sortSubjects`
- Types: `GradeEntry`, `GradeEntryExpanded`, `SubjectStats`, `SortKey`, `GradeTypeStyle`

#### `hooks/useGrades.ts`

**Function Signature:**

```typescript
useGrades(): {
  entries: GradeEntry[]
  status: LoadingState
  error: string | null
  refresh(): Promise<void>
}
```

**Features:**

- Fetch all grades with caching
- Cache with TTL (ACTIVITY duration)
- Auto-refresh capability

#### `hooks/useGradesBySubject.ts`

**Function Signature:**

```typescript
useGradesBySubject(specId: number): {
  entries: GradeEntry[]
  status: LoadingState
  error: string | null
}
```

#### `hooks/useGradesGroups.ts`

**Function Signature:**

```typescript
useGradesGroups(): {
  groups: Record<string, GradeEntry[]>
  status: LoadingState
}
```

#### `model/store.ts`

**Exports:** `useGradesStore` (Zustand store)
**State:**

```typescript
interface GradesState {
  entries: GradeEntry[]
  status: LoadingState
  error: string | null
  loadedAt: number | null
  bySubject: Record<number, SubjectData>
  update(patch: Partial<...>): void
  updateSubject(specId: number, patch: Partial<SubjectData>): void
  reset(): void
}
```

---

### Entity: Homework (`src/entities/homework/`)

#### `index.ts`

**Exports:**

- API: `homeworkApi`
- Hooks: `useHomework`, `useHomeworkBySubject`, `useHomeworkGroups`
- Store: `useHomeworkStore`
- Config: `getGradeStyle`, `STATUS_CONFIG`, `STATUS_KEY_MAP`, `STATUS_MAP`, `STATUS_ORDER`
- Types: `GroupData`, `HomeworkItem`, `HomeworkItemWithStatus`, `HomeworkStatus`, `UploadFileResponse`, `HomeworkCounters`, `SubjectData`

#### `hooks/useHomework.ts`

**Function Signature:**

```typescript
useHomework(): {
  items: Record<number, HomeworkItem[]>
  status: LoadingState
  error: string | null
  counters: HomeworkCounters | null
  filterStatus: HomeworkStatus | null
  expandedStatuses: Set<number>
  loadAll(force?: boolean): Promise<void>
  loadMore(statusKey: number): Promise<void>
  toggleExpanded(statusKey: number): void
  setFilter(status: HomeworkStatus | null): void
  refresh(): Promise<void>
}
```

#### `hooks/useHomeworkBySubject.ts`

**Function Signature:**

```typescript
useHomeworkBySubject(specId: number): SubjectData & {
  loadMore(statusKey: number): Promise<void>
  toggleExpanded(statusKey: number): void
}
```

#### `hooks/useHomeworkGroups.ts`

**Function Signature:**

```typescript
useHomeworkGroups(): {
  groups: Record<number, HomeworkItem[]>
  status: LoadingState
  error: string | null
}
```

#### `configs/homeworkConfig.ts`

**Exports:**

- `STATUS_CONFIG`: Record mapping status keys to configuration
- `STATUS_MAP`: Status display names
- `STATUS_ORDER`: Array of status keys in order
- `STATUS_KEY_MAP`: Status string to key mapping
- `getGradeStyle(status)`: Returns CSS for status

#### `model/store.ts`

**Exports:** `useHomeworkStore` (Zustand store)
**Constants:** `PREVIEW_SIZE = 6`, `PAGE_SIZE = 6`
**State:**

```typescript
interface HomeworkState {
	items: Record<number, HomeworkItem[]>
	pages: Record<number, number>
	expandedStatuses: Set<number>
	counters: HomeworkCounters | null
	status: LoadingState
	error: string | null
	filterStatus: HomeworkStatus | null
	loadedAt: number | null
	knownSpecs: Array<{ specId: number; specName: string }>
	subjects: Record<number, SubjectData>
	// 15+ setter methods
}
```

---

### Entity: Dashboard (`src/entities/dashboard/`)

#### `index.ts`

**Exports:**

- Hooks: `useDashboardCharts`, `useGradesCharts`
- Store: `useDashboardChartsStore`
- Utils: `calcTrend`, `lastValue`, `toChartData`
- Types: `ChartDataPoint`, `ChartPoint`

---

### Entity: Schedule (`src/entities/schedule/`)

#### `index.ts`

**Exports:**

- API: `scheduleApi`
- Hooks: `useHomeSchedule`, `useScheduleByDate`, `useScheduleMonth`, `useScheduleToday`, `useScheduleWeek`
- Stores: `useScheduleStore`, `useLessonNotesStore`
- Notes helpers: `makeLessonKey`, `getNotesForKey`, `DEFAULT_STATUSES`
- Types: `LessonItem`, `LessonNote`, `NoteStatus`

#### `hooks/useHomeSchedule.ts`

**Function Signature:**

```typescript
useHomeSchedule(): {
  offset: -1 | 0 | 1
  dateStr: string
  title: string
  todayLessons: LessonItem[]
  todayStatus: LoadingState
  otherLessons: LessonItem[]
  otherStatus: LoadingState
  goPrev(): void
  goNext(): void
  goToday(): void
}
```

**Features:**

- Owns offset nav for home schedule widget
- Preloads yesterday + tomorrow via `useScheduleByDate`
- Auto-shifts to tomorrow after lessons end using `getScheduleTimeInfo`

#### `hooks/useScheduleToday.ts`

**Function Signature:**

```typescript
useScheduleToday(): {
  today: LessonItem[]
  status: LoadingState
  error: string | null
}
```

#### `hooks/useScheduleMonth.ts`

**Function Signature:**

```typescript
useScheduleMonth(year: number, month: number): {
  lessons: LessonItem[]
  status: LoadingState
  error: string | null
}
```

---

### Entity: Leaderboard (`src/entities/leaderboard/`)

#### `index.ts`

**Exports:**

- Hook: `useLeaderboard`
- Store: `useLeaderboardStore`
- Types: `LeaderboardScope`, `LeaderboardStudent`

#### `hooks/useLeaderboard.ts`

**Function Signature:**

```typescript
useLeaderboard(scope: LeaderboardScope): {
  students: LeaderboardStudent[]
  status: LoadingState
  error: string | null
}
```

---

### Entity: Payment (`src/entities/payment/`)

#### `index.ts`

**Exports:**

- API: `paymentApi`
- Hooks: `usePayment`, `usePaymentIndex`
- Store: `usePaymentStore`
- Types: `PaymentIndex`, `PaymentRecord`, `PaymentSummary`

---

### Entity: Profile (`src/entities/profile/`)

#### `index.ts`

**Exports:**

- Hook: `useProfileDetails`
- Types: `ProfileDetails`, `ProfileRelative`

#### `hooks/useProfileDetails.ts`

**Function Signature:**

```typescript
useProfileDetails(): {
  profile: ProfileDetails | null
  status: LoadingState
  error: string | null
}
```

---

### Entity: Review (`src/entities/review/`)

#### `index.ts`

**Exports:**

- Hook: `useReviews`
- Types: `ReviewItem`

#### `hooks/useReviews.ts`

**Function Signature:**

```typescript
useReviews(): {
  reviews: ReviewItem[]
  status: LoadingState
  error: string | null
}
```

---

### Entity: Subject (`src/entities/subject/`)

#### `index.ts`

**Exports:**

- Hook: `useSubjects`
- Types: `Subject`

#### `hooks/useSubjects.ts`

**Function Signature:**

```typescript
useSubjects(): Subject[]
```

---

### Entity: User (`src/entities/user/`)

#### `index.ts`

**Exports:**

- API: `userApi`
- Hook: `useUser`
- Store: `useUserStore`
- Types: `UserInfo`

#### `hooks/useUser.ts`

**Function Signature:**

```typescript
useUser(): {
  user: UserInfo | null
  status: LoadingState
  error: string | null
}
```

#### `model/store.ts`

**Exports:** `useUserStore` (Zustand store)
**State:**

```typescript
interface UserState {
	user: UserInfo | null
	setUser(user: UserInfo): void
	reset(): void
}
```

---

## FEATURES - Use Cases & Business Logic

### Feature: Auth (`src/features/auth/`)

#### `index.ts`

**Exports:**

- Hook: `useLogin`
- Stores: `useAuthStore`, `useHydrationStore`
- Components: `LoginForm`, `LogoutButton`

#### `hooks/useLogin.ts`

**Function Signature:**

```typescript
useLogin(): {
  username: string
  password: string
  showPassword: boolean
  error: string | null
  loading: boolean
  setUsername(value: string): void
  setPassword(value: string): void
  setShowPassword(value: boolean): void
  submit(e: React.FormEvent): Promise<void>
}
```

**Features:**

- Form validation
- Login request with error handling
- User data fetch and storage
- Account saving for multi-account support

#### `model/store.ts`

**Exports:** `useAuthStore`, `useHydrationStore`
**Auth State:**

```typescript
interface AuthState {
	token: string | null
	isAuthenticated: boolean
	activeUsername: string | null
	accounts: SavedAccount[]
	setToken(token: string): void
	logout(): void
	saveAccount(account: SavedAccount): void
	switchAccount(username: string): boolean
	removeAccount(username: string): void
}
```

#### `ui/LoginForm.tsx`

**Component Signature:**

```typescript
LoginForm(): ReactNode
```

**Features:** Login form with username/password, error display, loading state

#### `ui/LogoutButton.tsx`

**Component Signature:**

```typescript
LogoutButton(): ReactNode
```

---

### Feature: Init User (`src/features/initUser/`)

#### `index.ts`

**Exports:** Hook: `useInitUser`

#### `hooks/useInitUser.ts`

**Function Signature:**

```typescript
useInitUser(): void
```

**Functionality:**

- Initializes authenticated user data on app load
- Fetches user profile from API
- Syncs hydration state

---

### Feature: Download Homework (`src/features/downloadHomework/`)

#### `index.ts`

**Exports:**

- Hook: `useDownloadHomework`
- Component: `StudAnswerSheet`

#### `hooks/useDownloadHomework.ts`

**Function Signature:**

```typescript
useDownloadHomework(): {
  download(homeworkId: number): Promise<void>
  isLoading: boolean
  error: string | null
}
```

---

### Feature: Delete Homework (`src/features/deleteHomework/`)

#### `index.ts`

**Exports:** Hook: `useDeleteHomework`

#### `hooks/useDeleteHomework.ts`

**Function Signature:**

```typescript
useDeleteHomework(): {
  delete(homeworkId: number): Promise<void>
  isLoading: boolean
  error: string | null
}
```

---

### Feature: Change User (`src/features/changeUser/`)

#### `index.ts`

**Exports:**

- Hook: `useSwitchUser`
- Component: `AccountSwitcher`

#### `hooks/useSwitchUser.ts`

**Function Signature:**

```typescript
useSwitchUser(): {
  accounts: SavedAccount[]
  activeUsername: string | null
  switch(username: string): void
  logout(username: string): void
}
```

---

### Feature: Play Cat Game (`src/features/playCatGame/`)

#### `index.ts`

**Exports:** Component: `CatGame`

#### `ui/CatGame.tsx`

**Component Signature:**

```typescript
CatGame(): ReactNode
```

---

### Feature: App Update (`src/features/appUpdate/`)

#### `index.ts`

**Exports:**

- Hook: `useAppUpdate`
- Hook: `useInitAppUpdate`
- Store: `useAppUpdateStore`
- Components: `AppUpdateBanner`, `AppUpdateSheet`

#### `hooks/useAppUpdate.ts`

**Function Signature:**

```typescript
useAppUpdate(): {
  status: UpdateStatus
  serverInfo: AppReleaseInfo | null
  latestRelease: AppReleaseInfo | null
  downloadProgress: number
  errorMessage: string | null
  checkForUpdate(): Promise<void>
  downloadAndInstall(): Promise<void>
  dismiss(): void
}
```

**Features:**

- Dynamic import of Capacitor plugins (App, Filesystem, ApkInstaller)
- Version comparison via `isRemoteReleaseNewer` from shared/lib
- APK download with progress tracking
- Install permission handling

#### `hooks/useInitAppUpdate.ts`

**Function Signature:**

```typescript
useInitAppUpdate(): void
```

**Features:** Calls `checkForUpdate()` once after 3s delay on app start.

#### `model/store.ts`

**Exports:** `useAppUpdateStore` (Zustand store)
**State:**

```typescript
interface AppUpdateState {
  status: UpdateStatus // 'idle' | 'checking' | 'available' | 'downloading' | 'error'
  serverInfo: AppReleaseInfo | null
  latestRelease: AppReleaseInfo | null
  downloadProgress: number
  errorMessage: string | null
  // + setters, reset, openSheet
}
```

**Note:** Uses `AppReleaseInfo` type from `shared/lib/appRelease.ts` (no duplicate type).

#### `ui/AppUpdateSheet.tsx`

**Component:** BottomSheet with update download UI, changelog display with labeled items via `parseChangelogItems()` and `getChangelogLabelStyle()` from shared/lib.

---

### Feature: Send Notifications (`src/features/sendNotifications/`)

#### `model/store.ts`

**Exports:**

- Type: `ChangelogEntry` (alias for `ChangelogFeedEntry` from shared/lib)
- Constant: `FALLBACK_CHANGELOG`
- Store: `useNotificationsStore`
- Function: `getUnreadCount(lastReadId, entries)`

**Note:** `ChangelogEntry` is a type alias for `ChangelogFeedEntry` from `shared/lib/appRelease.ts` — no duplicate interface.

---

### Feature: Send Homework (`src/features/sendHomework/`)

- Hooks and UI for homework submission

---

### Feature: Refresh Grades (`src/features/refreshGrades/`)

- Cache invalidation for grades

---

### Feature: Refresh Homework (`src/features/refreshHomework/`)

- Cache invalidation for homework

---

### Feature: Refresh Library (`src/features/refreshLibrary/`)

- Cache invalidation for library materials

---

### Feature: Refresh Schedule (`src/features/refreshSchedule/`)

- Cache invalidation for schedule

---

### Feature: Sort Subjects (`src/features/sortSubjects/`)

- Subject ordering utilities

---

### Feature: Select Spec (`src/features/selectSpec/`)

- Selection UI for specialization

---

### Feature: Logout (`src/features/logout/`)

- Logout logic and store reset

---

### Feature: Clear Cache (`src/features/clearCache/`)

- Cache clearing functionality

---

### Feature: Show Onboarding (`src/features/showOnboarding/`)

- Onboarding flow for new users

---

### Feature: Show Preview (`src/features/showPreview/`)

- Image/file preview functionality

---

### Feature: Play Video (`src/features/playVideo/`)

- Video playback for library materials

---

## PAGES - Route Components

### `src/pages/index.ts`

**Exports:**

```typescript
GradesPage
HomePage
HomeworkPage
LibraryPage
LoginPage
NotificationsPage
ProfileDetailsPage
ProfilePage
SchedulePage
PaymentPage
```

### `src/pages/home/ui/HomePage.tsx`

**Component Signature:**

```typescript
HomePage(): ReactNode
```

**Renders:**

- DashboardCharts
- Today's schedule
- Future exams

### `src/pages/grades/ui/GradesPage.tsx`

**Component Signature:**

```typescript
GradesPage(): ReactNode
```

### `src/pages/homework/ui/HomeworkPage.tsx`

**Component Signature:**

```typescript
HomeworkPage(): ReactNode
```

### `src/pages/login/ui/LoginPage.tsx`

**Component Signature:**

```typescript
LoginPage(): ReactNode
```

### `src/pages/profile/ui/ProfilePage.tsx`

**Component Signature:**

```typescript
ProfilePage(): ReactNode
```

### `src/pages/profileDetail/ui/ProfileDetailPage.tsx`

**Component Signature:**

```typescript
ProfileDetailPage(): ReactNode
```

### `src/pages/schedule/ui/SchedulePage.tsx`

**Component Signature:**

```typescript
SchedulePage(): ReactNode
```

### `src/pages/payment/ui/PaymentPage.tsx`

**Component Signature:**

```typescript
PaymentPage(): ReactNode
```

### `src/pages/library/ui/LibraryPage.tsx`

**Component Signature:**

```typescript
LibraryPage(): ReactNode
```

### `src/pages/notifications/ui/NotificationsPage.tsx`

**Component Signature:**

```typescript
NotificationsPage(): ReactNode
```

**Features:**

- Tabs: changelog, feedback (оценки занятий), news
- Refresh button for changelog
- Update banner when new APK available
- Unread badge tracking via `useNotificationsStore`

---

## WIDGETS - Reusable Components

### `src/widgets/index.ts`

**Exports:**

#### Layout Widgets

- `BottomBar` - Navigation bar
- `TopBar` - Header with user info

#### Dashboard Widgets

- `DashboardCharts` - Home dashboard charts

#### Grades Widgets

- `GradesExamList` - Exam grade list
- `GradesCalendar` - Calendar view of grades
- `GradesCharts` - Grade charts visualization
- `GradesHeader` - Grades page header
- `GradesRecentList` - Recent grades
- `GradesSubjectList` - Subject-grouped grades
- `GradesSummary` - Grade summary card
- `GradesTabs` - Tab navigation
- Type: `Tab`

#### Homework Widgets

- `HomeworkStatusView` - View by status
- `HomeworkSubjectView` - View by subject
- `HomeworkCard` - Individual homework item
- `HomeworkCountersBar` - Homework counts
- `HomeworkViewToggle` - Toggle view mode
- Type: `HomeworkViewMode`

#### Schedule Widgets

- `HomeScheduleSection` - Home-page schedule section with prev/today/next nav
- `ScheduleCalendar` - Calendar schedule view
- `ScheduleList` - List schedule view
- `ScheduleWeekView` - Weekly schedule view
- `LessonList` - Shared lesson list

#### Notifications Widgets

- `ChangelogTab` - Version changelog list
- `ComingSoonTab` - Placeholder for planned sections

#### Exam Widgets

- `FutureExams` - Upcoming exams display

#### Profile/Leaderboard Widgets

- `ProfileAvatar` - User avatar
- `ProfileInfoCard` - User info card
- `ProfilePaymentCard` - Payment info
- `ProfileRelativesCard` - Family info
- `ProfileHeader` - Profile page header
- `Leaderboard` - Student rankings
- `ReviewsList` - Reviews list

#### Payment Widgets

- `PaymentHistoryCard` - Payment history
- `PaymentRequisitesCard` - Payment details
- `PaymentScheduleCard` - Payment schedule

#### Library Widgets

- `Library` - Library materials list

#### Evaluate Lesson Widgets

- `EvaluateLesson` / `EvaluateLessonList` - Lesson feedback form

#### Loading Widgets

- `Loading` - Loading screens and splash

### `src/widgets/TopBar/ui/TopBar.tsx`

**Component Signature:**

```typescript
TopBar(): ReactNode | null
```

**Features:**

- Displays school branding (ITTOP COLLEGE)
- Shows current user full name and group
- Avatar with link to profile
- Memoized for performance

### `src/widgets/BottomBar/ui/BottomBar.tsx`

**Component Signature:**

```typescript
BottomBar(): ReactNode
```

**Features:**

- Fixed bottom navigation
- 4 tabs: Home, Grades, Schedule, Homework
- Active state indicator
- Icon-based navigation using lucide-react

---

## SHARED - Utilities, Hooks, & Common Components

### Shared API (`src/shared/api/index.ts`)

#### `api` - Axios Instance

**Configuration:**

```typescript
const api = axios.create({
  baseURL: API_BASE_URL
  headers: {
    Accept: 'application/json'
    'Content-Type': 'application/json'
  }
})
```

**Interceptors:**

- Request: Adds JWT Authorization header
- Response: Handles 401, FormData headers

---

### Shared Hooks (`src/shared/hooks/index.ts`)

#### `useMonthNav(initialYYYYMM?: string)`

**Function Signature:**

```typescript
useMonthNav(initialYYYYMM?: string): {
  year: number
  month: number
  prevMonth(): void
  nextMonth(): void
}
```

**Functionality:**

- Month/year navigation state
- Handles year boundaries
- Optional initial month parameter

#### `useCurrentMinutes()`

**Function Signature:**

```typescript
useCurrentMinutes(): number
```

#### `toMinutes`

**Function Signature:**

```typescript
toMinutes(hours: number, minutes: number): number
```

#### `useElementSize()`

**Function Signature:**

```typescript
useElementSize(): {
  ref: (node: HTMLDivElement | null) => void
  width: number
  height: number
}
```

**Features:** ResizeObserver for element tracking

#### `useContainerReady()`

**Function Signature:**

```typescript
useContainerReady(): boolean
```

#### `useLazyItems(items: T[], pageSize: number)`

**Function Signature:**

```typescript
useLazyItems<T>(items: T[], pageSize: number): {
  displayedItems: T[]
  hasMore: boolean
  loadMore(): void
}
```

#### `useSwipeBack(callback: () => void)`

**Function Signature:**

```typescript
useSwipeBack(callback: () => void): void
```

#### `useEntityFetch()`

Generic hook for entity data fetching with caching.

#### `usePhotoViewer()`

Hook for photo viewer modal state management.

#### `useScrollableTabs()`

Hook for horizontally scrollable tab navigation.

---

### Shared UI Components (`src/shared/ui/index.ts`)

#### `AvatarPlaceholder`

**Component Signature:**

```typescript
AvatarPlaceholder(props: { initials?: string }): ReactNode
```

#### `CustomTooltip`

**Component Signature:**

```typescript
CustomTooltip(props: { content: string; children: ReactNode }): ReactNode
```

#### `ErrorView`

**Component Signature:**

```typescript
ErrorView(props: { message: string; onRetry?: () => void }): ReactNode
```

#### `MonthGrid`

**Component Signature:**

```typescript
MonthGrid(props: { year: number; month: number; [key: string]: any }): ReactNode
```

#### `PageHeader`

**Component Signature:**

```typescript
PageHeader(props: { title: string; subtitle?: string }): ReactNode
```

#### `RefreshButton`

**Component Signature:**

```typescript
RefreshButton(props: {
  isRefreshing: boolean
  onRefresh: () => void
  disabled?: boolean
  className?: string
  minSpinMs?: number
}): ReactNode
```

**Features:** Optional `minSpinMs` keeps the spin animation for at least N ms after `isRefreshing` flips false (subsumes the ad-hoc local-spinner pattern in feature wrappers).

#### `ShowMoreBtn`

**Component Signature:**

```typescript
ShowMoreBtn(props: { onShowMore: () => void; isLoading?: boolean }): ReactNode
```

#### `SkeletonList`

**Component Signature:**

```typescript
SkeletonList(props: { count: number; height?: number }): ReactNode
```

#### `StatusView`

**Component Signature:**

```typescript
StatusView(props: { status: LoadingState; error?: string | null }): ReactNode
```

---

### Shared Library (`src/shared/lib/`)

#### App Release (`appRelease.ts`)

```typescript
// Types
interface AppReleaseInfo { version, build, apk_url, changelog }
interface ChangelogItem { label: string | null, text: string }
interface ChangelogFeedEntry { id, version, date?, items: ChangelogItem[] }

// Functions
compareVersions(left: string, right: string): number
isRemoteReleaseNewer(params): boolean
parseChangelogItems(changelog: string): ChangelogItem[]
getChangelogLabelStyle(label: string): string
toChangelogFeedEntry(release, date?): ChangelogFeedEntry
fetchLatestAppRelease(signal?): Promise<AppReleaseInfo>
```

#### Image Cache (`imageCache.ts`)

- `getCachedImageUrl(url: string | null): string`
- `preloadImages(urls: string[]): void`

#### Validation (`isCacheValid.ts`)

- `isCacheValid(loadedAt: number | null, ttlMs: number): boolean`

#### Theme (`themeStore.ts`)

- Zustand store for light/dark theme management

#### Utils

- `ScrollToTop` (`scrollToTop.ts`) - Scroll to top component
- `storage` (`storage.ts`) - LocalStorage wrapper (get/set/remove)
- `resetAllAppState` (`resetAllAppState.ts`) - Reset all stores on logout
- `formatDate` (`formatDate.ts`) - Date formatting
- `getAuthToken` (`getAuthToken.ts`) - Get auth token from store
- `materialUrls` (`materialUrls.ts`) - Material URL utilities
- `pluralize` (`pluralize.ts`) - Russian pluralization
- `youtube` (`youtube.ts`) - YouTube URL parsing

---

### Shared Types (`src/shared/types/`)

```typescript
type LoadingState = 'idle' | 'loading' | 'success' | 'error'
```

### Shared Utils (`src/shared/utils/`)

- Date formatting functions
- String utilities
- Number formatting

### Shared Styles (`src/shared/styles/`)

- CSS variables
- Global styles

### Shared Config (`src/shared/config/`)

- `pageConfig` - Route paths
- `API_BASE_URL` - API endpoint
- `ttl` - Cache TTL settings
- `CACHE_KEYS` - Cache key constants

---

## Type System Summary

### Common Types Used Across App

```typescript
type LoadingState = 'idle' | 'loading' | 'success' | 'error'
type HomeworkStatus = number // Maps to STATUS_KEY_MAP
type LeaderboardScope = 'class' | 'school' | 'region'

interface GradeEntry {
	id: number
	spec_id: number
	date: string
	value: number
	// Additional fields
}

interface HomeworkItem {
	id: number
	spec_id: number
	title: string
	description: string
	deadline: string
	status: HomeworkStatus
	photo_url?: string
	// Additional fields
}

interface LessonItem {
	id: number
	date: string
	title: string
	classroom: string
	time_start: string
	time_end: string
}

interface UserInfo {
	id: number
	full_name: string
	username: string
	photo_url?: string
	group: {
		id: number
		name: string
	}
}

interface SavedAccount {
	username: string
	token: string
	fullName: string
	groupName: string
	avatarUrl: string | null
}
```

---

## Store Pattern Summary

All stores use **Zustand** with create pattern:

```typescript
export const useStoreX = create<StateInterface>()(set => ({
  // Initial state
  property: defaultValue,
  // Setters
  setProp: (value) => set({ property: value }),
  // Actions
  customAction: () => set(state => ({...}))
}))
```

Some stores use **persist middleware** for localStorage (e.g., `useAuthStore`)

---

## Data Flow Summary

```
API Layer (axios instance with interceptors)
    ↓
Entity Hooks (useResource) - fetch & cache data
    ↓
Entity Stores (Zustand) - state management
    ↓
Feature Hooks - compose & transform entity data
    ↓
Page Components - use feature hooks
    ↓
Widget Components - render UI
```

---

## File Count Summary

**Total TypeScript/TSX files:** ~289

**Breakdown by category:**

- Entity modules: ~80 files
- Feature modules: ~60 files
- Page components: ~35 files
- Widget components: ~50 files
- Shared utilities: ~45 files
- Config & types: ~19 files
