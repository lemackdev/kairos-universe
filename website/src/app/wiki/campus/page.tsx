import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CampusViewerLoader } from "@/components/campus/CampusViewerLoader";
import { campusZones } from "@/lib/campus/masterplan";

export const metadata = {
  title: "Kairos Campus",
  description:
    "The Kairos Campus in interactive 3D: confirmed room functions on a proposed, non-canon layout, plus the building directory.",
};

export default function CampusPage() {
  return (
    <article className="campusPage">
      <Breadcrumbs items={[{ label: "Kairospedia", href: "/wiki" }, { label: "Kairos Campus" }]} />
      <header className="pageHeader">
        <span className="eyebrow">Los Angeles</span>
        <h1>Kairos Campus</h1>
        <p className="lede">
          The organization&rsquo;s shared training, support and residential facility. Orbit the
          model, pick a view, and click a room to see what is established about it.
        </p>
      </header>
      <p className="fictionNotice">
        <strong>Conceptual model.</strong> Room <em>functions</em> come from canon and each is
        labelled with its status. Positions, sizes, shapes and distances are not canonized anywhere.
        They are a proposal made so the campus can be drawn, and can change without affecting canon.
      </p>

      <CampusViewerLoader />

      <section className="contentSection" id="zones">
        <h2 className="sectionKicker">Campus zones</h2>
        <nav aria-label="Campus zones" className="statusRow">
          {campusZones.map((zone) => (
            <a className="badge" href={`#zone-${zone.id}`} key={zone.id}>
              {zone.letter}. {zone.name}
            </a>
          ))}
        </nav>
      </section>

      {campusZones.map((zone) => (
        <section className="contentSection" id={`zone-${zone.id}`} key={zone.id}>
          <h2 className="sectionKicker">
            {zone.letter}. {zone.name}
          </h2>
          <p className="campusSummary">{zone.summary}</p>
          <dl className="campusGrid">
            {zone.buildings.map((building) => (
              <div className="campusCard" key={building.id}>
                <dt>
                  <span>{building.name}</span>
                  <span className="badge">
                    {building.status === "confirmed-function" ? "Confirmed function" : "Proposed layout"}
                  </span>
                </dt>
                <dd>
                  {building.description}
                  {building.teams && building.teams.length > 0 && (
                    <> &mdash; Associated with: {building.teams.join(", ")}.</>
                  )}
                  {building.rooms && building.rooms.length > 0 && (
                    <> Rooms: {building.rooms.join(", ")}.</>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <section className="contentSection" id="about-model">
        <h2 className="sectionKicker">About the model</h2>
        <p>
          The 3D campus is generated in Blender from an inventory of established functions and a
          separate layout proposal, then exported for the browser. Residential buildings are shown as
          closed volumes because no interior is established. The directory above is the earlier
          proposal list and may name areas the model leaves out for lack of canon support.
        </p>
      </section>
    </article>
  );
}
