package com.Dikroll.Journal.widgets;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;
import androidx.core.content.ContextCompat;
import com.Dikroll.Journal.MainActivity;
import com.Dikroll.Journal.R;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import org.json.JSONObject;

public class GoalsSummaryWidgetProvider extends AppWidgetProvider {
    public static final String PAYLOAD_KEY = "goals_payload";

    private static final int[] TILE_COUNT_IDS = {
        R.id.goals_tile_1_count, R.id.goals_tile_2_count, R.id.goals_tile_3_count,
        R.id.goals_tile_4_count, R.id.goals_tile_5_count
    };
    private static final int[] TILE_PCT_IDS = {
        R.id.goals_tile_1_pct, R.id.goals_tile_2_pct, R.id.goals_tile_3_pct,
        R.id.goals_tile_4_pct, R.id.goals_tile_5_pct
    };

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
        ComponentName provider = new ComponentName(appContext, GoalsSummaryWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(provider);

        WidgetMidnightScheduler.schedule(appContext);

        if (ids == null || ids.length == 0) return;
        for (int id : ids) {
            updateWidget(appContext, manager, id);
        }
    }

    private static void updateWidget(Context context, AppWidgetManager manager, int widgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.goals_summary_widget);
        bindClick(context, views);

        String payload = readPayload(context);
        if (payload == null || payload.isEmpty()) {
            renderEmpty(views);
            manager.updateAppWidget(widgetId, views);
            return;
        }

        try {
            JSONObject root = new JSONObject(payload);
            renderPayload(context, views, root);
        } catch (Exception ignored) {
            renderEmpty(views);
        }

        manager.updateAppWidget(widgetId, views);
    }

    private static void renderPayload(Context context, RemoteViews views, JSONObject root) {
        double avg = readOptionalDouble(root, "avg", "averageGrade");
        double att = root.optDouble("attendance", Double.NaN);
        long total = root.optLong("totalMarks", 0);

        views.setTextViewText(R.id.goals_stat_avg,
            Double.isNaN(avg) ? "—" : formatOneDecimal(avg));
        views.setTextViewText(R.id.goals_stat_attendance,
            Double.isNaN(att) ? "—" : Math.round(att) + "%");
        views.setTextViewText(R.id.goals_stat_total, String.valueOf(total));

        JSONObject dist = root.optJSONObject("distribution");
        long[] counts = new long[5];
        if (dist != null) {
            counts[0] = dist.optLong("1", 0);
            counts[1] = dist.optLong("2", 0);
            counts[2] = dist.optLong("3", 0);
            counts[3] = dist.optLong("4", 0);
            counts[4] = dist.optLong("5", 0);
        }
        long sumDist = counts[0] + counts[1] + counts[2] + counts[3] + counts[4];

        long pctBase = sumDist > 0 ? sumDist : total;
        for (int i = 0; i < 5; i++) {
            long c = counts[i];
            views.setTextViewText(TILE_COUNT_IDS[i], String.valueOf(c));
            if (pctBase > 0) {
                long pct = Math.round((c * 100.0) / pctBase);
                views.setTextViewText(TILE_PCT_IDS[i], pct + "%");
                views.setViewVisibility(TILE_PCT_IDS[i], View.VISIBLE);
            } else {
                views.setViewVisibility(TILE_PCT_IDS[i], View.GONE);
            }
        }

        if (total > 0) {
            views.setImageViewBitmap(
                R.id.goals_distribution_bar,
                createDistributionBar(context, counts, total)
            );
            views.setViewVisibility(R.id.goals_distribution_bar, View.VISIBLE);
        } else {
            views.setViewVisibility(R.id.goals_distribution_bar, View.GONE);
        }

    }

    private static void renderEmpty(RemoteViews views) {
        views.setTextViewText(R.id.goals_stat_avg, "—");
        views.setTextViewText(R.id.goals_stat_attendance, "—");
        views.setTextViewText(R.id.goals_stat_total, "0");
        for (int i = 0; i < 5; i++) {
            views.setTextViewText(TILE_COUNT_IDS[i], "0");
            views.setViewVisibility(TILE_PCT_IDS[i], View.GONE);
        }
        views.setViewVisibility(R.id.goals_distribution_bar, View.GONE);
    }

    private static Bitmap createDistributionBar(Context context, long[] counts, long total) {
        int widthPx = dpToPx(context, 280);
        int heightPx = dpToPx(context, 8);
        Bitmap bitmap = Bitmap.createBitmap(widthPx, heightPx, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);

        int[] gradeOrder = {5, 4, 3, 2, 1};
        int[] colors = {
            ContextCompat.getColor(context, R.color.widget_grade_5),
            ContextCompat.getColor(context, R.color.widget_grade_4),
            ContextCompat.getColor(context, R.color.widget_grade_3),
            ContextCompat.getColor(context, R.color.widget_grade_2),
            ContextCompat.getColor(context, R.color.widget_grade_1)
        };

        float left = 0f;
        for (int i = 0; i < gradeOrder.length; i++) {
            int grade = gradeOrder[i];
            long count = counts[grade - 1];
            if (count <= 0) continue;
            float segmentWidth = (count / (float) total) * widthPx;
            float right = i == gradeOrder.length - 1 ? widthPx : Math.min(widthPx, left + segmentWidth);
            paint.setColor(colors[i]);
            canvas.drawRect(left, 0f, right, heightPx, paint);
            left = right;
        }

        return bitmap;
    }

    private static int dpToPx(Context context, int dp) {
        float density = context.getResources().getDisplayMetrics().density;
        return Math.max(1, Math.round(dp * density));
    }

    private static double readOptionalDouble(JSONObject root, String primaryKey, String legacyKey) {
        if (root.has(primaryKey) && !root.isNull(primaryKey)) {
            return root.optDouble(primaryKey, Double.NaN);
        }
        if (root.has(legacyKey) && !root.isNull(legacyKey)) {
            return root.optDouble(legacyKey, Double.NaN);
        }
        return Double.NaN;
    }

    private static String formatOneDecimal(double v) {
        return String.format(java.util.Locale.US, "%.1f", v);
    }

    private static String readPayload(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(
            ScheduleWidgetProvider.PREFERENCES_NAME, Context.MODE_PRIVATE);
        String payload = prefs.getString(PAYLOAD_KEY, null);
        if (payload != null && !payload.isEmpty()) return payload;

        File file = new File(context.getFilesDir(), "widgets/goals-payload.json");
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
        intent.setData(Uri.parse("journal-v://goals"));
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK
            | Intent.FLAG_ACTIVITY_CLEAR_TOP
            | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pending = PendingIntent.getActivity(
            context, 1003, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.goals_root, pending);
    }
}
