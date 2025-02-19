const title = "title";
const text = "text";
const tasksList = document.getElementById("tasks-list");

if (authToken) {
    if (isAuthenticated()) {
        getTasks();
        getTasksSummary();
    }
}

async function isAuthenticated() {
    try {
        const response = await fetch("http://localhost:8080/user", {
            method: "GET",
            headers: {"Authorization": authToken}
        });

        if (!response.ok) {
            console.log('User is not authorised')
            return false;
        }

        if (response.ok) {
            console.log('User is authorised')
            return true;
        }

    } catch (err) {
        console.log('User is not authorised')
    }
}

async function getTasks() {
    try {
        const response = await fetch(`http://localhost:8080/tasks`, {
            method: "GET",
            headers: {
                "Authorization": authToken,  // Ensure this token is correct
                "Content-Type": "application/json" // Ensure the content type is JSON
            }
        });

        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
            });
        }

        const taskMessage = document.getElementById("edit-task-message");
        const tasks = await response.json();

        tasks.forEach(task => {
            // Create the <li> element
            const li = document.createElement("li");
            li.classList.add("task-card");

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

                const form = document.createElement('form')
                const titleInput = document.createElement("input")
                titleInput.classList.add("title-input");
                titleInput.type = "text";
                titleInput.placeholder = "Title"
                titleInput.value = task.title;
                titleInput.addEventListener("input", () => {
                    updateTask(
                        task.id,
                        document.querySelector(".title-input").value,
                        document.querySelector(".text-input").value);
                })
                form.append(titleInput);

                const textInput = document.createElement("input");
                textInput.classList.add("text-input");
                textInput.type = "text";
                textInput.placeholder = task.text;
                textInput.value = task.text;
                textInput.addEventListener('input', () => {
                    updateTask(
                        task.id,
                        document.querySelector(".title-input").value,
                        document.querySelector(".text-input").value
                    );
                    taskMessage.textContent = 'Task updated successfully';
                    taskMessage.style.color = "green";
                })
                form.append(textInput);

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete task"
                deleteButton.addEventListener("click", (e) => {
                    e.preventDefault();
                    deleteTask(task.id);
                    taskMessage.textContent = 'Task deleted successfully';
                    taskMessage.style.color = "green";
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
                        taskMessage.textContent = 'Task unchecked successfully';
                        taskMessage.style.color = "green";
                    } else {
                        completeTask(task.id);
                        taskMessage.textContent = 'Task checked successfully';
                        taskMessage.style.color = "green";
                    }
                })
                form.append(checkbox);

                bottomSection.appendChild(form);
            })

            rightDiv.appendChild(button);

            // Append all sections to <li>
            li.appendChild(leftDiv);
            li.appendChild(rightDiv);

            // Append <li> to <ul>
            tasksList.appendChild(li);
        })

    } catch (err) {
        console.log(err);
    }

    async function completeTask(taskId) {
        try {
            const response = await fetch(`http://localhost:8080/tasks/complete`, {
                method: "POST",
                headers: {
                    "Authorization": authToken,  // Ensure this token is correct
                    "Content-Type": "application/json" // Ensure the content type is JSON
                },
                body: JSON.stringify({taskId: taskId})
            })

            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.message);
                })
            }
        } catch (err) {
            console.log(err);
        }
    }

    async function uncompleteTask(taskId) {
        try {
            const response = await fetch(`http://localhost:8080/tasks/uncomplete`, {
                method: "POST",
                headers: {
                    "Authorization": authToken,  // Ensure this token is correct
                    "Content-Type": "application/json" // Ensure the content type is JSON
                },
                body: JSON.stringify({taskId: taskId})
            })

            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.message);
                })
            }
        } catch (err) {
            console.log(err);
        }
    }

    async function updateTask(taskId, title, text) {
        try {
            const response = await fetch(`http://localhost:8080/tasks/update`, {
                method: "POST",
                headers: {
                    "Authorization": authToken,  // Ensure this token is correct
                    "Content-Type": "application/json" // Ensure the content type is JSON
                },
                body: JSON.stringify({
                    taskId: taskId,
                    title: title,
                    text: text
                })
            })

            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.message);
                })
            }
        } catch (err) {
            console.log(err);
        }
    }

    async function deleteTask(taskId) {
        try {
            const response = await fetch(`http://localhost:8080/tasks/delete`, {
                method: "POST",
                headers: {
                    "Authorization": authToken,  // Ensure this token is correct
                    "Content-Type": "application/json" // Ensure the content type is JSON
                },
                body: JSON.stringify({taskId: taskId})
            })

            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.message);
                })
            }
        } catch (err) {
            console.log(err);
        }
    }

}

async function createTask(title, text) {
    try {
        const response = await fetch(`http://localhost:8080/tasks/create`, {
            method: "POST",
            headers: {
                "Authorization": authToken,  // Ensure this token is correct
                "Content-Type": "application/json" // Ensure the content type is JSON
            },
            body: JSON.stringify({
                title: title,
                text: text
            })
        })
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.message);
            })
        }

        if (response.ok) {
            document.getElementById('task-message').innerHTML = "Task created successfully";
            document.getElementById('task-message').style.color = 'green';
        }

    } catch (err) {
        console.log(err);
    }
}

document.getElementById('new-task-button').addEventListener('click', (e) => {
    e.preventDefault();
    const taskModal = document.getElementById("create-task-modal");
    showElement(taskModal);
})

const taskTitleInput = document.getElementById("create-task-title-input");
const taskTextInput = document.getElementById("create-task-description-input");
const submitBtn = document.getElementById("create-task-button");

submitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    createTask(taskTitleInput.value, taskTextInput.value);
})

async function getTasksSummary() {
    try {
        const response = await fetch(`http://localhost:8080/tasks/summary`, {
            method: "GET",
            headers: {
                "Authorization": authToken,  // Ensure this token is correct
                "Content-Type": "application/json" // Ensure the content type is JSON
            }
        });

        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.message);
            })
        }

        response.json().then(data => {
            const completedTasksNumber = document.getElementById('completed-tasks-number');
            const uncompletedTasksNumber = document.getElementById('uncompleted-tasks-number');

            completedTasksNumber.textContent = data.completedTaskNumber;
            uncompletedTasksNumber.textContent = data.uncompletedTaskNumber
        })


    } catch (err) {
        console.log(err);
    }
}