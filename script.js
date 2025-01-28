let containerArea = document.getElementById("container-area");
let addContainerButton = document.getElementById("add-container");
let undoDeleteButton = document.getElementById("undo-delete");

let containerHistory = []; // Store deleted containers for undo functionality
let containersData = JSON.parse(localStorage.getItem("containersData")) || []; // Persistent storage

// Function to render containers from saved data
function renderContainers() {
  containerArea.innerHTML = ""; // Clear existing containers
  containersData.forEach((container) => {
    createContainer(container.id, container.name, container.content, container.todos);
  });
}

// Save all container data to localStorage
function saveToLocalStorage() {
  localStorage.setItem("containersData", JSON.stringify(containersData));
}

// Function to create a container
function createContainer(id, name = "Untitled", content = "", todos = []) {
  let container = document.createElement("div");
  container.classList.add("container");
  container.dataset.id = id;

  // Header with editable title and delete button
  let header = document.createElement("div");
  header.classList.add("container-header");

  let titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.value = name;
  titleInput.addEventListener("input", (e) => {
    let containerId = container.dataset.id;
    let containerData = containersData.find((c) => c.id === containerId);
    containerData.name = e.target.value;
    saveToLocalStorage();
  });
  header.appendChild(titleInput);

  let deleteButton = document.createElement("button");
  deleteButton.innerText = "Delete";
  deleteButton.addEventListener("click", () => deleteContainer(container));
  header.appendChild(deleteButton);

  container.appendChild(header);

  // Content area for notes
  let contentArea = document.createElement("textarea");
  contentArea.setAttribute("placeholder", "Write something here...");
  contentArea.style.width = "100%";
  contentArea.style.height = "100px";
  contentArea.value = content;
  contentArea.addEventListener("input", (e) => {
    let containerId = container.dataset.id;
    let containerData = containersData.find((c) => c.id === containerId);
    containerData.content = e.target.value;
    saveToLocalStorage();
  });
  container.appendChild(contentArea);

  // To-Do list area
  let todoList = document.createElement("div");
  todoList.classList.add("todo-list");
  todos.forEach((todo) => addTodoItem(todoList, todo.text, todo.completed, id));

  let addTodoButton = document.createElement("button");
  addTodoButton.classList.add("add-todo");
  addTodoButton.innerText = "Add To-Do";
  addTodoButton.addEventListener("click", () => addTodoItem(todoList, "", false, id));
  container.appendChild(todoList);
  container.appendChild(addTodoButton);

  containerArea.appendChild(container);
}

// Function to add a To-Do item
function addTodoItem(todoList, text = "", completed = false, containerId) {
  let todoItem = document.createElement("div");
  let checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = completed;
  checkbox.addEventListener("change", (e) => {
    let containerData = containersData.find((c) => c.id === containerId);
    let todo = containerData.todos.find((t) => t.text === text);
    todo.completed = e.target.checked;
    saveToLocalStorage();
  });

  let todoText = document.createElement("input");
  todoText.type = "text";
  todoText.value = text;
  todoText.placeholder = "To-Do Item";
  todoText.addEventListener("input", (e) => {
    let containerData = containersData.find((c) => c.id === containerId);
    let todo = containerData.todos.find((t) => t.text === text);
    todo.text = e.target.value;
    saveToLocalStorage();
  });

  todoItem.appendChild(checkbox);
  todoItem.appendChild(todoText);
  todoList.appendChild(todoItem);

  // Add to persistent data
  let containerData = containersData.find((c) => c.id === containerId);
  containerData.todos.push({ text: "", completed: false });
  saveToLocalStorage();
}

// Function to delete a container
function deleteContainer(container) {
  let containerId = container.dataset.id;
  let containerIndex = containersData.findIndex((c) => c.id === containerId);
  containerHistory.push(containersData[containerIndex]); // Save to history
  containersData.splice(containerIndex, 1); // Remove from data
  saveToLocalStorage(); // Save updated data
  container.remove(); // Remove from UI
  undoDeleteButton.disabled = containerHistory.length === 0; // Enable/Disable Undo
}

// Undo delete
undoDeleteButton.addEventListener("click", () => {
  if (containerHistory.length > 0) {
    let restoredContainer = containerHistory.pop();
    containersData.push(restoredContainer);
    saveToLocalStorage();
    renderContainers();
    undoDeleteButton.disabled = containerHistory.length === 0;
  }
});

// Add container on button click
addContainerButton.addEventListener("click", () => {
  let newContainer = {
    id: Date.now().toString(),
    name: "Untitled",
    content: "",
    todos: [],
  };
  containersData.push(newContainer);
  saveToLocalStorage();
  createContainer(newContainer.id, newContainer.name, newContainer.content, newContainer.todos);
});

// Initial render from localStorage
renderContainers();
