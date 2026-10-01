/**
 * Sunset (maghrib) calculation with no external services.
 *
 * Standard astronomical algorithm (the same math used by the well-known
 * SunCalc library): solar mean anomaly, ecliptic longitude, declination and
 * the hour angle for the official sunset zenith of 90.833 degrees.
 *
 * When the user has not shared their location, coordinates are estimated
 * from the device timezone (longitude = UTC offset, latitude assumed 30°N),
 * which still tracks the season correctly via solar declination.
 */

export interface Coords {
  lat: number;
  lon: number;
}

export interface ReminderWindow {
  start: Date;
  end: Date;
}

const DAY_MS = 86_400_000;
const J1970 = 2440588;
const J2000 = 2451545;
const RAD = Math.PI / 180;
const OBLIQUITY = RAD * 23.4397;

const toJulian = (date: Date) => date.valueOf() / DAY_MS - 0.5 + J1970;
const fromJulian = (j: number) => new Date((j + 0.5 - J1970) * DAY_MS);
const toDays = (date: Date) => toJulian(date) - J2000;

const solarMeanAnomaly = (d: number) => RAD * (357.5291 + 0.98560028 * d);

const eclipticLongitude = (M: number) => {
  const C =
    RAD *
    (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  return M + C + RAD * 102.9372 + Math.PI;
};

const declination = (L: number) => Math.asin(Math.sin(OBLIQUITY) * Math.sin(L));

const julianCycle = (d: number, lw: number) =>
  Math.round(d - 0.0009 - lw / (2 * Math.PI));

const approxTransit = (Ht: number, lw: number, n: number) =>
  0.0009 + (Ht + lw) / (2 * Math.PI) + n;

const solarTransitJ = (ds: number, M: number, L: number) =>
  J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);

const hourAngle = (h: number, phi: number, d: number) =>
  Math.acos(
    (Math.sin(h) - Math.sin(phi) * Math.sin(d)) /
      (Math.cos(phi) * Math.cos(d)),
  );

/** Official sunset (sun's upper limb on the horizon) for the given date. */
export function sunsetAt(date: Date, { lat, lon }: Coords): Date | null {
  const lw = RAD * -lon;
  const phi = RAD * lat;
  const d = toDays(date);
  const n = julianCycle(d, lw);
  const ds = approxTransit(0, lw, n);
  const M = solarMeanAnomaly(ds);
  const L = eclipticLongitude(M);
  const dec = declination(L);
  const h = -0.833 * RAD; // zenith 90.833°
  const w = hourAngle(h, phi, dec);
  if (Number.isNaN(w)) return null; // polar day/night — no sunset
  return fromJulian(solarTransitJ(approxTransit(w, lw, n), M, L));
}

/** Fallback coordinates derived from the device timezone. */
export function estimateCoordsFromTimezone(date: Date): Coords {
  // getTimezoneOffset() is minutes west of UTC; 15° of longitude per hour.
  const lon = -date.getTimezoneOffset() / 4;
  return { lat: 30, lon };
}

/** Maghrib on the civil day containing `date`, using real or estimated coords. */
export function maghribOn(date: Date, coords: Coords | null): Date | null {
  const c = coords ?? estimateCoordsFromTimezone(date);
  return sunsetAt(date, c);
}

/**
 * Active reminder window: from maghrib on the most recent Thursday
 * (local calendar) until maghrib the following day (Friday).
 * Returns null when `now` is outside the window.
 */
export function fridayReminderWindow(
  now: Date,
  coords: Coords | null,
): ReminderWindow | null {
  const daysSinceThursday = (now.getDay() - 4 + 7) % 7; // JS: 4 = Thursday
  const thursday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - daysSinceThursday,
    12,
  );
  const friday = new Date(
    thursday.getFullYear(),
    thursday.getMonth(),
    thursday.getDate() + 1,
    12,
  );
  const start = maghribOn(thursday, coords);
  const end = maghribOn(friday, coords);
  if (!start || !end) return null;
  return now >= start && now < end ? { start, end } : null;
}
