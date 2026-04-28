document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);

    // Safe DOM check
    const deviceReadyEl = document.getElementById('deviceready');
    if (deviceReadyEl) {
        deviceReadyEl.classList.add('ready');
    }

   
    if (typeof initDB === "function") {
        initDB();
    }

    
    setTimeout(() => {

        if (typeof loadAccounts === "function") {
            loadAccounts();
        }

        if (typeof loadEditData === "function") {
            loadEditData();
        }

        if (typeof loadProfile === "function") {
            loadProfile();
        }

    }, 500); // small delay to ensure DB is ready
}