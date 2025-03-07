const tasksList = document.getElementById("tasks-list");
const taskTitleInput = document.getElementById("create-task-title-input");
const taskTextInput = document.getElementById("create-task-description-input");
const submitTaskCreationBtn = document.getElementById("create-task-button");
const createTaskModal = document.getElementById("create-task-modal");
const newTaskButton = document.getElementById('new-task-button');
const completedTasksNumber = document.getElementById('completed-tasks-number');
const uncompletedTasksNumber = document.getElementById('uncompleted-tasks-number');

newTaskButton.addEventListener('click', () => showElement(createTaskModal))

submitTaskCreationBtn.addEventListener("click", (e) => {
    e.preventDefault();
    createTask(taskTitleInput.value, taskTextInput.value);
});

async function getTasks() {
    try {
        const response = await fetch(`http://3.90.86.198:8080/tasks`, {
            method: "GET",
            headers: {
                "Authorization": getAuthorizationToken(),  // Ensure this token is correct
                "Content-Type": "application/json" // Ensure the content type is JSON
            }
        });

        if (!response.ok) {
            console.log(response);
            const errorData = await response.json();
            throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
        }

        const taskMessage = document.getElementById("#edit-task-message");
        const tasks = await response.json();

        tasks.forEach(task => {
            createTaskCard(task);
        })

    } catch (err) {
        console.log(err);
    }
}

async function completeTask(taskId) {
    try {
        const response = await fetch(`http://3.90.86.198:8080/tasks/complete`, {
            method: "POST",
            headers: {
                "Authorization": getAuthorizationToken(),  // Ensure this token is correct
                "Content-Type": "application/json" // Ensure the content type is JSON
            },
            body: JSON.stringify({taskId: taskId})
        })

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }
    } catch (err) {
        console.log(err);
    }
}

async function uncompleteTask(taskId) {
    try {
        const response = await fetch(`http://3.90.86.198:8080/tasks/uncomplete`, {
            method: "POST",
            headers: {
                "Authorization": getAuthorizationToken(),  // Ensure this token is correct
                "Content-Type": "application/json" // Ensure the content type is JSON
            },
            body: JSON.stringify({taskId: taskId})
        })

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }
    } catch (err) {
        console.log(err);
    }
}

async function updateTask(taskId, title, text) {
    try {
        const response = await fetch(`http://3.90.86.198:8080/tasks/update`, {
            method: "POST",
            headers: {
                "Authorization": getAuthorizationToken(),  // Ensure this token is correct
                "Content-Type": "application/json" // Ensure the content type is JSON
            },
            body: JSON.stringify({
                taskId: taskId,
                title: title,
                text: text
            })
        })

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }
    } catch (err) {
        console.log(err);
    }
}

async function deleteTask(taskId) {
    try {
        const response = await fetch(`http://3.90.86.198:8080/tasks/delete`, {
            method: "POST",
            headers: {
                "Authorization": getAuthorizationToken(),  // Ensure this token is correct
                "Content-Type": "application/json" // Ensure the content type is JSON
            },
            body: JSON.stringify({taskId: taskId})
        })

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }
    } catch (err) {
        console.log(err);
    }
}

