# 🌐 API Reference

## Обзор

Backend располагается на `https://msapi-top-journal.ru`. В разработке используется Vite прокси для переадресации запросов:

```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'https://msapi-top-journal.ru',
    changeOrigin: true,
    rewrite: path => path.replace(/^\/api/, ''),
  },
  '/files': {
    target: 'https://msapi-top-journal.ru',
    changeOrigin: true,
  }
}
```

---

## API Endpoints

### 🔐 Authentication

#### Login

```
POST /auth/login
```

**Request:**

```typescript
interface LoginRequest {
	username: string
	password: string
}
```

**Response (200):**

```typescript
interface LoginResponse {
	token: string
	user: UserInfo
}
```

**Error (401):**

```json
{
	"message": "Неверные учётные данные"
}
```

---

### 👤 User

#### Get Current User

```
GET /user/me
```

**Response (200):**

```typescript
interface UserInfo {
	id: number
	username: string
	full_name: string
	email: string
	group: {
		id: number
		name: string
	}
	photo_url: string | null
	// ... другие поля
}
```

**Error (401):**
Пользователь не аутентифицирован.

#### Get User Profile

```
GET /user/profile
```

**Response (200):**

```typescript
interface UserProfile {
	id: number
	username: string
	full_name: string
	email: string
	phone?: string
	group: {
		id: number
		name: string
	}
	// ... другие поля профиля
}
```

#### Get User Avatar

```
GET /user/me/avatar
```

**Response:**
Изображение (PNG/JPG) или редирект на `/files/default-avatar.png`

---

### 📊 Grades

#### Get All Grades

```
GET /grades/all
```

**Response (200):**

```typescript
interface GradesResponse {
	entries: GradeEntry[]
	summary: {
		averageGrade: number
		totalSubjects: number
		passedSubjects: number
	}
}

interface GradeEntry {
	id: number
	subject_id: number
	subject_name: string
	grade: number
	date: string // ISO 8601
	teacher: string
	semester: number
	comment?: string
}
```

#### Get Grades by Subject

```
GET /grades/by-subject/{specId}
```

**Path Parameters:**

- `specId` (number) - Специальность ID

**Response (200):**

```typescript
interface SubjectGrades {
	subject_id: number
	subject_name: string
	entries: GradeEntry[]
	average: number
}
```

#### Get Grades Statistics

```
GET /grades/statistics
```

**Query Parameters:**

- `semester?` (number) - Номер семестра (не обязательно)

**Response (200):**

```typescript
interface GradesStatistics {
	averageGrade: number
	medianGrade: number
	minGrade: number
	maxGrade: number
	gradeDistribution: {
		'5': number
		'4': number
		'3': number
		'2': number
		'1': number
	}
}
```

---

### 📝 Homework

#### Get Homework List (Paginated)

```
GET /homework/list
```

**Query Parameters:**

- `page` (number) - Номер страницы (default: 1)
- `limit` (number) - Размер страницы (default: 6)
- `status` (string) - Фильтр по статусу: `pending`, `submitted`, `checked`, `expired`

**Response (200):**

```typescript
interface HomeworkListResponse {
	items: HomeworkItem[]
	pagination: {
		current_page: number
		total_pages: number
		total_count: number
		page_size: number
	}
}

interface HomeworkItem {
	id: number
	subject_id: number
	subject_name: string
	title: string
	description: string
	due_date: string // ISO 8601
	created_at: string

	// Статус
	status: 'pending' | 'submitted' | 'checked' | 'expired'
	submitted_at?: string
	checked_at?: string

	// Файлы
	attachments: {
		id: number
		filename: string
		url: string
		size: number
		mime_type: string
	}[]

	// Ответ студента
	submission?: {
		id: number
		submitted_at: string
		files: {
			id: number
			filename: string
			url: string
			size: number
		}[]
		feedback?: string
		grade?: number
	}

	// Превью
	preview_image_url?: string
}
```

#### Get All Homework

```
GET /homework/all
```

**Query Parameters:**

- `status?` (string) - Фильтр по статусу

**Response (200):**

```typescript
interface HomeworkAllResponse {
	items: HomeworkItem[]
	summary: {
		total: number
		pending: number
		submitted: number
		checked: number
		expired: number
	}
}
```

#### Get Homework Counters

```
GET /homework/counters
```

**Response (200):**

