/**
 * Zod schemas for notes validation
 */
import { z } from 'zod';
export declare const NoteCategorySchema: z.ZodEnum<["design_decision", "architecture", "requirement", "todo", "bug", "idea", "documentation", "general"]>;
export declare const CreateNoteSchema: z.ZodObject<{
    project: z.ZodString;
    category: z.ZodDefault<z.ZodEnum<["design_decision", "architecture", "requirement", "todo", "bug", "idea", "documentation", "general"]>>;
    title: z.ZodString;
    content: z.ZodString;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strict", z.ZodTypeAny, {
    project: string;
    category: "design_decision" | "architecture" | "requirement" | "todo" | "bug" | "idea" | "documentation" | "general";
    title: string;
    content: string;
    tags: string[];
}, {
    project: string;
    title: string;
    content: string;
    category?: "design_decision" | "architecture" | "requirement" | "todo" | "bug" | "idea" | "documentation" | "general" | undefined;
    tags?: string[] | undefined;
}>;
export declare const UpdateNoteSchema: z.ZodObject<{
    id: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<["design_decision", "architecture", "requirement", "todo", "bug", "idea", "documentation", "general"]>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strict", z.ZodTypeAny, {
    id: number;
    category?: "design_decision" | "architecture" | "requirement" | "todo" | "bug" | "idea" | "documentation" | "general" | undefined;
    title?: string | undefined;
    content?: string | undefined;
    tags?: string[] | undefined;
}, {
    id: number;
    category?: "design_decision" | "architecture" | "requirement" | "todo" | "bug" | "idea" | "documentation" | "general" | undefined;
    title?: string | undefined;
    content?: string | undefined;
    tags?: string[] | undefined;
}>;
export declare const GetNoteSchema: z.ZodObject<{
    id: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const DeleteNoteSchema: z.ZodObject<{
    id: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const SearchNotesSchema: z.ZodObject<{
    project: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<["design_decision", "architecture", "requirement", "todo", "bug", "idea", "documentation", "general"]>>;
    query: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    limit: number;
    offset: number;
    project?: string | undefined;
    category?: "design_decision" | "architecture" | "requirement" | "todo" | "bug" | "idea" | "documentation" | "general" | undefined;
    tags?: string[] | undefined;
    query?: string | undefined;
}, {
    project?: string | undefined;
    category?: "design_decision" | "architecture" | "requirement" | "todo" | "bug" | "idea" | "documentation" | "general" | undefined;
    tags?: string[] | undefined;
    query?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export declare const ListProjectsSchema: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
export declare const GetStatsSchema: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>;
export type GetNoteInput = z.infer<typeof GetNoteSchema>;
export type DeleteNoteInput = z.infer<typeof DeleteNoteSchema>;
export type SearchNotesInput = z.infer<typeof SearchNotesSchema>;
//# sourceMappingURL=notes.d.ts.map