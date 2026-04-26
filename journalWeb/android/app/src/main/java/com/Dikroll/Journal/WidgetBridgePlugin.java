package com.Dikroll.Journal;

import android.content.Context;
import android.content.SharedPreferences;
import com.Dikroll.Journal.widgets.GoalsSummaryWidgetProvider;
import com.Dikroll.Journal.widgets.ScheduleSummaryWidgetProvider;
import com.Dikroll.Journal.widgets.ScheduleWidgetProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    private SharedPreferences getWidgetPrefs() {
        return getContext()
            .getApplicationContext()
            .getSharedPreferences(
                ScheduleWidgetProvider.PREFERENCES_NAME,
                Context.MODE_PRIVATE
            );
    }

    @PluginMethod
    public void saveSchedule(PluginCall call) {
        String payload = call.getString("payload", "");
        Context appContext = getContext().getApplicationContext();
        getWidgetPrefs().edit().putString(ScheduleWidgetProvider.PAYLOAD_KEY, payload).commit();
        ScheduleWidgetProvider.requestWidgetUpdate(appContext);
        ScheduleSummaryWidgetProvider.requestWidgetUpdate(appContext);

        JSObject ret = new JSObject();
        ret.put("saved", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void clearSchedule(PluginCall call) {
        Context appContext = getContext().getApplicationContext();
        getWidgetPrefs().edit().remove(ScheduleWidgetProvider.PAYLOAD_KEY).commit();
        ScheduleWidgetProvider.requestWidgetUpdate(appContext);
        ScheduleSummaryWidgetProvider.requestWidgetUpdate(appContext);

        JSObject ret = new JSObject();
        ret.put("cleared", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void saveGoals(PluginCall call) {
        String payload = call.getString("payload", "");
        Context appContext = getContext().getApplicationContext();
        getWidgetPrefs().edit().putString(GoalsSummaryWidgetProvider.PAYLOAD_KEY, payload).commit();
        GoalsSummaryWidgetProvider.requestWidgetUpdate(appContext);

        JSObject ret = new JSObject();
        ret.put("saved", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void clearGoals(PluginCall call) {
        Context appContext = getContext().getApplicationContext();
        getWidgetPrefs().edit().remove(GoalsSummaryWidgetProvider.PAYLOAD_KEY).commit();
        GoalsSummaryWidgetProvider.requestWidgetUpdate(appContext);

        JSObject ret = new JSObject();
        ret.put("cleared", true);
        call.resolve(ret);
    }
}
