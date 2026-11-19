# Smart To-Do Assistant - Backend

This is the API side of the Smart To-Do Assistant. It's a Node and Express app
that keeps tasks in a SQLite file and serves them over HTTP.

Right now it does two useful things: it hands back the task list, and it loads a
CSV of sample tasks into the database.

It's read-only for now. There is no create, update or delete endpoint yet, so the
way to get data in is the CSV loader.

## Stack

| Piece | What I used |
| --- | --- |
| Runtime | Node.js, ES modules |
| Web framework | Express 5 |
| Database | SQLite through `better-sqlite3` |
| CSV parsing | `csv-parse` |

## Requirements

- Node 22.9 or newer. The `start` and `dev` scripts use `--env-file-if-exists`,
  which landed in 22.9.
- npm (comes with Node).

## Getting started

```bash
cd backend
npm install
npm start
```

You should see:

```
Smart To-Do Assistant API listening on http://localhost:3000
Database: .../backend/data/tasks.db
```

The database file and the `tasks` table are created automatically the first time
you start. It starts out empty, so the next step is usually to load the sample
data:

```bash
curl.exe "http://localhost:3000/api/load-sample-data"
```

Then check what landed:

```bash
curl.exe "http://localhost:3000/api/tasks"
```

With PowerShell, use `curl.exe` and not `curl`. Plain `curl` is an alias for
`Invoke-WebRequest`, which prints different output. `Invoke-RestMethod` works fine
too if you prefer it.

For development, `npm run dev` restarts the server whenever a source file changes.
`npm start` does not watch files.

## Configuration

Copy `.env.example` to `.env` and edit it. Everything has a working default, so
the app runs without a `.env` at all, but you'll want one before deploying.

```bash
copy .env.example .env     # Windows
cp .env.example .env       # macOS / Linux
```

| Variable | Default | What it does |
| --- | --- | --- |
| `PORT` | `3000` | Port the server listens on |
| `DB_FILE` | `./data/tasks.db` | Where the SQLite file lives |
| `SAMPLE_DATA_FILE` | `./data/sample-tasks.csv` | CSV read by the loader endpoint |
| `NODE_ENV` | `development` | Set to `production` on a server |

Relative paths are resolved from the `backend/` folder, not from your current
directory, so it doesn't matter where you run npm from.

## Project layout

```
backend/
├── data/
│   └── sample-tasks.csv        8 sample tasks for the loader
├── src/
│   ├── server.js               entry point, starts the HTTP server
│   ├── app.js                  builds the Express app and its middleware
│   ├── config.js               reads env vars and resolves paths
│   ├── db/
│   │   ├── index.js            opens the SQLite connection
│   │   └── schema.sql          the tasks table
│   ├── routes/
│   │   ├── index.js            wires the routers under /api
│   │   ├── tasks.routes.js     GET /api/tasks
│   │   └── admin.routes.js     GET /api/load-sample-data
│   ├── services/
│   │   └── tasks.service.js    the actual SQL queries
│   └── utils/
│       └── csv.js              CSV parsing and row validation
├── .env.example
└── package.json
```

The routes stay thin. They read the request, call a function in `services/`, and
send JSON back. Anything that talks to the database lives in the service layer.

## Endpoints

All endpoints live under `/api`.

### GET /api/health

A smoke test for deployments. It always returns the same thing and doesn't touch
the database.

```bash
curl.exe "http://localhost:3000/api/health"
```

```json
{ "status": "ok" }
```

### GET /api/tasks

Returns every task as a JSON array. No pagination yet, since the table is small.

```bash
curl.exe "http://localhost:3000/api/tasks"
```

```json
[
  {
    "task_id": 3,
    "title": "Buy groceries",
    "description": "Weekly grocery run for the apartment",
    "due_date": "2026-11-18",
    "duration": 60,
    "importance": 2,
    "urgency": 3,
    "status": "In Progress"
  },
  {
    "task_id": 2,
    "title": "Review team pull requests",
    "description": "Check the dev/elina and dev/songang branches",
    "due_date": "2026-11-19",
    "duration": 45,
    "importance": 3,
    "urgency": 4,
    "status": "Pending"
  }
]
```

Sort order, since it isn't obvious from the output: tasks with a due date come
first, soonest due first. Then by importance, high to low. Then by `task_id`.
Tasks with no due date sort to the very end.

Fields match the `tasks` table, so `description`, `due_date`, `duration` and
`urgency` can be `null`. `importance` is between 1 and 5, and `status` is one of
`Pending`, `In Progress` or `Completed`.

### GET /api/load-sample-data

Reads a CSV file off disk and loads it into the `tasks` table. This is meant for
seeding your local database, not for production.

Query parameters:

| Param | Values | Default | Effect |
| --- | --- | --- | --- |
| `mode` | `replace`, `append` | `replace` | See below |

```bash
# Wipe the table and load the CSV (default)
curl.exe "http://localhost:3000/api/load-sample-data"

# Add the CSV rows on top of whatever is already there
curl.exe "http://localhost:3000/api/load-sample-data?mode=append"
```

