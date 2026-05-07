import { apiFetch } from "@/lib/api/client";
import type { ListQuery, PaginatedResponse } from "@/types/api";
import type { InvestigationNote } from "@/types/domain";

export type NoteListQuery = ListQuery & {
  alert_id?: string;
  investigation_id?: string;
};

// Request body sent to POST /api/v1/investigation-notes.
// Uses snake_case because the API client does not convert request keys.
export type NoteCreatePayload = {
  alert_id: string;
  content: string;
  note_type?: "human" | "system";
  investigation_id?: string;
};

export function listNotes(query: NoteListQuery) {
  return apiFetch<PaginatedResponse<InvestigationNote>>(
    "/api/v1/investigation-notes",
    { query },
  );
}

export function createNote(payload: NoteCreatePayload) {
  return apiFetch<InvestigationNote>("/api/v1/investigation-notes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
