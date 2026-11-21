const taskList = document.querySelector("#task-list");
const cardTemplate = document.querySelector("#task-card-template");
const taskMessage = document.querySelector("#task-message");
const refreshButton = document.querySelector("#refresh-tasks");
const retryButton = document.querySelector("#retry-tasks");
const statusButtons = [...document.querySelectorAll("[data-status-filter]")];
const selectedStatuses = new Set(statusButtons.map((button) => button.dataset.statusFilter));
const tasksPage = document.querySelector("#tasks-page");
const overviewPage = document.querySelector("#overview-page");
const navLinks = document.querySelectorAll(".bottom-nav a");
let allTasks = null;
const actionLabels = new Map([
  ["Pending", "Start"],
  ["In Progress", "Done"],
  ["Completed", "Delete"],
]);
const dateFormat = new Intl.DateTimeFormat("en-CA", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function comparePriority(a, b) {
  return Number(a.status === "Completed") - Number(b.status === "Completed")
    || (b.urgency ?? 0) - (a.urgency ?? 0)
    || (b.importance ?? 0) - (a.importance ?? 0);
}

function renderRating(container, level) {
  container.dataset.level = level ?? "unknown";
  const segments = document.createElement("span");
  segments.className = "rating-segments";
  segments.setAttribute("aria-hidden", "true");

  for (let segment = 1; segment <= 5; segment += 1) {
    const cell = document.createElement("span");
    if (segment <= level) cell.className = "filled";
    segments.append(cell);
  }

  const value = document.createElement("span");
  value.textContent = level == null ? "Not rated" : `${level}/5`;
  container.append(segments, value);
}

function setCardExpanded(card, expanded) {
  const toggle = card.querySelector(".task-toggle");
  const title = card.querySelector(".task-title").textContent;
  card.classList.toggle("is-expanded", expanded);
  card.querySelector(".task-body").hidden = !expanded;
  card.querySelector(".quick-status-action").hidden = expanded;
  toggle.setAttribute("aria-expanded", String(expanded));
  toggle.setAttribute("aria-label", `${expanded ? "Collapse" : "Expand"} ${title}`);
}

function renderTask(task, index) {
  const card = cardTemplate.content.firstElementChild.cloneNode(true);
  const field = (name) => card.querySelector(`[data-field="${name}"]`);

  field("title").textContent = task.title;
  field("status").textContent = task.status;
  field("description").textContent = task.description ?? "";
  field("description").hidden = !task.description;
  field("duration").textContent = task.duration == null ? "Not estimated" : `${task.duration} min`;

  const dot = card.querySelector(".urgency-dot");
  const urgencyLabel = task.urgency == null ? "Urgency not rated" : `Urgency ${task.urgency} out of 5`;
  dot.dataset.level = task.urgency ?? "unknown";
  dot.setAttribute("role", "img");
  dot.setAttribute("aria-label", urgencyLabel);
  dot.title = urgencyLabel;

  const due = field("due");
  if (task.due_date) {
    const date = document.createElement("time");
    date.dateTime = task.due_date;
    date.textContent = dateFormat.format(new Date(`${task.due_date}T00:00:00Z`));
    due.append(date);
  } else {
    due.textContent = "No due date";
  }

  renderRating(field("urgency"), task.urgency);
  renderRating(field("importance"), task.importance);

  const label = actionLabels.get(task.status) ?? "Update";
  for (const action of card.querySelectorAll(".status-action")) {
    action.textContent = label;
    action.setAttribute("aria-label", `${label} ${task.title}`);
  }

  const detailsId = `task-details-${index}`;
  card.querySelector(".task-body").id = detailsId;
  const toggle = card.querySelector(".task-toggle");
  toggle.setAttribute("aria-controls", detailsId);
  toggle.addEventListener("click", () => {
    const expanded = card.classList.contains("is-expanded");
    const current = taskList.querySelector(".is-expanded");
    if (current && current !== card) setCardExpanded(current, false);
    setCardExpanded(card, !expanded);
  });
  setCardExpanded(card, index === 0);
  return card;
}

function updateStatusCounts() {
  for (const button of statusButtons) {
    const count = allTasks.filter((task) => task.status === button.dataset.statusFilter).length;
    button.querySelector("span").textContent = `(${count})`;
  }
}

function renderFilteredTasks() {
  if (allTasks === null) return;

  const visible = allTasks.filter((task) => selectedStatuses.has(task.status));
  taskList.replaceChildren(...visible.map(renderTask));

  if (selectedStatuses.size === 0) {
    taskMessage.textContent = "Select a status to see tasks.";
  } else if (allTasks.length === 0) {
    taskMessage.textContent = "No tasks yet.";
  } else {
    taskMessage.textContent = visible.length === 0 ? "No tasks match the selected statuses." : "";
  }
}

async function loadTasks() {
  allTasks = null;
  refreshButton.disabled = true;
  retryButton.hidden = true;
  taskList.setAttribute("aria-busy", "true");
  taskList.replaceChildren();
  taskMessage.textContent = "Loading tasks…";

  try {
    const tasks = await getTasks();
    if (!Array.isArray(tasks)) throw new TypeError("Expected a task array");

    allTasks = [...tasks].sort(comparePriority);
    updateStatusCounts();
    renderFilteredTasks();
  } catch {
    allTasks = null;
    taskMessage.textContent = "Couldn’t load tasks.";
    retryButton.hidden = false;
  } finally {
    taskList.setAttribute("aria-busy", "false");
    refreshButton.disabled = false;
  }
}

function showPage() {
  const showOverview = window.location.hash === "#overview";
  tasksPage.hidden = showOverview;
  overviewPage.hidden = !showOverview;
  for (const link of navLinks) {
    const isActive = link.hash === (showOverview ? "#overview" : "#tasks");
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  document.title = `${showOverview ? "Overview" : "Tasks"} | Smart To-Do Assistant`;
}

for (const button of statusButtons) {
  button.addEventListener("click", () => {
    const status = button.dataset.statusFilter;
    if (selectedStatuses.has(status)) selectedStatuses.delete(status);
    else selectedStatuses.add(status);
    button.setAttribute("aria-pressed", String(selectedStatuses.has(status)));
    renderFilteredTasks();
  });
}

window.addEventListener("hashchange", () => {
  showPage();
  window.scrollTo(0, 0);
});
showPage();

refreshButton.addEventListener("click", loadTasks);
retryButton.addEventListener("click", async () => {
  await loadTasks();
  if (document.activeElement === document.body) {
    (retryButton.hidden ? refreshButton : retryButton).focus();
  }
});
loadTasks();
