export function ChampionFavoritesRow({ champions }: { champions: string[] }) {
  if (!champions.length) return <>TBD</>;
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.35rem" }}>
      {champions.map((champion, index) => (
        <span key={champion} className="badge badgeRole" title={index === 0 ? "Representative champion" : "Also favored"}>
          {champion}
          {index === 0 ? " ★" : ""}
        </span>
      ))}
    </span>
  );
}