async function createTask(title, text) {
    try {
        const response = await fetch(`http://3.90.86.198:8080/tasks/create`, {
            method: "POST",
            headers: {
                "Authorization": getAuthorizationToken(),  // Ensure this token is correct
                "Content-Type": "application/json" // Ensure the content type is JSON
            },
            body: JSON.stringify({
                title: title,
                text: text
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        if (response.ok) {
            displayMessage('#task-message', "Task created successfully", 'green');
            //TODO TASK SUCCESSFULLY CREATED ALERT
            const task = await response.json();
            createTaskCard(task);
        }

    } catch (err) {
        console.log(err);
    }
}

async function getTasksSummary() {
    try {
        const response = await fetch(`http://3.90.86.198:8080/tasks/summary`, {
            method: "GET",
            headers: {
                "Authorization": getAuthorizationToken(),  // Ensure this token is correct
                "Content-Type": "application/json" // Ensure the content type is JSON
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to get task summary");
        }

        completedTasksNumber.textContent = data.completedTaskNumber;
        uncompletedTasksNumber.textContent = data.uncompletedTaskNumber

    } catch (error) {
        console.log(error);
    }
}

function createTaskCard(task) {
    // Create the <li> element
    const li = document.createElement("li");
    li.classList.add("task-card");
    li.id = `task-${task.id}`;

    if (task.isCompleted) {
        li.style.background = "linear-gradient(to right, #90EE90, white)";
    } else {
        li.style.background = "linear-gradient(to right, #9988f3, white)";
    }

    // Create the left-bottom-section div
    const leftDiv = document.createElement("div");
    leftDiv.classList.add("left-bottom-section");

    const title = document.createElement("h4");
    title.textContent = task.title;

    const description = document.createElement("p");
    description.textContent = task.text;

    leftDiv.appendChild(title);
    leftDiv.appendChild(description);

    // Create the right-bottom-section div
    const rightDiv = document.createElement('div');
    rightDiv.classList.add('right-bottom-section');

    const button = document.createElement('button');
    button.classList.add('arrow-button');

    // Add a div inside the button to represent the arrow (use CSS for the arrow style)
    const arrowDiv = document.createElement('div');
    button.appendChild(arrowDiv);

    button.addEventListener('click', () => {
        showElement(document.getElementById("task-modal"))
        document.querySelector("#task-modal .modal-title").textContent = 'Edit task: ' + task.title;
        const bottomSection = document.querySelector("#task-modal .bottom-section");
        const taskMessage = document.createElement("p");
        taskMessage.id = 'edit-task-message';

        const form = document.createElement('form')
        const titleInput = document.createElement("input")
        titleInput.classList.add("title-input");
        titleInput.type = "text";
        titleInput.placeholder = "New title"

        const taskElement = document.getElementById(`task-${task.id}`);
        const taskTitle = taskElement.querySelector('h4');

        titleInput.addEventListener("input", () => {
            updateTask(
                task.id,
                document.querySelector(".title-input").value,
                taskElement.querySelector('p').textContent
            );
            taskTitle.textContent = document.querySelector(".title-input").value
            displayMessage("#edit-task-message", 'Task updated successfully', 'green');
        })
        form.append(titleInput);

        const textInput = document.createElement("input");
        textInput.classList.add("text-input");
        textInput.type = "text";
        textInput.placeholder = "New description"

        const taskText = taskElement.querySelector('p');

        textInput.addEventListener('input', () => {
            updateTask(
                task.id,
                taskElement.querySelector('h4').textContent,
                document.querySelector(".text-input").value,
            );
            taskText.textContent = document.querySelector(".text-input").value
            displayMessage("#edit-task-message", 'Task updated successfully', 'green');

        })
        form.append(textInput);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete task"
        deleteButton.addEventListener("click", (e) => {
            e.preventDefault();
            deleteTask(task.id);
            displayMessage("#edit-task-message", 'Task deleted successfully', 'green');

            const taskElement = document.getElementById(`task-${task.id}`);
            if (taskElement) {
                taskElement.remove(); // Remove it from the DOM
            }
        })

        form.append(deleteButton);

        const checkbox = document.createElement("input");
        if (task.isCompleted) {
            checkbox.checked = true;
        }
        checkbox.type = "checkbox";
        checkbox.addEventListener("input", () => {
            if (checkbox.checked === false) {
                uncompleteTask(task.id);

                taskElement.style.background = 'linear-gradient(to right, #9988f3, white)';
                displayMessage("#edit-task-message", 'Task unchecked successfully', 'green');
            } else {
                completeTask(task.id);

                taskElement.style.background = 'linear-gradient(to right, #90EE90, white)';
                displayMessage("#edit-task-message", 'Task checked successfully', 'green');
            }
        })
        form.append(checkbox);

        bottomSection.appendChild(taskMessage);
        bottomSection.appendChild(form);
    })

    rightDiv.appendChild(button);

    // Append all sections to <li>
    li.appendChild(leftDiv);
    li.appendChild(rightDiv);

    // Append <li> to <ul>
    tasksList.appendChild(li);
}