"use client";

import { Button } from "@/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["open", "in-progress", "closed"]).optional(),
  assignee: z.string().optional(),
  note: z.string().min(3, "Note should be at least 3 characters"),
});

export type AlertActionValues = z.infer<typeof schema>;

export function AlertActionsForm({
  onSubmit,
}: {
  onSubmit: (values: AlertActionValues) => void;
}) {
  const form = useForm<AlertActionValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "open", assignee: "", note: "" },
  });

  return (
    <form
      className="flex flex-col gap-2 px-4 py-3"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="mb-1 text-[11px] tracking-[0.06em] text-[var(--color-text-secondary)] uppercase">
        Actions
      </div>
      <select
        className="rounded-[6px] border border-[var(--color-border-secondary)] bg-[var(--color-background-primary)] px-2 py-1.5 text-[12px]"
        {...form.register("status")}
      >
        <option value="open">Open</option>
        <option value="in-progress">In progress</option>
        <option value="closed">Closed</option>
      </select>
      <input
        placeholder="Assign to..."
        className="rounded-[6px] border border-[var(--color-border-secondary)] bg-[var(--color-background-primary)] px-2 py-1.5 text-[12px]"
        {...form.register("assignee")}
      />
      <textarea
        placeholder="Add a note..."
        className="h-14 resize-none rounded-[6px] border border-[var(--color-border-secondary)] bg-[var(--color-background-primary)] px-2 py-2 text-[12px]"
        {...form.register("note")}
      />
      {form.formState.errors.note ? (
        <p className="text-[11px] text-[#A32D2D]">{form.formState.errors.note.message}</p>
      ) : null}
      <Button variant="primary" type="submit" className="w-full">
        Save + submit note
      </Button>
    </form>
  );
}
