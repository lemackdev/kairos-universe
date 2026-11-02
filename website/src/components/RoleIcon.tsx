import Image from "next/image";

const roles: Record<string, { file: string; label: string }> = {
  top: { file: "top.svg", label: "Top Lane" },
  jungle: { file: "jungle.svg", label: "Jungle" },
  mid: { file: "mid.svg", label: "Mid Lane" },
  bot: { file: "bot.svg", label: "Bot Lane / ADC" },
  support: { file: "support.svg", label: "Support" },
};

const aliases: Record<string, keyof typeof roles> = {
  top: "top", jungle: "jungle", mid: "mid", midlane: "mid",
  bot: "bot", adc: "bot", "bot/adc": "bot", "bot / adc": "bot", carry: "bot",
  support: "support", supp: "support",
};

export function RoleIcon({ role }: { role: string }) {
  const key = aliases[role.trim().toLowerCase()];
  const entry = key && roles[key];
  if (!entry) return null;
  return <Image src={`/role-icons/${entry.file}`} width={20} height={20} alt="" title={entry.label} unoptimized />;
}
