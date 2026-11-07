import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-xl font-semibold text-foreground">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        That page doesn&apos;t exist, or you don&apos;t have access to it.
      </p>
      <Link href="/dashboard" className={buttonVariants({ className: "mt-2" })}>
        Back to Overview
      </Link>
    </div>
  );
}
