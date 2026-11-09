"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { CsRoleIcons } from "@/components/CsRoleIcons";
import styles from "./CompetitionParticipants.module.css";

export interface CompetitionRosterPlayer {
  name: string;
  href: string | null;
  nationality: string | null;
  flagCode: string | null;
  role: string | null;
}

export interface CompetitionParticipant {
  key: string;
  name: string;
  href: string | null;
  logo?: ReactNode;
  logoTone?: "dark";
  roster: CompetitionRosterPlayer[];
}

export function CompetitionParticipants({ caption, teams, empty, columns = 4 }: {
  caption: string;
  teams: CompetitionParticipant[];
  empty: string;
  columns?: number;
}) {
  const [showRosters, setShowRosters] = useState(false);
  const hasRosters = teams.some((team) => team.roster.length > 0);

  return <div className={styles.wrap}>
    <div className={styles.heading}>
      <div className={styles.caption}>{caption}</div>
      {hasRosters && <button className={styles.toggle} type="button" onClick={() => setShowRosters((shown) => !shown)}
        aria-expanded={showRosters} aria-controls="competition-rosters">
        <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" fill="none">
          <path d="M1.2 8s2.25-4.1 6.8-4.1S14.8 8 14.8 8 12.55 12.1 8 12.1 1.2 8 1.2 8Z" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        {showRosters ? "Hide Rosters" : "Show Rosters"}
      </button>}
    </div>
    {teams.length ? <div className={`${styles.grid} ${columns === 4 ? styles.four : ""}`} id="competition-rosters">
      {teams.map((team) => <article className={styles.card} key={team.key}>
        {team.href ? <Link className={styles.teamLink} href={team.href}>
          <span className={`${styles.logo}${team.logo ? ` ${styles.logoImage}` : ""}${team.logoTone === "dark" ? ` ${styles.logoDark}` : ""}`}>
            {team.logo ?? <span className={styles.monogram}>{team.name.slice(0, 2)}</span>}
          </span>
          <strong>{team.name}</strong>
        </Link> : <div className={styles.teamLink}>
          <span className={`${styles.logo}${team.logo ? ` ${styles.logoImage}` : ""}${team.logoTone === "dark" ? ` ${styles.logoDark}` : ""}`}>
            {team.logo ?? <span className={styles.monogram}>{team.name.slice(0, 2)}</span>}
          </span>
          <strong>{team.name}</strong>
        </div>}
        {showRosters && <div className={styles.roster}>
          {team.roster.length ? team.roster.map((player, index) => <div className={styles.player} key={`${player.name}-${index}`}>
            {player.flagCode && <img className={styles.flag} src={`/flags/${player.flagCode}.${player.flagCode === "pr" ? "svg" : "png"}`} alt={player.nationality ?? ""} title={player.nationality ?? undefined} />}
            {player.href ? <Link className={styles.playerName} href={player.href}>{player.name}</Link> : <span className={styles.playerName}>{player.name}</span>}
            {player.role && (/igl|awper|rifler/i.test(player.role)
              ? <CsRoleIcons role={player.role} size={16} />
              : <img className={styles.role} src={`/role-icons/${player.role === "adc" ? "bot" : player.role}.svg`} alt="" title={player.role === "adc" ? "Bot Lane / ADC" : player.role} />)}
          </div>) : <p className={styles.noRoster}>Roster not available</p>}
        </div>}
      </article>)}
    </div> : <div className={styles.empty}>{empty}</div>}
  </div>;
}
