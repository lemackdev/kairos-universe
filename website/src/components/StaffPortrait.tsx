import Image from "next/image";

const portraits: Record<string, { width: number; height: number; name: string }> = {
  "adrian-elias-vale": { width: 1145, height: 1374, name: "Adrian Vale" },
  "claire-kairos-executive": { width: 1122, height: 1402, name: "Claire Whitcomb" },
  "emily-chen": { width: 1145, height: 1374, name: "Emily Chen" },
  "ethan-kairos-executive": { width: 1122, height: 1402, name: "Ethan Calder" },
  "ethan-trace-miller": { width: 1024, height: 1536, name: "Trace" },
  "hai-du-lam": { width: 1163, height: 1352, name: "Hai" },
  "jake-stewie2k-yip": { width: 1145, height: 1374, name: "Stewie2K" },
  "lukas-luk-novak": { width: 1145, height: 1374, name: "Luk" },
  "marcus-kairos-general-manager": { width: 1122, height: 1402, name: "Marcus Bell" },
  "miles-sable-warren": { width: 1312, height: 1199, name: "Sable" },
  "sofia-kairos-executive": { width: 1122, height: 1402, name: "Sofia Alvarez" },
  "thinkcard-kairos-strategic-coach": { width: 1024, height: 1536, name: "Thinkcard" },
  "zaqueri-aphromoo-black": { width: 1156, height: 1360, name: "Aphromoo" },
};

export function hasStaffPortrait(id: string): boolean {
  return Boolean(portraits[id]);
}

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
