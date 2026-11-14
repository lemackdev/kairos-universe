import Image from "next/image";
import { assetUrl, findBrandLogo, readPublishedBranding } from "../../../shared/branding";
import styles from "./UniformPanel.module.css";

export function BrandLogo({ organizationId, teamId, width = 180 }: { organizationId: string; teamId?: string; width?: number }) {
  const asset = findBrandLogo(readPublishedBranding(), organizationId, teamId);
  if (!asset) return null;
  return <Image src={assetUrl(asset)} alt={asset.id.replaceAll("-", " ")}
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
    </div>)}
  </div>;
}