```typescript
interface HomeworkCounters {
	total: number
	pending: number
	submitted: number
	checked: number
	expired: number
	hasNewSubmissions: boolean
}
```

#### Get Single Homework

```
GET /homework/{id}
```

**Path Parameters:**

- `id` (number) - Homework ID

**Response (200):**

```typescript
interface HomeworkItem {
	// ... (see above)
}
```

#### Submit Homework

```
POST /homework/{id}/submit
```

**Path Parameters:**

- `id` (number) - Homework ID

**Request (multipart/form-data):**

```
file: File (required) - Выполненное домашнее задание
comment?: string (optional) - Комментарий студента
```

**Response (201):**

```typescript
interface SubmitResponse {
	submission: {
		id: number
		homework_id: number
		submitted_at: string
		status: 'submitted'
	}
}
```

**Errors:**

- `400` - Файл не загружен или неверный формат
- `409` - Уже отправлено

#### Delete Homework Submission

```
DELETE /homework/{id}/submission
```

**Response (204):**
Успешно удалено

---

### 📅 Schedule

#### Get Today's Schedule

```
GET /schedule/today
```

**Response (200):**

```typescript
interface ScheduleItem {
	id: number
	date: string // ISO 8601
	subject_id: number
	subject_name: string
	room: string
	start_time: string // HH:MM
	end_time: string // HH:MM
	type: 'lecture' | 'seminar' | 'lab' | 'practice'
	teacher?: {
		id: number
		name: string
	}
	building?: string
	floor?: number
}

type TodayScheduleResponse = ScheduleItem[]
```

#### Get Schedule by Date

```
GET /schedule/by-date
```

**Query Parameters:**

- `date` (string, required) - ISO 8601 дата (YYYY-MM-DD)

**Response (200):**

```typescript
type ScheduleByDateResponse = ScheduleItem[]
```

#### Get Month Schedule

```
GET /schedule/month
```

**Query Parameters:**

- `year` (number, required) - Год
- `month` (number, required) - Месяц (1-12)

**Response (200):**

```typescript
interface MonthScheduleResponse {
	year: number
	month: number
	days: {
		date: string // ISO 8601
		items: ScheduleItem[]
	}[]
}
```

---

### 📊 Dashboard

#### Get Dashboard Counters

```
GET /dashboard/counters
```

**Response (200):**

```typescript
interface DashboardCounters {
	grades: {
		average: number
		total: number
	}
	homework: {
		pending: number
		submitted: number
		checked: number
		expired: number
	}
	attendance: {
		present: number
		absent: number
		late: number
		percentage: number
	}
	exams: {
		upcoming: number
		completed: number
	}
}
```

#### Get Leaderboard - Group

```
GET /dashboard/leaderboard/group
```

**Response (200):**

```typescript
interface LeaderboardItem {
	rank: number
	user_id: number
	username: string
	full_name: string
	group_name: string
	avatar_url: string | null
	points: number
	average_grade: number
	attendance_percentage: number
}

type GroupLeaderboardResponse = LeaderboardItem[]
```

#### Get Leaderboard - Stream

```
GET /dashboard/leaderboard/stream
```

**Response (200):**

```typescript
type StreamLeaderboardResponse = LeaderboardItem[]
```

#### Get Progress Chart Data

```
GET /dashboard/chart/average-progress
```

**Query Parameters:**

- `period?` (string) - `week`, `month`, `semester` (default: `month`)

**Response (200):**

```typescript
interface ProgressDataPoint {
	date: string // ISO 8601
	average_grade: number
	trend: 'up' | 'down' | 'stable'
}

type ProgressChartResponse = ProgressDataPoint[]
```

#### Get Attendance Chart Data

```
GET /dashboard/chart/attendance
```

**Query Parameters:**

- `period?` (string) - `week`, `month`, `semester` (default: `month`)

**Response (200):**

```typescript
interface AttendanceDataPoint {
	date: string
	present: number
	absent: number
	late: number
}

type AttendanceChartResponse = AttendanceDataPoint[]
```

#### Get Activity Feed

```
GET /dashboard/activity
```

**Query Parameters:**

- `limit?` (number) - Количество элементов (default: 10)

**Response (200):**

```typescript
interface ActivityItem {
	id: number
	type: 'grade' | 'homework' | 'message' | 'event'
	timestamp: string
	title: string
	description: string
	related_id?: number
}

type ActivityResponse = ActivityItem[]
```

