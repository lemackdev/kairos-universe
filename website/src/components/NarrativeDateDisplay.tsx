export function NarrativeDateDisplay({
  date,
  episode,
}: {
  date: string;
  episode: number;
}) {
  return (
    <dl>
      <div>
        <dt>Narrative date</dt>
        <dd>
          <time dateTime={date}>{formatDate(date)}</time>
        </dd>
      </div>
      <div>
        <dt>Current episode</dt>
        <dd>{episode}</dd>
      </div>
    </dl>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
