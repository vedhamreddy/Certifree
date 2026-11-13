export function SearchBar({ defaultValue = "", big = false }: { defaultValue?: string; big?: boolean }) {
  return (
    <form action="/courses" role="search" className={`flex w-full items-center rounded-2xl border border-line bg-surface shadow-[0_10px_30px_rgba(79,70,229,0.15)] ${big ? "p-2 pl-5" : "p-1.5 pl-4"}`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-muted" aria-hidden>
        <circle cx="11" cy="11" r="7" /><path d="M21 21l-5-5" />
      </svg>
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder='Search "cloud", "Python", "cybersecurity"...'
        aria-label="Search courses"
        className={`min-w-0 flex-1 bg-transparent px-3 outline-none placeholder:text-muted ${big ? "py-2.5 text-lg" : "py-2"}`}
      />
      <button className={`rounded-xl bg-brand font-semibold text-white transition hover:bg-brand-600 ${big ? "px-6 py-3" : "px-4 py-2"}`}>Search</button>
    </form>
  );
}
