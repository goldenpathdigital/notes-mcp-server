/**
 * SQLite database service for notes storage
 */
import type { Note, CreateNoteInput, UpdateNoteInput, SearchNotesInput } from '../types.js';
export declare class NotesDatabase {
    private db;
    constructor(dbPath: string);
    private initialize;
    private rowToNote;
    create(input: CreateNoteInput): Note;
    getById(id: number): Note | null;
    update(input: UpdateNoteInput): Note | null;
    delete(id: number): boolean;
    search(input: SearchNotesInput): {
        notes: Note[];
        total: number;
        hasMore: boolean;
    };
    listProjects(): string[];
    getStats(): {
        totalNotes: number;
        projectCount: number;
        categoryCounts: Record<string, number>;
    };
    close(): void;
}
//# sourceMappingURL=database.d.ts.map