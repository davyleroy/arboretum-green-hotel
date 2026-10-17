/** Thin line icons drawn for the amenities row. 1.2 px strokes, 32 px grid. */
const base = {
  width: 32,
  height: 32,
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const icons = {
  rooms: (
    <svg {...base}><path d="M4 23V10M4 18h24v5M28 23v-5M4 18v-4h9a3 3 0 0 1 3 3v1" /><circle cx="8.5" cy="14.5" r="1.8" /></svg>
  ),
  restaurant: (
    <svg {...base}><path d="M10 4v10a3 3 0 0 1-3 3v11M7 4v8M13 4v8M7 17h0" /><path d="M22 28V4c3 2 4.5 6 4.5 11H22" /></svg>
  ),
  coffee: (
    <svg {...base}><path d="M6 13h16v6a7 7 0 0 1-7 7h-2a7 7 0 0 1-7-7v-6z" /><path d="M22 15h2a3 3 0 0 1 0 6h-2.6" /><path d="M11 9c0-2 2-2 2-4M15 9c0-2 2-2 2-4" /></svg>
  ),
  hall: (
    <svg {...base}><rect x="5" y="5" width="22" height="13" /><path d="M16 18v4M10 27l6-5 6 5" /></svg>
  ),
  wifi: (
    <svg {...base}><path d="M4 12.5a17 17 0 0 1 24 0M8 17a11 11 0 0 1 16 0M12 21.5a5.5 5.5 0 0 1 8 0" /><circle cx="16" cy="25.5" r="0.9" fill="currentColor" /></svg>
  ),
  parking: (
    <svg {...base}><rect x="5" y="5" width="22" height="22" rx="2" /><path d="M13 23V10h4.5a3.5 3.5 0 0 1 0 7H13" /></svg>
  ),
  reception: (
    <svg {...base}><path d="M5 23h22M7 23a9 9 0 0 1 18 0M16 14v-2M14 12h4" /><path d="M4 27h24" /></svg>
  ),
  garden: (
    <svg {...base}><path d="M16 28V14" /><path d="M16 18c-5 0-8-3-8-8 5 0 8 3 8 8zM16 15c0-5 3-8 8-8 0 5-3 8-8 8z" /><path d="M8 28h16" /></svg>
  ),
};

export function Arrow() {
  return (
    <svg width="22" height="10" viewBox="0 0 22 10" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden>
      <path d="M0 5h20M16 1l4 4-4 4" />
    </svg>
  );
}
