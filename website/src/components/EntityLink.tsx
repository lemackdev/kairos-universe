import Link from "next/link";

export function EntityLink({
  href,
  name,
  detail,
}: {
  href: string;
  name: string;
  detail?: string;
}) {
  return (
    <Link href={href}>
      <span className="entityName">
        <strong>{name}</strong>
        {detail ? <small>{detail}</small> : null}
      </span>
    </Link>
  );
}
