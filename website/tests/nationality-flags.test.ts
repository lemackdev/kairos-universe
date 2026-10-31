import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { NationalityFlags } from "@/components/NationalityFlags";
import { loadCanonUniverse } from "@/lib/canon/loader";

it("renders both author-confirmed nationalities, preserving the primary", () => {
  const players = loadCanonUniverse().collections.players!;
  for (const [id, countries] of [
    ["emiliano-moteconhuesillo-navarro", ["Mexico", "Chile"]],
    ["vincente-flacogomez-galan", ["United States", "Brazil"]],
  ] as const) {
    const player = players.find((p) => p.id === id)!;
    const html = renderToStaticMarkup(createElement(NationalityFlags, {
      nationality: player.nationality as string, nationalities: player.nationalities as string[],
    }));
    for (const country of countries) expect(html).toContain(`alt="${country}"`);
    expect((html.match(/<img/g) ?? []).length).toBe(2);
    expect((player.nationalities as string[])[0]).toBe(player.nationality);
  }
});

it("does not guess a flag for unknown nationality", () => {
  expect(renderToStaticMarkup(createElement(NationalityFlags, { nationality: "TBD" }))).toBe("TBD");
  expect(renderToStaticMarkup(createElement(NationalityFlags, { nationality: null, compact: true }))).toBe("");
});

it("deduplicates flags and supports legacy primary-nationality records", () => {
  const html = renderToStaticMarkup(createElement(NationalityFlags, { nationalities: ["American", "American"] }));
  expect((html.match(/<img/g) ?? []).length).toBe(1);
  expect(renderToStaticMarkup(createElement(NationalityFlags, { nationality: "Canadian" }))).toContain('alt="Canada"');
});
