import { WeatherAlert } from "@/types/weather";

const NOTIFICATION_CACHE_KEY = "weatherai_notified_alerts";

export function getNotifiedAlerts(): Record<string, number> {
    if (typeof window === "undefined") return {};
    try {
        const raw = localStorage.getItem(NOTIFICATION_CACHE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

export function saveNotifiedAlert(alertId: string) {
    if (typeof window === "undefined") return;
    const cache = getNotifiedAlerts();
    // Store timestamp of when we last notified them about this alert ID
    cache[alertId] = Date.now();
    localStorage.setItem(NOTIFICATION_CACHE_KEY, JSON.stringify(cache));
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === "undefined" || !("Notification" in window)) {
        return Promise.resolve("denied");
    }

    if (Notification.permission === "granted" || Notification.permission === "denied") {
        return Promise.resolve(Notification.permission);
    }

    return Notification.requestPermission();
}

/**
 * Triggers a native system push notification.
 * Works dynamically on mobile utilizing the active Service Worker.
 */
export async function triggerPushNotification(alert: WeatherAlert) {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
        return;
    }

    if (Notification.permission !== "granted") {
        console.warn("Cannot send push notification, permission not granted.");
        return;
    }

    // Create a unique ID for this alert based on type and current date
    // e.g. "heat_2026-06-25" -> We only notify about heat once per day.
    const today = new Date().toISOString().split("T")[0];
    const alertId = `${alert.type}_${today}`;

    const cache = getNotifiedAlerts();

    // If we already notified for this condition today, skip to avoid spam.
    if (cache[alertId]) {
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;

        await registration.showNotification(`⚠️ SCAMS: ${alert.title}`, {
            body: alert.message,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            // @ts-ignore - TS doesn't recognize vibrate on NotificationOptions but it works in browsers
            vibrate: [200, 100, 200, 100, 200], // SOS vibration pattern for warnings
            tag: alertId, // Prevents stacking duplicates of the same alert
            data: {
                url: window.location.origin + "/dashboard"
            }
        });

        // Save that we successfully notified them
        saveNotifiedAlert(alertId);
        console.log("Successfully triggered push notification:", alertId);
    } catch (error) {
        console.error("Error triggering push notification:", error);
    }
}
