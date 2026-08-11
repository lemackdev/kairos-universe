export function OriginBadge({ origin }: { origin: "kairos-original" | "external-snapshot" }) {
  if (origin === "kairos-original") {
    return <span className="badge badge-kairos">Kairos Universe original</span>;
  }
  return <span className="badge badge-external">Real-world reference snapshot</span>;
}

export function ReviewBadge({ status }: { status: string }) {
  if (status === "approved") return null;
  return <span className="badge badge-warn">{status.replace("-", " ")}</span>;
}
