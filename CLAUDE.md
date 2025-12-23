# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Notes MCP Server - A TypeScript MCP server for saving project notes and design decisions to a SQLite database. Designed for persistent documentation across Claude Code sessions.

## Commands

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run the server (stdio mode)
NOTES_DB_PATH=/path/to/notes.db npm start

# Development with auto-reload
npm run dev
```

## Architecture

### Tech Stack
- TypeScript with ES2022 target
- MCP SDK (@modelcontextprotocol/sdk)
- better-sqlite3 for SQLite storage
- Zod for input validation

### Project Structure
```
src/
├── index.ts           # Main entry, MCP server setup, tool registration
├── types.ts           # TypeScript interfaces (Note, NoteCategory, etc.)
├── schemas/
│   └── notes.ts       # Zod validation schemas for all tools
└── services/
    └── database.ts    # SQLite database operations
```

### Tools
| Tool | Description |
|------|-------------|
| `notes_add` | Create a note with project, category, title, content, tags |
| `notes_get` | Retrieve a note by ID |
| `notes_update` | Update note fields (partial updates supported) |
| `notes_delete` | Delete a note permanently |
| `notes_search` | Search/filter notes with pagination |
| `notes_list_projects` | List all projects with notes |
| `notes_stats` | Get statistics (totals, category counts) |

### Categories
`design_decision`, `architecture`, `requirement`, `todo`, `bug`, `idea`, `documentation`, `general`

## Configuration

The server uses the `NOTES_DB_PATH` environment variable to locate the SQLite database. If not set, defaults to `.notes/notes.db` in the current directory.

Example Claude Code MCP config:
```json
{
  "mcpServers": {
    "notes": {
      "command": "node",
      "args": ["/path/to/notes-mcp-server/dist/index.js"],
      "env": {
        "NOTES_DB_PATH": "/path/to/project/.notes/notes.db"
      }
    }
  }
}
```

## Database Schema

Single `notes` table:
- `id` - INTEGER PRIMARY KEY
- `project` - TEXT (project name)
- `category` - TEXT (note category)
- `title` - TEXT
- `content` - TEXT (supports markdown)
- `tags` - TEXT (JSON array)
- `created_at` - TEXT (ISO datetime)
- `updated_at` - TEXT (ISO datetime)

SQLite WAL mode is enabled for performance. The `-wal` and `-shm` files should be gitignored.
