import { Fragment } from "react";
import Link from "next/link";

import { BrandLogo } from "@/components/UniformPanel";
import { PostCard } from "@/components/kairoswitter/PostCard";
import { getCatalog } from "@/lib/canon/server";
import { competitionLogo } from "@/lib/competitionLogos";
import { externalLogoDarkPath, externalLogoPath } from "@/lib/externalLogos";
import { csExternalTeams, csOrganizationSlugOf, csRankingRows } from "@/lib/external/worldState2027";
import styles from "./home.module.css";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const isIso = (value: string | null): value is string => !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
const longDate = (iso: string | null) => (isIso(iso) ? `${Number(iso.slice(8))} ${months[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}` : "TBD");
const shortDate = (iso: string | null) => (isIso(iso) ? `${Number(iso.slice(8))} ${months[Number(iso.slice(5, 7)) - 1]}` : "TBD");
const dayNumber = (iso: string) => Math.round(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 86_400_000);
const dateRange = (start: string | null, end: string | null) => (start && end && start !== end ? `${shortDate(start)} – ${shortDate(end)}` : shortDate(start));

const quickLinks = [
  { href: "/wiki/teams", label: "Teams" },
  { href: "/wiki/players", label: "Players" },
  { href: "/wiki/competitions", label: "Tournaments" },
  { href: "/wiki/calendar", label: "Calendar" },
  { href: "/wiki/rankings/counter-strike", label: "Ranking" },
  { href: "/wiki/kairoswitter", label: "Kairoswitter" },
];

