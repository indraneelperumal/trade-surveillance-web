import { Badge } from "@/components/ui/Badge";
import { formatRelativeDate } from "@/lib/utils";
import type { InvestigationNote } from "@/types/domain";

export function NotesTimeline({ notes }: { notes: InvestigationNote[] }) {
  if (notes.length === 0) {
    return <div className="text-[12px] text-[var(--color-text-secondary)]">No notes yet.</div>;
  }

  return (
    <div>
      {notes.map((note) => (
        <article
          key={note.id}
          className="border-b border-[var(--color-border-tertiary)] px-4 py-2.5 last:border-b-0"
        >
          <div className="mb-1 flex items-center gap-1.5">
            <span className="text-[11px] font-medium">{note.authorName}</span>
            <span className="text-[11px] text-[var(--color-text-secondary)]">
              {formatRelativeDate(note.createdAt)}
            </span>
            <Badge variant={note.noteType === "system" ? "note-system" : "note-human"}>
              {note.noteType === "system" ? "system" : "analyst"}
            </Badge>
          </div>
          <p className="text-[12px] leading-5 text-[var(--color-text-secondary)]">{note.body}</p>
        </article>
      ))}
    </div>
  );
}
