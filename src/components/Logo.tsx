export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#0A0A0A" />
      <path d="M12.5 20.5 L17.5 25.5 L28 14.5" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={30} />
      <span className="font-display text-[19px] font-extrabold tracking-tight text-ink">CertiFree</span>
    </span>
  );
}
