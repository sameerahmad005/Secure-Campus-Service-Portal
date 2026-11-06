/** Small JSON wrapper around localStorage that never throws (private mode, quota, blocked storage). */
export function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocal<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: the change lasts for this session only */
  }
}

export interface ActivityEntry {
  id: string;
  title: string;
  detail?: string;
  at: string;
}

const activityKey = (slug: string) => `amu-activity-${slug}`;

export function readActivity(slug: string): ActivityEntry[] {
  return readLocal<ActivityEntry[]>(activityKey(slug), []);
}

export function logActivity(slug: string, title: string, detail?: string): ActivityEntry[] {
  const next = [{ id: `${Date.now()}`, title, detail, at: new Date().toISOString() }, ...readActivity(slug)].slice(0, 25);
  writeLocal(activityKey(slug), next);
  window.dispatchEvent(new CustomEvent('amu-activity', { detail: slug }));
  return next;
}
