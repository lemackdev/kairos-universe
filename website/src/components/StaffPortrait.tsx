import Image from "next/image";

const portraits: Record<string, { width: number; height: number; name: string }> = {
  "tarik-kairos-cs-academy-head-coach": { width: 1122, height: 1402, name: "Tarik" },
  "alex-xpecial-chu": { width: 1199, height: 1312, name: "Xpecial" },
  "adrian-elias-vale": { width: 1145, height: 1374, name: "Adrian Vale" },
  "claire-kairos-executive": { width: 1122, height: 1402, name: "Claire Whitcomb" },
  "darshan-kairos-top-mentor": { width: 1199, height: 1312, name: "Darshan" },
  "doublelift-kairos-adc-mentor": { width: 1145, height: 1374, name: "Doublelift" },
  "emily-chen": { width: 1145, height: 1374, name: "Emily Chen" },
  "ethan-kairos-executive": { width: 1122, height: 1402, name: "Ethan Calder" },
  "ethan-trace-miller": { width: 1024, height: 1536, name: "Trace" },
  "evelyn-park": { width: 1145, height: 1374, name: "Evelyn Park" },
  "goldenglue-kairos-mid-mentor": { width: 1312, height: 1199, name: "Goldenglue" },
  "hai-du-lam": { width: 1163, height: 1352, name: "Hai" },
  "jake-stewie2k-yip": { width: 1145, height: 1374, name: "Stewie2K" },
  "lukas-luk-novak": { width: 1145, height: 1374, name: "Luk" },
  "marcus-kairos-general-manager": { width: 1122, height: 1402, name: "Marcus Bell" },
  "maya-torres": { width: 1145, height: 1374, name: "Maya Torres" },
  "miles-sable-warren": { width: 1312, height: 1199, name: "Sable" },
  "pobelter-kairos-mid-mentor": { width: 1192, height: 1319, name: "Pobelter" },
  "sofia-kairos-executive": { width: 1122, height: 1402, name: "Sofia Alvarez" },
  "thinkcard-kairos-strategic-coach": { width: 1024, height: 1536, name: "Thinkcard" },
  "wildturtle-kairos-adc-mentor": { width: 1312, height: 1199, name: "WildTurtle" },
  "xmithie-kairos-jungle-mentor": { width: 1145, height: 1374, name: "Xmithie" },
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
