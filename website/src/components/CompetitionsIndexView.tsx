"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CompetitionView } from "@/types/catalog";
import { competitionLogo } from "@/lib/competitionLogos";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const tierNames: Record<string, string> = { premier: "Premier", major: "Major", "tier-2": "Tier 2", "tier-3": "Tier 3", "regional-tier-1": "Tier 1", "regional-tier-2": "Tier 2", "tier-1-international": "International", "tier-2-international": "International", "world-championship": "World Championship", "tier-2-world-championship": "World Championship", "postseason-international": "International" };

export function CompetitionsIndexView({ competitions }: { competitions: CompetitionView[] }) {
  const [game, setGame] = useState("all");
  const [region, setRegion] = useState("all");
  const [organizer, setOrganizer] = useState("all");
  const [status, setStatus] = useState("all");

  const organizers = useMemo(() => Array.from(new Set(competitions.map((c) => c.organizerName).filter((name): name is string => Boolean(name)))).sort(), [competitions]);

  const sorted = [...competitions].sort((a, b) => (a.startDate ?? "9999").localeCompare(b.startDate ?? "9999") || a.name.localeCompare(b.name));
  const filtered = sorted.filter((competition) => {
    if (game !== "all" && competition.gameName !== game) return false;
    if (region !== "all" && competition.region !== region) return false;
    if (organizer !== "all" && competition.organizerName !== organizer) return false;
    if (status !== "all" && competition.status !== status) return false;
    return true;
  });

  return <>
    <div className="calendarFilters">
      <label>Game
        <select value={game} onChange={(event) => setGame(event.target.value)}>
          <option value="all">All</option>
          <option value="League of Legends">League of Legends</option>
          <option value="Counter-Strike">Counter-Strike</option>
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
      <label>Organizer
        <select value={organizer} onChange={(event) => setOrganizer(event.target.value)}>
          <option value="all">All</option>
          {organizers.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
      </label>
      <label>Status
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All</option>
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </label>
    </div>
    {filtered.length ? <div className="eventCards">{filtered.map((competition) => <Link className="eventCard" key={competition.id} href={`/wiki/competitions/${competition.slug}`}>
      <span className="eventCardDate"><small>{competition.startDate ? months[Number(competition.startDate.slice(5, 7)) - 1] : "TBD"}</small><strong>{competition.startDate ? Number(competition.startDate.slice(8)) : "–"}</strong></span>
      <span className="eventCardBody">
        <span className="eventCardGame">{competition.gameName}{competition.tier ? ` · ${tierNames[competition.tier] ?? competition.tier}` : ""}</span>
        <strong>{competition.name}</strong>
        <span className="eventCardMeta">{competition.startDate && competition.endDate && competition.startDate !== competition.endDate ? `${Number(competition.startDate.slice(8))} ${months[Number(competition.startDate.slice(5, 7)) - 1]} – ${Number(competition.endDate.slice(8))} ${months[Number(competition.endDate.slice(5, 7)) - 1]}` : "Date TBD"}{competition.prizePool ? ` · ${competition.prizePool}` : ""}</span>
      </span>
      <span className="eventCardLogo">{competitionLogo(competition.slug, competition.name) ?? <span>{competition.name.slice(0, 2)}</span>}</span>
    </Link>)}</div> : <p>No tournaments match these filters.</p>}
  </>;
}
