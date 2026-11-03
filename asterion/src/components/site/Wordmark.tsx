import Link from "next/link";

export function WordmarkMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="14.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="16" cy="16" r="8.5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2.2 2.2" />
      <path d="M16 1.5v6M16 24.5v6M1.5 16h6M24.5 16h6" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="16" cy="16" r="2.4" fill="var(--signal)" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <Link href="/" className="wordmark" aria-label="Asterion Intelligence, home">
      <WordmarkMark className="wordmark-mark" />
      <span className="wordmark-text">
        <span className="wordmark-name">Asterion</span>
        <span className="wordmark-sub">Intelligence</span>
      </span>
    </Link>
  );
}
