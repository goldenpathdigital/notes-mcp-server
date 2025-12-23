/**
 * Zod schemas for notes validation
 */
import { z } from 'zod';
export const NoteCategorySchema = z.enum([
    'design_decision',
    'architecture',
    'requirement',
    'todo',
    'bug',
    'idea',
    'documentation',
    'general',
]);
export const CreateNoteSchema = z.object({
    project: z.string()
        .min(1, 'Project name is required')
        .max(100, 'Project name must not exceed 100 characters')
        .describe('Project name this note belongs to (e.g., "gpd-portal", "my-app")'),
    category: NoteCategorySchema
        .default('general')
        .describe('Category of the note: design_decision, architecture, requirement, todo, bug, idea, documentation, or general'),
    title: z.string()
        .min(1, 'Title is required')
        .max(200, 'Title must not exceed 200 characters')
        .describe('Brief title summarizing the note'),
    content: z.string()
        .min(1, 'Content is required')
        .max(50000, 'Content must not exceed 50000 characters')
        .describe('Full content of the note (supports markdown)'),
    tags: z.array(z.string().max(50))
        .max(10)
        .default([])
        .describe('Optional tags for categorization (e.g., ["frontend", "performance"])'),
}).strict();
export const UpdateNoteSchema = z.object({
    id: z.number()
        .int()
        .positive()
        .describe('ID of the note to update'),
    title: z.string()
        .min(1)
        .max(200)
        .optional()
        .describe('New title for the note'),
    content: z.string()
        .min(1)
        .max(50000)
        .optional()
        .describe('New content for the note'),
    category: NoteCategorySchema
        .optional()
        .describe('New category for the note'),
    tags: z.array(z.string().max(50))
        .max(10)
        .optional()
        .describe('New tags for the note (replaces existing tags)'),
}).strict();
export const GetNoteSchema = z.object({
    id: z.number()
        .int()
        .positive()
        .describe('ID of the note to retrieve'),
}).strict();
export const DeleteNoteSchema = z.object({
    id: z.number()
        .int()
        .positive()
        .describe('ID of the note to delete'),
}).strict();
export const SearchNotesSchema = z.object({
    project: z.string()
        .max(100)
        .optional()
        .describe('Filter by project name'),
    category: NoteCategorySchema
        .optional()
        .describe('Filter by category'),
    query: z.string()
        .max(200)
        .optional()
        .describe('Search text in title and content'),
    tags: z.array(z.string().max(50))
        .max(10)
        .optional()
        .describe('Filter by tags (matches any of the provided tags)'),
    limit: z.number()
        .int()
        .min(1)
        .max(100)
        .default(20)
        .describe('Maximum number of results to return'),
    offset: z.number()
        .int()
        .min(0)
        .default(0)
        .describe('Number of results to skip for pagination'),
}).strict();
export const ListProjectsSchema = z.object({}).strict();
export const GetStatsSchema = z.object({}).strict();
//# sourceMappingURL=notes.js.map