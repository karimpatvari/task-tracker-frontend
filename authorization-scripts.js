function getAuthorizationToken() {
    return localStorage.getItem("authToken");
};

// UI Elements
const registrationButton = document.querySelector("#registrationBtn");
const loginButton = document.querySelector("#loginBtn");
const logoutButton = document.querySelector("#logoutBtn");
const authButtons = document.querySelector("#auth-buttons");

const registrationModal = document.getElementById("registration-modal");
const loginModal = document.getElementById("login-modal");
const taskModal = document.getElementById("task-modal");
const closeModalButtons = document.querySelectorAll(".close");

const submitRegistrationBtn = document.querySelector("#registrationSubmitBtn");
const loginSubmitButton = document.querySelector("#loginSubmitBtn");

const header = document.querySelector("#header");
const summary = document.querySelector("#summary");
const mainSection = document.querySelector("#main-section");

// Utility Functions
const showElement = (element) => element.style.display = "flex";

const hideElement = (element) => element.style.display = "none";

const showAuthButtons = () => {
    showElement(authButtons);
    hideElement(header);
    hideElement(mainSection);
    hideElement(summary);
};

const showAuthorizedContent = () => {
    fetchUser().then(user => {
        if (user) {
            assignUserData(user);
        }
    });
    hideElement(authButtons);
    showElement(header);
    showElement(mainSection);
    showElement(summary);
    getTasks();
    getTasksSummary();
};

const displayMessage = (selector, message, color = "red") => {
    const element = document.querySelector(selector);
    element.textContent = message;
    element.style.color = color;
    showElement(element);
};

const assignUserData = (data) => {
    // User = data;
    document.querySelector('#user-name').innerHTML = `Hello, ${data.firstName} ${data.lastName}`;
};

// Modal Handling
loginButton.addEventListener("click", () => showElement(loginModal));

registrationButton.addEventListener("click", () => showElement(registrationModal));

logoutButton.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    showAuthButtons();
});

closeModalButtons.forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".modal").forEach(modal => hideElement(modal));
        document.querySelector("#task-modal .bottom-section").innerHTML = "";
        cleanCreateTaskModal();
    });
});

function cleanCreateTaskModal(){
    const createTaskModalBottom = document.querySelector("#create-task-modal .bottom-section");
    createTaskModal.querySelector("#task-message").textContent = "";
    createTaskModal.querySelectorAll("input").forEach(input => {
        input.value = "";
    });
}

// Fetch User Data
if (getAuthorizationToken()) {
    fetchUser().then(user => {
        if (user) {
            assignUserData(user);
            showAuthorizedContent();
        } else {
            showAuthButtons();
        }
    });
} else {
    showAuthButtons();
}

// Registration
submitRegistrationBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    await handleRegistration();
});

// Login
loginSubmitButton.addEventListener("click", async (e) => {
    e.preventDefault();
    await handleLogin();
});

async function handleRegistration() {

    const email = document.getElementById("registrationEmail").value;
    const password = document.getElementById("registrationPassword").value;
    const repeatPassword = document.getElementById("registrationRepeatPassword").value;
    const firstName = document.getElementById("registrationFirstName").value;
    const lastName = document.getElementById("registrationLastName").value;

    if (repeatPassword !== password) {
        return displayMessage("#message-registration", "Passwords must match");
    }

    try {
        const response = await fetch("http://localhost:8080/user", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password, firstName, lastName})
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Registration failed");
        }

        const bearerToken = response.headers.get("authorization");
        if (bearerToken) {
            localStorage.setItem("authToken", bearerToken);
        }

        displayMessage("#message-registration", "Successfully created an account", "green");
        //TODO CREATE ALERT THAT REGISTRATION SUCCESSFUL
        location.reload();

    } catch (error) {
        console.error(error);
        displayMessage("#message-registration", error.message);
    }

}

async function handleLogin() {

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    try {
        const response = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password})
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Login failed");
        }

        const bearerToken = response.headers.get("authorization");
        if (bearerToken) {
            localStorage.setItem("authToken", bearerToken);
        }

        displayMessage("#message-login", "Successfully logged in", "green");
        //TODO CREATE ALERT THAT LOGIN SUCCESSFUL
        location.reload();

    } catch (error) {
        console.error(error);
        displayMessage("#message-login", error.message);
    }
}

async function fetchUser() {
    try {
        const response = await fetch("http://localhost:8080/user", {
            method: "GET",
            headers: {"Authorization": getAuthorizationToken()}
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(` ${response.status}: ${data.message || response.statusText}`);
        }

        return data;

    } catch (error) {
        console.error(error);
        localStorage.removeItem("authToken");
        return null;
    }
}
