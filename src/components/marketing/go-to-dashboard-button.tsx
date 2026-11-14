"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth/session";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * The landing page's one CTA, reused in the nav, hero and closing section.
 * It starts fetching the session as soon as it mounts (useSession is cached
 * app-wide by TanStack Query). Disabled while that's still pending, so a
 * signed-in visitor can't be shown the sign-up/log-in dialog just because
 * they clicked before the session resolved.
 */
export function GoToDashboardButton({
  size = "lg",
  variant = "default",
  className,
}: Pick<React.ComponentProps<typeof Button>, "size" | "variant" | "className">) {
  const router = useRouter();
  const { data, isPending, isError } = useSession();
  const [choiceOpen, setChoiceOpen] = useState(false);
  const authenticated = Boolean(data) && !isError;

  return (
    <>
      <Button
        size={size}
        variant={variant}
        className={className}
        disabled={isPending}
        onClick={() => {
          if (authenticated) {
            router.push("/dashboard");
          } else {
            setChoiceOpen(true);
          }
        }}
      >
        {isPending ? "Loading…" : "Go to dashboard"}
      </Button>
      <Dialog open={choiceOpen} onOpenChange={setChoiceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in to Enquoir Cloud</DialogTitle>
            <DialogDescription>
              Create an account or log in to reach your dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className={cn(buttonVariants({ variant: "default" }), "w-full sm:w-auto")}
            >
              Create an account
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
