import Link from "next/link";
import { getCatalog } from "@/lib/canon/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { BrandLogo } from "@/components/UniformPanel";
import { csExternalTeams, csOrganizationSlugOf, csRankingRows } from "@/lib/external/worldState2027";
import { externalLogoDarkPath, externalLogoPath } from "@/lib/externalLogos";
import styles from "./ranking.module.css";

export const metadata = { title: "Counter-Strike world ranking" };

export default function CsWorldRankingPage() {
  const catalog = getCatalog();
  const worldState = catalog.worldState2027;
  const teams = csExternalTeams(worldState);
  const players = new Map((worldState?.csExternalRosters.players ?? []).map((player) => [player.playerId, player]));
  const rows = csRankingRows(worldState);
  const view = (teamId: string) => {
    const kairos = catalog.teams.find((entry) => entry.id === teamId);
    if (kairos) {
      return { href: `/wiki/teams/${kairos.slug}`, logo: <BrandLogo organizationId={kairos.organizationId} teamId={kairos.id} width={40} />, nicknames: kairos.roster.map((entry) => entry.nickname) };
    }
    const team = teams.find((entry) => entry.teamId === teamId);
    const slug = team && worldState ? csOrganizationSlugOf(worldState, team) : null;
    const light = slug ? externalLogoPath(slug) : null;
    const dark = slug ? externalLogoDarkPath(slug) : null;
    const logo = light ? <picture>{dark && <source media="(prefers-color-scheme: dark)" srcSet={dark} />}<img src={light} alt="" /></picture> : null;
    return { href: team ? `/wiki/teams/${team.slug}` : null, logo, nicknames: (team?.starters ?? []).map((starter) => players.get(starter.playerId)?.nickname ?? starter.nickname) };
  };
  return <article className={styles.page}><Breadcrumbs items={[{ label: "Kairospedia", href: "/wiki" }, { label: "Rankings" }, { label: "Counter-Strike" }]} />
    <PageHeader eyebrow="Counter-Strike 2" title="World ranking" description="Every Counter-Strike team of the Kairos Universe, in the order of the HLTV world ranking of 9 November 2026." compact />
    <ol className={styles.list}>
      {rows.map((row) => {
        const { href, logo, nicknames } = view(row.teamId);
        return <li className={styles.row} key={row.teamId}>
          <span className={styles.rank}>{row.position}</span>
          <span className={styles.logo}>{logo ?? <span className={styles.mono}>{row.name.slice(0, 2)}</span>}</span>
          <span className={styles.body}>
            <span className={styles.title}>{href ? <Link href={href}>{row.name}</Link> : row.name}</span>
            <span className={styles.roster}>{nicknames.join(" \u00B7 ")}</span>
          </span>
          <span className={styles.change} aria-hidden="true">{"\u2013"}</span>
        </li>;
      })}
    </ol>
  </article>;
}
