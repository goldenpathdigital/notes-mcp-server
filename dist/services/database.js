/**
 * SQLite database service for notes storage
 */
import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
export class NotesDatabase {
    db;
    constructor(dbPath) {
        // Ensure directory exists
        const dir = dirname(dbPath);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');
        this.initialize();
    }
    initialize() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'general',
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT DEFAULT '[]',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_notes_project ON notes(project);
      CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
      CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
    `);
    }
    rowToNote(row) {
        return {
            id: row.id,
            project: row.project,
            category: row.category,
            title: row.title,
            content: row.content,
            tags: JSON.parse(row.tags || '[]'),
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }
    create(input) {
        const stmt = this.db.prepare(`
      INSERT INTO notes (project, category, title, content, tags)
      VALUES (?, ?, ?, ?, ?)
    `);
        const result = stmt.run(input.project, input.category, input.title, input.content, JSON.stringify(input.tags || []));
        return this.getById(result.lastInsertRowid);
    }
    getById(id) {
        const stmt = this.db.prepare('SELECT * FROM notes WHERE id = ?');
        const row = stmt.get(id);
        return row ? this.rowToNote(row) : null;
    }
    update(input) {
        const existing = this.getById(input.id);
        if (!existing) {
            return null;
        }
        const updates = [];
        const values = [];
        if (input.title !== undefined) {
            updates.push('title = ?');
            values.push(input.title);
        }
        if (input.content !== undefined) {
            updates.push('content = ?');
            values.push(input.content);
        }
        if (input.category !== undefined) {
            updates.push('category = ?');
            values.push(input.category);
        }
        if (input.tags !== undefined) {
            updates.push('tags = ?');
            values.push(JSON.stringify(input.tags));
        }
        if (updates.length === 0) {
            return existing;
        }
        updates.push("updated_at = datetime('now')");
        values.push(input.id);
        const stmt = this.db.prepare(`
      UPDATE notes SET ${updates.join(', ')} WHERE id = ?
    `);
        stmt.run(...values);
        return this.getById(input.id);
    }
    delete(id) {
        const stmt = this.db.prepare('DELETE FROM notes WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    search(input) {
        const conditions = [];
        const values = [];
        if (input.project) {
            conditions.push('project = ?');
            values.push(input.project);
        }
        if (input.category) {
            conditions.push('category = ?');
            values.push(input.category);
        }
        if (input.query) {
            conditions.push('(title LIKE ? OR content LIKE ?)');
            const searchTerm = `%${input.query}%`;
            values.push(searchTerm, searchTerm);
        }
        if (input.tags && input.tags.length > 0) {
            // Search for any of the provided tags
            const tagConditions = input.tags.map(() => "tags LIKE ?");
            conditions.push(`(${tagConditions.join(' OR ')})`);
            input.tags.forEach(tag => values.push(`%"${tag}"%`));
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const limit = input.limit ?? 20;
        const offset = input.offset ?? 0;
        // Get total count
        const countStmt = this.db.prepare(`SELECT COUNT(*) as count FROM notes ${whereClause}`);
        const countResult = countStmt.get(...values);
        const total = countResult.count;
        // Get paginated results
        const stmt = this.db.prepare(`
      SELECT * FROM notes ${whereClause}
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
    `);
        const rows = stmt.all(...values, limit, offset);
        const notes = rows.map(row => this.rowToNote(row));
        return {
            notes,
            total,
            hasMore: offset + notes.length < total,
        };
    }
    listProjects() {
        const stmt = this.db.prepare('SELECT DISTINCT project FROM notes ORDER BY project');
        const rows = stmt.all();
        return rows.map(row => row.project);
    }
    getStats() {
        const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM notes');
        const totalResult = totalStmt.get();
        const projectStmt = this.db.prepare('SELECT COUNT(DISTINCT project) as count FROM notes');
        const projectResult = projectStmt.get();
        const categoryStmt = this.db.prepare('SELECT category, COUNT(*) as count FROM notes GROUP BY category');
        const categoryRows = categoryStmt.all();
        const categoryCounts = {};
        categoryRows.forEach(row => {
            categoryCounts[row.category] = row.count;
        });
        return {
            totalNotes: totalResult.count,
            projectCount: projectResult.count,
            categoryCounts,
        };
    }
    close() {
        this.db.close();
    }
}
//# sourceMappingURL=database.js.map