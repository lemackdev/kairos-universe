import type { ReactNode } from "react";
import Link from "next/link";
import type { ScheduleTeam, ScheduleWeek } from "@/lib/leagueSchedule";
import { formatDate } from "@/lib/formatting/date";
import styles from "./LeagueResults.module.css";

export interface LeagueResultTeam extends ScheduleTeam {
  href: string | null;
  logo?: ReactNode;
}

const dayLabel = (iso: string, weekday: string) => {
  const date = new Date(`${iso}T00:00:00Z`);
  return `${weekday} ${date.getUTCDate()} ${date.toLocaleString("en-GB", { month: "short", timeZone: "UTC" })}`;
};

function TeamName({ team, small = false }: { team: LeagueResultTeam; small?: boolean }) {
  const logo = <span className={`${styles.logo}${small ? ` ${styles.logoSmall}` : ""}`}>{team.logo ?? <span className={styles.mono}>{team.name.slice(0, 2)}</span>}</span>;
  return <span className={styles.teamCell}>{logo}{team.href ? <Link href={team.href}>{team.name}</Link> : <span className="name">{team.name}</span>}</span>;
}

// Standings, head-to-head grid and weekly schedule. No series has been played, so every record is 0-0.
export function LeagueResults({ teams, weeks, advancing = 6 }: { teams: LeagueResultTeam[]; weeks: ScheduleWeek[]; advancing?: number }) {
  const byKey = new Map(teams.map((team) => [team.key, team]));
  return <div className={styles.wrap}>
    <div className={styles.top}>
      <div className={styles.panel}>
        <table className={styles.table}>
          <caption>Regular season standings</caption>
          <thead><tr><th>#</th><th>Team</th><th>Series</th><th>%</th><th>Games</th><th>%</th><th>+/-</th><th>Str</th></tr></thead>
          <tbody>{teams.map((team, index) => <tr key={team.key} className={index < advancing ? styles.cut : undefined}>
            <td className={styles.rank}>{index + 1}</td>
            <td className={styles.team}><TeamName team={team} /></td>
            <td>0 - 0</td><td className={styles.muted}>—</td><td>0 - 0</td><td className={styles.muted}>—</td><td>0</td><td className={styles.muted}>—</td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className={styles.panel}>
        <table className={styles.table}>
          <caption>Head to head</caption>
          <thead><tr><th />{teams.map((team) => <th key={team.key} title={team.name}><span className={`${styles.logo} ${styles.logoSmall}`}>{team.logo ?? <span className={styles.mono}>{team.name.slice(0, 2)}</span>}</span></th>)}<th>Total</th><th>WR %</th></tr></thead>
          <tbody>{teams.map((row) => <tr key={row.key}>
            <th scope="row" title={row.name}><span className={`${styles.logo} ${styles.logoSmall}`}>{row.logo ?? <span className={styles.mono}>{row.name.slice(0, 2)}</span>}</span></th>
            {teams.map((column) => row.key === column.key
              ? <td key={column.key} className={styles.diag} />
              : <td key={column.key} className={styles.muted}>0 - 0</td>)}
            <td>0 - 0</td><td className={styles.muted}>—</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
    <div className={styles.heading}>Match schedule</div>
    <div className={styles.weeks}>{weeks.map((week) => <div className={styles.week} key={week.number}>
      <div className={styles.weekHead}><strong>Week {week.number}</strong><span>{dayLabel(week.start, "Fri")} – {dayLabel(week.end, "Sun")}</span></div>
      {week.days.map((day) => <div key={day.date}>
        <div className={styles.day} title={formatDate(day.date) ?? undefined}>{dayLabel(day.date, day.weekday)}</div>
        {day.matches.map((match) => {
          const home = byKey.get(match.home.key) ?? { ...match.home, href: null };
          const away = byKey.get(match.away.key) ?? { ...match.away, href: null };
          return <div className={styles.match} key={`${home.key}-${away.key}`}>
            <span className={styles.side}><TeamName team={home} small /></span>
            <span className={styles.score}>Bo3</span>
            <span className={`${styles.side} ${styles.right}`}><TeamName team={away} small /></span>
          </div>;
        })}
      </div>)}
    </div>)}</div>
  </div>;
}
