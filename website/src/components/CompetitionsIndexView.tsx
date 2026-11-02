"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CompetitionView } from "@/types/catalog";

export function CompetitionsIndexView({ competitions }: { competitions: CompetitionView[] }) {
  const [game, setGame] = useState("all");
  const [region, setRegion] = useState("all");
  const [organizer, setOrganizer] = useState("all");
  const [status, setStatus] = useState("all");

  const organizers = useMemo(() => Array.from(new Set(competitions.map((c) => c.organizerName).filter((name): name is string => Boolean(name)))).sort(), [competitions]);

  const filtered = competitions.filter((competition) => {
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
    {filtered.length ? <ul className="entityList">{filtered.map((competition) => <li key={competition.id}>
      <Link href={`/wiki/competitions/${competition.slug}`}>{competition.name}</Link>
      <p>{competition.gameName} / {competition.status}{competition.organizerName ? ` / ${competition.organizerName}` : ""}</p>
    </li>)}</ul> : <p>No tournaments match these filters.</p>}
  </>;
}
