const API_BASE = "https://ns52kydv2b.execute-api.ap-southeast-2.amazonaws.com";

let tasks = [];
let editingId = null;

async function loadTodos() {
  try {
    const res = await fetch(`${API_BASE}/todos`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    tasks = await res.json();
    renderTasks();
    updateGreeting();
  } catch (error) {
    console.error("Failed to load todos:", error);
    tasks = [];
    renderTasks();
  }
}

window.onload = loadTodos;

function updateGreeting() {
  const hour = new Date().getHours();
  let greet = "Good Morning";
  if (hour >= 12 && hour < 18) greet = "Good Afternoon";
  else if (hour >= 18) greet = "Good Evening";

  const greetingEl = document.getElementById("greeting");
  if (greetingEl) {
    greetingEl.textContent = `${greet}, Beforebreakfast`;
  }
}

function renderTasks() {
  const onHold = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  document.getElementById("onHoldTasks").innerHTML = onHold.length
    ? onHold
        .map(
          (t) => `
            <div class="task-item">
                <div class="task-checkbox ${t.completed ? "completed" : ""}" onclick="toggleTask('${t.todoId}')"></div>
                <div class="task-content">
                    <div class="task-title ${t.completed ? "completed" : ""}">${t.title}</div>
                </div>
                <span class="status-badge status-${t.status}">
                    ${t.status === "progress" ? "In Progress" : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                </span>
                <div class="priority-badge priority-${t.priority}">
                    <i class="fas fa-circle"></i> ${t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                </div>
                <button class="icon-btn" style="width:30px;height:30px;" onclick="editTask('${t.todoId}')">
                    <i class="fas fa-pen" style="font-size:12px;"></i>
                </button>
                <button class="icon-btn" style="width:30px;height:30px;" onclick="deleteTask('${t.todoId}')">
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
                <div class="task-checkbox completed" onclick="toggleTask('${t.todoId}')"></div>
                <div class="task-content">
                    <div class="task-title completed">${t.title}</div>
                </div>
                <span class="status-badge status-completed">Completed</span>
                <div class="priority-badge priority-${t.priority}">
                    <i class="fas fa-circle"></i> ${t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                </div>
                <button class="icon-btn" style="width:30px;height:30px;" onclick="editTask('${t.todoId}')">
                    <i class="fas fa-pen" style="font-size:12px;"></i>
                </button>
                <button class="icon-btn" style="width:30px;height:30px;" onclick="deleteTask('${t.todoId}')">
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

async function toggleTask(todoId) {
  const t = tasks.find((task) => task.todoId === todoId);
  if (!t) return;

  const updatedStatus = !t.completed;

  try {
    await fetch(`${API_BASE}/todos/${todoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        completed: updatedStatus,
        status: updatedStatus ? "completed" : "pending",
      }),
    });

    loadTodos();
  } catch (error) {
    console.error("Failed to toggle task:", error);
  }
}

async function deleteTask(todoId) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  try {
    await fetch(`${API_BASE}/todos/${todoId}`, {
      method: "DELETE",
    });

    loadTodos();
  } catch (error) {
    console.error("Failed to delete task:", error);
  }
}

function editTask(todoId) {
  const task = tasks.find((t) => t.todoId === todoId);
  if (!task) return;

  editingId = todoId;

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

  const title = document.getElementById("taskTitle").value.trim();
  const status = document.getElementById("taskStatus").value;
  const priority = document.getElementById("taskPriority").value;

  try {
    if (editingId) {
      await fetch(`${API_BASE}/todos/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          status,
          priority,
          completed: status === "completed",
        }),
      });
    } else {
      await fetch(`${API_BASE}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          status,
          priority,
          completed: status === "completed",
        }),
      });
    }

    closeModal();
    loadTodos();
  } catch (error) {
    console.error("Failed to save task:", error);
  }
});