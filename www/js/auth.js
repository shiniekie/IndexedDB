// =========================
// LOGIN
// =========================
function login() {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    //  Basic validation
    if (!username || !password) {
        alert("Please fill all fields");
        return;
    }

    const tx = db.transaction("users", "readonly");
    const store = tx.objectStore("users");

    const request = store.getAll();

    request.onsuccess = function () {
        const user = request.result.find(u =>
            u.username === username && u.password === password
        );

        if (user) {
            localStorage.setItem("currentUser", JSON.stringify(user));
            window.location = "home.html";
        } else {
            alert("Invalid login");
        }
    };

    request.onerror = function () {
        alert("Error during login");
    };
}


// =========================
// REGISTER
// =========================
function register() {
    const fullname = document.getElementById("regFullname").value.trim();
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const confirmPassword = document.getElementById("regConfirmPassword").value.trim();

    // ✅ VALIDATION
    if (!fullname || !username || !password || !confirmPassword) {
        alert("Please fill all fields");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    const tx = db.transaction("users", "readwrite");
    const store = tx.objectStore("users");

    const checkRequest = store.getAll();

    checkRequest.onsuccess = function () {
        const exists = checkRequest.result.find(u => u.username === username);

        if (exists) {
            alert("Username already exists!");
            return;
        }

        store.add({
            fullname: fullname,
            username: username,
            password: password
        });

        tx.oncomplete = function () {
            alert("Registered!");
            window.location = "index.html";
        };

        tx.onerror = function () {
            alert("Error during registration");
        };
    };

    checkRequest.onerror = function () {
        alert("Error checking existing users");
    };
}

// =========================
// LOGOUT
// =========================
function logout() {
    localStorage.removeItem("currentUser");

  
    alert("Logged out");

    window.location = "index.html";
}