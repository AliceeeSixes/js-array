// Initialise tracking variables
let lastImage = null;
let eagerImage = null; // Eager loading next image makes it appear sooner after button press
let imageDimensions = []; // First two values are viewport size, second two values are image resolution
let eagerLoading = true; // Variable to enable/disable eager loading
let darkMode = false; // Variable to enable/disable dark mode
setImageDimensions("ratio1-1",1200,1200); // Set initial dimensions and generate image on load
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,7}$/;

// Initialise collections
let collections = localStorage.getItem("collections");
collections = JSON.parse(collections);
if (!collections) {
    collections = {};
} else {
    generateDropdowns(); // Generate dropdowns from saved collections
}

// Initialise settings
let settings = localStorage.getItem("settings");
settings = JSON.parse(settings);
if(settings) {
    eagerLoading = settings.eagerLoad; // Image loading style
    darkMode = settings.darkMode; // Dark mode

    console.log("Loaded settings as: " + JSON.stringify(settings));
}





// Get Image

async function getImage() {
    if (eagerLoading && eagerImage && eagerImage[1] == imageDimensions) {
        updateImage();
        
    } else {
        $("#emailMessage").text(""); // Remove error messages related to email addresses
        $("#addImageMessage").text(""); // Remove error messages related to adding images to collections
        try {
            let response = await fetch(`https://picsum.photos/${imageDimensions[1]}/${imageDimensions[2]}`);
            if (!response.ok) {
                throw new Error(`${response.status}`);
            }
            console.log(response);

            let imageUrl = response.url // Get image url

            $("#image-viewport").css("background",`url(${response.url})`).css("background-size","contain"); // Set image viewport to display image
            $("#image-viewport-link").attr("href",response.url);



            // Track most recently generated image in global variable lastImage
            lastImage = {
                url : imageUrl,
                dimensions: imageDimensions
            };

        } catch (error) {
            console.log(error.message);
            $("#addImageMessage").text(error.message); // Output any error text
        }
    }

    if (eagerLoading) {
        eagerLoad();
    }




    
}


// Eager load
async function eagerLoad() {
    try {
        let response = await fetch(`https://picsum.photos/${imageDimensions[1]}/${imageDimensions[2]}`);
        if (!response.ok) {
            throw new Error(`${response.status}`);
        }
        eagerImage = [response, imageDimensions];
        $("#quickLoad").css("background",`url(${response.url})`).css("background-size","contain"); // Extra div to display image as soon a possible
        console.log("Eager loaded")

    } catch (error) {
        console.log(error.message);
        $("#addImageMessage").text(error.message); // Output any error text
        eagerImage = null;
    }

}

// Update image
function updateImage() {
    let image = eagerImage[0]
    let imageUrl = image.url // Get image url
        $("#quickLoad").css("z-index","5"); // Bring pre-loaded version to the forefront
        $("#image-viewport").css("background",`url(${image.url})`).css("background-size","contain"); // Set image viewport to display image
        $("#image-viewport-link").attr("href",image.url);
        $("#quickLoad").css("z-index","-5"); // Hide pre-loaded version again



        // Track most recently generated image in global variable lastImage
        lastImage = {
            url : imageUrl,
            dimensions: imageDimensions
        };

}



// Set image dimensions

function setImageDimensions(ratio,x,y) {
    $("#image-viewport").removeClass(imageDimensions[0]); // Remove class for previous aspect ratio
    imageDimensions = [ratio,x,y]; // Set image dimensions
    $("#image-viewport").css("background","#111111");
    $("#image-viewport").addClass(ratio); // Add class for new aspect ratio
    getImage(); // Generate a new image to fit new aspect ratio
}


// Create new collection

function createNewCollection(name) {
    collections[name] = {
        images : []
    };
    console.log("New collection created");
    let collectionsJSON = JSON.stringify(collections); // Convert collections object to JSON string
    localStorage.setItem("collections", collectionsJSON); // Save collections to localStorage object
}

// Delete collection

