import Image from "next/image";
import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CsRoleIcons } from "@/components/CsRoleIcons";
import { NationalityFlags } from "@/components/NationalityFlags";
import { PageHeader } from "@/components/PageHeader";
import { RoleIcon } from "@/components/RoleIcon";
import { BrandLogo } from "@/components/UniformPanel";
import { getCatalog } from "@/lib/canon/server";
import styles from "./players.module.css";

export const metadata = { title: "Players" };

const lolRoleOrder = ["top", "jungle", "mid", "bot", "adc", "support"];
const roleRank = (role: string) => {
  const index = lolRoleOrder.indexOf(role.trim().toLowerCase());
  return index === -1 ? lolRoleOrder.length : index;
};

export default function PlayersPage() {
  const catalog = getCatalog();
  const teams = catalog.teams
    .map((team) => ({ team, players: catalog.players.filter((player) => player.currentTeamId === team.id) }))
    .filter((entry) => entry.players.length > 0);
  const total = catalog.players.length;

  return (
    <>
      <Breadcrumbs items={[{ label: "Kairospedia", href: "/wiki" }, { label: "Players" }]} />
      <PageHeader
        eyebrow={`${total} players`}
        title="Players"
        description="Every published Kairos player, grouped by the roster they play on."
        compact
      />
      {teams.map(({ team, players }) => {
        const isCs = team.gameName.toLowerCase().includes("counter");
        const sorted = [...players].sort((a, b) => Number(b.isCaptain) - Number(a.isCaptain) || roleRank(a.role) - roleRank(b.role) || a.nickname.localeCompare(b.nickname));
        return (
          <section className={styles.team} key={team.id} aria-labelledby={`team-${team.id}`}>
            <div className={styles.teamHead}>
              <span className={styles.teamLogo}><BrandLogo organizationId={team.organizationId} teamId={team.id} width={40} /></span>
              <div className={styles.teamTitle}>
                <h2 id={`team-${team.id}`}>{team.name}</h2>
                <p className={styles.teamMeta}>{team.gameName}{team.headCoachName ? ` \u00B7 Coach ${team.headCoachName}` : ""} &middot; {players.length} players</p>
              </div>
              <Link className={styles.teamLink} href={`/wiki/teams/${team.slug}`}>Team page <span aria-hidden="true">&rarr;</span></Link>
            </div>
            <div className={styles.roster}>
              {sorted.map((player) => (
                <Link className={styles.player} href={`/wiki/players/${player.slug}`} key={player.id}>
                  <span className={styles.photo}>
                    <Image src={`/portraits/${player.id}.png`} alt="" fill sizes="(max-width: 640px) 45vw, (max-width: 1100px) 30vw, 230px" />
                    {player.isCaptain && <span className={styles.captain}>Captain</span>}
                  </span>
                  <span className={styles.info}>
                    <span className={styles.nick}>{player.nickname}<NationalityFlags nationality={player.nationality} nationalities={player.nationalities} compact /></span>
                    <span className={styles.real}>{player.realName}</span>
                    <span className={styles.role}>{isCs ? <CsRoleIcons role={player.role} size={18} /> : <RoleIcon role={player.role} />}{player.role}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
