#!/usr/bin/env node
/**
 * Notes MCP Server
 *
 * An MCP server for saving project notes and design decisions to a SQLite database.
 * The database is stored in the project directory for git tracking.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { NotesDatabase } from './services/database.js';
import { CreateNoteSchema, UpdateNoteSchema, GetNoteSchema, DeleteNoteSchema, SearchNotesSchema, ListProjectsSchema, GetStatsSchema, } from './schemas/notes.js';
// Get database path from environment or use default
const DB_PATH = process.env.NOTES_DB_PATH || '.notes/notes.db';
// Initialize database
const db = new NotesDatabase(DB_PATH);
// Create MCP server
const server = new McpServer({
    name: 'notes-mcp-server',
    version: '1.0.0',
});
// Helper to format note as markdown
function formatNoteMarkdown(note) {
    const lines = [
        `# ${note.title}`,
        '',
        `**ID:** ${note.id}`,
        `**Project:** ${note.project}`,
        `**Category:** ${note.category}`,
        `**Tags:** ${note.tags.length > 0 ? note.tags.join(', ') : 'none'}`,
        `**Created:** ${note.created_at}`,
        `**Updated:** ${note.updated_at}`,
        '',
        '---',
        '',
        note.content,
    ];
    return lines.join('\n');
}
// Register tools
server.registerTool('notes_add', {
    title: 'Add Note',
    description: `Create a new note for a project. Use this to record design decisions, architecture notes, requirements, todos, bugs, ideas, or general documentation.

Args:
  - project (string): Project name this note belongs to
  - category (string): One of: design_decision, architecture, requirement, todo, bug, idea, documentation, general
  - title (string): Brief title summarizing the note
  - content (string): Full content (supports markdown)
  - tags (string[]): Optional tags for categorization

Returns:
  The created note with its assigned ID.

Examples:
  - Record a design decision: project="gpd-portal", category="design_decision", title="Use Filament for admin", content="We chose Filament v3 because..."
  - Add a todo: project="my-app", category="todo", title="Implement caching", content="Add Redis caching for API responses"`,
    inputSchema: CreateNoteSchema,
    annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
    },
}, async (params) => {
    try {
        const note = db.create(params);
        return {
            content: [{ type: 'text', text: formatNoteMarkdown(note) }],
            structuredContent: note,
        };
    }
    catch (error) {
        return {
            content: [{
                    type: 'text',
                    text: `Error creating note: ${error instanceof Error ? error.message : String(error)}`,
                }],
            isError: true,
        };
    }
});
server.registerTool('notes_get', {
    title: 'Get Note',
    description: `Retrieve a specific note by its ID.

Args:
  - id (number): The note ID

Returns:
  The full note content and metadata.`,
    inputSchema: GetNoteSchema,
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
    },
}, async (params) => {
    try {
        const note = db.getById(params.id);
        if (!note) {
            return {
                content: [{ type: 'text', text: `Error: Note with ID ${params.id} not found.` }],
                isError: true,
            };
        }
        return {
            content: [{ type: 'text', text: formatNoteMarkdown(note) }],
            structuredContent: note,
        };
    }
    catch (error) {
        return {
            content: [{
                    type: 'text',
                    text: `Error retrieving note: ${error instanceof Error ? error.message : String(error)}`,
                }],
            isError: true,
        };
    }
});
server.registerTool('notes_update', {
    title: 'Update Note',
    description: `Update an existing note. Only provide the fields you want to change.

Args:
  - id (number): The note ID to update
  - title (string, optional): New title
  - content (string, optional): New content
  - category (string, optional): New category
  - tags (string[], optional): New tags (replaces existing)

Returns:
  The updated note.`,
    inputSchema: UpdateNoteSchema,
    annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
    },
}, async (params) => {
    try {
        const note = db.update(params);
        if (!note) {
            return {
                content: [{ type: 'text', text: `Error: Note with ID ${params.id} not found.` }],
                isError: true,
            };
        }
        return {
            content: [{ type: 'text', text: formatNoteMarkdown(note) }],
            structuredContent: note,
        };
    }
    catch (error) {
        return {
            content: [{
                    type: 'text',
                    text: `Error updating note: ${error instanceof Error ? error.message : String(error)}`,
                }],
            isError: true,
        };
    }
});
server.registerTool('notes_delete', {
    title: 'Delete Note',
    description: `Delete a note permanently.

Args:
  - id (number): The note ID to delete

Returns:
  Confirmation of deletion.`,
    inputSchema: DeleteNoteSchema,
    annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false,
    },
}, async (params) => {
    try {
        const success = db.delete(params.id);
        if (!success) {
            return {
                content: [{ type: 'text', text: `Error: Note with ID ${params.id} not found.` }],
                isError: true,
            };
        }
        return {
            content: [{ type: 'text', text: `Successfully deleted note ${params.id}.` }],
            structuredContent: { deleted: true, id: params.id },
        };
    }
    catch (error) {
        return {
            content: [{
                    type: 'text',
                    text: `Error deleting note: ${error instanceof Error ? error.message : String(error)}`,
                }],
            isError: true,
        };
    }
});
server.registerTool('notes_search', {
    title: 'Search Notes',
    description: `Search and filter notes across projects.

Args:
  - project (string, optional): Filter by project name
  - category (string, optional): Filter by category
  - query (string, optional): Search text in title and content
  - tags (string[], optional): Filter by tags (matches any)
  - limit (number): Max results (default 20, max 100)
  - offset (number): Pagination offset (default 0)

Returns:
  List of matching notes with pagination info.

Examples:
  - Find all design decisions: category="design_decision"
  - Search in a project: project="gpd-portal", query="database"
  - Find tagged notes: tags=["frontend", "performance"]`,
    inputSchema: SearchNotesSchema,
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
    },
}, async (params) => {
    try {
        const result = db.search(params);
        const lines = [
            `# Search Results`,
            '',
            `Found **${result.total}** notes (showing ${result.notes.length})`,
            '',
        ];
        if (result.notes.length === 0) {
            lines.push('No notes found matching your criteria.');
        }
        else {
            for (const note of result.notes) {
                lines.push(`## [${note.id}] ${note.title}`);
                lines.push(`**Project:** ${note.project} | **Category:** ${note.category} | **Updated:** ${note.updated_at}`);
                if (note.tags.length > 0) {
                    lines.push(`**Tags:** ${note.tags.join(', ')}`);
                }
                lines.push('');
                // Show first 200 chars of content
                const preview = note.content.length > 200
                    ? note.content.substring(0, 200) + '...'
                    : note.content;
                lines.push(preview);
                lines.push('');
                lines.push('---');
                lines.push('');
            }
        }
        if (result.hasMore) {
            lines.push(`*More results available. Use offset=${params.offset ?? 0 + result.notes.length} to see next page.*`);
        }
        return {
            content: [{ type: 'text', text: lines.join('\n') }],
            structuredContent: {
                total: result.total,
                count: result.notes.length,
                offset: params.offset ?? 0,
                notes: result.notes,
                hasMore: result.hasMore,
                nextOffset: result.hasMore ? (params.offset ?? 0) + result.notes.length : undefined,
            },
        };
    }
    catch (error) {
        return {
            content: [{
                    type: 'text',
                    text: `Error searching notes: ${error instanceof Error ? error.message : String(error)}`,
                }],
            isError: true,
        };
    }
});
server.registerTool('notes_list_projects', {
    title: 'List Projects',
    description: `List all projects that have notes.

Returns:
  List of project names.`,
    inputSchema: ListProjectsSchema,
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
    },
}, async () => {
    try {
        const projects = db.listProjects();
        const lines = [
            '# Projects with Notes',
            '',
            projects.length === 0
                ? 'No projects found. Use notes_add to create your first note.'
                : projects.map(p => `- ${p}`).join('\n'),
        ];
        return {
            content: [{ type: 'text', text: lines.join('\n') }],
            structuredContent: { projects },
        };
    }
    catch (error) {
        return {
            content: [{
                    type: 'text',
                    text: `Error listing projects: ${error instanceof Error ? error.message : String(error)}`,
                }],
            isError: true,
        };
    }
});
server.registerTool('notes_stats', {
    title: 'Get Statistics',
    description: `Get statistics about stored notes.

Returns:
  Total notes, project count, and notes per category.`,
    inputSchema: GetStatsSchema,
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
    },
}, async () => {
    try {
        const stats = db.getStats();
        const lines = [
            '# Notes Statistics',
            '',
            `**Total Notes:** ${stats.totalNotes}`,
            `**Projects:** ${stats.projectCount}`,
            '',
            '## Notes by Category',
            '',
        ];
        if (Object.keys(stats.categoryCounts).length === 0) {
            lines.push('No notes yet.');
        }
        else {
            for (const [category, count] of Object.entries(stats.categoryCounts)) {
                lines.push(`- **${category}:** ${count}`);
            }
        }
        return {
            content: [{ type: 'text', text: lines.join('\n') }],
            structuredContent: stats,
        };
    }
    catch (error) {
        return {
            content: [{
                    type: 'text',
                    text: `Error getting stats: ${error instanceof Error ? error.message : String(error)}`,
                }],
            isError: true,
        };
    }
});
// Handle graceful shutdown
process.on('SIGINT', () => {
    db.close();
    process.exit(0);
});
process.on('SIGTERM', () => {
    db.close();
    process.exit(0);
});
// Run the server
async function main() {
    console.error(`Notes MCP Server starting...`);
    console.error(`Database path: ${DB_PATH}`);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Notes MCP Server running via stdio');
}
main().catch((error) => {
    console.error('Server error:', error);
    db.close();
    process.exit(1);
});
//# sourceMappingURL=index.js.map