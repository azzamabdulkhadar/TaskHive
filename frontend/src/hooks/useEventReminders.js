/**
 * useEventReminders
 *
 * Runs once on app mount (inside AppShell so the user is authenticated).
 * - Requests browser Notification permission on first call.
 * - Fetches all upcoming events and schedules a setTimeout for each one
 *   based on its `reminder` offset.
 * - Re-polls every POLL_INTERVAL ms so newly created events are picked up.
 * - Cleans up all timers on unmount.
 */

import { useEffect, useRef } from "react";
import { getEvents } from "../services/api/eventsService";

// How often to re-fetch events and reschedule (10 minutes)
const POLL_INTERVAL = 10 * 60 * 1000;

// Maps the `reminder` enum value → milliseconds BEFORE the event start time
const REMINDER_OFFSET_MS = {
  none:    null,
  at_time:    0,
  "5min":  5  * 60 * 1000,
  "15min": 15 * 60 * 1000,
  "30min": 30 * 60 * 1000,
  "1hour": 60 * 60 * 1000,
  "1day":  24 * 60 * 60 * 1000,
};

const useEventReminders = () => {
  // Track scheduled timer IDs so we can clear them on re-poll / unmount
  const timersRef  = useRef([]);
  // Track which event IDs have already fired this session so we don't double-notify
  const firedRef   = useRef(new Set());

  useEffect(() => {
    // ── 1. Request permission ────────────────────────────────────────────
    if (!("Notification" in window)) return; // browser doesn't support it

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // ── 2. Schedule helper ───────────────────────────────────────────────
    const scheduleReminders = async () => {
      // Clear any previously scheduled timers before rescheduling
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];

      if (Notification.permission !== "granted") return;

      try {
        const res    = await getEvents({ status: "upcoming", limit: 200 });
        const events = res.data?.data?.events ?? [];
        const now    = Date.now();

        events.forEach((ev) => {
          const offset = REMINDER_OFFSET_MS[ev.reminder];
          if (offset === null || offset === undefined) return; // reminder = "none"

          const fireAt    = new Date(ev.startDate).getTime() - offset;
          const delay     = fireAt - now;
          const notifKey  = `${ev._id}-${ev.reminder}`;

          // Don't schedule if already past or already fired this session
          if (delay < 0 || firedRef.current.has(notifKey)) return;

          const timerId = setTimeout(() => {
            firedRef.current.add(notifKey);

            const offsetLabel = ev.reminder === "at_time"
              ? "is starting now"
              : `starts in ${ev.reminder.replace("min", " minutes").replace("hour", " hour").replace("day", " day")}`;

            const notif = new Notification(`📅 ${ev.title}`, {
              body: `${ev.title} ${offsetLabel}.`,
              icon: "/taskHive.png",
              tag:  notifKey,      // deduplicates on OSes that support it
              requireInteraction: false,
            });

            // Clicking the notification focuses the tab
            notif.onclick = () => {
              window.focus();
              notif.close();
            };
          }, delay);

          timersRef.current.push(timerId);
        });
      } catch {
        // Non-fatal — silently skip if the fetch fails
      }
    };

    // ── 3. Run immediately, then poll ────────────────────────────────────
    scheduleReminders();
    const pollId = setInterval(scheduleReminders, POLL_INTERVAL);

    return () => {
      clearInterval(pollId);
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []); // run once on mount
};

export default useEventReminders;
