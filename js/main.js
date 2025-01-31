// Initialise tracking variables
let lastImage = null;
let imageDimensions = [200,200];
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,7}$/;

// Initialise collections
let collections = localStorage.getItem("collections");
collections = JSON.parse(collections);
if (!collections) {
    collections = {};
} else {
    generateDropdowns(); // Generate dropdowns from saved collections
}






// Get Image

async function getImage() {
    try {
        let response = await fetch(`https://picsum.photos/${imageDimensions[0]}/${imageDimensions[1]}`);
        if (!response.ok) {
            throw new Error(`${response.status}`);
        }

        let imageUrl = response.url // Get image url

        $("#image-viewport").css("background",`url(${response.url})`); // Set image viewport to display image


        // Track most recently generated image in global variable lastImage
        lastImage = {
            url : imageUrl,
            dimensions: imageDimensions
        };


    } catch (error) {
        console.log(error.message);
    }
}

getImage(); // Get image on page load


// Set image dimensions

function setImageDimensions(x,y) {
    imageDimensions = [x,y]; // Set image dimensions
    $("#image-viewport").css("background","#111111").css("width",x).css("height",y); // Resize image viewport and reset background
    getImage(); // Generate a new image to fit new aspect ratio
}


// Create new collection

function createNewCollection(name) {
    if (Object.hasOwn(collections, name)) {
        console.log("Collection already exists");
    } else {
        collections[name] = {
            images : []
        };
        console.log("New collection created");
    }
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
    let email = $("#email").val();
    if (validEmail(email)) {
        createNewCollection(email); // Create new collection
        $("#add-new-email button").html("&check;"); // Change + to tickmark to indicate success

        generateDropdowns(); // Regenerate dropdown menus

        $("#selected-email").val(email); // Auto-select new email as active collection
    } else {
        // Indicate failure
        console.log("Failed to add email");
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
});



// Save to collection

function saveToCollection() {

    let selectedCollection = $("#selected-email").val(); // Get value of currently selected email address
    if (selectedCollection === "none") {
        // If no email is selected output error
        console.log("Select a collection")
    } else {
        let currentCollection = collections[selectedCollection]; // Get selected collection from collections object

        currentCollection.images.push(lastImage); // Add last generated image to current collection

    }

    let collectionsJSON = JSON.stringify(collections); // Convert collections object to JSON string
    localStorage.setItem("collections", collectionsJSON); // Save collections to localStorage object
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

    let newTile = $(`<div class="image-tile" data-url="${url}" style="background:url(${url});width:${dimensions[0]}px;height:${dimensions[1]}px"><button class="delete-tile"><i class="fa fa-xmark"></i></button></div>`);
    return(newTile);
}


// Logic for UI tabs

function focusTab(tab) {
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