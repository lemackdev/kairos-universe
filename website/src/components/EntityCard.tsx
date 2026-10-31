import Link from "next/link";
import type { ReactNode } from "react";

export function EntityCard({
  href,
  kicker,
  title,
  description,
  meta,
  image,
}: {
  href: string;
  kicker: string;
  title: string;
  description: string;
  meta?: ReactNode;
  image?: ReactNode;
}) {
  return (
    <Link className="entityCard" href={href}>
      {image}
      <span className="sectionKicker">{kicker}</span>
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      {meta ? <span className="entityCardMeta">{meta}</span> : null}
    </Link>
  );
}
