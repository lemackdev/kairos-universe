import type { RosterEntryView } from "@/types/catalog";

import { EntityLink } from "./EntityLink";
import { RoleBadge } from "./Badges";
import { NationalityFlags } from "./NationalityFlags";

export function TeamRosterTable({ roster }: { roster: RosterEntryView[] }) {
  return (
    <div className="tableWrap">
      <table className="dataTable">
        <caption className="srOnly">Current active roster</caption>
        <thead>
          <tr>
            <th scope="col">Role</th>
            <th scope="col">Player</th>
            <th scope="col">Status</th>
            <th scope="col">Leadership</th>
          </tr>
        </thead>
        <tbody>
          {roster.map((entry) => (
            <tr key={entry.tenureId}>
              <td data-label="Role">
                <RoleBadge role={entry.role} />
              </td>
              <td data-label="Player">
                <NationalityFlags nationality={entry.nationality} nationalities={entry.nationalities} compact />
                <EntityLink
                  href={`/wiki/players/${entry.slug}`}
                  name={entry.nickname}
                  detail={entry.realName}
                />
              </td>
              <td data-label="Status">{entry.rosterStatus}</td>
              <td data-label="Leadership">
                {entry.isCaptain ? "Captain" : "Player"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
