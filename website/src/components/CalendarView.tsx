"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CompetitionView } from "@/types/catalog";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const TEAM_OPTIONS: Array<{ label: string; teamId: string | null }> = [
  { label: "All Kairos", teamId: null },
  { label: "LoL Main", teamId: "kairos-lol-main" },
  { label: "Academy Blue", teamId: "kairos-lol-academy-blue" },
  { label: "Academy White", teamId: "kairos-lol-academy-white" },
  { label: "CS Main", teamId: "kairos-cs-main" },
  { label: "CS Academy", teamId: "kairos-cs-academy" },
];

function ordinal(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`;
  switch (day % 10) {
    case 1: return `${day}st`;
    case 2: return `${day}nd`;
    case 3: return `${day}rd`;
    default: return `${day}th`;
  }
}

function dateRange(start: string, end: string | null): string {
  const [, startMonth, startDay] = start.split("-").map(Number);
  if (!end) return ordinal(startDay!);
  const [, endMonth, endDay] = end.split("-").map(Number);
  if (startMonth === endMonth && startDay === endDay) return ordinal(startDay!);
  if (startMonth === endMonth) return `${ordinal(startDay!)}-${ordinal(endDay!)}`;
  return `${MONTHS_SHORT[startMonth! - 1]} ${ordinal(startDay!)} - ${MONTHS_SHORT[endMonth! - 1]} ${ordinal(endDay!)}`;
}

const gameAccent: Record<string, string> = {
  "Counter-Strike": "calendarDotCs",
  "League of Legends": "calendarDotLol",
};

const COLLAPSED_COUNT = 5;

export function CalendarView({ competitions }: { competitions: CompetitionView[] }) {
  const [game, setGame] = useState("all");
  const [tier, setTier] = useState("all");
  const [region, setRegion] = useState("all");
  const [participation, setParticipation] = useState("all");
  const [team, setTeam] = useState<string | null>(null);
  const [month, setMonth] = useState("all");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => competitions.filter((competition) => {
    if (game !== "all" && competition.gameName !== game) return false;
    if (tier !== "all") {
      if (tier === "premier-tier-1" && !["premier", "tier-1-international", "regional-tier-1"].includes(competition.tier ?? "")) return false;
      if (tier === "tier-2" && !["tier-2", "tier-2-international", "regional-tier-2"].includes(competition.tier ?? "")) return false;
      if (tier === "tier-3" && competition.tier !== "tier-3") return false;
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

  function toggleExpanded(index: number) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  }

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
          <option value="tier-3">Tier 3</option>
          <option value="major-world">Major / World Championship</option>
        </select>
      </label>
      <label>Region
        <select value={region} onChange={(event) => setRegion(event.target.value)}>
          <option value="all">All</option>
          <option value="north-america">North America</option>
          <option value="south-america">South America</option>
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

    <div className="calendarGrid">
      {MONTHS.map((name, index) => {
        if (month !== "all" && String(index) !== month) return null;
        const events = byMonth.get(index) ?? [];
        const isExpanded = expanded.has(index);
        const visible = isExpanded ? events : events.slice(0, COLLAPSED_COUNT);
        const hiddenCount = events.length - visible.length;
        return <section className="calendarMonthCard" key={name}>
          <h3 className="calendarMonthTitle">{name}</h3>
          <div className="calendarMonthBody">
            {index === 6
              ? <p className="calendarBreak">COMPETITIVE BREAK</p>
              : (events.length
                ? <>
                    <ul className="calendarEventList">{visible.map((competition) => <CalendarRow key={competition.id} competition={competition} />)}</ul>
                    {hiddenCount > 0 && <button type="button" className="calendarExpandButton" onClick={() => toggleExpanded(index)}>
                      Expand all ({hiddenCount} more)
                    </button>}
                    {isExpanded && events.length > COLLAPSED_COUNT && <button type="button" className="calendarExpandButton" onClick={() => toggleExpanded(index)}>
                      Show less
                    </button>}
                  </>
                : <p className="calendarEmptyMonth">No events yet</p>)}
          </div>
        </section>;
      })}
    </div>

    {month === "all" && unscheduled.length > 0 && <section className="calendarMonthCard calendarMonthCardWide">
      <h3 className="calendarMonthTitle">Date TBD</h3>
      <div className="calendarMonthBody">
        <ul className="calendarEventList">{unscheduled.map((competition) => <CalendarRow key={competition.id} competition={competition} />)}</ul>
      </div>
    </section>}
  </div>;
}

function CalendarRow({ competition }: { competition: CompetitionView }) {
  return <li className="calendarRow">
    <Link href={`/wiki/competitions/${competition.slug}`} className="calendarRowLink">
      <span className={`calendarDot ${gameAccent[competition.gameName] ?? ""}`} aria-hidden="true" />
      <span className="srOnly">{competition.gameName} —{" "}</span>
      <span className="calendarRowName">{competition.name}</span>
      {competition.kairosParticipating && <span className="calendarRowKairos" title="Kairos participating">K</span>}
      {competition.startDate && <span className="calendarRowDate">{dateRange(competition.startDate, competition.endDate)}</span>}
    </Link>
  </li>;
}
