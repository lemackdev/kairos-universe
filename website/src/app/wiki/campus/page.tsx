import { Breadcrumbs } from "@/components/Breadcrumbs";
import { campusZones } from "@/lib/campus/masterplan";

export const metadata = {
  title: "Kairos Campus",
  description:
    "The Kairos Campus building directory: confirmed functions and a proposed masterplan, ahead of an interactive 3D view.",
};

export default function CampusPage() {
  return (
    <article>
      <Breadcrumbs items={[{ label: "Kairospedia", href: "/wiki" }, { label: "Kairos Campus" }]} />
      <h1>Kairos Campus</h1>
      <p>
        The Kairos Campus in Los Angeles is the organization&rsquo;s shared training, support, and
        residential facility. This page is a building directory and a proposed masterplan; it is a
        foundation page, not the finished interactive campus.
      </p>
      <p className="fictionNotice">
        <strong>Foundation page &mdash; interactive 3D view not yet built.</strong> Building{" "}
        <em>functions</em> below are either established in canon or proposed for author review, and
        each is labelled. Exact building geography, dimensions, shapes, and placement are not
        canonized anywhere and are a design proposal only, safe to revise later without affecting
        anything else on this page.
      </p>

      <section className="contentSection" id="zones">
        <h2>Campus zones</h2>
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
          <h2>
            {zone.letter}. {zone.name}
          </h2>
          <p>{zone.summary}</p>
          <dl>
            {zone.buildings.map((building) => (
              <div key={building.id}>
                <dt>
                  {building.name}{" "}
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

      <section className="contentSection" id="roadmap">
        <h2>Roadmap</h2>
        <p>
          The long-term goal is a genuine interactive 3D campus, modelled in Blender and displayed in
          the browser with React Three Fiber, where readers can orbit, select a building, and see its
          confirmed rooms and associated teams. That 3D view, its Blender asset pipeline, and its
          procedural architectural-massing MVP have not been built yet. This directory is the
          canon-safe foundation it will be built on top of.
        </p>
      </section>
    </article>
  );
}
