import manifest from "../../../assets/branding/external/manifest.json";

const byOrgSlug = new Map(manifest.logos.map((logo) => [logo.slug, logo.file]));

const darkByOrgSlug = new Map(manifest.logos.flatMap((logo) => ("darkFile" in logo && typeof logo.darkFile === "string" ? [[logo.slug, logo.darkFile] as const] : [])));

export function externalLogoDarkPath(organizationSlug: string): string | null {
  const file = darkByOrgSlug.get(organizationSlug);
  return file ? `/branding/external/${file}` : null;
}

export function externalLogoPath(organizationSlug: string): string | null {
  const file = byOrgSlug.get(organizationSlug);
  return file ? `/branding/external/${file}` : null;
}
