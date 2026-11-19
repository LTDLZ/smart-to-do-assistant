# Smart To-Do Assistant - Backend

Express + SQLite API for the task list. Read-only for now: two endpoints and a
health check.

## Run

```bash
cd backend
npm install
npm start
```

Server runs on `http://localhost:3000`. The database file and `tasks` table are
created on first start. `npm run dev` restarts on file changes. Needs Node 22.9+.

The table starts empty, so load the sample data first:

```bash
curl.exe "http://localhost:3000/api/load-sample-data"
```

In PowerShell use `curl.exe`, not `curl` (that's an alias for `Invoke-WebRequest`).

## Project structure

```
backend/
├── data/sample-tasks.csv          8 sample tasks
├── src/
│   ├── server.js                  starts the server
│   ├── app.js                     express app and middleware
│   ├── config.js                  env vars and paths
│   ├── db/
│   │   ├── index.js               sqlite connection
│   │   └── schema.sql             tasks table
│   ├── routes/
│   │   ├── index.js               mounts the /api routers
│   │   ├── tasks.routes.js        GET /api/tasks
│   │   └── admin.routes.js        GET /api/load-sample-data
│   ├── services/tasks.service.js  queries
│   └── utils/csv.js               csv parsing and validation
├── .env.example
└── package.json
```

## Endpoints

### GET /api/health

```json
{ "status": "ok" }
```

### GET /api/tasks

All tasks, soonest due date first. Tasks without a due date come last.

```bash
curl.exe "http://localhost:3000/api/tasks"
```

```json
[
  {
    "task_id": 1,
    "title": "Submit ITEC 4020 project proposal",
    "description": "Upload the proposal spreadsheet to the shared drive, then notify the team",
    "due_date": "2026-11-20",
    "duration": 90,
    "importance": 5,
    "urgency": 5,
    "status": "Pending"
  }
]
```

### GET /api/load-sample-data

Reads `data/sample-tasks.csv` and loads it. `mode=replace` (default) clears the
table first, `mode=append` adds rows with new ids.

```bash
curl.exe "http://localhost:3000/api/load-sample-data"
curl.exe "http://localhost:3000/api/load-sample-data?mode=append"
```

```json
{
  "message": "Loaded 8 task(s) from the sample CSV.",
  "mode": "replace",
  "source": "...\\backend\\data\\sample-tasks.csv",
  "inserted": 8,
  "totalTasks": 8
}
```

Errors are JSON too: `{"error": "..."}`. 400 for a bad `mode`, 404 for an unknown
route, 500 for a missing file or a bad CSV row.

## Database

One table, defined in `src/db/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS tasks (
    task_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    duration INTEGER,
    importance INTEGER NOT NULL DEFAULT 3 CHECK (importance BETWEEN 1 AND 5),
    urgency INTEGER,
    status TEXT NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'In Progress', 'Completed'))
);
```

The file is `data/tasks.db`. To reset it, stop the server and delete
`data/tasks.db*`, then start again.

## CSV format

Header row required. `title` is required. `importance` is 1-5 (default 3).
`status` is `Pending`, `In Progress` or `Completed` (default `Pending`). Blank
cells become `NULL`.

```
task_id,title,description,due_date,duration,importance,urgency,status
1,Submit ITEC 4020 project proposal,"Upload the proposal spreadsheet to the shared drive, then notify the team",2026-11-20,90,5,5,Pending
```

## Config

Copy `.env.example` to `.env`.

| Variable | Default |
| --- | --- |
| `PORT` | `3000` |
| `DB_FILE` | `./data/tasks.db` |
| `SAMPLE_DATA_FILE` | `./data/sample-tasks.csv` |
| `NODE_ENV` | `development` |
