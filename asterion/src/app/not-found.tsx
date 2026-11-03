import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="band">
      <div className="frame grid gap-6">
        <span className="label label-signal">404 / Not found</span>
        <h1>That page is not in the drawing.</h1>
        <p className="lede">The address may have changed, or it may never have existed.</p>
        <Button asChild variant="solid" className="w-fit">
          <Link href="/">Return to the overview</Link>
        </Button>
      </div>
    </section>
  );
}
