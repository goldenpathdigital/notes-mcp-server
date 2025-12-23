# Notes MCP Server

An MCP (Model Context Protocol) server for saving project notes and design decisions to a SQLite database. Designed to be used across multiple projects with git-tracked storage.

## Features

- **Persistent Storage**: Notes are saved to a SQLite database that can be committed to git
- **Project Organization**: Group notes by project name
- **Categories**: Organize notes as design decisions, architecture notes, requirements, todos, bugs, ideas, or documentation
- **Tagging**: Add tags for flexible categorization
- **Search**: Full-text search across titles and content
- **Markdown Support**: Content supports markdown formatting

## Installation

```bash
cd ~/mcp/notes-mcp-server
npm install
npm run build
```

## Configuration

Add to your Claude Desktop or Claude Code MCP configuration:

```json
{
  "mcpServers": {
    "notes": {
      "command": "node",
      "args": ["/home/aaronbalentine/mcp/notes-mcp-server/dist/index.js"],
      "env": {
        "NOTES_DB_PATH": "/path/to/your/project/.notes/notes.db"
      }
    }
  }
}
```

The `NOTES_DB_PATH` environment variable specifies where the SQLite database is stored. Set this to a path inside your project directory to track notes with git.

## Tools

### notes_add
Create a new note for a project.

```
project: string      - Project name
category: string     - design_decision|architecture|requirement|todo|bug|idea|documentation|general
title: string        - Brief title
content: string      - Full content (markdown supported)
tags: string[]       - Optional tags
```

### notes_get
Retrieve a specific note by ID.

### notes_update
Update an existing note (partial updates supported).

### notes_delete
Delete a note permanently.

### notes_search
Search and filter notes with pagination.

```
project: string      - Filter by project
category: string     - Filter by category
query: string        - Search in title/content
tags: string[]       - Filter by any matching tag
limit: number        - Max results (default 20)
offset: number       - Pagination offset
```

### notes_list_projects
List all projects that have notes.

### notes_stats
Get statistics about stored notes.

## Git Tracking

To track notes in your project:

1. Add `.notes/` to your project
2. Set `NOTES_DB_PATH` to point to `<project>/.notes/notes.db`
3. Commit the `.notes/notes.db` file

Note: SQLite in WAL mode creates `-wal` and `-shm` files. Add these to `.gitignore`:

```
.notes/*-wal
.notes/*-shm
```

## Development

```bash
# Development with auto-reload
npm run dev

# Build for production
npm run build

# Run built version
npm start
```
