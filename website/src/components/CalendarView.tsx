"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CompetitionView } from "@/types/catalog";
import { formatDate } from "@/lib/formatting/date";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const TEAM_OPTIONS: Array<{ label: string; teamId: string | null }> = [
  { label: "All Kairos", teamId: null },
  { label: "LoL Main", teamId: "kairos-lol-main" },
  { label: "Academy Blue", teamId: "kairos-lol-academy-blue" },
  { label: "Academy White", teamId: "kairos-lol-academy-white" },
  { label: "CS Main", teamId: "kairos-cs-main" },
  { label: "CS Academy", teamId: "kairos-cs-academy" },
];

const tierLabels: Record<string, string> = {
  premier: "Premier", major: "Major", "tier-2": "Tier 2",
  "tier-1-international": "Tier 1", "tier-2-international": "Tier 2",
  "world-championship": "World Championship", "tier-2-world-championship": "Tier 2 World Championship",
  "regional-tier-1": "Regional Tier 1", "regional-tier-2": "Regional Tier 2",
  "postseason-international": "Postseason International",
};

function tierBadges(competition: CompetitionView): string[] {
  const badges: string[] = [];
  if (competition.tier === "major") badges.push("MAJOR");
  if (competition.tier === "world-championship") badges.push("WORLD CHAMPIONSHIP");
  if (competition.tier === "tier-2" || competition.tier === "tier-2-international" || competition.tier === "regional-tier-2") badges.push("TIER 2");
  if (competition.kairosParticipating) badges.push("KAIROS PARTICIPATING");
  return badges;
}

export function CalendarView({ competitions }: { competitions: CompetitionView[] }) {
  const [game, setGame] = useState("all");
  const [tier, setTier] = useState("all");
  const [region, setRegion] = useState("all");
  const [participation, setParticipation] = useState("all");
  const [team, setTeam] = useState<string | null>(null);
  const [month, setMonth] = useState("all");

  const filtered = useMemo(() => competitions.filter((competition) => {
    if (game !== "all" && competition.gameName !== game) return false;
    if (tier !== "all") {
      if (tier === "premier-tier-1" && !["premier", "tier-1-international", "regional-tier-1"].includes(competition.tier ?? "")) return false;
      if (tier === "tier-2" && !["tier-2", "tier-2-international", "regional-tier-2"].includes(competition.tier ?? "")) return false;
      if (tier === "major-world" && !["major", "world-championship", "tier-2-world-championship"].includes(competition.tier ?? "")) return false;
    }
    if (region !== "all" && competition.region !== region) return false;
    if (participation === "kairos-playing" && !competition.kairosParticipating) return false;
    if (team && !competition.participants.some((participant) => participant.id === team)) return false;
    if (month !== "all") {
      const monthIndex = competition.startDate ? Number(competition.startDate.slice(5, 7)) - 1 : null;
      if (monthIndex === null || String(monthIndex) !== month) return false;
    }
    return true;
  }), [competitions, game, tier, region, participation, team, month]);

  const byMonth = new Map<number, CompetitionView[]>();
  const unscheduled: CompetitionView[] = [];
  for (const competition of filtered) {
    if (!competition.startDate) {
      unscheduled.push(competition);
      continue;
    }
    const monthIndex = Number(competition.startDate.slice(5, 7)) - 1;
    if (!byMonth.has(monthIndex)) byMonth.set(monthIndex, []);
    byMonth.get(monthIndex)!.push(competition);
  }
  for (const list of byMonth.values()) list.sort((a, b) => (a.startDate ?? "").localeCompare(b.startDate ?? ""));

  return <div className="calendarView">
    <div className="calendarFilters">
      <label>Game
        <select value={game} onChange={(event) => setGame(event.target.value)}>
          <option value="all">All</option>
          <option value="League of Legends">League of Legends</option>
          <option value="Counter-Strike">Counter-Strike</option>
        </select>
      </label>
      <label>Tier
        <select value={tier} onChange={(event) => setTier(event.target.value)}>
          <option value="all">All</option>
          <option value="premier-tier-1">Premier / Tier 1</option>
          <option value="tier-2">Tier 2</option>
          <option value="major-world">Major / World Championship</option>
        </select>
      </label>
      <label>Region
        <select value={region} onChange={(event) => setRegion(event.target.value)}>
          <option value="all">All</option>
          <option value="north-america">North America</option>
          <option value="europe">Europe</option>
          <option value="international">International</option>
        </select>
      </label>
      <label>Participation
        <select value={participation} onChange={(event) => setParticipation(event.target.value)}>
          <option value="all">All Events</option>
          <option value="kairos-playing">Kairos Playing</option>
        </select>
      </label>
      <label>Team
        <select value={team ?? ""} onChange={(event) => setTeam(event.target.value || null)}>
          {TEAM_OPTIONS.map((option) => <option key={option.label} value={option.teamId ?? ""}>{option.label}</option>)}
        </select>
      </label>
      <label>Month
        <select value={month} onChange={(event) => setMonth(event.target.value)}>
          <option value="all">All</option>
          {MONTHS.map((name, index) => <option key={name} value={String(index)}>{name}</option>)}
        </select>
      </label>
    </div>

    <div className="calendarMonths">
      {MONTHS.map((name, index) => {
        if (month !== "all" && String(index) !== month) return null;
        const events = byMonth.get(index) ?? [];
        return <section className="calendarMonth" key={name}>
          <h3>{name}</h3>
          {index === 6
            ? <p className="calendarBreak">COMPETITIVE BREAK — no events scheduled.</p>
            : (events.length
              ? <ul className="calendarEventList">{events.map((competition) => <CalendarCard key={competition.id} competition={competition} />)}</ul>
              : <p className="calendarEmptyMonth">No competitive tournaments.</p>)}
        </section>;
      })}
    </div>

    {month === "all" && unscheduled.length > 0 && <section className="calendarMonth">
      <h3>Date TBD</h3>
      <ul className="calendarEventList">{unscheduled.map((competition) => <CalendarCard key={competition.id} competition={competition} />)}</ul>
    </section>}
  </div>;
}

function CalendarCard({ competition }: { competition: CompetitionView }) {
  const badges = tierBadges(competition);
  return <li className="calendarCard">
    <Link href={`/wiki/competitions/${competition.slug}`}>{competition.name}</Link>
    <p className="calendarCardMeta">
      {competition.gameName}
      {competition.startDate && ` • ${formatDate(competition.startDate)} – ${formatDate(competition.endDate)}`}
      {competition.location && ` • ${competition.location}`}
    </p>
    <p className="calendarCardMeta">
      {competition.tier && (tierLabels[competition.tier] ?? competition.tier)}
      {competition.prizePool && ` • ${competition.prizePool}`}
      {competition.teamsCount != null && ` • ${competition.teamsCount} teams`}
    </p>
    {badges.length > 0 && <div className="statusRow">{badges.map((badge) => <span className="badge badgeStatus" key={badge}>{badge}</span>)}</div>}
  </li>;
}
