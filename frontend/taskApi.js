// Jeeman's eight CSV samples, with API urgency values as of November 20, 2026.
const sampleTasks = [
  { task_id: 1, title: "Submit ITEC 4020 project proposal", description: "Upload the proposal spreadsheet to the shared drive, then notify the team", due_date: "2026-11-20", duration: 90, importance: 5, urgency: 5, status: "Pending" },
  { task_id: 2, title: "Review team pull requests", description: "Check the dev/elina and dev/songang branches", due_date: "2026-11-19", duration: 45, importance: 3, urgency: 5, status: "Pending" },
  { task_id: 3, title: "Buy groceries", description: "Weekly grocery run for the apartment", due_date: "2026-11-18", duration: 60, importance: 2, urgency: 5, status: "In Progress" },
  { task_id: 4, title: "Prepare demo script", description: "Outline the live demo flow for integration/demo-1", due_date: "2026-11-25", duration: 120, importance: 4, urgency: 3, status: "Pending" },
  { task_id: 5, title: "Book dentist appointment", description: "Call the clinic to schedule a cleaning", due_date: "2026-12-01", duration: 15, importance: 3, urgency: 1, status: "Pending" },
  { task_id: 6, title: "Write API tests", description: "Add coverage for GET /api/tasks", due_date: "2026-11-22", duration: 150, importance: 4, urgency: 4, status: "Pending" },
  { task_id: 7, title: "Read SQLite documentation", description: "Skim the better-sqlite3 query guide", due_date: "2026-11-21", duration: 30, importance: 2, urgency: 4, status: "Completed" },
  { task_id: 8, title: "Plan sprint retro", description: "Schedule a 30 minute meeting with the team", due_date: "2026-11-26", duration: 40, importance: 3, urgency: 2, status: "Pending" },
];

async function getTasks() {
  // Simulate a short request so the loading state is visible in the local preview.
  await new Promise((resolve) => setTimeout(resolve, 350));
  return sampleTasks;
}
