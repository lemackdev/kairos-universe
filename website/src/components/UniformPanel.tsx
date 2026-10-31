import Image from "next/image";
import { assetUrl, readPublishedBranding } from "../../../shared/branding";
import styles from "./UniformPanel.module.css";

export function BrandLogo({ organizationId, width = 180 }: { organizationId: string; width?: number }) {
  const asset = readPublishedBranding().assets.find(a => a.category === "logo" && a.organizationId === organizationId);
  if (!asset) return null;
  return <Image src={assetUrl(asset)} alt={organizationId.replaceAll("-", " ") + " approved logo"}
    width={asset.width} height={asset.height} sizes={width + "px"}
    style={{ width, maxWidth: "100%", height: "auto", objectFit: "contain" }} />;
}

export function UniformPanel({ teamId }: { teamId: string }) {
  const catalog = readPublishedBranding();
  const uniforms = catalog.uniforms.filter(u => u.teamIds.includes(teamId));
  if (!uniforms.length) return null;
  return <div className={styles.panel}>
    {uniforms.map(uniform => <div key={uniform.id}>
      <h3>{uniform.season} Uniform / {uniform.name}</h3>
      <p>{uniform.meaning}</p>
      <div className={styles.pair}>
        {(["front", "back"] as const).map(orientation => {
          const asset = catalog.assets.find(a => a.id === uniform[orientation + "Asset" as "frontAsset" | "backAsset"]);
          if (!asset) return null;
          return <figure key={orientation}>
            <a href={assetUrl(asset)} aria-label={`View full-size ${uniform.name} ${orientation}`}>
              <Image src={assetUrl(asset)} alt={`${uniform.name}, ${uniform.season}, ${orientation} view`}
                width={asset.width} height={asset.height} sizes="(max-width: 640px) 85vw, 340px" />
            </a>
            <figcaption>{orientation === "front" ? "Front" : "Back"} / {uniform.season}</figcaption>
          </figure>;
        })}
      </div>
      <dl className={styles.partners}>
        <div><dt>Technical supplier</dt><dd>{uniform.technicalSupplier.name}</dd></div>
        <div><dt>Supplier status</dt><dd>Approved future design; pending formal narrative canonization.</dd></div>
        <div><dt>Institutional partner</dt><dd>{uniform.institutionalPartner.name}, {uniform.institutionalPartner.role} (parent company)</dd></div>
      </dl>
      <p className={styles.note}>User-approved design reference, reconstructed for clean presentation. Fictional-universe branding, not a real-world sponsorship announcement. Contract terms and announcement date remain unconfirmed.</p>
    </div>)}
  </div>;
}

