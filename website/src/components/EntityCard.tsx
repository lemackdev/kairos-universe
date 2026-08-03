import Link from "next/link";

export function EntityCard({
  href,
  kicker,
  title,
  description,
  meta,
}: {
  href: string;
  kicker: string;
  title: string;
  description: string;
  meta?: string;
}) {
  return (
    <Link className="entityCard" href={href}>
      <span className="sectionKicker">{kicker}</span>
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      {meta ? <span className="entityCardMeta">{meta}</span> : null}
    </Link>
  );
}
