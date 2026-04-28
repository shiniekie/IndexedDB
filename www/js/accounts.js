// =========================
// IMAGE CONVERTER
// =========================
function getBase64(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => callback(reader.result);

    reader.onerror = () => {
        alert("Error reading image");
    };
}


// =========================
// SAVE ACCOUNT (CREATE + UPDATE)
// =========================
function saveAccount() {
    const site = document.getElementById("site").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const file = document.getElementById("imageInput").files[0];

    const user = JSON.parse(localStorage.getItem("currentUser"));
    const editId = localStorage.getItem("editId");

    //  VALIDATION
    if (!site || !username || !password) {
        alert("Please fill in all fields!");
        return;
    }

    //  Prevent crash if user not found
    if (!user) {
        alert("User not logged in");
        window.location = "index.html";
        return;
    }

    if (file) {
        getBase64(file, function (imageBase64) {

            if (editId) {
                updateAccount(editId, site, username, password, imageBase64, user.id);
                localStorage.removeItem("editId");
            } else {
                insertAccount(site, username, password, imageBase64, user.id);
            }

        });

    } else {

        if (editId) {
            //  Keep existing image if no new file
            const tx = db.transaction("accounts", "readonly");
            const store = tx.objectStore("accounts");

            const req = store.get(Number(editId));

            req.onsuccess = function () {
                const oldData = req.result;

                updateAccount(
                    editId,
                    site,
                    username,
                    password,
                    oldData ? oldData.image : null,
                    user.id
                );

                localStorage.removeItem("editId");
            };

            req.onerror = function () {
                alert("Error loading existing data");
            };

        } else {
            insertAccount(site, username, password, null, user.id);
        }

    }
}
// =========================
// CREATE
// =========================
function insertAccount(site, username, password, image, userId) {
    const tx = db.transaction("accounts", "readwrite");
    const store = tx.objectStore("accounts");

    store.add({
        site,
        username,
        password,
        image,
        userId
    });

    tx.oncomplete = function () {
        alert("Account saved!");
        window.location = "home.html";
    };

    tx.onerror = function () {
        alert("Database error while saving");
    };
}


// =========================
// READ
// =========================
function loadAccounts() {
    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (!user) {
        window.location = "index.html";
        return;
    }

    const tx = db.transaction("accounts", "readonly");
    const store = tx.objectStore("accounts");

    const request = store.getAll();

    
    request.onsuccess = function () {
        const list = document.getElementById("accountList");
        list.innerHTML = "";

        request.result
            .filter(acc => acc.userId === user.id)
            .forEach(acc => {
                const li = document.createElement("li");

                li.innerHTML = `
                    <div class="card">
                        <div style="display:flex; align-items:center; gap:10px;">
                            ${acc.image ? `<img src="${acc.image}" width="50" style="border-radius:10px;">` : ""}
                            <div>
                                <strong>${acc.site}</strong><br>
                                <small>${acc.username}</small><br>
                                <small>${'*'.repeat(acc.password.length)}</small>
                            </div>
                        </div>

                        <div style="margin-top:10px; display:flex; gap:10px;">
                            <button onclick="editAccount(${acc.id})">Edit</button>
                            <button onclick="deleteAccount(${acc.id})" style="background:#e74c3c;">Delete</button>
                        </div>
                    </div>
                `;

                list.appendChild(li);
            });
    };

    
    request.onerror = function () {
        alert("Error loading accounts");
    };
}

// =========================
// DELETE
// =========================
function deleteAccount(id) {
    const tx = db.transaction("accounts", "readwrite");
    const store = tx.objectStore("accounts");

    store.delete(id);

    tx.oncomplete = function () {
        alert("Deleted!");
        loadAccounts();
    };

    tx.onerror = function () {
        alert("Error deleting account");
    };
}


// =========================
// EDIT NAVIGATION
// =========================
function editAccount(id) {
    localStorage.setItem("editId", id);
    window.location = "add-account.html";
}


// =========================
// LOAD DATA FOR EDIT
// =========================
function loadEditData() {
    const id = localStorage.getItem("editId");

    if (!id) return;

    const tx = db.transaction("accounts", "readonly");
    const store = tx.objectStore("accounts");

    const request = store.get(Number(id));

    request.onsuccess = function () {
        const acc = request.result;

        if (!acc) return;

        document.getElementById("site").value = acc.site;
        document.getElementById("username").value = acc.username;
        document.getElementById("password").value = acc.password;
    };

    request.onerror = function () {
        alert("Error loading account");
    };
}


// =========================
// UPDATE
// =========================
function updateAccount(id, site, username, password, image, userId) {
    const tx = db.transaction("accounts", "readwrite");
    const store = tx.objectStore("accounts");

    store.put({
        id: Number(id),
        site,
        username,
        password,
        image,
        userId
    });

    tx.oncomplete = function () {
        alert("Updated!");
        window.location = "home.html";
    };

    tx.onerror = function () {
        alert("Error updating account");
    };
}