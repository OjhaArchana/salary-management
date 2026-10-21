const BADGES: Record<string, string> = {
  Engineering: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  Sales: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Marketing: "bg-pink-50 text-pink-700 ring-pink-600/20",
  "Human Resources": "bg-amber-50 text-amber-700 ring-amber-600/20",
  Finance: "bg-sky-50 text-sky-700 ring-sky-600/20",
  Operations: "bg-teal-50 text-teal-700 ring-teal-600/20",
  "Customer Support": "bg-orange-50 text-orange-700 ring-orange-600/20",
  Product: "bg-violet-50 text-violet-700 ring-violet-600/20",
};
const FALLBACK_BADGE = "bg-slate-100 text-slate-700 ring-slate-500/20";

const AVATARS = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-pink-100 text-pink-700",
  "bg-amber-100 text-amber-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
];

export function departmentBadge(department: string): string {
  return BADGES[department] ?? FALLBACK_BADGE;
}

// A simple string hash, so the same person always gets the same colour.
export function avatarColor(seed: string): string {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATARS[hash % AVATARS.length];
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase();
}