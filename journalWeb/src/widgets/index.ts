// Layout
export { BottomBar } from './BottomBar/ui/BottomBar'
export { TopBar } from './TopBar/ui/TopBar'

// Dashboard
export { DashboardCharts } from './DashboardCharts/ui/DashboardCharts'

// Grades
export type { Tab } from '@/widgets/Grades/GradesTabs/ui/GradesTabs'
export { GradesExamList } from './Grades/GradesList/ui/GradesExamList'

export { GradesCalendar } from './Grades/GradesCalendar/ui/GradesCalendar'
export { GradesCharts } from './Grades/GradesCharts/ui/GradesCharts'

export { GradesRecentList } from './Grades/GradesList/ui/GradesRecentList'
export { GradesSubjectList } from './Grades/GradesList/ui/GradesSubjectList'
export { GradesSummary } from './Grades/GradesSummary/ui/GradesSummary'
export { GradesTabs } from './Grades/GradesTabs/ui/GradesTabs'
// Homework
export { HomeworkStatusView } from '@/widgets/HomeworkList/ui/views/HomeworkStatusView'
export { HomeworkSubjectView } from '@/widgets/HomeworkList/ui/views/HomeworkSubjectView'
export { HomeworkCard } from './HomeworkList/ui/card/HomeworkCard'
export { HomeworkCountersBar } from './HomeworkList/ui/shared/HomeworkCounterBar'
// Schedule
export { HomeScheduleSection } from './Schedule/HomeScheduleSection/ui/HomeScheduleSection'
export { ScheduleCalendar } from './Schedule/ScheduleCalendar/ui/ScheduleCalendar'
export { LessonList } from './Schedule/ScheduleList/ui/LessonList'
export { ScheduleList } from './Schedule/ScheduleList/ui/ScheduleList'
export { ScheduleWeekView } from './Schedule/ScheduleWeekView/ui/ScheduleWeekView'

// Exams
export { FutureExams } from './FutureExams/ui/FutureExams'

// Profile
export { Leaderboard } from './Leaderboard/ui/Leaderboard'
export { ProfileAvatar } from './Profile/ProfileDetails/ui/ProfileAvatar'
export { ProfileInfoCard } from './Profile/ProfileDetails/ui/ProfileInfoCard'
export { ProfilePaymentCard } from './Profile/ProfileDetails/ui/ProfilePaymentCard'
export { ProfileRelativesCard } from './Profile/ProfileDetails/ui/ProfileRelativesCard'
export { ProfileHeader } from './Profile/ProfileHeader/ui/ProfileHeader'
export { ReviewsList } from './ReviewList/ui/ReviewList'

//Payment
export { PaymentHistoryCard } from './Payment/ui/PaymentHistoryCard'
export { PaymentRequisitesCard } from './Payment/ui/PaymentRequisitesCard'
export { PaymentScheduleCard } from './Payment/ui/PaymentScheduleCard'

// Features re-exports (widget-level access)
export { EvaluateLessonList } from '@/features/evaluateLesson'
export { AccountSwitcher } from '@/features/changeUser'
export { ClearCacheSheet } from '@/features/clearCache'

// Library
export { LibraryMaterialCard } from './Library/LibraryMaterialCard/ui/LibraryMaterialCard'
export { LibraryTabs } from './Library/LibraryTabs/ui/LibraryTabs'
export { LibraryView } from './Library/LibraryView/ui/LibraryView'

// Notifications
export { ChangelogTab } from './Notifications/ChangelogTab/ui/ChangelogTab'
export { ComingSoonTab } from './Notifications/ComingSoonTab/ui/ComingSoonTab'

// Goals
export { EmptyGoalsState } from './Goals/EmptyGoalsState/ui/EmptyGoalsState'
export { GoalCard } from './Goals/GoalCard/ui/GoalCard'
export { GoalHero } from './Goals/GoalHero/ui/GoalHero'
export { GoalsList } from './Goals/GoalsList/ui/GoalsList'
export { GoalsSummaryCard } from './Goals/GoalsSummaryCard/ui/GoalsSummaryCard'
export { OverallGoalSummary } from './Goals/OverallGoalSummary/ui/OverallGoalSummary'
export { RecentMarks } from './Goals/RecentMarks/ui/RecentMarks'
export { SetGoalSheet } from './Goals/SetGoalSheet/ui/SetGoalSheet'
export { SubjectStats } from './Goals/SubjectStats/ui/SubjectStats'
export { WhatIfSimulator } from './Goals/WhatIfSimulator/ui/WhatIfSimulator'
