import { apiFetch } from "@/lib/api/client";
import type { ListQuery, PaginatedResponse } from "@/types/api";
import type { InvestigationNote } from "@/types/domain";

export type NoteListQuery = ListQuery & {
  alert_id?: string;
  investigation_id?: string;
};

export function listNotes(query: NoteListQuery) {
  return apiFetch<PaginatedResponse<InvestigationNote>>(
    "/api/v1/investigation-notes",
    { query },
  );
}

export function createNote(payload: Partial<InvestigationNote>) {
  return apiFetch<InvestigationNote>("/api/v1/investigation-notes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
