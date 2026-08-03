import type { ReactNode } from "react";

export interface InfoboxRow {
  label: string;
  value: ReactNode;
}

export function EntityInfobox({
  title,
  monogram,
  rows,
}: {
  title: string;
  monogram: string;
  rows: InfoboxRow[];
}) {
  return (
    <aside className="infobox" aria-label={`${title} facts`}>
      <div className="infoboxMark" aria-hidden="true">
        {monogram}
      </div>
      <div className="infoboxTitle">{title}</div>
      <dl>
        {rows.map((row) => (
          <div className="infoboxRow" key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
