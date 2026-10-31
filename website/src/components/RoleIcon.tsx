const paths: Record<string, { d: string; label: string }> = {
  top: { label: "Top Lane", d: "M12 2l7 4v6c0 5-3.2 8.3-7 10-3.8-1.7-7-5-7-10V6l7-4z" },
  jungle: { label: "Jungle", d: "M12 2c4 3 6 7 6 11a6 6 0 1 1-12 0c0-4 2-8 6-11zm0 4c-2 2.5-3.5 5-3.5 7a3.5 3.5 0 0 0 7 0c0-2-1.5-4.5-3.5-7z" },
  mid: { label: "Mid Lane", d: "M12 2l2.6 7.2L22 12l-7.4 2.8L12 22l-2.6-7.2L2 12l7.4-2.8L12 2z" },
  bot: { label: "Bot Lane / ADC", d: "M3 12l14-8-4 8 4 8-14-8zm13.5 0h4.5" },
  support: { label: "Support", d: "M12 21s-7-4.4-9.5-9C.8 7.8 2.6 4 6 4c2 0 3.5 1.1 4 2.3C10.5 5.1 12 4 14 4c3.4 0 5.2 3.8 3.5 8-2.5 4.6-9.5 9-9.5 9z" },
};

const aliases: Record<string, keyof typeof paths> = {
  top: "top", jungle: "jungle", mid: "mid", midlane: "mid",
  bot: "bot", adc: "bot", "bot/adc": "bot", "bot / adc": "bot", carry: "bot",
  support: "support", supp: "support",
};

export function RoleIcon({ role }: { role: string }) {
  const key = aliases[role.trim().toLowerCase()];
  const entry = key && paths[key];
  if (!entry) return null;
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" focusable="false">
    <title>{entry.label}</title>
    <path d={entry.d} />
  </svg>;
}
