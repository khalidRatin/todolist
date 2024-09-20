const taskInput = document.querySelector(".task-input input"), //Selects the input element 
    filters = document.querySelectorAll(".filters span"),      //Selects status bar
    clearAll = document.querySelector(".clear-btn"),           //Selects clear button
    taskBox = document.querySelector(".task-box"),             //Selects the checkbox
    addBtn = document.getElementById("add-btn");               //Selects the add button

let editId,
    isEditTask = false,
    todos = JSON.parse(localStorage.getItem("todo-list")) || []; //Track edit status and tasks

filters.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector("span.active").classList.remove("active");
        btn.classList.add("active");
        showTodo(btn.id);
    });
});

function showTodo(filter) {
    let liTag = "";
    if (todos) {
        todos.forEach((todo, id) => {
            let completed = todo.status == "completed" ? "checked" : "";
            if (filter == todo.status || filter == "all") {
                liTag += `<li class="task" draggable="true" data-id="${id}">
                            <label for="${id}">
                                <input onclick="updateStatus(this)" type="checkbox" id="${id}" ${completed}>
                                <p class="${completed}">${todo.name}</p>
                            </label>
                            <div class="settings">
                                <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>    
                                <ul class="task-menu">
                                    <li onclick='editTask(${id}, "${todo.name}")'><i class="uil uil-pen"></i>Edit</li>
                                    <li onclick='deleteTask(${id}, "${filter}")'><i class="uil uil-trash"></i>Delete</li>
                                </ul>
                            </div>
                        </li>`;
            }                                                       //uil uil ellipsis-h means 3 dot button.
        });
    }
    taskBox.innerHTML = liTag || `<span>You don't have any task here</span>`;
    let checkTask = taskBox.querySelectorAll(".task");
    !checkTask.length ? clearAll.classList.remove("active") : clearAll.classList.add("active");
    taskBox.offsetHeight >= 300 ? taskBox.classList.add("overflow") : taskBox.classList.remove("overflow");
    document.querySelectorAll('.task').forEach(addDnDHandlers); // Add drag and drop handlers
}
showTodo("all");

function showMenu(selectedTask) {
    let menuDiv = selectedTask.parentElement.lastElementChild;
    menuDiv.classList.add("show");
    document.addEventListener("click", e => {
        if (e.target.tagName != "I" || e.target != selectedTask) {
            menuDiv.classList.remove("show");
        }
    });
}

function updateStatus(selectedTask) {
    let taskName = selectedTask.parentElement.lastElementChild;
    if (selectedTask.checked) {
        taskName.classList.add("checked");
        todos[selectedTask.id].status = "completed";
    } else {
        taskName.classList.remove("checked");          //Updates completed or not in the basis of checkbox
        todos[selectedTask.id].status = "pending";
    }
    localStorage.setItem("todo-list", JSON.stringify(todos));
}

function editTask(taskId, textName) {
    editId = taskId;
    isEditTask = true;
    taskInput.value = textName;                //Press to edit task
    taskInput.focus();
    taskInput.classList.add("active");
}

function deleteTask(deleteId, filter) {
    isEditTask = false;
    todos.splice(deleteId, 1);                //Press to delete task
    localStorage.setItem("todo-list", JSON.stringify(todos));
    showTodo(filter);
}

clearAll.addEventListener("click", () => {
    isEditTask = false;
    todos.splice(0, todos.length);            //Press to clear all
    localStorage.setItem("todo-list", JSON.stringify(todos));
    showTodo();
});

taskInput.addEventListener("keyup", e => {
    let userTask = taskInput.value.trim();
    if (e.key == "Enter" && userTask) {       //Press enter to add task
        addTask(userTask);
    }
});

addBtn.addEventListener("click", () => {
    let userTask = taskInput.value.trim();
    if (userTask) {                           //Add button to add task
        addTask(userTask);
    }
});

function addTask(userTask) {                  //Add a new task/updates
    if (!isEditTask) {
        todos = !todos ? [] : todos;
        let taskInfo = { name: userTask, status: "pending" };
        todos.push(taskInfo);
    } else {
        isEditTask = false;             
        todos[editId].name = userTask;
    }
    taskInput.value = "";
    localStorage.setItem("todo-list", JSON.stringify(todos));
    showTodo(document.querySelector("span.active").id);
}

let dragSrcEl = null;                       //Tracks source element

function handleDragStart(e) {               //Handles start of dragging
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
    this.classList.add('dragging');
}

function handleDragOver(e) {                //Allows the dragged element to be dropped
    if (e.preventDefault) {
        e.preventDefault();                 // Necessary. Allows us to drop.
    }
    e.dataTransfer.dropEffect = 'move';     // See the section on the DataTransfer object.
    return false;
}

function handleDrop(e) {                    //Handles the drop event and updates the task order
    if (e.stopPropagation) {
        e.stopPropagation();                // Stops some browsers from redirecting.
    }

    if (dragSrcEl != this) {
        dragSrcEl.classList.remove('dragging');
        let srcId = parseInt(dragSrcEl.getAttribute('data-id'));
        let targetId = parseInt(this.getAttribute('data-id'));

        let draggedTodo = todos[srcId];
        todos.splice(srcId, 1);
        todos.splice(targetId, 0, draggedTodo);

        localStorage.setItem("todo-list", JSON.stringify(todos));
        showTodo(document.querySelector("span.active").id);
    }
    return false;
}

function addDnDHandlers(task) {
    task.addEventListener('dragstart', handleDragStart, false);
    task.addEventListener('dragover', handleDragOver, false);
    task.addEventListener('drop', handleDrop, false);
    task.addEventListener('dragend', () => task.classList.remove('dragging'), false);
}

document.querySelectorAll('.task').forEach(addDnDHandlers);
