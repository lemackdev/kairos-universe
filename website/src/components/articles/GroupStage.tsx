import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./GroupStage.module.css";

export interface GroupStageTeam {
  key: string;
  name: string;
  href: string | null;
  logo?: ReactNode;
  tbd?: boolean;
  wins?: number;
  losses?: number;
  maps?: number;
  roundsWon?: number;
  roundsLost?: number;
  roundDiff?: number;
}

export interface GroupStageMatch {
  key: string;
  round: number;
  teamA: GroupStageTeam;
  teamB: GroupStageTeam;
  format: string;
  mapsA: number | null;
  mapsB: number | null;
}

const signed = (value: number) => (value > 0 ? `+${value}` : String(value));

function TeamCell({ team }: { team: GroupStageTeam }) {
  if (team.tbd) return <span className={`${styles.team} ${styles.tbdTeam}`}><span className={styles.tbdMark} aria-hidden="true">?</span><span>TBD</span></span>;
  return <span className={styles.team}>
    <span className={styles.logo}>{team.logo ?? <span className={styles.mono}>{team.name.slice(0, 2)}</span>}</span>
    {team.href ? <Link href={team.href}>{team.name}</Link> : <span>{team.name}</span>}
  </span>;
}

export function GroupStage({ groups, format, advancing }: { groups: Array<{ name: string; teams: GroupStageTeam[]; matches: GroupStageMatch[] }>; format: string; advancing: number }) {
  return <div className={styles.wrap}>
    <p className={styles.note}>{format}. The {advancing === 2 ? "two best teams" : `${advancing} best teams`} of each group advance. Every match is a best of three.</p>
    <div className={styles.grid}>
      {groups.map((group) => <div className={styles.block} key={group.name}>
        <table className={styles.group}>
          <caption>{group.name}</caption>
          <thead><tr><th scope="col">#</th><th scope="col">Team</th><th scope="col" title="Maps played">M</th><th scope="col" title="Rounds won">RW</th><th scope="col" title="Rounds lost">RL</th><th scope="col" title="Round difference">RD</th><th scope="col" className={styles.recordHead} title="Match record (wins - losses)">Record</th></tr></thead>
          <tbody>
            {group.teams.map((team, index) => <tr key={team.key} className={index < advancing ? styles.advance : styles.eliminated}>
              <th scope="row">{index + 1}</th>
              <td><TeamCell team={team} /></td>
              <td className={styles.num}>{team.maps ?? 0}</td>
              <td className={styles.num}>{team.roundsWon ?? 0}</td>
              <td className={styles.num}>{team.roundsLost ?? 0}</td>
              <td className={styles.num}>{signed(team.roundDiff ?? 0)}</td>
              <td className={`${styles.num} ${styles.record}`}>{team.wins ?? 0} - {team.losses ?? 0}</td>
            </tr>)}
          </tbody>
        </table>
      </div>)}
    </div>
  </div>;
}

export function GroupMatches({ groups, title }: { groups: Array<{ name: string; matches: GroupStageMatch[] }>; title?: string }) {
  const body = <div className={styles.wrap}>
    <div className={styles.grid}>
      {groups.map((group) => <details className={styles.block} key={group.name} open aria-label={`${group.name} matches`}>
        <summary className={styles.matchHead}><span>{group.name}</span><span className={styles.chevron} aria-hidden="true" /></summary>
        {[1, 2, 3].map((round) => <div className={styles.round} key={round}>
          <div className={styles.roundLabel}>Round {round}</div>
          {group.matches.filter((match) => match.round === round).map((match) => {
            const played = match.mapsA !== null && match.mapsB !== null;
            return <div key={match.key} className={styles.match}>
              <span className={`${styles.side} ${played && match.mapsA! > match.mapsB! ? styles.won : ""}`}><TeamCell team={match.teamA} /></span>
              <span className={styles.score}>{played ? `${match.mapsA} : ${match.mapsB}` : "x"}</span>
              <span className={`${styles.side} ${styles.right} ${played && match.mapsB! > match.mapsA! ? styles.won : ""}`}><TeamCell team={match.teamB} /></span>
            </div>;
          })}
        </div>)}
      </details>)}
    </div>
  </div>;
  if (!title) return body;
  return <details className={styles.section} open>
    <summary className={styles.sectionHead}><h3>{title}</h3><span className={styles.chevron} aria-hidden="true" /></summary>
    {body}
  </details>;
}
