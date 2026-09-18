// Shared frontend models for wrong-note association screens.
export interface Note { id: string; title: string; content: string }
export interface Wrong { id: string; title: string; review?: string | null }
export interface WrongNotesResponse { data: { wrongId: string; notes: Note[] } }
