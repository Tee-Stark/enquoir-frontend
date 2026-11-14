"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Shared by every "create" or "rotate" flow that issues a secret the
 * backend shows exactly once and never again (agent API keys, merchant
 * integration keys, ...) - one "copy it now" dialog instead of one per
 * resource type.
 */
export function RevealSecretDialog({
  issued,
  onClose,
}: {
  issued: { title: string; secret: string } | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!issued) return;
    try {
      await navigator.clipboard.writeText(issued.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail (permission denied, an unfocused
      // document, ...) - this secret is never shown again, so a silent
      // failure here would be worse than a noisy one.
      toast.error("Couldn't copy to the clipboard. Select and copy the key manually.");
    }
  };

  return (
    <Dialog open={issued !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{issued?.title}</DialogTitle>
          <DialogDescription>
            Shown once. Enquoir stores only its hash — copy it now, there&apos;s
            no way to see it again.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
          <code className="flex-1 overflow-x-auto font-mono text-xs text-foreground">
            {issued?.secret}
          </code>
          <Button type="button" variant="ghost" size="icon-sm" onClick={copy}>
            {copied ? (
              <Check className="size-3.5 text-success" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
