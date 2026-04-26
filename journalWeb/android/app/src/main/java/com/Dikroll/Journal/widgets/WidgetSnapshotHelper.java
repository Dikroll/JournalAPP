package com.Dikroll.Journal.widgets;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Computes a "today snapshot" from the widget payload at render time.
 *
 * The payload may carry a weeklyLessons map keyed by ISO date. We pick lessons
 * for the current device date so the widget stays correct even if the JS app
 * hasn't run today yet (e.g. the user opened the app on Friday and is now
 * looking at the widget on Saturday).
 */
public class WidgetSnapshotHelper {

    public static class TodaySnapshot {
        public final List<JSONObject> lessons;
        public final JSONObject nextLesson;
        public final JSONObject currentLesson;
        public final JSONObject tomorrowFirstLesson;
        public final String upcomingDayLabel; // "ЗАВТРА", "В ПОНЕДЕЛЬНИК"…
        public final int completedCount;
        public final int totalCount;
        public final boolean isEmpty;
        public final boolean allLessonsCompleted;

        TodaySnapshot(
            List<JSONObject> lessons,
            JSONObject nextLesson,
            JSONObject currentLesson,
            JSONObject tomorrowFirstLesson,
            String upcomingDayLabel,
            int completedCount,
            int totalCount,
            boolean isEmpty,
            boolean allLessonsCompleted
        ) {
            this.lessons = lessons;
            this.nextLesson = nextLesson;
            this.currentLesson = currentLesson;
            this.tomorrowFirstLesson = tomorrowFirstLesson;
            this.upcomingDayLabel = upcomingDayLabel;
            this.completedCount = completedCount;
            this.totalCount = totalCount;
            this.isEmpty = isEmpty;
            this.allLessonsCompleted = allLessonsCompleted;
        }
    }

    public static String isoDate(long epochMs) {
        Calendar cal = Calendar.getInstance();
        cal.setTimeInMillis(epochMs);
        return String.format(
            Locale.US,
            "%04d-%02d-%02d",
            cal.get(Calendar.YEAR),
            cal.get(Calendar.MONTH) + 1,
            cal.get(Calendar.DAY_OF_MONTH)
        );
    }

    private static int minutesFromTime(String time) {
        if (time == null) return -1;
        String[] parts = time.split(":");
        if (parts.length < 2) return -1;
        try {
            return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
        } catch (NumberFormatException e) {
            return -1;
        }
    }

    public static long lessonEpochMs(JSONObject lesson, String timeKey) {
        if (lesson == null) return 0;
        return lessonEpochMs(lesson.optString("date", ""), lesson.optString(timeKey, ""));
    }

    public static long lessonEpochMs(String date, String time) {
        try {
            String[] dateParts = date.split("-");
            String[] timeParts = time.split(":");
            if (dateParts.length != 3 || timeParts.length < 2) return 0;

            Calendar cal = Calendar.getInstance();
            cal.set(
                Integer.parseInt(dateParts[0]),
                Integer.parseInt(dateParts[1]) - 1,
                Integer.parseInt(dateParts[2]),
                Integer.parseInt(timeParts[0]),
                Integer.parseInt(timeParts[1]),
                0
            );
            cal.set(Calendar.MILLISECOND, 0);
            return cal.getTimeInMillis();
        } catch (Exception e) {
            return 0;
        }
    }

    public static TodaySnapshot build(JSONObject root, long nowMs) {
        if (root == null) {
            return new TodaySnapshot(
                Collections.emptyList(), null, null, null, null, 0, 0, true, false
            );
        }

        String todayKey = isoDate(nowMs);

        List<JSONObject> todayLessons = pickLessons(root, todayKey);

        // Fallback: if weekly didn't have today, but root.date matches today, use root.lessons.
        if (todayLessons.isEmpty()
            && todayKey.equals(root.optString("date", ""))) {
            JSONArray legacy = root.optJSONArray("lessons");
            if (legacy != null) {
                todayLessons = sortByLesson(arrayToList(legacy));
            }
        }

        // Look ahead up to 7 days for the next school day with lessons.
        JSONObject upcomingFirst = null;
        String upcomingLabel = null;
        for (int offset = 1; offset <= 7; offset++) {
            long candidateMs = nowMs + 86_400_000L * offset;
            String key = isoDate(candidateMs);
            JSONObject first = firstOf(pickLessons(root, key));
            if (first == null && offset == 1) {
                JSONObject legacyTomorrow = root.optJSONObject("tomorrowFirstLesson");
                if (legacyTomorrow != null
                    && key.equals(legacyTomorrow.optString("date", ""))) {
                    first = legacyTomorrow;
                }
            }
            if (first != null) {
                upcomingFirst = first;
                upcomingLabel = labelForOffset(candidateMs, offset);
                break;
            }
        }

        Calendar now = Calendar.getInstance();
        now.setTimeInMillis(nowMs);
        int nowMin = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE);

