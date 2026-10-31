import Image from "next/image";
import { readPublishedPortraits } from "../../../shared/branding";

export function PlayerPortrait({ playerId }: { playerId: string }) {
  const portrait = readPublishedPortraits().find(p => p.playerId === playerId);
  if (!portrait) return null;
  return <figure style={{ margin: 0, width: "100%", maxWidth: 300 }}>
    <Image src={`/portraits/${portrait.playerId}.png`} alt={portrait.altText}
      width={portrait.width} height={portrait.height} sizes="(max-width: 640px) 80vw, 300px"
      style={{ display: "block", width: "100%", height: "auto" }} />
  </figure>;
}
