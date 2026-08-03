import type { SourceView } from "@/types/catalog";

import { CanonBadge } from "./Badges";

export function SourceList({ sources }: { sources: SourceView[] }) {
  return (
    <ul className="sourceList">
      {sources.map((source) => (
        <li key={source.id}>
          <strong>{source.label}</strong>
          <div className="sourceMeta">
            {source.type} · {source.originType}
          </div>
          <CanonBadge status={source.canonStatus} />
        </li>
      ))}
    </ul>
  );
}
