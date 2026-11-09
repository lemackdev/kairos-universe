import Image from "next/image";

const definitions = [
  { key: "igl", file: "cs-igl.svg", label: "In-game leader" },
  { key: "awper", file: "cs-awper.svg", label: "AWPer" },
  { key: "rifler", file: "cs-rifler.svg", label: "Rifler" },
] as const;

export function CsRoleIcons({ role, size = 20 }: { role: string | null | undefined; size?: number }) {
  if (!role) return null;
  const normalized = role.toLowerCase();
  const selected = definitions.filter(({ key }) => normalized.includes(key));
  if (!selected.length) return null;
  const label = selected.map((entry) => entry.label).join(" and ");
  return <span aria-label={label} title={label} style={{ display: "inline-flex", alignItems: "center", gap: 2, verticalAlign: "middle" }}>
    {selected.map((entry) => <Image key={entry.key} src={`/role-icons/${entry.file}`} width={size} height={size} alt="" unoptimized />)}
  </span>;
}