        int completed = 0;
        JSONObject nextLesson = null;
        JSONObject currentLesson = null;
        for (JSONObject lesson : todayLessons) {
            int endMin = minutesFromTime(lesson.optString("finishedAt", null));
            int startMin = minutesFromTime(lesson.optString("startedAt", null));
            if (endMin < 0 || startMin < 0) continue;
            if (endMin <= nowMin) completed++;
            if (currentLesson == null && nowMin >= startMin && nowMin <= endMin) {
                currentLesson = lesson;
            }
            if (nextLesson == null && startMin > nowMin) {
                nextLesson = lesson;
            }
        }

        boolean allDone = !todayLessons.isEmpty()
            && currentLesson == null
            && nextLesson == null;

        return new TodaySnapshot(
            todayLessons,
            nextLesson,
            currentLesson,
            upcomingFirst,
            upcomingLabel,
            completed,
            todayLessons.size(),
            todayLessons.isEmpty(),
            allDone
        );
    }

    private static String labelForOffset(long candidateMs, int offset) {
        if (offset == 1) return "ЗАВТРА";
        Calendar cal = Calendar.getInstance(new Locale("ru", "RU"));
        cal.setTimeInMillis(candidateMs);
        String day = cal.getDisplayName(
            Calendar.DAY_OF_WEEK,
            Calendar.LONG_STANDALONE,
            new Locale("ru", "RU")
        );
        if (day == null || day.isEmpty()) return "ЗАВТРА";
        return ("В " + day).toUpperCase(new Locale("ru", "RU"));
    }

    private static List<JSONObject> pickLessons(JSONObject root, String key) {
        JSONObject weekly = root.optJSONObject("weeklyLessons");
        if (weekly == null) return Collections.emptyList();
        JSONArray arr = weekly.optJSONArray(key);
        if (arr == null) return Collections.emptyList();
        return sortByLesson(arrayToList(arr));
    }

    private static List<JSONObject> arrayToList(JSONArray arr) {
        List<JSONObject> result = new ArrayList<>(arr.length());
        for (int i = 0; i < arr.length(); i++) {
            JSONObject obj = arr.optJSONObject(i);
            if (obj != null) result.add(obj);
        }
        return result;
    }

    private static List<JSONObject> sortByLesson(List<JSONObject> input) {
        List<JSONObject> result = new ArrayList<>(input);
        Collections.sort(result, (a, b) -> {
            int la = a.optInt("lesson", 0);
            int lb = b.optInt("lesson", 0);
            return Integer.compare(la, lb);
        });
        return result;
    }

    private static JSONObject firstOf(List<JSONObject> list) {
        if (list == null || list.isEmpty()) return null;
        return list.get(0);
    }

    public static long nextMidnightMs(long nowMs) {
        Calendar cal = Calendar.getInstance();
        cal.setTimeInMillis(nowMs);
        cal.add(Calendar.DAY_OF_YEAR, 1);
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 1);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTimeInMillis();
    }

    public static long nextRefreshMs(JSONObject root, long nowMs) {
        long fallback = nextMidnightMs(nowMs);
        TodaySnapshot snapshot = build(root, nowMs);

        if (snapshot.currentLesson != null) {
            long endMs = lessonEpochMs(snapshot.currentLesson, "finishedAt");
            if (endMs > nowMs) return endMs + 1_000L;
        }

        if (snapshot.nextLesson != null) {
            long startMs = lessonEpochMs(snapshot.nextLesson, "startedAt");
            if (startMs > nowMs) return startMs + 1_000L;
        }

        return fallback;
    }
}
