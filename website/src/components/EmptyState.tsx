export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="emptyState">
      <span className="sectionKicker">Publication state</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
