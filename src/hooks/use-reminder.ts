import { useEffect, useMemo, useState } from "react";
import { fridayReminderWindow, type ReminderWindow } from "@/lib/sunset";
import {
  getLastNotifiedDay,
  setLastNotifiedDay,
  useSettings,
} from "@/lib/storage";

const TICK_MS = 30_000;
const REMINDER_TITLE = "صلِّ على محمد ﷺ";
const REMINDER_BODY = "أكثروا من الصلاة على النبي ﷺ";
const NOTIFICATION_TAG = "friday-reminder";

/**
 * Thursday-maghrib → Friday-maghrib reminder.
 *
 * The banner is shown to everyone during the window; the notification is
 * only sent when the user enabled it, granted permission, and has not been
 * notified earlier that calendar day (one quiet notification per day).
 */
export function useFridayReminder() {
  const settings = useSettings();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), TICK_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") setNow(new Date());
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const activeWindow: ReminderWindow | null = useMemo(
    () => fridayReminderWindow(now, settings.location),
    [now, settings.location],
  );

  useEffect(() => {
    if (!settings.notificationsEnabled || !activeWindow) return;
    if (
      typeof Notification === "undefined" ||
      Notification.permission !== "granted"
    ) {
      return;
    }
    // Local YYYY-MM-DD key, one notification per calendar day.
    const dayKey = now.toLocaleDateString("en-CA");
    if (getLastNotifiedDay() === dayKey) return;
    try {
      new Notification(REMINDER_TITLE, {
        body: REMINDER_BODY,
        tag: NOTIFICATION_TAG,
      });
      setLastNotifiedDay(dayKey);
    } catch {
      // Some browsers restrict `new Notification()`; stay quiet rather than crash.
    }
  }, [settings.notificationsEnabled, activeWindow, now]);

  return { isWindowActive: activeWindow !== null, activeWindow };
}
