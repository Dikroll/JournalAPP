package com.Dikroll.Journal.widgets;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * Re-arms the midnight alarm and refreshes widgets after device boot or app
 * update. Without this, the AlarmManager queue is wiped on reboot and the
 * widget would only refresh again the next time the user opens the app.
 */
public class WidgetBootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (action == null) return;
        if (!Intent.ACTION_BOOT_COMPLETED.equals(action)
            && !Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)) {
            return;
        }
        Context appContext = context.getApplicationContext();
        WidgetMidnightScheduler.schedule(appContext);
        ScheduleWidgetProvider.requestWidgetUpdate(appContext);
        ScheduleSummaryWidgetProvider.requestWidgetUpdate(appContext);
        GoalsSummaryWidgetProvider.requestWidgetUpdate(appContext);
    }
}
