package com.Dikroll.Journal.widgets;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import org.json.JSONObject;

/**
 * Schedules the next widget wake-up via AlarmManager. We prefer the nearest
 * schedule transition (lesson start/end) and fall back to midnight rollover.
 */
public class WidgetMidnightScheduler extends BroadcastReceiver {
    private static final String ACTION_REFRESH = "com.Dikroll.Journal.widgets.MIDNIGHT_REFRESH";
    private static final int REQUEST_CODE = 4242;

    public static void schedule(Context context) {
        Context appContext = context.getApplicationContext();
        AlarmManager alarmManager = (AlarmManager) appContext.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        Intent intent = new Intent(appContext, WidgetMidnightScheduler.class);
        intent.setAction(ACTION_REFRESH);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent pending = PendingIntent.getBroadcast(
            appContext, REQUEST_CODE, intent, flags
        );

        long triggerAt = computeNextTriggerAt(appContext);
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pending);
            } else {
                alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAt, pending);
            }
        } catch (SecurityException ignored) {
            alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAt, pending);
        }
    }

    private static long computeNextTriggerAt(Context context) {
        long now = System.currentTimeMillis();
        String payload = ScheduleWidgetProvider.readPayload(context);
        if (payload == null || payload.isEmpty()) {
            return WidgetSnapshotHelper.nextMidnightMs(now);
        }

        try {
            JSONObject root = new JSONObject(payload);
            long next = WidgetSnapshotHelper.nextRefreshMs(root, now);
            return next > now ? next : WidgetSnapshotHelper.nextMidnightMs(now);
        } catch (Exception ignored) {
            return WidgetSnapshotHelper.nextMidnightMs(now);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        if (!ACTION_REFRESH.equals(intent.getAction())) return;
        Context appContext = context.getApplicationContext();

        ScheduleWidgetProvider.requestWidgetUpdate(appContext);
        ScheduleSummaryWidgetProvider.requestWidgetUpdate(appContext);

        schedule(appContext);
    }
}
