import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  badges,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  badges?: ReactNode;
  compact?: boolean;
}) {
  return (
    <header className={`pageHeader${compact ? " pageHeaderCompact" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p className="lede">{description}</p>
      {badges ? <div className="statusRow">{badges}</div> : null}
    </header>
  );
}
