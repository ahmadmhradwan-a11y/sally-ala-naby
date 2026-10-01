import { useCallback, useSyncExternalStore } from "react";

/**
 * Offline-first local persistence.
 *
 * All user data lives in localStorage (spec: data must survive closing the
 * app and restarting the device). A small in-memory fallback keeps the app
 * working in private-browsing modes where storage writes may throw.
 * Cross-component/cross-tab updates are propagated via a CustomEvent plus
 * the native `storage` event.
 */

const COUNT_KEY = "salawat.count.v1";
const SETTINGS_KEY = "salawat.settings.v1";
const LAST_NOTIFIED_KEY = "salawat.lastNotifiedDay.v1";

const COUNT_EVENT = "salawat:count";
const SETTINGS_EVENT = "salawat:settings";

export interface TasbihPos {
  x: number;
  y: number;
}

export type MaghribMode = "estimate" | "location";

export interface AppSettings {
  /** Whether the floating tasbih bubble is shown across the app. */
  tasbihEnabled: boolean;
  /** Last resting position (px from top-left) of the floating tasbih. */
  tasbihPos: TasbihPos | null;
  /** Whether the Friday reminder notification is allowed. */
  notificationsEnabled: boolean;
  /** How maghrib time is computed: timezone estimate or device location. */
  maghribMode: MaghribMode;
  /** Device coordinates, only when the user opted in. */
  location: { lat: number; lon: number } | null;
}

export const DEFAULT_SETTINGS: AppSettings = {
  tasbihEnabled: false,
  tasbihPos: null,
  notificationsEnabled: false,
  maghribMode: "estimate",
  location: null,
};

/* ------------------------------------------------------------------ */
/* Raw storage helpers (safe against quota/private-mode errors)        */
/* ------------------------------------------------------------------ */

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function emit(name: string) {
  window.dispatchEvent(new CustomEvent(name));
}

/* ------------------------------------------------------------------ */
/* Salawat counter                                                     */
/* ------------------------------------------------------------------ */

let memoryCount = 0;

export function getSalawatCount(): number {
  const raw = safeGet(COUNT_KEY);
  if (raw === null) return memoryCount;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function setSalawatCount(value: number) {
  memoryCount = value;
  safeSet(COUNT_KEY, String(value));
  emit(COUNT_EVENT);
}

function subscribeCount(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === COUNT_KEY || event.key === null) onChange();
  };
  window.addEventListener(COUNT_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(COUNT_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Reactive salawat counter shared by the main counter and the floating tasbih. */
export function useSalawatCount() {
  const count = useSyncExternalStore(subscribeCount, getSalawatCount);
  const increment = useCallback(() => {
    setSalawatCount(getSalawatCount() + 1);
  }, []);
  const reset = useCallback(() => {
    setSalawatCount(0);
  }, []);
  return { count, increment, reset };
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

let memorySettings: AppSettings | null = null;
let settingsCache: { raw: string | null; value: AppSettings } = {
  raw: undefined as unknown as string | null,
  value: DEFAULT_SETTINGS,
};

export function getSettings(): AppSettings {
  const raw = safeGet(SETTINGS_KEY);
  if (raw === null) return memorySettings ?? DEFAULT_SETTINGS;
  if (settingsCache.raw === raw) return settingsCache.value;
  let parsed: AppSettings = DEFAULT_SETTINGS;
  try {
    const data = JSON.parse(raw) as Partial<AppSettings>;
    parsed = {
      tasbihEnabled: data.tasbihEnabled === true,
      tasbihPos:
        data.tasbihPos &&
        typeof data.tasbihPos.x === "number" &&
        typeof data.tasbihPos.y === "number"
          ? data.tasbihPos
          : null,
      notificationsEnabled: data.notificationsEnabled === true,
      maghribMode: data.maghribMode === "location" ? "location" : "estimate",
      location:
        data.location &&
        typeof data.location.lat === "number" &&
        typeof data.location.lon === "number"
          ? data.location
          : null,
    };
  } catch {
    parsed = DEFAULT_SETTINGS;
  }
  settingsCache = { raw, value: parsed };
  return parsed;
}

export function patchSettings(patch: Partial<AppSettings>) {
  const next = { ...getSettings(), ...patch };
  memorySettings = next;
  safeSet(SETTINGS_KEY, JSON.stringify(next));
  settingsCache = { raw: safeGet(SETTINGS_KEY), value: next };
  emit(SETTINGS_EVENT);
}

function subscribeSettings(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === SETTINGS_KEY || event.key === null) onChange();
  };
  window.addEventListener(SETTINGS_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(SETTINGS_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSettings() {
  return useSyncExternalStore(subscribeSettings, getSettings);
}

/* ------------------------------------------------------------------ */
/* Reminder bookkeeping                                                */
/* ------------------------------------------------------------------ */

export function getLastNotifiedDay(): string | null {
  return safeGet(LAST_NOTIFIED_KEY);
}

export function setLastNotifiedDay(day: string) {
  safeSet(LAST_NOTIFIED_KEY, day);
}