#### Get Quizzes

```
GET /dashboard/quizzes
```

**Response (200):**

```typescript
interface QuizItem {
	id: number
	title: string
	subject_name: string
	due_date: string
	status: 'pending' | 'completed'
	grade?: number
}

type QuizzesResponse = QuizItem[]
```

---

### 💳 Payment

#### Get Payment Info

```
GET /payment/info
```

**Response (200):**

```typescript
interface PaymentInfo {
	id: number
	student_id: number
	status: 'paid' | 'pending' | 'overdue'
	amount: number
	currency: string
	due_date: string
	paid_date?: string
	description: string
}

type PaymentResponse = PaymentInfo[]
```

#### Get Payment History

```
GET /payment/history
```

**Query Parameters:**

- `limit?` (number) - Default: 10
- `offset?` (number) - Default: 0

**Response (200):**

```typescript
interface PaymentHistory {
	transactions: {
		id: number
		date: string
		amount: number
		status: 'success' | 'failed' | 'pending'
		method: string
		description: string
	}[]
	pagination: {
		total: number
		limit: number
		offset: number
	}
}
```

---

### 🎓 Subjects

#### Get All Subjects

```
GET /subjects
```

**Response (200):**

```typescript
interface Subject {
	id: number
	name: string
	code: string
	teacher?: {
		id: number
		name: string
	}
	credits?: number
}

type SubjectsResponse = Subject[]
```

#### Get Subject Details

```
GET /subjects/{id}
```

**Response (200):**

```typescript
interface SubjectDetails {
	id: number
	name: string
	code: string
	description?: string
	credits: number
	semester: number
	teacher: {
		id: number
		name: string
		email: string
	}
	// ... другие детали
}
```

---

### 🎯 Exams

#### Get Upcoming Exams

```
GET /exams/upcoming
```

**Response (200):**

```typescript
interface FutureExamItem {
	id: number
	subject_id: number
	subject_name: string
	date: string // ISO 8601
	time: string // HH:MM
	room: string
	building: string
	type: 'exam' | 'retake'
	notes?: string
}

type ExamsResponse = FutureExamItem[]
```

#### Get Exam Schedule

```
GET /exams/schedule
```

**Query Parameters:**

- `semester?` (number) - Номер семестра

**Response (200):**

```typescript
type ExamScheduleResponse = FutureExamItem[]
```

---

### ⭐ Reviews

#### Get Reviews

```
GET /reviews
```

**Query Parameters:**

- `for_user_id?` (number) - Отзывы для определённого пользователя
- `limit?` (number) - Default: 10

**Response (200):**

```typescript
interface ReviewItem {
	id: number
	from_user: {
		id: number
		name: string
		avatar_url?: string
	}
	rating: number // 1-5
	text?: string
	created_at: string
}

type ReviewsResponse = ReviewItem[]
```

#### Create Review

```
POST /reviews
```

**Request:**

```typescript
interface CreateReviewRequest {
	for_user_id: number
	rating: number // 1-5
	text?: string
}
```

**Response (201):**

```typescript
interface ReviewItem {
	// ... (see above)
}
```

---

## Error Handling

### Стандартные HTTP коды

| Код     | Описание              | Обработка                |
| ------- | --------------------- | ------------------------ |
| **200** | OK                    | Успешный запрос          |
| **201** | Created               | Успешное создание        |
| **204** | No Content            | Успешное удаление        |
| **400** | Bad Request           | Ошибка валидации         |
| **401** | Unauthorized          | Требуется аутентификация |
| **403** | Forbidden             | Доступ запрещён          |
| **404** | Not Found             | Ресурс не найден         |
| **409** | Conflict              | Конфликт состояния       |
| **500** | Internal Server Error | Ошибка сервера           |

### Error Response Format

```typescript
interface ErrorResponse {
	status: number
	message: string
	code?: string
	details?: Record<string, unknown>
	timestamp: string
}
```

### Обработка в коде

```typescript
try {
	const response = await api.get('/endpoint')
	// ...
} catch (error) {
	if (error.response?.status === 401) {
		// Логин истёк - redirect на /login
		useAuthStore.setState({ isAuthenticated: false })
	} else if (error.response?.status === 400) {
		// Ошибка валидации
		const message = error.response.data.message
		showErrorToast(message)
	} else if (error.response?.status >= 500) {
		// Ошибка сервера
		console.error('[API Error]', error)
		showErrorToast('Ошибка сервера. Повторите попытку позже')
	}
}
```

