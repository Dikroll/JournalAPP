package com.Dikroll.Journal.widgets;

public final class WidgetTextHelpers {
    private WidgetTextHelpers() {}

    /**
     * Strips a parenthetical suffix from a room string so long values like
     * "АУ 8 (5 этаж)" collapse to "АУ 8" for tight widget rows.
     */
    public static String shortRoom(String room) {
        if (room == null) return "";
        int paren = room.indexOf('(');
        if (paren < 0) return room.trim();
        return room.substring(0, paren).trim();
    }
}
