// =========================
// LOAD PROFILE
// =========================
function loadProfile() {
    const sessionUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!sessionUser) {
        window.location = "index.html";
        return;
    }

    const tx = db.transaction("users", "readonly");
    const store = tx.objectStore("users");

    const request = store.get(sessionUser.id);

    request.onsuccess = function () {
        const user = request.result;
        if (!user) return;

        // ✅ SHOW FULLNAME HERE (THIS WAS MISSING)
        document.getElementById("viewFullname").textContent = user.fullname || user.username;

        // EXISTING
        document.getElementById("viewUsername").textContent = user.username;

        const img = document.getElementById("profileImage");
        img.src = user.image ? user.image : "";

        // EDIT MODE preload
        document.getElementById("profileFullname").value = user.fullname || "";
        document.getElementById("profileUsername").value = user.username;
        document.getElementById("profilePassword").value = user.password;

        localStorage.setItem("currentUser", JSON.stringify(user));
    };
}
function enableEdit() {
    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (!user) return;

   
    document.getElementById("profileFullname").value = user.fullname || "";
    document.getElementById("profileUsername").value = user.username;
    document.getElementById("profilePassword").value = user.password;

    // SWITCH MODE
    document.getElementById("profileView").style.display = "none";
    document.getElementById("profileEdit").style.display = "block";
}

function cancelEdit() {
    document.getElementById("profileEdit").style.display = "none";
    document.getElementById("profileView").style.display = "block";
}
// =========================
// UPDATE PROFILE
// =========================
function updateProfile() {
    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (!user) {
        alert("User not found");
        return;
    }

    const username = document.getElementById("profileUsername").value;
    const password = document.getElementById("profilePassword").value;
    const file = document.getElementById("profileImageInput").files[0];

    //  Basic validation
    if (!username || !password) {
        alert("Please fill all fields");
        return;
    }

    if (file) {
        getBase64(file, function (imageBase64) {
            saveProfile(user.id, username, password, imageBase64);
        });
    } else {
        saveProfile(user.id, username, password, user.image);
    }
}


// =========================
// SAVE PROFILE
// =========================

function saveProfile(id, username, password, image) {
    const tx = db.transaction("users", "readwrite");
    const store = tx.objectStore("users");

    // GET EXISTING USER FIRST
    const request = store.get(id);

    request.onsuccess = function () {
        const existingUser = request.result;

        const updatedUser = {
            id: id,
            username: username,
            password: password,
            // KEEP OLD IMAGE IF NO NEW ONE
            image: image || existingUser.image || null
        };

        store.put(updatedUser);

        tx.oncomplete = function () {
            // UPDATE SESSION
            localStorage.setItem("currentUser", JSON.stringify(updatedUser));

            alert("Profile updated!");

           
            cancelEdit();   // go back to view mode
            loadProfile();  // refresh UI
        };

        tx.onerror = function () {
            alert("Error updating profile");
        };
    };
}
function getBase64(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result);
    reader.onerror = error => console.error(error);
}