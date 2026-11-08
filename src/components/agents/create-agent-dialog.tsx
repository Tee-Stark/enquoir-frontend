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
import { useCreateAgent, type IssuedAgent } from "@/lib/agents/queries";
import { RevealApiKeyDialog } from "./reveal-api-key-dialog";

export function CreateAgentDialog({ disabled }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [issued, setIssued] = useState<IssuedAgent | null>(null);
  const createAgent = useCreateAgent();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAgent.mutate(name.trim(), {
      onSuccess: (data) => {
        setIssued(data);
        setOpen(false);
        setName("");
        createAgent.reset();
      },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button disabled={disabled} size="sm">
              <Plus /> Create agent
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create agent</DialogTitle>
            <DialogDescription>
              Its API key is shown once, right after this — store it then.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <FormField label="Name" htmlFor="agent-name">
              <Input
                id="agent-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Payroll bot"
                maxLength={100}
                autoFocus
              />
            </FormField>
            <FormError error={createAgent.error} />
            <DialogFooter showCloseButton>
              <Button type="submit" disabled={!name.trim() || createAgent.isPending}>
                {createAgent.isPending ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <RevealApiKeyDialog issued={issued} onClose={() => setIssued(null)} />
    </>
  );
}
