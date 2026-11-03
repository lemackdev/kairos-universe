import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { AssemblyStage } from "@/components/assembly/AssemblyStage";
import { StageStep } from "@/components/assembly/StageStep";
import { ProposedNotice } from "@/components/site/ProposedNotice";
import { Button } from "@/components/ui/button";
import { canon, divisionStatusLabel, isUnknown } from "@/content/canon";
import { disciplines } from "@/content/proposed";
import { parts } from "@/lib/assembly";
import { kairospediaHref } from "@/lib/site";

export default function HomePage() {
  const kairosPage = kairospediaHref("/wiki/organizations/kairos-esports");
  const undefinedCount = canon.asterion.unconfirmedDetails.length;

  return (
    <>
      <AssemblyStage>
        <StageStep index={0}>
          <span className="label label-signal">Parent company of Kairos Esports</span>
          <h1 className="hero-title">
            <span>Engineered</span>
            <span className="dim">for the long term.</span>
          </h1>
          <p className="lede">
            Asterion Intelligence provides the financial and organizational foundation for
            Kairos Esports, a talent-development project that plans in years rather than
            seasons.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="solid">
              <Link href="/approach">Read the approach</Link>
            </Button>
            <Button asChild>
              <Link href="/ventures">Kairos Esports</Link>
            </Button>
          </div>
          <p className="mono-note max-w-sm">
            The object beside this text is a reference assembly, a design study and not a
            product. Scroll to take it apart.
          </p>
        </StageStep>

        <StageStep index={1} align="right">
          <div className="flex items-center gap-3">
            <span className="label label-signal">01 / Registration</span>
            <ProposedNotice />
          </div>
          <h2>One axis. Everything registers to it.</h2>
          <p className="lede">
            The spindle sets a single reference line. Bearings, plate, and frames are all
            measured from it, so a change in one place can be checked against the rest.
          </p>
          <p className="mono-note">
            Proposed approach: choose one reference and keep it fixed.
          </p>
        </StageStep>

        <StageStep index={2}>
          <div className="flex items-center gap-3">
            <span className="label label-signal">02 / Exploded</span>
            <ProposedNotice />
          </div>
          <h2>Drawn apart so each part can be checked.</h2>
          <p className="lede">
            An exploded view is a test of the design. If a part cannot be shown on its own,
            with its job stated, it is probably doing too much.
          </p>
          <Button asChild className="w-fit">
            <Link href="/systems">Proposed disciplines</Link>
          </Button>
        </StageStep>

        <StageStep index={3} align="right">
          <span className="label label-signal">03 / Index</span>
          <h2>Seven parts, each with a job.</h2>
          <ol className="spec-list" aria-label="Reference assembly parts">
            {parts.map((part) => (
              <li key={part.id} className="spec-row">
                <span className="label">{part.index}</span>
                <div>
                  <h3 className="!text-base !font-normal">{part.name}</h3>
                  <p className="!text-sm">{part.role}</p>
                </div>
              </li>
            ))}
          </ol>
        </StageStep>
      </AssemblyStage>

      <section className="band band-paper" aria-labelledby="company-heading">
        <div className="frame grid12 gap-y-10">
          <div className="c-1-6">
            <span className="label label-signal">The company</span>
            <h2 id="company-heading" className="mt-4">
              A parent company with one confirmed venture.
            </h2>
          </div>
          <div className="c-8-5 prose-block">
            <p>
              Adrian Vale founded Asterion Intelligence and serves as its chief executive. He
              also founded and owns Kairos Esports, which Asterion owns as a subsidiary.
            </p>
            <p>
              Asterion supplies Kairos with its financial and organizational foundation. That
              is the whole of what has been established about the company&apos;s work.
              {" "}
              {undefinedCount} further details, including headquarters and founding date,
              have not been published, and this site does not guess at them.
            </p>
            <Link href="/company" className="label label-signal inline-flex items-center gap-1">
              Company record <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="band" aria-labelledby="focus-heading">
        <div className="frame">
          <div className="grid12 gap-y-6">
            <div className="c-1-6">
              <span className="label label-signal">Focus areas</span>
              <h2 id="focus-heading" className="mt-4">
                Six disciplines under consideration.
              </h2>
            </div>
            <div className="c-8-5 flex flex-col items-start gap-4">
              <ProposedNotice label="Proposed, not canon" />
              <p className="lede">
                None of these has been confirmed as Asterion business activity. They describe
                how the company could present its engineering interests.
              </p>
            </div>
          </div>
          <ol className="spec-list mt-14">
            {disciplines.map((discipline) => (
              <li key={discipline.id} className="spec-row">
                <span className="label">{discipline.index}</span>
                <div>
                  <h3>{discipline.name}</h3>
                  <p className="mt-2">{discipline.purpose}</p>
                </div>
              </li>
            ))}
          </ol>
          <Button asChild className="mt-10">
            <Link href="/systems">See the discipline map</Link>
          </Button>
        </div>
      </section>

      <section className="band band-graphite hairline-top" aria-labelledby="kairos-heading">
        <div className="frame grid12 gap-y-10">
          <div className="c-1-5">
            <span className="label label-signal">Asterion and Kairos</span>
            <h2 id="kairos-heading" className="mt-4">
              The foundation under the team.
            </h2>
          </div>
          <div className="c-6-7">
            <table className="fact-table">
              <tbody>
                <tr>
                  <th scope="row">Relationship</th>
                  <td>{canon.kairos.parentName} is the parent company of {canon.kairos.name}.</td>
                </tr>
                <tr>
                  <th scope="row">Founder and owner</th>
                  <td>{canon.kairos.ownerName}</td>
                </tr>
                <tr>
                  <th scope="row">Based in</th>
                  <td>
                    {isUnknown(canon.kairos.headquarters.city)
                      ? "Not yet defined"
                      : `${canon.kairos.headquarters.city}, ${canon.kairos.headquarters.region}`}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Divisions</th>
                  <td>
                    {canon.kairos.divisions.map((division) => (
                      <div key={division.id}>
                        {division.name}
                        <span className="mono-note"> / {divisionStatusLabel(division.status)}</span>
                      </div>
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/ventures">About the venture</Link>
              </Button>
              {kairosPage ? (
                <Button asChild variant="ghost">
                  <a href={kairosPage}>
                    Kairospedia record <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
