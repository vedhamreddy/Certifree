export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 88 106" aria-hidden="true">
      <path d="M24 60 L14 96 L28 88 L38 100 L46 66 Z" fill="#10B981" />
      <path d="M64 60 L74 96 L60 88 L50 100 L42 66 Z" fill="#10B981" />
      <circle cx="44" cy="42" r="38" fill="#4F46E5" />
      <circle cx="44" cy="42" r="29" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M29 43 L39 53 L60 31" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark size={30} />
      <span className="font-display text-xl font-bold tracking-tight text-ink">
        Certi<span className="text-free">Free</span>
      </span>
    </span>
  );
}
