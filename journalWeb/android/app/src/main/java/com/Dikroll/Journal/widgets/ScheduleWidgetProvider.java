package com.Dikroll.Journal.widgets;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.RemoteViews;
import androidx.core.content.ContextCompat;
import com.Dikroll.Journal.MainActivity;
import com.Dikroll.Journal.R;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONObject;

public class ScheduleWidgetProvider extends AppWidgetProvider {
    public static final String ACTION_WIDGET_DATA_CHANGED = "com.Dikroll.Journal.widgets.ACTION_WIDGET_DATA_CHANGED";
    public static final String PREFERENCES_NAME = "JournalWidgetData";
    public static final String PAYLOAD_KEY = "schedule_payload";

    // Up to 7 row slots in the layout, sized for systemLarge.
    private static final int[] ROW_CONTAINERS = {
        R.id.widget_row_1, R.id.widget_row_2, R.id.widget_row_3, R.id.widget_row_4,
        R.id.widget_row_5, R.id.widget_row_6, R.id.widget_row_7
    };
    private static final int[] ROW_TIMES = {
        R.id.widget_row_1_time, R.id.widget_row_2_time, R.id.widget_row_3_time, R.id.widget_row_4_time,
        R.id.widget_row_5_time, R.id.widget_row_6_time, R.id.widget_row_7_time
    };
    private static final int[] ROW_BARS = {
        R.id.widget_row_1_bar, R.id.widget_row_2_bar, R.id.widget_row_3_bar, R.id.widget_row_4_bar,
        R.id.widget_row_5_bar, R.id.widget_row_6_bar, R.id.widget_row_7_bar
    };
    private static final int[] ROW_SUBJECTS = {
        R.id.widget_row_1_subject, R.id.widget_row_2_subject, R.id.widget_row_3_subject, R.id.widget_row_4_subject,
        R.id.widget_row_5_subject, R.id.widget_row_6_subject, R.id.widget_row_7_subject
    };
    private static final int[] ROW_ROOMS = {
        R.id.widget_row_1_room, R.id.widget_row_2_room, R.id.widget_row_3_room, R.id.widget_row_4_room,
        R.id.widget_row_5_room, R.id.widget_row_6_room, R.id.widget_row_7_room
    };

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onEnabled(Context context) {
        super.onEnabled(context);
        WidgetMidnightScheduler.schedule(context.getApplicationContext());
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);
        updateWidget(context, appWidgetManager, appWidgetId);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_WIDGET_DATA_CHANGED.equals(intent.getAction())) {
            requestWidgetUpdate(context);
        }
    }

    public static void requestWidgetUpdate(Context context) {
        Context appContext = context.getApplicationContext();
        AppWidgetManager manager = AppWidgetManager.getInstance(appContext);
        ComponentName provider = new ComponentName(appContext, ScheduleWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(provider);

        WidgetMidnightScheduler.schedule(appContext);

        if (ids == null || ids.length == 0) return;

        for (int id : ids) {
            updateWidget(appContext, manager, id);
        }

        Intent broadcast = new Intent(appContext, ScheduleWidgetProvider.class);
        broadcast.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        broadcast.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        appContext.sendBroadcast(broadcast);
    }

    private static int maxRowsFor(AppWidgetManager manager, int widgetId) {
        Bundle options = manager.getAppWidgetOptions(widgetId);
        int minHeight = options != null
            ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0)
            : 0;
        // ~24dp per row + ~32dp header/padding. systemMedium ≈ 110dp height; systemLarge ≈ 250dp.
        if (minHeight >= 180) return 7;
        return 4;
    }

    private static void updateWidget(Context context, AppWidgetManager manager, int widgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.schedule_widget);
        bindClick(context, views);
        resetViews(views);

        int textSecondary = ContextCompat.getColor(context, R.color.widget_text_secondary);
        int brandSoft = ContextCompat.getColor(context, R.color.widget_brand_soft);

        String payload = readPayload(context);
        if (payload == null || payload.isEmpty()) {
            renderState(
                views,
                "СЕГОДНЯ",
                "Нет данных",
                "Откройте приложение, чтобы загрузить расписание",
                null,
                textSecondary
            );
            manager.updateAppWidget(widgetId, views);
            return;
        }

        try {
            JSONObject root = new JSONObject(payload);
            WidgetSnapshotHelper.TodaySnapshot snap =
                WidgetSnapshotHelper.build(root, System.currentTimeMillis());

            int maxRows = maxRowsFor(manager, widgetId);

            if (snap.totalCount > 0) {
                views.setTextViewText(R.id.widget_badge, snap.completedCount + "/" + snap.totalCount);
                views.setViewVisibility(R.id.widget_badge, View.VISIBLE);
            }

            if (snap.currentLesson != null || snap.nextLesson != null) {
                views.setTextViewText(R.id.widget_title, "СЕГОДНЯ");
                views.setTextColor(R.id.widget_title, textSecondary);

                List<JSONObject> visible = visibleLessons(snap);
                int shown = Math.min(visible.size(), maxRows);
                int remaining = visible.size() - shown;
                String currentId = idOf(snap.currentLesson);

                int textPrimary = ContextCompat.getColor(context, R.color.widget_text_primary);
                int divider = ContextCompat.getColor(context, R.color.widget_row_divider);

                for (int i = 0; i < shown; i++) {
                    JSONObject lesson = visible.get(i);
                    boolean isCurrent = currentId != null && currentId.equals(idOf(lesson));
                    String time = lesson.optString("startedAt", "--:--");
                    String subject = lesson.optString("subject", "");
                    String room = WidgetTextHelpers.shortRoom(lesson.optString("room", ""));

                    views.setTextViewText(ROW_TIMES[i], time);
                    views.setTextColor(ROW_TIMES[i], isCurrent ? brandSoft : textPrimary);

                    views.setTextViewText(ROW_SUBJECTS[i], subject);
                    views.setTextColor(ROW_SUBJECTS[i], textPrimary);

                    views.setTextViewText(ROW_ROOMS[i], room);
                    views.setViewVisibility(ROW_ROOMS[i], room.isEmpty() ? View.GONE : View.VISIBLE);

                    views.setInt(ROW_BARS[i], "setBackgroundColor", isCurrent ? brandSoft : divider);
                    views.setInt(
                        ROW_CONTAINERS[i],
                        "setBackgroundResource",
                        isCurrent ? R.drawable.widget_lesson_row_highlight : 0
                    );
                    views.setViewVisibility(ROW_CONTAINERS[i], View.VISIBLE);
                }

                if (remaining > 0) {
                    views.setTextViewText(R.id.widget_overflow, "+" + remaining + " ещё");
                    views.setViewVisibility(R.id.widget_overflow, View.VISIBLE);
                }
            } else if (snap.tomorrowFirstLesson != null) {
                JSONObject t = snap.tomorrowFirstLesson;
                String room = WidgetTextHelpers.shortRoom(t.optString("room", ""));
                String header = snap.upcomingDayLabel != null ? snap.upcomingDayLabel : "ЗАВТРА";
                String subtitle = t.optString("startedAt", "--:--") + " · " + t.optString("subject", "");
                String caption = room.isEmpty() ? "Сегодня пары закончились" : "Сегодня пары закончились · " + room;
                renderState(views, "ЗАВТРА", header, subtitle, caption, brandSoft);
            } else if (snap.allLessonsCompleted) {
                renderState(
                    views,
                    "ГОТОВО НА СЕГОДНЯ",
                    "Сегодня пары закончились",
                    "Следующее обновление появится автоматически",
                    null,
                    textSecondary
                );
            } else if (snap.isEmpty) {
                renderState(
                    views,
                    "ВЫХОДНОЙ",
                    "Сегодня пар нет",
                    "Можно выдохнуть",
                    null,
                    brandSoft
                );
            } else {
                renderState(
                    views,
                    "ГОТОВО НА СЕГОДНЯ",
                    "Сегодня пары закончились",
                    "Следующее обновление появится автоматически",
                    null,
                    textSecondary
                );
            }
        } catch (Exception error) {
            renderState(views, "СЕГОДНЯ", "Ошибка", "Не удалось прочитать данные", null, textSecondary);
        }

        manager.updateAppWidget(widgetId, views);
    }

    private static List<JSONObject> visibleLessons(WidgetSnapshotHelper.TodaySnapshot snap) {
        List<JSONObject> all = snap.lessons;
        if (all == null || all.isEmpty()) return new ArrayList<>();

        String anchorId = null;
        if (snap.currentLesson != null) anchorId = idOf(snap.currentLesson);
        else if (snap.nextLesson != null) anchorId = idOf(snap.nextLesson);

        if (anchorId == null) return new ArrayList<>(all);

        int start = -1;
        for (int i = 0; i < all.size(); i++) {
            if (anchorId.equals(idOf(all.get(i)))) {
                start = i;
                break;
            }
        }
        if (start < 0) return new ArrayList<>(all);
        return new ArrayList<>(all.subList(start, all.size()));
    }

    private static String idOf(JSONObject lesson) {
        if (lesson == null) return null;
        return lesson.optString("date", "") + "-" + lesson.optInt("lesson", -1);
    }

    private static void renderState(
        RemoteViews views,
        String title,
        String stateTitle,
        String stateSubtitle,
        String caption,
        int titleColor
    ) {
        views.setTextViewText(R.id.widget_title, title);
        views.setTextColor(R.id.widget_title, titleColor);
        views.setTextViewText(R.id.widget_state_title, stateTitle);
        views.setTextViewText(R.id.widget_state_subtitle, stateSubtitle);
        views.setViewVisibility(R.id.widget_state_block, View.VISIBLE);
        if (caption != null && !caption.isEmpty()) {
            views.setTextViewText(R.id.widget_state_caption, caption);
            views.setViewVisibility(R.id.widget_state_caption, View.VISIBLE);
        }
    }

    private static void resetViews(RemoteViews views) {
        views.setTextViewText(R.id.widget_title, "СЕГОДНЯ");
        views.setTextViewText(R.id.widget_badge, "");
        views.setViewVisibility(R.id.widget_badge, View.GONE);
        views.setViewVisibility(R.id.widget_overflow, View.GONE);
        views.setViewVisibility(R.id.widget_state_block, View.GONE);
        views.setViewVisibility(R.id.widget_state_caption, View.GONE);
        views.setTextViewText(R.id.widget_state_title, "");
        views.setTextViewText(R.id.widget_state_subtitle, "");
        views.setTextViewText(R.id.widget_state_caption, "");
        for (int i = 0; i < ROW_CONTAINERS.length; i++) {
            views.setViewVisibility(ROW_CONTAINERS[i], View.GONE);
            views.setTextViewText(ROW_TIMES[i], "");
            views.setTextViewText(ROW_SUBJECTS[i], "");
            views.setTextViewText(ROW_ROOMS[i], "");
        }
    }

    static String readPayload(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE);
        String payload = prefs.getString(PAYLOAD_KEY, null);
        if (payload != null && !payload.isEmpty()) return payload;

        File file = new File(context.getFilesDir(), "widgets/schedule-payload.json");
        if (!file.exists()) return null;

        StringBuilder builder = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                builder.append(line);
            }
            return builder.toString();
        } catch (Exception ignored) {
            return null;
        }
    }

    private static void bindClick(Context context, RemoteViews views) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setAction(Intent.ACTION_VIEW);
        intent.setData(Uri.parse("journal-v://schedule"));
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);

        PendingIntent pendingIntent = PendingIntent.getActivity(
            context,
            1001,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);
    }
}
