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
});
