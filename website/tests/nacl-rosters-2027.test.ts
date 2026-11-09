import { describe, expect, it } from "vitest";
import { loadWorldState2027 } from "@/lib/external/worldState2027";

const worldState = loadWorldState2027();
const nacl = worldState.naclRosters;
const byTeam = (name: string) => nacl.teams.find((team) => team.name === name)!.starters.map((starter) => `${starter.role}:${starter.nickname}`);
const kairosAcademyBlue = ["connor-mako-sullivan", "jacob-xnox-price", "owen-kite-hughes", "tyler-murmur-grant", "lucas-grit-foster"];

describe("NACL 2027 rosters", () => {
  it("covers all eight active NACL teams with forty starters", () => {
    expect(nacl.league).toBe("NACL");
    expect(nacl.teams).toHaveLength(8);
    expect(nacl.teams.flatMap((team) => team.starters)).toHaveLength(40);
    const active = worldState.membership.regions.NACL!.active.map((team) => team.teamId).sort();
    expect(nacl.teams.map((team) => team.teamId).sort()).toEqual(active);
    expect(nacl.vacancies).toEqual([]);
  });

  it("leaves the Kairos Academy Blue roster unchanged", () => {
    const team = nacl.teams.find((entry) => entry.teamId === "kairos-lol-academy-blue")!;
    expect(team.internal).toBe(true);
    expect(team.starters.map((starter) => starter.playerId)).toEqual(kairosAcademyBlue);
    expect(nacl.departures.some((entry) => kairosAcademyBlue.includes(entry.playerId))).toBe(false);
  });

  it("applies the approved reshuffle and role changes", () => {
    expect(byTeam("Blue Otter")).toEqual(["top:Dcoy", "jungle:Niles", "mid:Retrozing", "bot:Hub", "support:Tubs"]);
    expect(byTeam("Sentinels")).toEqual(["top:Horder", "jungle:Tomio", "mid:shochi", "bot:Spawn", "support:Only35"]);
    expect(byTeam("Winthrop University")).toEqual(["top:Wilson", "jungle:Kisno", "mid:Bradley", "bot:Cody Sun", "support:Mixtsure"]);
    expect(byTeam("Maryville University")[0]).toBe("top:Will");
    expect(byTeam("University of Mississippi")).toContain("support:Aeon Crystal");
    expect(byTeam("University of Mississippi")).toContain("bot:Sushee");
  });

  it("adds only nickname-only identities for players with no record", () => {
    expect(nacl.addedPlayers.map((player) => player.nickname).sort()).toEqual(["Dcoy", "Nordik"]);
    for (const player of nacl.addedPlayers) {
      expect(player.reviewStatus).toBe("author-named-identity-only");
      expect(player.legalName).toBeNull();
      expect(player.nationality).toBeNull();
      expect(player.dateOfBirth).toBeNull();
    }
  });

  it("clears the free-agent records of assigned players and keeps no player on two lineups", () => {
    const freeAgents = new Set(worldState.freeAgents.players.map((player) => player.playerId));
    const ids = nacl.teams.flatMap((team) => team.starters.map((starter) => starter.playerId));
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(freeAgents.has(id)).toBe(false);
    expect(freeAgents.has("external-lol-player-only35")).toBe(false);
    expect(freeAgents.has("external-lol-player-cody-sun")).toBe(false);
  });
});
