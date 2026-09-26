import type { ReactNode } from "react";

type IconName =
  | "calendar-check"
  | "users"
  | "bar-chart"
  | "palette"
  | "settings"
  | "chevron-right"
  | "plus"
  | "chrome"
  | "calendar"
  | "edit"
  | "settings-row"
  | "eye"
  | "qr-code"
  | "images"
  | "trash"
  | "heart"
  | "languages"
  | "link"
  | "map-pin"
  | "user"
  | "home"
  | "credit-card"
  | "package"
  | "download"
  | "globe"
  | "arrow-left"
  | "file-text"
  | "chevron-down"
  | "check";

const paths: Record<IconName, ReactNode> = {
  "calendar-check": (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M9 15l2 2 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  users: (
    <>
      <path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path d="M22 19v-1a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.75" fill="none" />
    </>
  ),
  "bar-chart": (
    <>
      <path d="M6 20V10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M12 20V4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M18 20v-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  palette: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <circle cx="8.5" cy="10.5" r="1.25" fill="currentColor" />
      <circle cx="12" cy="8" r="1.25" fill="currentColor" />
      <circle cx="15" cy="11" r="1.25" fill="currentColor" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path
        d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </>
  ),
  "chevron-right": (
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  chrome: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path d="M12 3a15 15 0 0 1 4 8M12 3a15 15 0 0 0-4 8M4 12h16" stroke="currentColor" strokeWidth="1.75" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),
  "settings-row": (
    <>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        strokeWidth="1.75"
        fill="none"
      />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" fill="none" />
    </>
  ),
  "qr-code": (
    <>
      <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path d="M14 14h2v2h-2zM18 14h3v3h-3zM14 18h2v3h-2zM18 21h3v-3h-3z" fill="currentColor" />
    </>
  ),
  images: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path d="m21 16-5.5-5.5L5 19" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  heart: (
    <path
      d="M12 20s-7-4.35-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 15.65 12 20 12 20Z"
      stroke="currentColor"
      strokeWidth="1.75"
      fill="none"
    />
  ),
  languages: (
    <>
      <path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a3.5 3.5 0 0 0 4.95 0l2.12-2.12a3.5 3.5 0 0 0-4.95-4.95L11 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M14 11a3.5 3.5 0 0 0-4.95 0L6.93 13.12a3.5 3.5 0 0 0 4.95 4.95L13 17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  "map-pin": (
    <>
      <path d="M12 21s6-4.35 6-10a6 6 0 1 0-12 0c0 5.65 6 10 6 10Z" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.75" fill="none" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path d="M4 20c0-4 3.58-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  home: (
    <>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),
  "credit-card": (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.75" />
      <path d="M7 15h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  package: (
    <>
      <path
        d="M12 3 21 8v8l-9 5-9-5V8l9-5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M12 12 21 8M12 12v9M12 12 3 8" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="m8 11 4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"
        stroke="currentColor"
        strokeWidth="1.75"
        fill="none"
      />
    </>
  ),
  "arrow-left": (
    <path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  "file-text": (
    <>
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  "chevron-down": (
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  check: (
    <path
      d="M5 12l3 3 7-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
};

export function DashboardIcon({
  name,
  className = "size-4",
  active = false,
}: {
  name: IconName;
  className?: string;
  active?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} shrink-0 ${active ? "text-white" : "text-current"}`}
      fill="none"
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}
