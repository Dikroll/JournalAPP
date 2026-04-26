package com.Dikroll.Journal.widgets;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.SystemClock;
import android.view.View;
import android.widget.RemoteViews;
import androidx.core.content.ContextCompat;
import com.Dikroll.Journal.MainActivity;
import com.Dikroll.Journal.R;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import org.json.JSONObject;

public class ScheduleSummaryWidgetProvider extends AppWidgetProvider {
    private static final long MIN_COUNTDOWN_MS = 60_000L;

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int id : appWidgetIds) {
            updateWidget(context.getApplicationContext(), appWidgetManager, id);
        }
    }

    @Override
    public void onEnabled(Context context) {
        super.onEnabled(context);
        WidgetMidnightScheduler.schedule(context.getApplicationContext());
    }

    public static void requestWidgetUpdate(Context context) {
        Context appContext = context.getApplicationContext();
        AppWidgetManager manager = AppWidgetManager.getInstance(appContext);
        ComponentName provider = new ComponentName(appContext, ScheduleSummaryWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(provider);

        WidgetMidnightScheduler.schedule(appContext);

        if (ids == null || ids.length == 0) return;
        for (int id : ids) {
            updateWidget(appContext, manager, id);
        }
    }

    private static void updateWidget(Context context, AppWidgetManager manager, int widgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.schedule_summary_widget);
        bindClick(context, views);
        resetViews(views);

        int textPrimary = ContextCompat.getColor(context, R.color.widget_text_primary);
        int textSecondary = ContextCompat.getColor(context, R.color.widget_text_secondary);
        int brandSoft = ContextCompat.getColor(context, R.color.widget_brand_soft);

        String payload = readPayload(context);
        if (payload == null || payload.isEmpty()) {
            views.setTextViewText(R.id.summary_header, "СЕГОДНЯ");
            views.setTextColor(R.id.summary_header, textSecondary);
            showStaticTime(views, "Нет данных", textPrimary);
            views.setTextViewText(R.id.summary_subject, "Откройте приложение");
            views.setTextViewText(R.id.summary_room, "Чтобы подтянуть расписание");
            views.setViewVisibility(R.id.summary_room, View.VISIBLE);
            manager.updateAppWidget(widgetId, views);
            return;
        }

        try {
            JSONObject root = new JSONObject(payload);
            WidgetSnapshotHelper.TodaySnapshot snap =
                WidgetSnapshotHelper.build(root, System.currentTimeMillis());

            if (snap.totalCount > 0) {
                views.setTextViewText(R.id.summary_progress, snap.completedCount + "/" + snap.totalCount);
                views.setViewVisibility(R.id.summary_progress, View.VISIBLE);
            }

            if (snap.currentLesson != null) {
                renderCurrent(context, views, snap.currentLesson, brandSoft, textPrimary, textSecondary);
            } else if (snap.nextLesson != null) {
                renderNext(context, views, snap.nextLesson, textPrimary, textSecondary, brandSoft);
            } else if (snap.tomorrowFirstLesson != null) {
                renderTomorrow(views, snap, textPrimary, textSecondary, brandSoft);
            } else if (snap.allLessonsCompleted) {
                views.setTextViewText(R.id.summary_header, "ГОТОВО НА СЕГОДНЯ");
                views.setTextColor(R.id.summary_header, textSecondary);
                showStaticTime(views, "Готово", textPrimary);
                views.setTextViewText(R.id.summary_subject, "Пары закончились");
                views.setTextViewText(R.id.summary_room, "Следующая появится автоматически");
                views.setViewVisibility(R.id.summary_room, View.VISIBLE);
            } else if (snap.isEmpty) {
                views.setTextViewText(R.id.summary_header, "ВЫХОДНОЙ");
                views.setTextColor(R.id.summary_header, textSecondary);
                showStaticTime(views, "Пар нет", textPrimary);
                views.setTextViewText(R.id.summary_subject, "Можно выдохнуть");
                views.setTextViewText(R.id.summary_room, "Следим за ближайшим учебным днем");
                views.setViewVisibility(R.id.summary_room, View.VISIBLE);
            } else {
                views.setTextViewText(R.id.summary_header, "СЕГОДНЯ");
                views.setTextColor(R.id.summary_header, textSecondary);
                showStaticTime(views, "Готово", textPrimary);
                views.setTextViewText(R.id.summary_subject, "Пары закончились");
                views.setTextViewText(R.id.summary_room, "Следующая появится автоматически");
                views.setViewVisibility(R.id.summary_room, View.VISIBLE);
            }
        } catch (Exception error) {
            views.setTextViewText(R.id.summary_header, "СЕГОДНЯ");
            views.setTextColor(R.id.summary_header, textSecondary);
            showStaticTime(views, "Ошибка", textPrimary);
            views.setTextViewText(R.id.summary_subject, "Не удалось прочитать пары");
            views.setTextViewText(R.id.summary_room, "Откройте приложение для обновления");
            views.setViewVisibility(R.id.summary_room, View.VISIBLE);
        }

        manager.updateAppWidget(widgetId, views);
    }

    private static void renderCurrent(
        Context context,
        RemoteViews views,
        JSONObject current,
        int brandSoft,
        int textPrimary,
        int textSecondary
    ) {
        views.setTextViewText(R.id.summary_header, "СЕЙЧАС");
        views.setTextColor(R.id.summary_header, brandSoft);

        String finishedAt = current.optString("finishedAt", "--:--");
        String subject = current.optString("subject", "");
        String room = WidgetTextHelpers.shortRoom(current.optString("room", ""));

        long nowMs = System.currentTimeMillis();
        long endMs = WidgetSnapshotHelper.lessonEpochMs(current, "finishedAt");
        long remainingMs = endMs - nowMs;
        if (remainingMs > MIN_COUNTDOWN_MS) {
            long base = SystemClock.elapsedRealtime() + remainingMs;
            views.setChronometer(R.id.summary_chrono, base, "%s", true);
            views.setChronometerCountDown(R.id.summary_chrono, true);
            views.setTextColor(R.id.summary_chrono, textPrimary);
            views.setViewVisibility(R.id.summary_chrono, View.VISIBLE);
            views.setViewVisibility(R.id.summary_time, View.GONE);
        } else {
            showStaticTime(views, finishedAt, textPrimary);
        }

        views.setTextViewText(R.id.summary_subject, subject);
        if (!room.isEmpty()) {
            views.setTextViewText(R.id.summary_room, "до " + finishedAt + " · " + room);
        } else {
            views.setTextViewText(R.id.summary_room, "до " + finishedAt);
        }
        views.setViewVisibility(R.id.summary_room, View.VISIBLE);
    }

    private static void renderNext(
        Context context,
        RemoteViews views,
        JSONObject next,
        int textPrimary,
        int textSecondary,
        int brandSoft
    ) {
        views.setTextViewText(R.id.summary_header, "ДАЛЕЕ");
        views.setTextColor(R.id.summary_header, textSecondary);

        String startedAt = next.optString("startedAt", "--:--");
        String subject = next.optString("subject", "");
        String room = WidgetTextHelpers.shortRoom(next.optString("room", ""));

        long nowMs = System.currentTimeMillis();
        long startMs = WidgetSnapshotHelper.lessonEpochMs(next, "startedAt");
        long remainingMs = startMs - nowMs;
        if (remainingMs > MIN_COUNTDOWN_MS) {
            long base = SystemClock.elapsedRealtime() + remainingMs;
            views.setChronometer(R.id.summary_chrono, base, "%s", true);
            views.setChronometerCountDown(R.id.summary_chrono, true);
            views.setTextColor(R.id.summary_chrono, textPrimary);
            views.setViewVisibility(R.id.summary_chrono, View.VISIBLE);
            views.setViewVisibility(R.id.summary_time, View.GONE);
        } else {
            showStaticTime(views, startedAt, textPrimary);
        }

        views.setTextViewText(R.id.summary_subject, subject);
        if (!room.isEmpty()) {
            views.setTextViewText(R.id.summary_room, startedAt + " · " + room);
        } else {
            views.setTextViewText(R.id.summary_room, startedAt);
        }
        views.setViewVisibility(R.id.summary_room, View.VISIBLE);
    }

    private static void renderTomorrow(
        RemoteViews views,
        WidgetSnapshotHelper.TodaySnapshot snap,
        int textPrimary,
        int textSecondary,
        int accentColor
    ) {
        JSONObject tomorrow = snap.tomorrowFirstLesson;
        String header = snap.upcomingDayLabel != null ? snap.upcomingDayLabel : "ЗАВТРА";
        views.setTextViewText(R.id.summary_header, header);
        views.setTextColor(R.id.summary_header, accentColor);

        showStaticTime(views, tomorrow.optString("startedAt", "--:--"), textPrimary);
        views.setTextViewText(R.id.summary_subject, tomorrow.optString("subject", ""));

        String room = WidgetTextHelpers.shortRoom(tomorrow.optString("room", ""));
        if (!room.isEmpty()) {
            views.setTextViewText(R.id.summary_room, room);
        } else {
            views.setTextViewText(R.id.summary_room, "Первая пара");
        }
        views.setViewVisibility(R.id.summary_room, View.VISIBLE);
    }

    private static void showStaticTime(RemoteViews views, String text, int color) {
        views.setTextViewText(R.id.summary_time, text);
        views.setTextColor(R.id.summary_time, color);
        views.setViewVisibility(R.id.summary_time, View.VISIBLE);
        views.setViewVisibility(R.id.summary_chrono, View.GONE);
    }

    private static void resetViews(RemoteViews views) {
        views.setTextViewText(R.id.summary_time, "");
        views.setTextViewText(R.id.summary_subject, "");
        views.setTextViewText(R.id.summary_room, "");
        views.setTextViewText(R.id.summary_progress, "");
        views.setViewVisibility(R.id.summary_progress, View.GONE);
        views.setViewVisibility(R.id.summary_room, View.GONE);
        views.setViewVisibility(R.id.summary_chrono, View.GONE);
        views.setViewVisibility(R.id.summary_time, View.VISIBLE);
    }

    private static String readPayload(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(
            ScheduleWidgetProvider.PREFERENCES_NAME, Context.MODE_PRIVATE);
        String payload = prefs.getString(ScheduleWidgetProvider.PAYLOAD_KEY, null);
        if (payload != null && !payload.isEmpty()) return payload;

        File file = new File(context.getFilesDir(), "widgets/schedule-payload.json");
        if (!file.exists()) return null;
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) sb.append(line);
            return sb.toString();
        } catch (Exception ignored) {
            return null;
        }
    }

    private static void bindClick(Context context, RemoteViews views) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setAction(Intent.ACTION_VIEW);
        intent.setData(Uri.parse("journal-v://schedule"));
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK
            | Intent.FLAG_ACTIVITY_CLEAR_TOP
            | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pending = PendingIntent.getActivity(
            context, 1002, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.summary_root, pending);
    }
}
