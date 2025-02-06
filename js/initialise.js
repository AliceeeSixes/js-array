// The file that runs at runtime to initialise variables and load the page correctly



// Initialise tracking variables
let lastImage = null; // Variable for tracking last generated image
let eagerImage = null; // Eager loading next image makes it appear sooner after button press
let imageDimensions = []; // First two values are viewport size, second two values are image resolution
let eagerLoading = true; // Variable to enable/disable eager loading
let darkMode = false; // Variable to enable/disable dark mode
let notifs = true; // Variable to enable/disable notifications for the collections tab
setImageDimensions("ratio1-1",1200,1200); // Set initial dimensions AND generate image on load (changing dimensions auto-loads a new image)
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,7}$/; // Regex for testing emails
let unreadNotifs = 0; // Counter for notification system

// Initialise collections
let collections = localStorage.getItem("collections"); // Get saved collections JSON from localStorage object
collections = JSON.parse(collections); // Parse JSON into object
if (!collections) {
    collections = {}; // Initialise collections object as empty object if it is not found in storage
} else {
    generateDropdowns(); // Generate dropdowns from saved collections
}

// Initialise settings
let settings = localStorage.getItem("settings"); // Load settings JSON from localStorage object
settings = JSON.parse(settings); // Convert JSON to object
if(settings) {
    eagerLoading = settings.eagerLoad; // Image loading style

    darkMode = settings.darkMode; // Dark mode
    if (darkMode) {
        $("body").addClass("dark");
    } else {
        $("body").removeClass("dark");
    }

    notifs = settings.notifs; // Notifications
}

// Focus images tab on page load
focusTab("images");