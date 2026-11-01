import Image from "next/image";
import Link from "next/link";
import { readPublishedTeamLineups } from "../../../../shared/branding";
import type { TeamView } from "@/types/catalog";
import styles from "./TeamLineupBanner.module.css";

export function TeamLineupBanner({ team }: { team: TeamView }) {
  const lineup = readPublishedTeamLineups().find(item => item.teamId === team.id);
  if (!lineup) return null;
  const players = lineup.playerIds.map(id => team.roster.find(player => player.playerId === id));
  if (players.some(player => !player)) throw new Error(`Published lineup missing player: ${team.id}`);

  return <figure className={styles.banner}>
    <div className={styles.heading}>
      <span>Team lineup</span>
      <span>{team.gameName} / {team.rosterLevel}</span>
    </div>
    <div className={styles.scroll}>
      <div className={styles.content}>
        <a href={`/team-lineups/${team.id}.png`} aria-label={`View full-size lineup for ${team.name}`}>
          <Image className={styles.image} src={`/team-lineups/${team.id}.png`}
            width={lineup.width} height={lineup.height} sizes="(max-width: 760px) 800px, 100vw"
            loading="eager"
            alt={`Illustrated five-player lineup for ${team.name}`} />
        </a>
        <figcaption className={styles.players}>
          {players.map(player => player && <div className={styles.player} key={player.playerId}>
            <Link href={`/wiki/players/${player.slug}`}>{player.nickname}</Link>
            {player.role !== "TBD" && <span>{player.role}</span>}
          </div>)}
        </figcaption>
      </div>
    </div>
  </figure>;
}
