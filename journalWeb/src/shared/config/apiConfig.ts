class ApiConfig {
	// auth
	readonly AUTH_LOGIN = '/auth/login'

	// user
	readonly USER_ME = '/user/me'
	readonly USER_PROFILE = '/user/profile'
	readonly USER_AVATAR = '/user/me/avatar'

	// schedule
	readonly SCHEDULE_TODAY = '/schedule/today'
	readonly SCHEDULE_BY_DATE = '/schedule/by-date'
	readonly SCHEDULE_MONTH = '/schedule/month'

	// dashboard
	readonly DASHBOARD_COUNTERS = '/dashboard/counters'
	readonly DASHBOARD_LEADERBOARD = '/dashboard/leaderboard'
	readonly DASHBOARD_LEADERBOARD_GROUP = '/dashboard/leaderboard/group'
	readonly DASHBOARD_LEADERBOARD_STREAM = '/dashboard/leaderboard/stream'
	readonly DASHBOARD_ACTIVITY = '/dashboard/activity'
	readonly DASHBOARD_QUIZZES = '/dashboard/quizzes'
	readonly DASHBOARD_CHART_PROGRESS = '/dashboard/chart/average-progress'
	readonly DASHBOARD_CHART_ATTENDANCE = '/dashboard/chart/attendance'

	// homework
	readonly HOMEWORK_COUNTERS = '/homework/counters'
	readonly HOMEWORK_LIST = '/homework/list'
	readonly HOMEWORK_ALL = '/homework/all'
	readonly HOMEWORK_EVALUATE = '/homework/evaluate'
	readonly HOMEWORK_SYNC = '/homework/sync'
	readonly HOMEWORK_SUBMIT = '/homework/submit'
	readonly HOMEWORK_FILE_UPLOAD = '/homework/upload-file'
	readonly HOMEWORK_BY_SUBJECT = '/homework/by-subject'
	readonly HOMEWORK_REFRESH = '/homework/refresh'
	readonly HOMEWORK_DELETE = '/homework/delete'

	// progress
	readonly PROGRESS_FUTURE_EXAMS = '/progress/future-exams'
	readonly PROGRESS_VISITS = '/progress/visits'

	// reviews
	readonly REVIEWS_LIST = '/reviews/list'

	// news
	readonly NEWS_LATEST = '/news/latest'

	// payment
	readonly PAYMENT_SCHEDULE = '/payment/schedule'
	readonly PAYMENT_HISTORY = '/payment/history'
	readonly PAYMENT_SUMMARY = '/payment/summary'

	// feedback
	readonly FEEDBACK_PENDING = '/feedback/pending'
	readonly FEEDBACK_TAGS = '/feedback/tags'
	readonly FEEDBACK_EVALUATE = '/feedback/evaluate'

	// market
	readonly MARKET_PRODUCTS = '/market/products'
	readonly MARKET_PRODUCTS_ALL = '/market/products/all'
	readonly MARKET_CART = '/market/cart'
	readonly MARKET_ORDERS = '/market/orders'
	readonly MARKET_ORDERS_CREATE = '/market/orders/create'

	// library
	readonly LIBRARY_SPECS = '/library/specs'
	readonly LIBRARY_COUNTERS = '/library/counters'
	readonly LIBRARY_MATERIALS = '/library/materials'
	readonly LIBRARY_MATERIALS_ALL = '/library/materials/all'
	//examProgress
	readonly PROGRESS_EXAMS = '/progress/exams'
}

export const apiConfig = new ApiConfig()
