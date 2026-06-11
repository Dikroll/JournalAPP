import { lazy } from "react";

export const EvaluateLessonPage = lazy(() =>
	import("@/pages/evaluateLesson/ui/EvaluateLessonPage").then((m) => ({
		default: m.EvaluateLessonPage,
	})),
);
export const GoalDetailPage = lazy(() =>
	import("@/pages/goals/ui/GoalDetailPage").then((m) => ({
		default: m.GoalDetailPage,
	})),
);
export const GoalsPage = lazy(() =>
	import("@/pages/goals/ui/GoalsPage").then((m) => ({ default: m.GoalsPage })),
);
export const GradesPage = lazy(() =>
	import("@/pages/grades/ui/GradesPage").then((m) => ({
		default: m.GradesPage,
	})),
);
export const HomePage = lazy(() =>
	import("@/pages/home/ui/HomePage").then((m) => ({ default: m.HomePage })),
);
export const HomeworkPage = lazy(() =>
	import("@/pages/homework/ui/HomeworkPage").then((m) => ({
		default: m.HomeworkPage,
	})),
);
export const LibraryPage = lazy(() =>
	import("@/pages/library/ui/LibraryPage").then((m) => ({
		default: m.LibraryPage,
	})),
);
export const LoginPage = lazy(() =>
	import("@/pages/login/ui/LoginPage").then((m) => ({ default: m.LoginPage })),
);
export const MarketPage = lazy(() =>
	import("@/pages/market/ui/MarketPage").then((m) => ({
		default: m.MarketPage,
	})),
);
export const NewsDetailPage = lazy(() =>
	import("@/pages/notifications/ui/NewsDetailPage").then((m) => ({
		default: m.NewsDetailPage,
	})),
);
export const NewsPage = lazy(() =>
	import("@/pages/Newspage/ui/Newspage").then((m) => ({ default: m.NewsPage })),
);
export const NotificationSettingsPage = lazy(() =>
	import("@/pages/notificationSettings/ui/NotificationSettingsPage").then(
		(m) => ({ default: m.NotificationSettingsPage }),
	),
);
export const NotificationsPage = lazy(() =>
	import("@/pages/notifications/ui/NotificationsPage").then((m) => ({
		default: m.NotificationsPage,
	})),
);
export const PaymentPage = lazy(() =>
	import("@/pages/payment/ui/PaymentPage").then((m) => ({
		default: m.PaymentPage,
	})),
);
export const ProfileActivityPage = lazy(() =>
	import("@/pages/profileActivity/ui/ProfileActivityPage").then((m) => ({
		default: m.ProfileActivityPage,
	})),
);
export const ProfileDetailsPage = lazy(() =>
	import("@/pages/profileDetail/ui/ProfileDetailPage").then((m) => ({
		default: m.ProfileDetailsPage,
	})),
);
export const ProfilePage = lazy(() =>
	import("@/pages/profile/ui/ProfilePage").then((m) => ({
		default: m.ProfilePage,
	})),
);
export const SchedulePage = lazy(() =>
	import("@/pages/schedule/ui/SchedulePage").then((m) => ({
		default: m.SchedulePage,
	})),
);
