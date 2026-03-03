const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

let todos = [];

app.get("/todos", (req, res) => {
  res.json(todos);
});

app.post("/todos", (req, res) => {
  const newTodo = {
    id: Date.now(),
    title: req.body.title,
    status: req.body.status || "pending",
    priority: req.body.priority || "medium",
    completed: req.body.completed || false
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

app.delete("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  todos = todos.filter(t => t.id !== id);
  res.json({ message: "Deleted" });
});

app.put("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);

  if (todo) {
    todo.title = req.body.title ?? todo.title;
    todo.status = req.body.status ?? todo.status;
    todo.priority = req.body.priority ?? todo.priority;
    todo.completed = req.body.completed ?? todo.completed;

    res.json(todo);
  } else {
    res.status(404).json({ message: "Not found" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});