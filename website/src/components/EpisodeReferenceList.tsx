import type { EpisodeView } from "@/types/catalog";
import { formatDate } from "@/lib/formatting/date";

export function EpisodeReferenceList({
  episodes,
  limit,
}: {
  episodes: EpisodeView[];
  limit?: number;
}) {
  const visible = limit ? episodes.slice(0, limit) : episodes;

  return (
    <ol className="episodeList">
      {visible.map((episode) => (
        <li key={episode.id}>
          <strong>
            Episode {episode.number}: {episode.title}
          </strong>
          <div className="episodeMeta">
            {episode.date ? formatDate(episode.date) : "Exact date TBD"}
          </div>
          <p className="muted">{episode.summary}</p>
        </li>
      ))}
    </ol>
  );
}
