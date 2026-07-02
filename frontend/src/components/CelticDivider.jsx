export const CelticDivider = ({ className = "" }) => (
  <div className={`flex items-center justify-center gap-4 ${className}`} data-testid="celtic-divider">
    <span className="h-px w-16 sm:w-28 bg-white/10" />
    <svg width="42" height="42" viewBox="0 0 42 42" fill="none" className="opacity-40 shrink-0">
      <g stroke="#A8A39D" strokeWidth="1" fill="none">
        <path d="M21 6 C11 12 11 30 21 36 C31 30 31 12 21 6 Z" />
        <path d="M6 21 C12 11 30 11 36 21 C30 31 12 31 6 21 Z" />
        <circle cx="21" cy="21" r="4" />
      </g>
    </svg>
    <span className="h-px w-16 sm:w-28 bg-white/10" />
  </div>
);
