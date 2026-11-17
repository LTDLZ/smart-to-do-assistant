# Smart To-Do Assistant

An ITEC 4020 group project that helps users decide what to work on next and turn large tasks into manageable steps.

## Project materials

- [Short pitch (Google Docs)](https://docs.google.com/document/d/1GziXUBg7MZrLnobckvvulrhLZaYIitdssI6ZT2z7uNI/)
- October project proposal — `docs/project-proposal.xlsx` on `dev/songang` once uploaded. It will be included in the first integration pull request.

## What the app will do

- **Manage tasks.** Create, view, edit, and delete tasks with deadlines, estimated durations, importance levels, and statuses.
- **Recommend what to do next.** Prioritize tasks by urgency and importance.
- **Break down large tasks.** Use an AI model to suggest actionable steps for a selected task.

## Stack and evaluation

| Area | Choice |
| --- | --- |
| Client and server | Web client calling a Node.js and Express REST API |
| Task storage | SQLite |
| Deployment | AWS EC2 |
| AI for task breakdown | OpenAI API (proposed provider) |

We will create sample task records and a labelled test set. We will use Precision@k to evaluate priority recommendations, score task breakdowns with a separate rubric, and measure AI response latency and API cost.

## Team branches

| Team member | Working branch |
| --- | --- |
| Songang Li | `dev/songang` |
| Elina Najafi | `dev/elina` |
| Jeeman Khorsheed | `dev/jeeman` |

## Development workflow

1. **Work separately.** Branch from the initial `main` commit and push to your own `dev/*` branch. If you create a task branch, set your own `dev/*` branch as the base of its pull request. Keep `main` README-only during development.
2. **Assemble the demo.** Agree on the shared REST routes and data fields. When all three members are ready, create `integration/demo-1` from `main` and open a pull request from each `dev/*` branch into it. Use merge commits to preserve individual contributions. Resolve conflicts and test the combined app on `integration/demo-1`.
3. **Merge the first version.** After the team verifies the demo, review and merge the pull request from `integration/demo-1` into `main`.

Store API keys and credentials in environment variables. Keep local `.env` files and real credentials out of Git.
