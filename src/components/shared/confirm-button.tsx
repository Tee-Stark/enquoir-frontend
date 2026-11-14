"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

/**
 * A button that asks for confirmation before running its action - for
 * anything that cuts something off with no undo (rotating or revoking
 * a credential). Not every mutating button needs this, only ones
 * where a misclick has a real, hard-to-reverse cost.
 */
export function ConfirmButton({
  title,
  description,
  confirmLabel,
  onConfirm,
  disabled,
  variant,
  size,
  children,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
  children: React.ReactNode;
} & VariantProps<typeof buttonVariants>) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant={variant} size={size} disabled={disabled} />}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