function deleteCollection(name) {
    if (!name) {
        name = $("#viewed-collection").val();
    }
    if (Object.hasOwn(collections, name)) {
        delete collections[name];
    } else {
        console.log("Collection does not exist");
    }
    generateDropdowns(); // Regenerate dropdown menus
    generateFromCollection($("#viewed-collection").val()); // Regenerate tiles from collection

    let collectionsJSON = JSON.stringify(collections); // Convert collections object to JSON string
    localStorage.setItem("collections", collectionsJSON); // Save collections to localStorage object
}


// Add new email address

function addNewEmail() {
    $("#add-new-email").removeClass("error"); // Remove error class
    $("#addImageMessage").text(""); // Remove error messages related to adding images
    let email = $("#email").val();
    if (!validEmail(email)) {
        // Indicate failure - invalid email
        console.log("Failed to add email");
        $("#emailMessage").text("Failed to add email address - invalid").removeClass("positive").addClass("negative").show();
    } else if (Object.hasOwn(collections, email)) {
        // Indicate failure - collection already exists
        console.log("Collection already exists");
        $("#emailMessage").text("Failed to add email address - already added!").removeClass("positive").addClass("negative").show();
    } else {
        
        createNewCollection(email); // Create new collection
        $("#add-new-email button").html("&check;"); // Change + to tickmark to indicate success
        $("#emailMessage").text("Email address added!").removeClass("negative").addClass("positive").show();
        

        generateDropdowns(); // Regenerate dropdown menus

        $("#selected-email").val(email); // Auto-select new email as active collection
    }
    $("#email").val("");


}

// Event listener to change tickmark back to plus after specified delay
$("#add-new-email button").on("click", async function() {
    setTimeout(() => {
        $("#add-new-email button").html("+"); // Change tickmark back to +
    }, 3000); 
});

// Event listener to change tickmark back to plus if text entry is clicked
$("#email").on("click", () => {
    $("#add-new-email button").html("+"); // Change tickmark back to +
    $("#add-new-email").removeClass("error"); // Remove error class
    $("#emailMessage").hide(); // Hide message text
});



// Save to collection

function saveToCollection() {
    $("#add-new-email").removeClass("error"); // Remove error class
    $("#emailMessage").text(""); // Remove error messages related to email addresses

    let selectedCollection = $("#selected-email").val(); // Get value of currently selected email address
    if (selectedCollection === "none") {
        // If no email is selected output error
        console.log("Select a collection")
        $("#addImageMessage").text("You must add an email address to save images").removeClass("positive").addClass("negative");
        $("#add-new-email").addClass("error");
    } else if (inCollection(lastImage, selectedCollection) === true) {
        console.log("This image is already in this collection");
        $("#addImageMessage").text("This image is already in this collection").removeClass("positive").addClass("negative");
    } else {
        let currentCollection = collections[selectedCollection]; // Get selected collection from collections object

        currentCollection.images.push(lastImage); // Add last generated image to current collection

        $("#addImageMessage").text("Successfully added image!").removeClass("negative").addClass("positive");

    }

    let collectionsJSON = JSON.stringify(collections); // Convert collections object to JSON string
    localStorage.setItem("collections", collectionsJSON); // Save collections to localStorage object
}

// Check if image is already in a collection
function inCollection(image, collection) {
    let collectionToSearch = collections[collection];
    let url = image.url;
    for (let i in collectionToSearch.images) {
        if (collectionToSearch.images[i].url == url) {
            return(true);
        }
    }
    return(false);
}

// Generate tiles from collection

function generateFromCollection(collection) {

    if (Object.hasOwn(collections, collection)) {
        let currentCollection = collections[collection]; // Get selected collection from collections object
        let imagesArray = currentCollection.images; // Get images from collection

        console.log(`Generating ${imagesArray.length} images from collection ${collection}`); // Console log to make following easier

        $("#image-tile-container").html(""); // Clear image tile container before adding new tiles
        
        // Iterate through images array

        for (let i in imagesArray) {
            let image = imagesArray[i]; // Get image object from collection
            console.log(`Image with url ${image.url} and dimensions ${image.dimensions}`); // Console log to make following easier
            let imageTile = generateImageTile(image); // Generate a new image tile from the image
            // Set height and width
            imageTile.addClass(image.dimensions[0]);
            $("#image-tile-container").append(imageTile); // Add new image tile to DOM
        }
    } else {
        $("#image-tile-container").html("");
    }

}

