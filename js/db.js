let db;

function initDB() {
    const request = indexedDB.open("SecureVaultDB", 1);

    request.onupgradeneeded = function (e) {
        db = e.target.result;

        //  Avoid duplicate creation (important for upgrades)
        if (!db.objectStoreNames.contains("users")) {
            db.createObjectStore("users", {
                keyPath: "id",
                autoIncrement: true
            });
        }

        if (!db.objectStoreNames.contains("accounts")) {
            const accountStore = db.createObjectStore("accounts", {
                keyPath: "id",
                autoIncrement: true
            });

            accountStore.createIndex("userId", "userId", { unique: false });
        }
    };

    request.onsuccess = function (e) {
        db = e.target.result;
        console.log("DB ready");
        migrateUsersAddFullname();

       
        db.onversionchange = function () {
            db.close();
            alert("Database updated. Please reload the app.");
        };
    };

    request.onerror = function (e) {
        console.error("DB failed", e.target.error);
        alert("Database failed to initialize");
    };

    
    request.onblocked = function () {
        alert("Please close other tabs using this app!");
    };
}

function migrateUsersAddFullname() {
    const tx = db.transaction("users", "readwrite");
    const store = tx.objectStore("users");

    const request = store.getAll();

    request.onsuccess = function () {
        request.result.forEach(user => {
           if (!user.fullname) { 
                
                user.fullname = user.username || "";
                store.put(user);
            }
        });
    };

    request.onerror = function () {
        console.error("Migration failed");
    };
}