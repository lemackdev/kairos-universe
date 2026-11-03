import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { canon, isUnknown } from "@/content/canon";
import { kairospediaHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Company",
  description:
    "Confirmed corporate information for Asterion Intelligence: leadership, role, and what has not yet been defined.",
};

function Unknown({ children = "Not yet defined" }: { children?: string }) {
  return <span className="tbd">{children}</span>;
}

export default function CompanyPage() {
  const { asterion } = canon;
  const kairosRecord = kairospediaHref("/wiki/organizations/kairos-esports");

  return (
    <>
      <section className="band" aria-labelledby="company-heading">
        <div className="frame grid12 gap-y-8">
          <div className="c-1-7">
            <span className="label label-signal">Company</span>
            <h1 id="company-heading" className="mt-5">
              What is established, and what is not.
            </h1>
          </div>
          <p className="c-8-5 lede self-end">{asterion.description}</p>
        </div>
      </section>

      <section className="band band-paper" aria-labelledby="record-heading">
        <div className="frame grid12 gap-y-10">
          <div className="c-1-5">
            <span className="tag tag-confirmed">Confirmed canon</span>
            <h2 id="record-heading" className="mt-6">
              Corporate record
            </h2>
          </div>
          <div className="c-6-7">
            <table className="fact-table">
              <tbody>
                <tr>
                  <th scope="row">Name</th>
                  <td>{asterion.name}</td>
                </tr>
                <tr>
                  <th scope="row">Type</th>
                  <td>Parent company</td>
                </tr>
                <tr>
                  <th scope="row">Founder</th>
                  <td>{asterion.founderName}</td>
                </tr>
                <tr>
                  <th scope="row">Chief executive</th>
                  <td>
                    {asterion.chiefExecutiveName}, {asterion.chiefExecutiveTitle}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Subsidiary</th>
                  <td>
                    {asterion.subsidiaries.map((s) => (
                      <div key={s.organizationId}>
                        <Link href="/ventures" className="underline">
                          {s.name}
                        </Link>
                      </div>
                    ))}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Role</th>
                  <td>Provides the financial and organizational foundation of Kairos Esports.</td>
                </tr>
                <tr>
                  <th scope="row">Founded</th>
                  <td>
                    <Unknown />
                  </td>
                </tr>
                <tr>
                  <th scope="row">Headquarters</th>
                  <td>
                    {isUnknown(asterion.headquarters.city) ? <Unknown /> : asterion.headquarters.city}
                    <p className="mono-note mt-1">
                      Not inferred from the location of the Kairos campus.
                    </p>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Other business</th>
                  <td>
                    <Unknown />
                  </td>
                </tr>
                <tr>
                  <th scope="row">Financials</th>
                  <td>
                    <Unknown />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="band" aria-labelledby="leadership-heading">
        <div className="frame grid12 gap-y-10">
          <div className="c-1-5">
            <span className="label label-signal">Leadership</span>
            <h2 id="leadership-heading" className="mt-4">
              {asterion.founderCommonName}
            </h2>
            <p className="mono-note mt-3">Founder and CEO</p>
          </div>
          <div className="c-6-7 prose-block">
            <p>
              {asterion.founderName}, known as {asterion.founderCommonName}, founded Asterion
              Intelligence and leads it as chief executive. He also founded and owns Kairos
              Esports.
            </p>
            <p>
              No further biography is published on this site. Anything beyond these roles
              belongs to the story, and the story has not yet settled it.
            </p>
          </div>
        </div>
      </section>

      <section className="band band-graphite hairline-top" aria-labelledby="about-heading">
        <div className="frame grid12 gap-y-10">
          <div className="c-1-5">
            <span className="label label-signal">About this site</span>
            <h2 id="about-heading" className="mt-4">
              A fictional company.
            </h2>
          </div>
          <div className="c-6-7 prose-block">
            <p>
              Asterion Intelligence belongs to the Kairos Universe, a fictional setting. Facts
              labelled confirmed are drawn from the canon records. Material labelled proposed
              is a creative direction awaiting author approval and carries no canon weight.
            </p>
            <div className="flex flex-wrap gap-3">
              {kairosRecord ? (
                <Button asChild variant="solid">
                  <a href={kairosRecord}>
                    Kairos Esports on Kairospedia <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                </Button>
              ) : null}
              <Button asChild variant="outline">
                <Link href="/approach">Proposed approach</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
