from typing import Optional

from pydantic import BaseModel

# ══════════════════════════════════════════════════════════════════
#  AUTH
# ══════════════════════════════════════════════════════════════════

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ══════════════════════════════════════════════════════════════════
#  USER
# ══════════════════════════════════════════════════════════════════

class PointBalance(BaseModel):
    earned: int
    spent: int
    balance: int

class GamingPoints(BaseModel):
    diamonds: PointBalance
    coins: PointBalance

class Group(BaseModel):
    id: int
    name: str
    status: int

class Stream(BaseModel):
    id: int
    name: str

class UserInfo(BaseModel):
    student_id: int
    full_name: str
    photo_url: Optional[str]
    age: int
    gender: int
    birthday: str
    registered_at: str
    last_seen_at: str
    study_form: str
    level: int
    achieves_count: int
    group: Group
    stream: Stream
    points: GamingPoints
    is_debtor: bool
    has_homework_issues: bool


# ══════════════════════════════════════════════════════════════════
#  DASHBOARD COUNTERS
# ══════════════════════════════════════════════════════════════════

class Counters(BaseModel):
    homework: int = 0
    messages: int = 0
    notifications: int = 0
    news: int = 0

class HomeworkCounters(BaseModel):
    total: int = 0
    pending: int = 0
    checked: int = 0
    overdue: int = 0
    new: int = 0
    returned: int = 0


# ══════════════════════════════════════════════════════════════════
#  LEADERBOARD
# ══════════════════════════════════════════════════════════════════

class LeaderEntry(BaseModel):
    student_id: int
    full_name: str
    photo_url: Optional[str]
    position: int
    points: int

class RankInfo(BaseModel):
    position: int
    total: Optional[int]
    week_diff: int
    month_diff: int

class Leaderboard(BaseModel):
    my_rank: dict[str, RankInfo]   # { "group": RankInfo, "stream": RankInfo }
    top_group: list[LeaderEntry]
    top_stream: list[LeaderEntry]


# ══════════════════════════════════════════════════════════════════
#  ACTIVITY
# ══════════════════════════════════════════════════════════════════

class ActivityEntry(BaseModel):
    date: str
    points: int
    point_type: str          # DIAMOND / COIN
    achievement: Optional[str]  # HOMETASK_INTIME и т.д.


# ══════════════════════════════════════════════════════════════════
#  QUIZZES
# ══════════════════════════════════════════════════════════════════

class QuizRetries(BaseModel):
    total: int
    used: int
    remaining: int

class QuizItem(BaseModel):
    material_id: int
    quiz_id: int
    theme: str
    questions_count: int
    time_limit_seconds: int
    cooldown_seconds: int
    retries: QuizRetries
    last_mark: Optional[float]
    passed_at: Optional[str]
    week: int
    date: str
    is_new: bool


# ══════════════════════════════════════════════════════════════════
#  HOMEWORK
# ══════════════════════════════════════════════════════════════════

class HomeworkItem(BaseModel):
    id: int
    theme: str
    spec_name: str
    teacher: str
    issued_date: str
    deadline: str
    overdue_date: Optional[str] = None  
    status: int
    has_file: bool
    file_url: Optional[str] = None                       
    comment: Optional[str] = None


# ══════════════════════════════════════════════════════════════════
#  REVIEWS
# ══════════════════════════════════════════════════════════════════

class ReviewGroup(BaseModel):
    """
    Один отзыв преподавателя может касаться нескольких предметов.
    Вместо N одинаковых записей — одна со списком предметов.
    """
    date: str
    teacher: str
    message: str
    specs: list[str]


# ══════════════════════════════════════════════════════════════════
#  NEWS
# ══════════════════════════════════════════════════════════════════

class NewsItem(BaseModel):
    id: int
    title: str
    published_at: str
    is_read: bool


# ══════════════════════════════════════════════════════════════════
#  PAYMENT
# ══════════════════════════════════════════════════════════════════

class ScheduledPayment(BaseModel):
    id: int
    description: str
    amount: int
    due_date: str
    is_paid: bool

class PaymentRecord(BaseModel):
    date: str
    amount: int
    description: str
    type: int

class PaymentSummary(BaseModel):
    total_debt: int
    next_payment: Optional[ScheduledPayment]
    schedule: list[ScheduledPayment]
    history: list[PaymentRecord]


# ══════════════════════════════════════════════════════════════════
#  PROGRESS
# ══════════════════════════════════════════════════════════════════

class ExamResult(BaseModel):
    exam_id: int
    spec: str
    teacher: str
    mark: int
    mark_type: int
    date: str
    comment: Optional[str]
    has_file: bool

