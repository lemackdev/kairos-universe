import type { Metadata } from "next";
import Link from "next/link";

import { ProposedNotice } from "@/components/site/ProposedNotice";
import { Button } from "@/components/ui/button";
import { canon } from "@/content/canon";
import { principles } from "@/content/proposed";

export const metadata: Metadata = {
  title: "Approach",
  description:
    "The proposed working principles of Asterion Intelligence: long-term systems, reliability, precision, practical implementation, and research.",
};

export default function ApproachPage() {
  return (
    <>
      <section className="band" aria-labelledby="approach-heading">
        <div className="frame grid12 gap-y-8">
          <div className="c-1-7">
            <span className="label label-signal">Approach</span>
            <h1 id="approach-heading" className="mt-5">
              How the work is meant to be done.
            </h1>
          </div>
          <div className="c-8-5 flex flex-col items-start gap-5 self-end">
            <ProposedNotice label="Proposed, not canon" />
            <p className="lede">
              These five principles are a proposed description of how Asterion Intelligence
              would work. They have not been confirmed as company canon.
            </p>
          </div>
        </div>
      </section>

      <section className="band band-paper" aria-label="Principles">
        <div className="frame grid12 gap-y-12">
          <aside className="c-1-5 lg:sticky lg:top-28 lg:self-start">
            <span className="label label-signal">Context</span>
            <p className="prose-block mt-4">
              What is confirmed: {canon.asterion.description} The principles below are
              consistent with that role and with the long-term, player-development
              philosophy already established for Kairos. They go no further than that.
            </p>
          </aside>
          <ol className="c-7-6 spec-list">
            {principles.map((principle, i) => (
              <li key={principle.id} className="spec-row" style={{ gridTemplateColumns: "3.25rem 1fr" }}>
                <span className="label">{String(i + 1).padStart(2, "0")}</span>
                <div className="grid gap-3">
                  <span className="label label-signal">{principle.name}</span>
                  <h2 className="!text-[clamp(1.5rem,2.6vw,2.4rem)]">{principle.statement}</h2>
                  <p className="!max-w-xl">
                    <span className="mono-note">In practice. </span>
                    {principle.practice}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band" aria-labelledby="limits-heading">
        <div className="frame grid12 gap-y-8">
          <div className="c-1-5">
            <span className="label label-signal">Limits</span>
            <h2 id="limits-heading" className="mt-4">
              What this page does not claim.
            </h2>
          </div>
          <div className="c-6-7 prose-block">
            <p>
              No results, clients, or deployments are described here, because none have been
              established. A principle is a statement of intent, and intent is all this page
              offers.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/systems">Proposed disciplines</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/company">Confirmed company facts</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
