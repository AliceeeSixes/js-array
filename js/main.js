// The file that contains functions relating to the page as a whole

// Logic for UI tabs
function focusTab(tab) {

    $("#emailMessage").text(""); // Remove error messages related to email addresses
    $("#addImageMessage").text(""); // Remove error messages related to adding images to collections
    
    if (tab === "images") {
        $(".image-viewer").show(); // Show new tab
        $(".collection-viewer").hide(); // Hide old tab
        $("#image-tab").addClass("current"); // Update tab buttons at top
        $("#collection-tab").removeClass("current");// Update tab buttons at top

        // Carry over selected email to new tab
        let email = $("#viewed-collection").val();
        $("#selected-email").val(email);

    } else {
        $(".image-viewer").hide(); // Hide old tab
        $(".collection-viewer").show(); // Show new tab
        $("#image-tab").removeClass("current"); // Update tab buttons at top
        $("#collection-tab").addClass("current"); // Update tab buttons at top

        clearNotifs(); // Clear notifications when viewing collections tab


        // Carry over selected email to new tab
        let email = $("#selected-email").val();
        $("#viewed-collection").val(email);


        // Generate images on tab swap
        let selected = $("#viewed-collection").val();
        if (selected != "none") {
            generateFromCollection(selected);
        }

    }
}




// Generate dropdown menu options
function generateDropdowns() {

    // Create options html from collections
    let options = ``;
    for (const email in collections) {
        options += `<option value="${email}">${email}</option>`;
    }

    // Add default option if no collections exist
    if (!options) {
        options = `<option value="none">No collections created</option>`
    }

    // Put html into select elements
    $("select").html(options);
}



// Settings menu display/hide
function settingsToggle(arg) {
    if(arg) {
        loadSettings();
        $(".settings-menu-outer").css("display","flex");
    } else {
        updateSettings();
        $(".settings-menu-outer").css("display","none");
        
    }
}


// Load current settings into settings menu
function loadSettings() {
    // Eager loading
    if (eagerLoading) {
        let settingEagerLoad = $("#loading-style").prop("checked", true);
    } else {
        let settingEagerLoad = $("#loading-style").prop("checked", false);
    }
    // Dark mode
    if (darkMode) {
        let settingEagerLoad = $("#dark-mode").prop("checked", true);
    } else {
        let settingEagerLoad = $("#dark-mode").prop("checked", false);
    }

    // Notifications
    if (notifs) {
        let settingEagerLoad = $("#notifs-setting").prop("checked", true);
    } else {
        let settingEagerLoad = $("#notifs-setting").prop("checked", false);
    }
    
}

// Update user settings
function updateSettings() {
    // Eager loading
    let settingEagerLoad = $("#loading-style").is(":checked");
    eagerLoading = settingEagerLoad;

    // Dark mode
    let settingDarkMode = $("#dark-mode").is(":checked");
    darkMode = settingDarkMode;
    if (darkMode) {
        $("body").addClass("dark");
    } else {
        $("body").removeClass("dark");
    }

    // Notifications
    let settingsNotifs = $("#notifs-setting").is(":checked");
    notifs = settingsNotifs;
    if (notifs && unreadNotifs > 0) {
        $(".notifs").show();
    } else {
        $(".notifs").hide();
    }

    // Reassign settings object
    settings = {};
    settings.eagerLoad = eagerLoading;
    settings.darkMode = darkMode;
    settings.notifs = notifs;
    console.log("settings saved as" + JSON.stringify(settings));

    // Convert settings object to JSON for storage
    let settingsJSON = JSON.stringify(settings);

    // Store settings locally to be recalled later
    localStorage.setItem("settings", settingsJSON);
}

// Notifs
function addNotif() {
    unreadNotifs ++;
    if (unreadNotifs > 99) {
        $(".notifs").text("99+");
    } else {
        $(".notifs").text(unreadNotifs);
    }
    if (notifs) {
        $(".notifs").show();
    }
}

function clearNotifs() {
    $(".notifs").hide();
    unreadNotifs = 0;
}