class LessonMarks(BaseModel):
    """Только непустые оценки — null поля не включаются"""
    control: Optional[int] = None
    homework: Optional[int] = None
    lab: Optional[int] = None
    classwork: Optional[int] = None
    practical: Optional[int] = None
    final: Optional[int] = None

    def any_marks(self) -> bool:
        return any(v is not None for v in self.model_dump().values())

class VisitRecord(BaseModel):
    date: str
    lesson_number: int
    attended: bool           # вместо status: 1/2 — просто bool
    spec_id: int
    spec_name: str
    teacher: str
    theme: str
    marks: Optional[LessonMarks]  # None если оценок нет вообще


    # ══════════════════════════════════════════════════════════════════
#  UPSTREAM MODELS (то что приходит от msapi.top-academy.ru)
# ══════════════════════════════════════════════════════════════════

class UpstreamGroup(BaseModel):
    id: int
    name: str
    group_status: int
    is_primary: bool

class UpstreamGamingPoint(BaseModel):
    new_gaming_point_types__id: int
    points: int

class UpstreamVisibility(BaseModel):
    is_design: bool
    is_video_courses: bool
    is_vacancy: bool
    is_signal: bool
    is_promo: bool
    is_test: bool
    is_email_verified: bool
    is_quizzes_expired: bool
    is_debtor: bool
    is_phone_verified: bool
    is_only_profile: bool
    is_referral_program: bool
    is_dz_group_issue: bool
    is_birthday: bool
    is_school: bool
    is_news_popup: bool
    is_school_branch: bool
    is_college_branch: bool
    is_higher_education_branch: bool
    is_russian_branch: bool
    is_academy_branch: bool

class UpstreamUserInfo(BaseModel):
    student_id: int
    full_name: str
    photo: Optional[str]
    age: int
    gender: int
    birthday: str
    registration_date: str
    last_date_visit: str
    study_form_short_name: str
    level: int
    achieves_count: int
    manual_link: Optional[str]
    current_group_id: int
    current_group_status: int
    group_name: str
    stream_id: int
    stream_name: str
    groups: list[UpstreamGroup]
    gaming_points: list[UpstreamGamingPoint]
    spent_gaming_points: list[UpstreamGamingPoint]
    visibility: UpstreamVisibility

class UpstreamCounter(BaseModel):
    counter_type: int
    counter: int

class UpstreamLeaderPoints(BaseModel):
    totalCount: Optional[int]
    studentPosition: int
    weekDiff: int
    monthDiff: int

class UpstreamLeaderEntry(BaseModel):
    id: Optional[int]
    full_name: Optional[str]
    photo_path: Optional[str]
    position: int
    amount: Optional[int]

class UpstreamActivityEntry(BaseModel):
    date: str
    action: int
    current_point: int
    point_types_id: int
    point_types_name: str
    achievements_id: Optional[int]
    achievements_name: Optional[str]
    achievements_type: Optional[int]
    badge: int
    old_competition: bool

class UpstreamQuizItem(BaseModel):
    material_id: int
    quiz_id: int
    theme: str
    questions_count: int
    time_limit: int
    retake_time: int
    retries_number: int
    retries_number_end: int
    last_mark: Optional[float]
    passed_at: Optional[str]
    current_week: int
    public_week: int
    date: str
    is_new_material: bool
    material_type: int
    type_id: int
    category_id: int
    id_spec: int
    author_id: int
    author: Optional[str]
    name_spec: Optional[str]
    coins_count: Optional[int]
    sort_date: int

class UpstreamReview(BaseModel):
    date: str
    message: str
    spec: str
    full_spec: str
    teacher: str

class UpstreamNewsItem(BaseModel):
    id_bbs: int
    theme: str
    time: str
    viewed: bool

class UpstreamScheduledPayment(BaseModel):
    id: int
    description: str
    price: int
    payment_date: str
    status: int

class UpstreamPaymentRecord(BaseModel):
    date: str
    amount: int
    description: str
    type: int

class UpstreamExamResult(BaseModel):
    exam_id: int
    spec: str
    teacher: str
    mark: int
    mark_type: int
    date: str
    comment_teach: Optional[str]
    need_access: int
    need_access_stud: Optional[int]
    ex_file_name: Optional[str]
    id_file: int
    file_path: Optional[str]
    comment_delete_file: Optional[str]

class UpstreamVisitRecord(BaseModel):
    date_visit: str
    lesson_number: int
    status_was: int
    spec_id: int
    spec_name: str
    teacher_name: str
    lesson_theme: str
    control_work_mark: Optional[int]
    home_work_mark: Optional[int]
    lab_work_mark: Optional[int]
    class_work_mark: Optional[int]
    practical_work_mark: Optional[int]
    final_work_mark: Optional[int]