// Tile generation function
function generateImageTile(image) {
    let url = image.url; // Get url
    let dimensions = image.dimensions; // Get dimensions

    let newTile = $(`<div class="image-tile" data-url="${url}" style="background:url(${url});background-size:contain;"><a  href="${url}" target="_blank"></a><button class="delete-tile"><i class="fa fa-xmark"></i></button><div class="resolution">${dimensions[1]} * ${dimensions[2]}</div></div>`);
    return(newTile);
}


// Logic for UI tabs

function focusTab(tab) {

    $("#emailMessage").text(""); // Remove error messages related to email addresses
    $("#addImageMessage").text(""); // Remove error messages related to adding images to collections
    
    if (tab === "images") {
        $(".image-viewer").show()
        $(".collection-viewer").hide();
        $("#image-tab").addClass("current");
        $("#collection-tab").removeClass("current");

        // Carry over selected email to new tab
        let email = $("#viewed-collection").val();
        $("#selected-email").val(email);
    } else {
        $(".image-viewer").hide();
        $(".collection-viewer").show();
        $("#image-tab").removeClass("current");
        $("#collection-tab").addClass("current");


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

// Focus images on load
focusTab("images");


// Generate dropdowns
function generateDropdowns() {
    // Create options html
    let options = ``;
    for (const email in collections) {
        options += `<option value="${email}">${email}</option>`;
    }


    if (!options) {
        options = `<option value="none">No collections created</option>`
    }
    // Put html into select elements
    $("select").html(options);
}


// Event listeners for selecting collection to view
$("#viewed-collection").on("change", () => {
    let selected = $("#viewed-collection").val();
    generateFromCollection(selected);
    
});



// Function to clear ALL collections (debug only)
function clearAllCollections() {
    collections = {};
    let collectionsJSON = JSON.stringify(collections); // Convert collections object to JSON string
    localStorage.setItem("collections", collectionsJSON); // Save collections to localStorage object
}


// Event listener for tile delete button

$(".collection-viewer").on("click", ".delete-tile", (event) => {
    let tile = $(event.target).parents(".image-tile"); // Get tile to delete
    let imageurl = tile.data("url"); // Get image url from tile
    
    let collection = $("#viewed-collection").val();
    let currentCollection = collections[collection]; // Get selected collection from collections object
    let images = currentCollection.images; // Get images array from collection
    let newImages = []; // Initialise new array

    for (let index in images) {
        if (images[index].url !== imageurl) {
            newImages.push(images[index]); // Add all but the matching url to the new array
        }
    }
    currentCollection.images = newImages;


    let collectionsJSON = JSON.stringify(collections); // Convert collections object to JSON string
    localStorage.setItem("collections", collectionsJSON); // Save collections to localStorage object

    generateFromCollection(collection);

});


// Event listener to show selected aspect ratio
$("#image-aspect-ratio__buttons").on("click","button", (event) => {
    $("#image-aspect-ratio__buttons button").removeClass("selected");
    $(event.target).addClass("selected");
});

function validEmail(email) {
    let result = emailRegex.test(email);
    return(result)
}


// Settings menu
function settingsToggle(arg) {
    if(arg) {
        loadSettings();
        $(".settings-menu-outer").css("display","flex");
    } else {
        updateSettings();
        $(".settings-menu-outer").css("display","none");
        
    }
}


// Load current settings
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
    

}

function updateSettings() {
    // Eager loading
    let settingEagerLoad = $("#loading-style").is(":checked");
    eagerLoading = settingEagerLoad;

    // Dark mode
    let settingDarkMode = $("#dark-mode").is(":checked");
    darkMode = settingDarkMode;


    settings = {};
    settings.eagerLoad = eagerLoading;
    settings.darkMode = darkMode;
    console.log("settings saved as" + JSON.stringify(settings));


    let settingsJSON = JSON.stringify(settings);

    localStorage.setItem("settings", settingsJSON);
}