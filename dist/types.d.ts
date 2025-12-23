/**
 * Type definitions for the Notes MCP Server
 */
export interface Note {
    [key: string]: unknown;
    id: number;
    project: string;
    category: NoteCategory;
    title: string;
    content: string;
    tags: string[];
    created_at: string;
    updated_at: string;
}
export type NoteCategory = 'design_decision' | 'architecture' | 'requirement' | 'todo' | 'bug' | 'idea' | 'documentation' | 'general';
export interface NoteRow {
    id: number;
    project: string;
    category: string;
    title: string;
    content: string;
    tags: string;
    created_at: string;
    updated_at: string;
}
export interface CreateNoteInput {
    project: string;
    category: NoteCategory;
    title: string;
    content: string;
    tags?: string[];
}
export interface UpdateNoteInput {
    id: number;
    title?: string;
    content?: string;
    category?: NoteCategory;
    tags?: string[];
}
export interface SearchNotesInput {
    project?: string;
    category?: NoteCategory;
    query?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
}
//# sourceMappingURL=types.d.ts.map