class UpstreamLesson(BaseModel):
    date: str
    lesson: int
    started_at: str
    finished_at: str
    teacher_name: str
    subject_name: str
    room_name: str

class LessonItem(BaseModel):
    date: str
    lesson: int
    started_at: str
    finished_at: str
    teacher: str      
    subject: str       
    room: str           

class MarketItem(BaseModel):
    description: str
    dynamic_price_status: int
    file_name: str
    id: int
    prices: list[dict]
    quantity: int
    status: int
    title: str
    url: str
    vendor_code: str
    total_count: int



# ══════════════════════════════════════════════════════════════════
#  FEEDBACK
# ══════════════════════════════════════════════════════════════════

class UpstreamPendingLesson(BaseModel):
    key: str
    date_visit: str
    fio_teach: str
    spec_name: str
    teach_photo: Optional[str]

class UpstreamTag(BaseModel):
    id: int
    translate_key: str
    type: str

class PendingLesson(BaseModel):
    key: str
    date: str
    teacher: str
    subject: str
    teacher_photo: Optional[str]

class Tag(BaseModel):
    id: int
    key: str

class EvaluateRequest(BaseModel):
    key: str
    mark_lesson: int
    mark_teach: int
    tags_lesson: list[int] = []
    tags_teach: list[int] = []
    comment_lesson: str = ""
    comment_teach: str = ""


# ══════════════════════════════════════════════════════════════════
#  MARKET
# ══════════════════════════════════════════════════════════════════

class ProductPrice(BaseModel):
    diamonds: int
    coins: int

class ProductItem(BaseModel):
    id: int
    title: str
    description: str
    quantity: int
    image_url: str
    price: ProductPrice

class CartItem(BaseModel):
    id: int
    count: int

class OrderProduct(BaseModel):
    id: int
    title: str
    quantity: int
    image_url: str
    price: ProductPrice

class Order(BaseModel):
    id: int
    created_at: str
    status: int

class OrderDetail(BaseModel):
    id: int
    created_at: str
    updated_at: str
    status: int
    notes: Optional[str]
    products: list[OrderProduct]

class CreateOrderRequest(BaseModel):
    notes: Optional[str] = None
    items: list[CartItem]

    # ══════════════════════════════════════════════════════════════════
#  LIBRARY
# ══════════════════════════════════════════════════════════════════

class UpstreamLibraryCount(BaseModel):
    material_type_id: int
    materials_count: int
    new_count: int
    recommended_count: int

class UpstreamSpec(BaseModel):
    id: int
    name: str
    short_name: str

class SpecItem(BaseModel):
    id: int
    name: str
    short_name: str

class LibraryTypeCount(BaseModel):
    type_id: int
    type_name: str
    total: int
    new: int
    recommended: int

class LibrarySummary(BaseModel):
    new: list[LibraryTypeCount]   # filter_type=0
    all: list[LibraryTypeCount]   # filter_type=1


# ══════════════════════════════════════════════════════════════════
#  USER PROFILE
# ══════════════════════════════════════════════════════════════════

class UpstreamPhone(BaseModel):
    phone_type: int
    phone_number: str

class UpstreamSocialLink(BaseModel):
    id: int
    name: str
    value: Optional[str]
    show_link: bool

class UpstreamRelative(BaseModel):
    full_name: str
    address: Optional[str]
    relationship: str
    phones: list[UpstreamPhone]
    emails: list[str]

class UpstreamUserProfile(BaseModel):
    id: int
    ful_name: str           # опечатка в upstream — намеренно
    address: Optional[str]
    date_birth: str
    email: Optional[str]
    photo_path: Optional[str]
    is_email_verified: bool
    is_phone_verified: bool
    fill_percentage: int
    phones: list[UpstreamPhone]
    links: list[UpstreamSocialLink]
    relatives: list[UpstreamRelative]

# ── output ──────────────────────────────────────────────────────

class Phone(BaseModel):
    type: int         # 0 — мобильный, 1 — домашний
    number: str

class SocialLink(BaseModel):
    name: str
    url: Optional[str]

class Relative(BaseModel):
    full_name: str
    relationship: str
    address: Optional[str]
    phones: list[Phone]
    emails: list[str]

class UserProfile(BaseModel):
    id: int
    full_name: str             # исправлена опечатка ful_name
    address: Optional[str]
    birthday: str              # date_birth → birthday
    email: Optional[str]
    photo_url: Optional[str]   # photo_path → photo_url
    is_email_verified: bool
    is_phone_verified: bool
    fill_percentage: int
    phones: list[Phone]
    socials: list[SocialLink]  # links → socials, только те у кого show_link=True и value заполнен
    relatives: list[Relative]