import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { StaffPortrait } from "@/components/StaffPortrait";
import { loadCanonUniverse, loadPublicationManifest } from "@/lib/canon/loader";
import { buildCatalog } from "@/lib/catalog/build";

const ids = [
  "adrian-elias-vale",
  "emily-chen",
  "lukas-luk-novak",
  "ethan-trace-miller",
  "jake-stewie2k-yip",
  "zaqueri-aphromoo-black",
  "thinkcard-kairos-strategic-coach",
  "claire-kairos-executive",
  "ethan-kairos-executive",
  "sofia-kairos-executive",
  "marcus-kairos-general-manager",
  "hai-du-lam",
  "miles-sable-warren",
];

describe("published management and coach profiles", () => {
  const catalog = buildCatalog(loadCanonUniverse(), loadPublicationManifest());

  it.each(ids)("publishes %s with an illustrative transparent portrait", (id) => {
    const person = catalog.staff.find((entry) => entry.id === id);
    expect(person).toBeDefined();
    expect(catalog.routes).toContain(`/wiki/staff/${person!.slug}`);

    const file = path.join(process.cwd(), "public", "staff-portraits", `${id}.png`);
    expect(existsSync(file)).toBe(true);
    const bytes = readFileSync(file);
    expect(bytes.subarray(1, 4).toString()).toBe("PNG");
    expect(bytes[25]).toBe(6);

    const html = renderToStaticMarkup(createElement(StaffPortrait, { id }));
    expect(html).toContain(encodeURIComponent(`/staff-portraits/${id}.png`));
    expect(html).toContain("AI-generated illustrative portrait");
  });

  it.each([
    ["claire-kairos-executive", "Claire Whitcomb"],
    ["ethan-kairos-executive", "Ethan Calder"],
    ["sofia-kairos-executive", "Sofia Alvarez"],
    ["marcus-kairos-general-manager", "Marcus Bell"],
  ])("publishes the author-directed full name for %s", (id, name) => {
    expect(catalog.staff.find((entry) => entry.id === id)?.realName).toBe(name);
  });

  it("shows both Academy head coaches without changing Counter-Strike Academy leadership", () => {
    expect(catalog.teams.find((entry) => entry.id === "kairos-lol-academy-blue")?.headCoachName).toBe("Hai");
    expect(catalog.teams.find((entry) => entry.id === "kairos-lol-academy-white")?.headCoachName).toBe("Sable");
    expect(catalog.teams.find((entry) => entry.id === "kairos-cs-academy")?.headCoachName).toBe("Stewie2K");
    expect(catalog.routes).toContain("/wiki/staff/maya-torres");
    expect(catalog.routes).toContain("/wiki/staff/evelyn-park");
  });
});
