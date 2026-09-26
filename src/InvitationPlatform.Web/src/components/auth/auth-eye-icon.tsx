export function AuthEyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
        <path
          d="M3 3l18 18M10.58 10.58A2 2 0 0 0 12 18a2 2 0 0 0 1.42-.58M6.71 6.71A10.94 10.94 0 0 0 2 12s3.5 7 10 7a10.8 10.8 0 0 0 5.29-1.42M17.94 17.94A10.94 10.94 0 0 0 22 12s-3.5-7-10-7a10.8 10.8 0 0 0-5.29 1.42"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}
