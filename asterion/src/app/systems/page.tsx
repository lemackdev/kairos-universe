import type { Metadata } from "next";
import Link from "next/link";

import { ProposedNotice } from "@/components/site/ProposedNotice";
import { DisciplineDiagram } from "@/components/systems/DisciplineDiagram";
import { Button } from "@/components/ui/button";
import { disciplines } from "@/content/proposed";

export const metadata: Metadata = {
  title: "Systems",
  description:
    "Six proposed technical disciplines for Asterion Intelligence. No products have been released and no customers are described.",
};

export default function SystemsPage() {
  return (
    <>
      <section className="band" aria-labelledby="systems-heading">
        <div className="frame grid12 gap-y-8">
          <div className="c-1-7">
            <span className="label label-signal">Systems</span>
            <h1 id="systems-heading" className="mt-5">
              Six disciplines, drawn as a map.
            </h1>
          </div>
          <div className="c-8-5 flex flex-col items-start gap-5 self-end">
            <ProposedNotice label="Proposed, not canon" />
            <p className="lede">
              A framework for the kinds of systems Asterion could build. No product has been
              released, no customer exists, and no contract is implied.
            </p>
          </div>
        </div>
      </section>

      <section className="band-graphite hairline-top py-16 md:py-24" aria-label="Discipline map">
        <div className="frame">
          <ol className="discipline-map">
            {disciplines.map((discipline) => (
              <li key={discipline.id} className="discipline">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="label">{discipline.index}</span>
                  <span className="tag tag-proposed">Proposed</span>
                </div>
                <DisciplineDiagram kind={discipline.diagram} />
                <h2 className="!text-[clamp(1.4rem,2.2vw,2.1rem)]">{discipline.name}</h2>
                <p>{discipline.purpose}</p>
                <p className="mono-note">
                  <span className="label-signal">Guiding question </span>
                  {discipline.question}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band band-paper" aria-labelledby="reading-heading">
        <div className="frame grid12 gap-y-8">
          <div className="c-1-5">
            <span className="label label-signal">Reading the map</span>
            <h2 id="reading-heading" className="mt-4">
              One confirmed link to the real work.
            </h2>
          </div>
          <div className="c-6-7 prose-block">
            <p>
              The one connection to established canon is analytics. Kairos treats coaching
              and analytics as core competitive advantages, and Asterion provides the
              organizational foundation behind them. Whether Asterion builds any of the
              systems above, for Kairos or for anyone else, has not been decided.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/ventures">Kairos Esports</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/approach">The approach</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
