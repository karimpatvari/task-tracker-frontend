const authToken = localStorage.getItem("authToken");

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

// User data
let User;

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
    hideElement(authButtons);
    showElement(header);
    showElement(mainSection);
    showElement(summary);
};

const displayMessage = (selector, message, color = "red") => {
    const element = document.querySelector(selector);
    element.textContent = message;
    element.style.color = color;
    showElement(element);
};

const assignUserData = (data) => {
    User = data;
    document.querySelector('#user-name').innerHTML = `Hello, ${User.firstName} ${User.lastName}`;
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
        hideElement(registrationModal);
        hideElement(loginModal);
        hideElement(taskModal);
        const bottomSection = document.querySelector("#task-modal .bottom-section")
        while (bottomSection.firstChild) {
            bottomSection.removeChild(bottomSection.firstChild);
        }
        location.reload();
    });
});

// Fetch User Data
if (authToken) {
    fetch("http://localhost:8080/user", {
        method: "GET",
        headers: { "Authorization": authToken }
    })
        .then(response => {
            if (!response.ok) {
                localStorage.removeItem("authToken");
                return response.json().then(errorData => {
                    throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
                });
            }
            return response.json();
        })
        .then(data => {
            assignUserData(data);
            showAuthorizedContent();
        })
        .catch(error => {
            console.error(error);
            localStorage.removeItem("authToken");
            showAuthButtons();
        });
} else {
    showAuthButtons();
}

// Registration
submitRegistrationBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const email = document.getElementById("registrationEmail").value;
    const password = document.getElementById("registrationPassword").value;
    const repeatPassword = document.getElementById("registrationRepeatPassword").value;
    const firstName = document.getElementById("registrationFirstName").value;
    const lastName = document.getElementById("registrationLastName").value;

    if (repeatPassword !== password) {
        return displayMessage("#message-registration", "Passwords must match");
    }

    fetch("http://localhost:8080/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.message);
                });
            }
            return response;
        })
        .then(response => {
            for (let [key, value] of response.headers.entries()) {
                if (key === "authorization") {
                    localStorage.setItem("authToken", value);
                }
            }
            displayMessage("#message-registration", "Successfully created an account", "green");
            showAuthorizedContent();
        })
        .catch(error => {
            console.error(error);
            displayMessage("#message-registration", error.message);
        });
});

// Login
loginSubmitButton.addEventListener("click", (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.message);
                });
            }
            return response;
        })
        .then(response => {
            for (let [key, value] of response.headers.entries()) {
                if (key === "authorization") {
                    localStorage.setItem("authToken", value);
                }
            }
            displayMessage("#message-login", "Successfully logged in", "green");
            location.reload();
        })
        .catch(error => {
            console.error(error);
            displayMessage("#message-login", error.message);
        });
});

