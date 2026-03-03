let tasks = [];
let editingId = null;

async function loadTodos() {
  const res = await fetch("http://localhost:3000/todos");
  tasks = await res.json();
  renderTasks();
}

window.onload = loadTodos;

function updateGreeting() {
  const hour = new Date().getHours();
  let greet = "Good Morning";
  if (hour >= 12 && hour < 18) greet = "Good Afternoon";
  else if (hour >= 18) greet = "Good Evening";
  document.getElementById("greeting").textContent = `${greet}, Beforebreakfast`;
}

function renderTasks() {
  const onHold = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  document.getElementById("onHoldTasks").innerHTML = onHold.length
    ? onHold
      .map(
        (t) => `
            <div class="task-item">
                <div class="task-checkbox ${t.completed ? "completed" : ""}" onclick="toggleTask(${t.id})"></div>
                <div class="task-content">
                    <div class="task-title ${t.completed ? "completed" : ""}">${t.title}</div>
                </div>
                <span class="status-badge status-${t.status}">
                    ${t.status === "progress" ? "In Progress" : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                </span>
                <div class="priority-badge priority-${t.priority}">
                    <i class="fas fa-circle"></i> ${t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                </div>
                <button class="icon-btn" style="width:30px;height:30px;" onclick="editTask(${t.id})">
                    <i class="fas fa-pen" style="font-size:12px;"></i>
                </button>
                <button class="icon-btn" style="width:30px;height:30px;" onclick="deleteTask(${t.id})">
                    <i class="fas fa-trash" style="font-size:12px;"></i>
                </button>
            </div>
        `
      )
      .join("")
    : '<p style="color:#9ca3af;padding:20px;">No tasks on hold</p>';

  document.getElementById("completedTasks").innerHTML = completed.length
    ? completed
      .map(
        (t) => `
            <div class="task-item">
                <div class="task-checkbox completed" onclick="toggleTask(${t.id})"></div>
                <div class="task-content">
                    <div class="task-title completed">${t.title}</div>
                </div>
                <span class="status-badge status-completed">Completed</span>
                <div class="priority-badge priority-${t.priority}">
                    <i class="fas fa-circle"></i> ${t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                </div>
                <button class="icon-btn" style="width:30px;height:30px;" onclick="editTask(${t.id})">
                    <i class="fas fa-pen" style="font-size:12px;"></i>
                </button>
                <button class="icon-btn" style="width:30px;height:30px;" onclick="deleteTask(${t.id})">
                    <i class="fas fa-trash" style="font-size:12px;"></i>
                </button>
            </div>
        `
      )
      .join("")
    : '<p style="color:#9ca3af;padding:20px;">No completed tasks</p>';

  const total = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pending = total - completedCount;
  const rate = total ? Math.round((completedCount / total) * 100) : 0;

  document.getElementById("taskCount").textContent = pending;
  document.getElementById("totalTasks").textContent = total;
  document.getElementById("completedCount").textContent = completedCount;
  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("completionRateValue").textContent = rate + "%";
  document.getElementById("totalProgress").style.width = rate + "%";
  document.getElementById("completionProgress").style.width = rate + "%";

}

async function toggleTask(id) {
  const t = tasks.find((t) => t.id === id);

  if (!t) return;

  const updatedStatus = !t.completed;

  await fetch(`http://localhost:3000/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      completed: updatedStatus,
      status: updatedStatus ? "completed" : "pending"
    })
  });

  loadTodos();
}

async function deleteTask(id) {
  if (confirm("Are you sure you want to delete this task?")) {
    await fetch(`http://localhost:3000/todos/${id}`, {
      method: "DELETE"
    });

    loadTodos();
  }
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editingId = id;

  document.getElementById("taskTitle").value = task.title;
  document.getElementById("taskStatus").value = task.status;
  document.getElementById("taskPriority").value = task.priority;

  openModal();
}

function openModal() {
  document.getElementById("taskModal").classList.add("modal-active");
}

function closeModal() {
  document.getElementById("taskModal").classList.remove("modal-active");
  document.getElementById("taskForm").reset();
  editingId = null;
}

document.getElementById("taskForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("taskTitle").value;
  const status = document.getElementById("taskStatus").value;
  const priority = document.getElementById("taskPriority").value;

  if (editingId) {
    // UPDATE
    await fetch(`http://localhost:3000/todos/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        status,
        priority,
        completed: status === "completed"
      })
    });
  } else {
    // CREATE
    await fetch("http://localhost:3000/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        status,
        priority,
        completed: status === "completed"
      })
    });
  }

  closeModal();
  loadTodos();
});

