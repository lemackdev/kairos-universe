import manifest from "../../../assets/branding/external/manifest.json";

const byOrgSlug = new Map(manifest.logos.map((logo) => [logo.slug, logo.file]));

export function externalLogoPath(organizationSlug: string): string | null {
  const file = byOrgSlug.get(organizationSlug);
  return file ? `/branding/external/${file}` : null;
}