export default function WikiHomePage() {
  const catalog = getCatalog();
  const today = catalog.metadata.currentNarrativeDate;
  const worldState = catalog.worldState2027;

  const upcoming = catalog.competitions
    .filter((competition) => isIso(competition.startDate) && competition.startDate >= today)
    .sort((a, b) => a.startDate!.localeCompare(b.startDate!) || a.name.localeCompare(b.name))
    .slice(0, 4);
  const next = upcoming[0];
  const after = upcoming.slice(1);
  const daysToNext = next ? dayNumber(next.startDate!) - dayNumber(today) : null;

  const csTeams = csExternalTeams(worldState);
  const rankingRows = csRankingRows(worldState);
  const rowFor = (row: (typeof rankingRows)[number]) => {
    const kairos = catalog.teams.find((entry) => entry.id === row.teamId);
    if (kairos) return { ...row, name: row.teamId === "kairos-cs-academy" ? "Kairos Academy" : kairos.name, href: `/wiki/teams/${kairos.slug}`, logo: null, logoDark: null, organizationId: kairos.organizationId, isKairos: true };
    const team = csTeams.find((entry) => entry.teamId === row.teamId);
    const slug = team && worldState ? csOrganizationSlugOf(worldState, team) : null;
    return { ...row, href: team ? `/wiki/teams/${team.slug}` : null, logo: slug ? externalLogoPath(slug) : null, logoDark: slug ? externalLogoDarkPath(slug) : null, organizationId: null, isKairos: false };
  };
  // Top ten, then both Kairos teams at their real positions.
  const topTen = rankingRows.filter((row) => !row.teamId.startsWith("kairos-")).slice(0, 10).map(rowFor);
  const kairosRows = rankingRows.filter((row) => row.teamId.startsWith("kairos-") && row.position > 10).map(rowFor);
  const ranking = [...topTen, ...kairosRows];

  const feed = catalog.kairoswitter;
  const accounts = new Map((feed?.accounts ?? []).map((account) => [account.key, account]));
  const latest = (feed?.posts ?? []).slice(0, 4);

  return (
    <div className={styles.home} data-page="home">
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>{longDate(today)} &middot; 2027 season</p>
          <h1 className={styles.title}>Everything in <em>Kairos</em> esports.</h1>
          <p className={styles.lede}>Teams, players, tournaments and the feed of what is happening, in one place.</p>
          <nav className={styles.quick} aria-label="Quick links">
            {quickLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
          </nav>
        </div>
        {next && <Link className={styles.nowCard} href={`/wiki/competitions/${next.slug}`}>
          <span className={styles.nowLabel}>Next up</span>
          <span className={styles.countdown}>
            <strong>{daysToNext === 0 ? "Today" : daysToNext}</strong>
            {daysToNext !== 0 && <span>{daysToNext === 1 ? "day to go" : "days to go"}</span>}
          </span>
          <span className={styles.nowName}>{next.name}</span>
          <span className={styles.nowMeta}>{dateRange(next.startDate, next.endDate)}{next.location ? ` · ${next.location}` : ""}</span>
          <span className={styles.nowGo}>Open event <span aria-hidden="true">&rarr;</span></span>
        </Link>}
      </section>

      {after.length > 0 && <section className={styles.section} aria-labelledby="then">
        <div className={styles.sectionHead}><h2 id="then">Then</h2><Link href="/wiki/calendar">Full calendar <span aria-hidden="true">&rarr;</span></Link></div>
        <div className={styles.eventGrid}>
          {after.map((competition) => <Link key={competition.id} className={styles.event} href={`/wiki/competitions/${competition.slug}`}>
            <span className={styles.dateTile}><small>{months[Number(competition.startDate!.slice(5, 7)) - 1]}</small><strong>{Number(competition.startDate!.slice(8))}</strong></span>
            <span className={styles.eventBody}>
              <span className={styles.chip}>{competition.gameName}</span>
              <strong>{competition.name}</strong>
              <span className={styles.eventMeta}>{dateRange(competition.startDate, competition.endDate)}</span>
              {competition.prizePool && <span className={styles.eventMeta}>{competition.prizePool}</span>}
            </span>
            <span className={styles.eventLogo}>{competitionLogo(competition.slug, competition.name) ?? <span className={styles.mono}>{competition.name.slice(0, 2)}</span>}</span>
          </Link>)}
        </div>
      </section>}

      <div className={styles.columns}>
        <section className={styles.section} aria-labelledby="ranking">
          <div className={styles.sectionHead}><h2 id="ranking">Counter-Strike ranking</h2><Link href="/wiki/rankings/counter-strike">All teams <span aria-hidden="true">&rarr;</span></Link></div>
          <ol className={styles.rankList}>
            {ranking.map((row, index) => <Fragment key={row.teamId}>
              {row.isKairos && !ranking[index - 1]?.isKairos && <li className={styles.rankGap} aria-hidden="true">{"⋯"}</li>}
              <li data-top={row.position <= 3 ? "true" : undefined} data-kairos={row.isKairos ? "true" : undefined}>
                <span className={styles.rankNo}>{row.position}</span>
                <span className={styles.rankLogo}>{row.organizationId ? <BrandLogo organizationId={row.organizationId} width={28} /> : row.logo ? <picture>{row.logoDark && <source media="(prefers-color-scheme: dark)" srcSet={row.logoDark} />}<img src={row.logo} alt="" /></picture> : <span className={styles.mono}>{row.name.slice(0, 2)}</span>}</span>
                {row.href ? <Link href={row.href}>{row.name}</Link> : <span>{row.name}</span>}
              </li>
            </Fragment>)}
          </ol>
        </section>

        <section className={styles.section} aria-labelledby="feed">
          <div className={styles.sectionHead}><h2 id="feed">On Kairoswitter</h2><Link href="/wiki/kairoswitter">Open the feed <span aria-hidden="true">&rarr;</span></Link></div>
          <div className={styles.feed}>
            {latest.map((post) => <PostCard key={post.id} post={post} account={accounts.get(post.authorKey)!} />)}
          </div>
        </section>
      </div>

      <section className={styles.section} aria-labelledby="kairos">
        <div className={styles.sectionHead}><h2 id="kairos">Kairos teams</h2><Link href="/wiki/teams">All teams <span aria-hidden="true">&rarr;</span></Link></div>
        <div className={styles.teamGrid}>
          {catalog.teams.map((team) => <Link key={team.id} className={styles.team} href={`/wiki/teams/${team.slug}`}>
            <span className={styles.teamLogo}><BrandLogo organizationId={team.organizationId} teamId={team.id} width={40} /></span>
            <strong>{team.name}</strong>
            <span className={styles.teamMeta}>{team.gameName}</span>
            {team.headCoachName && <span className={styles.teamMeta}>Coach {team.headCoachName}</span>}
          </Link>)}
        </div>
      </section>
    </div>
  );
}
