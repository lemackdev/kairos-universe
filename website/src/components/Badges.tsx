export function CanonBadge({ status = "Confirmed" }: { status?: string }) {
  return <span className="badge badgeCanon">{status}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="badge badgeStatus">{humanizeStatus(status)}</span>
  );
}

export function GameBadge({ game }: { game: string }) {
  return <span className="badge">{game}</span>;
}

export function RoleBadge({ role }: { role: string }) {
  return <span className="badge badgeRole">{role}</span>;
}

function humanizeStatus(value: string): string {
  return value.replaceAll("-", " ");
}
