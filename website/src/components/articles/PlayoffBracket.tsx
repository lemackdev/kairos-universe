import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import styles from "./PlayoffBracket.module.css";

export interface BracketTeam {
  key: string;
  name: string;
  href: string | null;
  logo?: ReactNode;
}

export interface BracketRound {
  name: string;
  matchFormat?: string;
  matches: Array<{ teamA: BracketTeam | null; teamB: BracketTeam | null }>;
}

function Slot({ team }: { team: BracketTeam | null }) {
  if (!team) return <div className={`${styles.slot} ${styles.tbd}`}><span className={styles.mark}>?</span><span>TBD</span></div>;
  return <div className={styles.slot}>
    <span className={styles.logo}>{team.logo ?? <span className={styles.mono}>{team.name.slice(0, 2)}</span>}</span>
    {team.href ? <Link href={team.href}>{team.name}</Link> : <span>{team.name}</span>}
  </div>;
}

export function PlayoffBracket({ title, rounds }: { title: string; rounds: BracketRound[] }) {
  const base = rounds[0]?.matches.length ?? 0;
  return <details className={styles.section} open>
    <summary className={styles.head}><span>{title}</span><span className={styles.chevron} aria-hidden="true" /></summary>
    <div className={styles.scroll}>
      <div className={styles.bracket}>
        {rounds.map((round, r) => {
          const span = 2 ** (r + 1);
          const last = r === rounds.length - 1;
          return <div className={styles.round} key={round.name}>
            <div className={styles.roundName}>{round.name}{round.matchFormat && <span className={styles.bo}>{round.matchFormat}</span>}</div>
            <div className={styles.column} style={{ gridTemplateRows: `repeat(${base * 2}, var(--unit))` }}>
              {round.matches.map((match, i) => <div
                key={i}
                className={`${styles.match} ${r > 0 ? styles.hasIn : ""} ${last ? "" : i % 2 === 0 ? styles.up : styles.down}`}
                style={{ gridRow: `${i * span + 1} / span ${span}`, "--half": 2 ** r } as CSSProperties}
              >
                <div className={styles.box}><Slot team={match.teamA} /><Slot team={match.teamB} /></div>
              </div>)}
            </div>
          </div>;
        })}
      </div>
    </div>
  </details>;
}
