"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormField } from "@/components/form/form-field";
import { FormError } from "@/components/form/form-error";
import {
  useCreateMerchantIntegration,
  type IssuedMerchantIntegration,
} from "@/lib/commerce/merchant-integrations";
import { RevealSecretDialog } from "@/components/shared/reveal-secret-dialog";

export function CreateMerchantIntegrationDialog({ disabled }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [issued, setIssued] = useState<IssuedMerchantIntegration | null>(null);
  const createIntegration = useCreateMerchantIntegration();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createIntegration.mutate(name.trim(), {
      onSuccess: (data) => {
        setIssued(data);
        setOpen(false);
        setName("");
        createIntegration.reset();
      },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button disabled={disabled} size="sm">
              <Plus /> Connect merchant
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect a merchant</DialogTitle>
            <DialogDescription>
              Its integration key is shown once, right after this — store it then.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <FormField label="Name" htmlFor="merchant-name">
              <Input
                id="merchant-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Storefront"
                maxLength={100}
                autoFocus
              />
            </FormField>
            <FormError error={createIntegration.error} />
            <DialogFooter showCloseButton>
              <Button type="submit" disabled={!name.trim() || createIntegration.isPending}>
                {createIntegration.isPending ? "Connecting…" : "Connect"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <RevealSecretDialog
        issued={issued && { title: `${issued.integration.name} — integration key`, secret: issued.key.secret }}
        onClose={() => setIssued(null)}
      />
    </>
  );
}
