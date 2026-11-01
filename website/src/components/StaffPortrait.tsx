import Image from "next/image";

const portraits: Record<string, { width: number; height: number; name: string }> = {
  "adrian-elias-vale": { width: 1145, height: 1374, name: "Adrian Vale" },
  "emily-chen": { width: 1145, height: 1374, name: "Emily Chen" },
  "ethan-trace-miller": { width: 1024, height: 1536, name: "Trace" },
  "jake-stewie2k-yip": { width: 1145, height: 1374, name: "Stewie2K" },
  "lukas-luk-novak": { width: 1145, height: 1374, name: "Luk" },
  "thinkcard-kairos-strategic-coach": { width: 1024, height: 1536, name: "Thinkcard" },
  "zaqueri-aphromoo-black": { width: 1156, height: 1360, name: "Aphromoo" },
};

export function StaffPortrait({ id, compact = false }: { id: string; compact?: boolean }) {
  const portrait = portraits[id];
  if (!portrait) return null;

  return (
    <figure className={compact ? "staffPortrait staffPortraitCompact" : "staffPortrait"}>
      <Image
        src={`/staff-portraits/${id}.png`}
        alt={`AI-generated illustrative portrait of ${portrait.name}`}
        width={portrait.width}
        height={portrait.height}
        sizes={compact ? "(max-width: 640px) 40vw, 160px" : "(max-width: 640px) 80vw, 340px"}
      />
    </figure>
  );
}