```json
{
  "message": "Loaded 8 task(s) from the sample CSV.",
  "mode": "replace",
  "source": "D:\\...\\backend\\data\\sample-tasks.csv",
  "inserted": 8,
  "totalTasks": 8
}
```

How the two modes behave:

- `replace` deletes all existing tasks, resets the auto-increment counter, and
  inserts the CSV rows in a single transaction. Hitting the endpoint twice gives
  you the same 8 rows with the same ids both times. Handy when you want a clean
  slate.
- `append` ignores the ids in the CSV and lets SQLite assign new ones, then adds
  the rows. That way you can run it repeatedly without hitting a duplicate id
  error.

`source` is the absolute path of the file that was read, which is useful when you
point `SAMPLE_DATA_FILE` somewhere else.

Two things worth knowing about this endpoint:

- It's a `GET` that changes data. That's convenient in a browser and wrong for a
  real API. If this ever leaves your machine, it should become a `POST` behind
  some kind of auth.
- The whole load runs in one transaction. If any row fails validation, nothing is
  written, so you never end up with half a dataset.

### Error responses

Errors are always JSON with a single `error` field.

| Status | When | Example body |
| --- | --- | --- |
| 400 | Bad `mode` value | `{"error":"Invalid \"mode\". Use \"replace\" or \"append\"."}` |
| 404 | Unknown route | `{"error":"Route not found: GET /api/nope"}` |
| 500 | File missing, or a CSV row fails validation | `{"error":"Row 3: \"importance\" must be between 1 and 5 (received \"9\")"}` |

The 500 message for a bad CSV row tells you the line number and the column, so you
can go straight to the problem.

## The database

One table, defined in `src/db/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS tasks (
    task_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    duration INTEGER,
    importance INTEGER NOT NULL DEFAULT 3
        CHECK (importance BETWEEN 1 AND 5),
    urgency INTEGER,
    status TEXT NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'In Progress', 'Completed'))
);
```

`schema.sql` runs on every startup. It uses `CREATE TABLE IF NOT EXISTS`, so it's
safe to run over and over and it won't wipe your data.

A few decisions behind the schema:

- `due_date` is plain text in `YYYY-MM-DD` form. That sorts correctly as a string,
  so there's no date type to fight with.
- `importance` is constrained to 1 through 5, and `status` is constrained to the
  three values above. The database rejects bad values instead of trusting the
  application.
- `title` is the only required column.

The connection uses WAL mode (`PRAGMA journal_mode = WAL`), so you can read the
database while the server is running. That means opening `data/tasks.db` in VS
Code with a SQLite extension won't block the API.

### Resetting the database

Stop the server and delete the file. The next start recreates an empty one.

```bash
# Windows
Remove-Item data\tasks.db*

# macOS / Linux
rm data/tasks.db*
```

There are up to three files because of WAL mode: `tasks.db`, `tasks.db-wal` and
`tasks.db-shm`. Delete all of them together. `data/*.db*` is in `.gitignore`, so
none of this ends up in commits.

## The sample CSV

`data/sample-tasks.csv` holds 8 tasks, one of them with a quoted description that
contains a comma. It's there to prove the parser handles that properly, and to
give the recommender something to work with later.

```
task_id,title,description,due_date,duration,importance,urgency,status
1,Submit ITEC 4020 project proposal,"Upload the proposal spreadsheet to the shared drive, then notify the team",2026-11-20,90,5,5,Pending
2,Review team pull requests,Check the dev/elina and dev/songang branches,2026-11-19,45,3,4,Pending
```

Rules the loader enforces:

- The first line must be a header, and column names have to match the table
  fields. Extra columns are ignored.
- `title` is required. A blank title fails the row.
- `importance` must be 1 to 5. Blank defaults to 3.
- `status` must be `Pending`, `In Progress` or `Completed`. Blank defaults to
  `Pending`.
- `duration` and `urgency` must be whole numbers, or blank.
- `task_id` can be blank. In `replace` mode the id from the CSV is used; in
  `append` mode it's ignored.
- Blank cells become `NULL`.

A failure stops the whole import. You'll get the line number in the error, and
the note about line numbers counting the header as line 1.

To point at a different file, set `SAMPLE_DATA_FILE` in `.env`. Absolute paths
work too.

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Run the server |
| `npm run dev` | Run the server and restart on file changes |

## Not done yet

So the next person doesn't wonder whether something's missing:

- No `POST`, `PUT` or `DELETE` for tasks. The store is currently write-only
  through the CSV loader.
- No authentication on the `/api` routes.
- No CORS headers, so a front end served from another origin (say a Vite dev
  server on port 5173) will get blocked by the browser. Add the `cors` middleware
  when we put a real client in front of this.
- No tests yet.
- Priority scoring and the AI task breakdown from the project plan aren't here.
  This is the storage and API layer they'll sit on.
