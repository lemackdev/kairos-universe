import Link from "next/link";
import type { ReactNode } from "react";

const gameAccents: Record<string, string> = {
  "League of Legends": "#1f8fff",
  "Counter-Strike": "#e08a2c",
};

export function GameBadge({ game }: { game: string }) {
  const color = gameAccents[game];
  return <span className="gameBadge" style={color ? { borderColor: color, color } : undefined}>{game}</span>;
}

export function EntityCard({
  href,
  kicker,
  title,
  description,
  meta,
  image,
  game,
}: {
  href: string;
  kicker: string;
  title: string;
  description: string;
  meta?: ReactNode;
  image?: ReactNode;
  game?: string;
}) {
  return (
    <Link className="entityCard" href={href}>
      <div className="entityCardHead">
        {image ? <span className="entityCardLogo">{image}</span> : null}
        <div>
          <span className="sectionKicker">{kicker}</span>
          {game ? <GameBadge game={game} /> : null}
        </div>
      </div>
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      {meta ? <span className="entityCardMeta">{meta}</span> : null}
    </Link>
  );
}
