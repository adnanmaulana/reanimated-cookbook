export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="5" r="2.5" stroke="#12272A" strokeWidth="2" />
      <circle cx="6" cy="19" r="2.5" stroke="#12272A" strokeWidth="2" />
      <circle cx="18" cy="8" r="2.5" stroke="#2F5BFF" strokeWidth="2" />
      <path d="M6 7.5v9M18 10.5c0 4-6 3-11 6" stroke="#12272A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
