import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  canon,
  divisionStatusLabel,
  isUnknown,
  kairosStatusLabel,
} from "@/content/canon";
import { kairospediaHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ventures",
  description:
    "Kairos Esports is the confirmed subsidiary of Asterion Intelligence. No other ventures have been established.",
};

export default function VenturesPage() {
  const { kairos } = canon;
  const org = kairospediaHref("/wiki/organizations/kairos-esports");
  const campus = kairospediaHref("/wiki/campus");
  const wiki = kairospediaHref("/wiki");

  return (
    <>
      <section className="band" aria-labelledby="ventures-heading">
        <div className="frame grid12 gap-y-8">
          <div className="c-1-7">
            <span className="label label-signal">Ventures</span>
            <h1 id="ventures-heading" className="mt-5">
              One subsidiary. Fully confirmed.
            </h1>
          </div>
          <p className="c-8-5 lede self-end">
            Kairos Esports is the only venture of Asterion Intelligence that has been
            established. No others are implied.
          </p>
        </div>
      </section>

      <section className="band band-paper" aria-labelledby="kairos-heading">
        <div className="frame grid12 gap-y-10">
          <div className="c-1-5">
            <span className="tag tag-confirmed">Confirmed canon</span>
            <h2 id="kairos-heading" className="mt-6">
              {kairos.name}
            </h2>
            <p className="prose-block mt-6">
              A long-term talent-development project founded and owned by Adrian Vale.
              Asterion provides its financial and organizational foundation. The project is
              built around player development, structured support for young players, and
              infrastructure meant to last.
            </p>
          </div>
          <div className="c-7-6">
            <table className="fact-table">
              <tbody>
                <tr>
                  <th scope="row">Relationship</th>
                  <td>Subsidiary of {kairos.parentName}</td>
                </tr>
                <tr>
                  <th scope="row">Founder and owner</th>
                  <td>{kairos.ownerName}</td>
                </tr>
                <tr>
                  <th scope="row">Status</th>
                  <td>{kairosStatusLabel(kairos.status)}</td>
                </tr>
                <tr>
                  <th scope="row">Headquarters</th>
                  <td>
                    {isUnknown(kairos.headquarters.city)
                      ? "Not yet defined"
                      : `${kairos.headquarters.city}, ${kairos.headquarters.region}, ${kairos.headquarters.country}`}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Divisions</th>
                  <td>
                    {kairos.divisions.map((division) => (
                      <div key={division.id}>
                        {division.name}
                        <span className="tbd"> / {divisionStatusLabel(division.status)}</span>
                      </div>
                    ))}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Competition</th>
                  <td>
                    Has not played an official match. First official competition is planned
                    for {kairos.officialDebutPeriod.leagueOfLegends.month}{" "}
                    {kairos.officialDebutPeriod.leagueOfLegends.exactYear}.
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="mono-note mt-4">
              Status shown as of the {kairos.currentStoryPeriod.toLowerCase()} story period.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {org ? (
                <Button asChild variant="solid">
                  <a href={org}>
                    Kairos on Kairospedia <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                </Button>
              ) : null}
              {campus ? (
                <Button asChild variant="outline">
                  <a href={campus}>
                    Kairos campus <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                </Button>
              ) : null}
              {!wiki ? (
                <p className="mono-note">
                  Kairospedia links appear here once NEXT_PUBLIC_KAIROSPEDIA_URL is configured.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="band" aria-labelledby="others-heading">
        <div className="frame grid12 gap-y-8">
          <div className="c-1-5">
            <span className="label label-signal">Other ventures</span>
            <h2 id="others-heading" className="mt-4">
              None established.
            </h2>
          </div>
          <div className="c-6-7 prose-block">
            <p>
              Kairos has said additional games may be added later. That is a possibility, not
              an announcement, and Asterion has no other subsidiary on record.
            </p>
            <Button asChild variant="ghost" className="w-fit">
              <Link href="/company">Company record</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
