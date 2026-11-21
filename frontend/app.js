const taskList = document.querySelector("#task-list");
const cardTemplate = document.querySelector("#task-card-template");
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

function renderTask(task, open) {
  const card = cardTemplate.content.firstElementChild.cloneNode(true);
  const field = (name) => card.querySelector(`[data-field="${name}"]`);

  card.open = open;
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
  return card;
}

async function renderTasks() {
  const tasks = [...await getTasks()].sort(comparePriority);
  taskList.replaceChildren(...tasks.map((task, index) => renderTask(task, index === 0)));
}

renderTasks();