---

## Аутентификация

### Token Management

1. После успешного логина получаем `token`
2. Token сохраняется в localStorage через `useAuthStore`
3. Request interceptor автоматически добавляет token в заголовок:
   ```
   Authorization: Bearer {token}
   ```

### Token Refresh

В текущей реализации нет refresh token. Если token истеёт:

1. Сервер возвращает 401
2. Пользователь логируется (переход на `/login`)
3. Нужно повторно войти

### Multi-Account Support

- До 5 аккаунтов могут быть сохранены в localStorage
- Token для каждого аккаунта сохраняется отдельно
- При переключении между аккаунтами обновляется текущий token

```typescript
// Сохранение аккаунта
saveAccount({
	username: 'user@example.com',
	token: 'eyJhbGciOiJIUzI1NiIs...',
	fullName: 'John Doe',
	groupName: 'Group A',
	avatarUrl: '/files/avatar.jpg',
})

// Переключение
switchAccount('user@example.com') // Загружает token этого аккаунта
```

---

## Rate Limiting

Текущая информация о rate limiting отсутствует. Проверить документацию backend.

---

## Кеширование

### Client-side Caching Strategy

Приложение использует настраиваемый TTL (Time To Live) для кеша:

```typescript
// examples/config.ts
const CACHE_CONFIG = {
	GRADES: 15 * 60 * 1000, // 15 минут
	HOMEWORK: 15 * 60 * 1000, // 15 минут
	SCHEDULE: 1 * 60 * 60 * 1000, // 1 час
	EXAM: 24 * 60 * 60 * 1000, // 24 часа
}

function isCacheValid(loadedAt: number | null, ttl: number): boolean {
	if (!loadedAt) return false
	return Date.now() - loadedAt < ttl
}
```

### ETag Support

Backend может возвращать ETag для оптимизации:

```typescript
// Request с If-None-Match
api.get('/endpoint', {
	headers: {
		'If-None-Match': previousETag,
	},
})

// Response 304 Not Modified
// Приложение использует кешированные данные
```

---

## Streaming & Large Files

### File uploads

```typescript
// Отправка файла с FormData
const formData = new FormData()
formData.append('file', file)
formData.append('comment', 'My submission')

await api.post('/homework/123/submit', formData)
// Content-Type автоматически удаляется для автоматического boundary
```

### Image Optimization

Для изображений используется превью размер:

```typescript
// Request параметр для превью
GET /homework/123?preview_size=small
```

Приложение кеширует и предзагружает изображения:

```typescript
import { preloadImages } from '@/shared/lib'

const imageUrls = items.map(i => i.preview_image_url)
await preloadImages(imageUrls)
```

---

## API Mirroring

В случае если основной backend недоступен, backend поддерживает миррор:

```
Основной: https://msapi-top-journal.ru
Миррор: https://mirror-msapi.top-journal.ru (если применимо)
```

Переключение на миррор должно быть добавлено в конфигурацию.

---

## Версионирование API

Текущая версия: **v1** (не явно в endpoints)

При изменении API может быть добавлено:

```
GET /api/v2/endpoint
```

---

## Лучшие практики при работе с API

1. **Всегда обрабатывайте ошибки**

   ```typescript
   try {
   	const data = await api.get(endpoint)
   } catch (err) {
   	// Обработка ошибок
   }
   ```

2. **Используйте кеш при необходимости**

   ```typescript
   if (isCacheValid(loadedAt, TTL)) {
   	return state.data
   }
   ```

3. **Покажите loading 状态**

   ```typescript
   setStatus('loading')
   try {
   	// ...
   } finally {
   	setStatus('idle')
   }
   ```

4. **Отмените запросы при размонтировании**

   ```typescript
   useEffect(() => {
   	let cancelled = false

   	api.get(endpoint).then(data => {
   		if (!cancelled) setData(data)
   	})

   	return () => {
   		cancelled = true
   	}
   }, [])
   ```

5. **Валидируйте данные**
   ```typescript
   if (!response.data || !response.data.items) {
   	throw new Error('Invalid response format')
   }
   ```

---

**Документация API версия:** 1.0  
**Последнее обновление:** Март 2026
