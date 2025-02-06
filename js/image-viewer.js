// The file that contains functions relating to the image viewer tab



// Get Image
async function getImage() {
    if (eagerLoading && eagerImage && eagerImage[1] == imageDimensions) {

        updateImage(); // Display eager loaded image if one is present and the setting is enabled

    } else {

        $("#emailMessage").text(""); // Remove error messages related to email addresses
        $("#addImageMessage").text(""); // Remove error messages related to adding images to collections

        try {
            let response = await fetch(`https://picsum.photos/${imageDimensions[1]}/${imageDimensions[2]}`); // Fetch image from Picsum API
            if (!response.ok) {
                throw new Error(`${response.status}`); // Error handling
            }

            let imageUrl = response.url // Get image url
            $("#image-viewport").css("background",`url(${imageUrl})`).css("background-size","contain"); // Set image viewport to display image
            $("#image-viewport-link").attr("href",imageUrl); // Make image open full-scale in new tab on click



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
        eagerLoad(); // Pre-load the next image if the setting is enabled to prevent delay on button press
    }
}


// Eager load - load images in advance so high-resolution images don't introduce delay on button press
async function eagerLoad() {
    try {
        let response = await fetch(`https://picsum.photos/${imageDimensions[1]}/${imageDimensions[2]}`); // Fetch image from Picsum API
        if (!response.ok) {
            throw new Error(`${response.status}`); // Error handling
        }

        eagerImage = [response, imageDimensions]; // Create image array for the updateImage() function to parse
        $("#quickLoad").css("background",`url(${response.url})`).css("background-size","contain"); // Extra div to display image as soon a possible to prevent browser lag slowing down image display

    } catch (error) {
        console.log(error.message);
        $("#addImageMessage").text(error.message); // Output any error text
        eagerImage = null; // Clear currently stored eager image to allow the function to run from scratch next time
    }

}

// Update image
function updateImage() {
    let image = eagerImage[0]; // Get API response object out of eagerImage array created earlier
    let imageUrl = image.url // Get image url from response object
        $("#quickLoad").css("z-index","5"); // Bring pre-loaded version to the forefront
        $("#image-viewport").css("background",`url(${image.url})`).css("background-size","contain"); // Set image viewport to display image
        $("#image-viewport-link").attr("href",image.url); // Set image link to correct URL
        $("#quickLoad").css("z-index","-5"); // Hide pre-loaded version again



        // Track most recently displayed image in global variable lastImage
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
    let email = $("#email").val(); // Get value from input field
    if (!validEmail(email)) {
        // Indicate failure - invalid email
        console.log("Failed to add email");
        $("#emailMessage").text("Failed to add email address - invalid").removeClass("positive").addClass("negative").show(); // Invalid email message
    } else if (Object.hasOwn(collections, email)) {
        // Indicate failure - collection already exists
        console.log("Collection already exists");
        $("#emailMessage").text("Failed to add email address - already added!").removeClass("positive").addClass("negative").show(); // Email already added message
    } else {
        
        createNewCollection(email); // Create new collection
        $("#add-new-email button").html("&check;"); // Change + to tickmark to indicate success
        $("#emailMessage").text("Email address added!").removeClass("negative").addClass("positive").show(); // Success message
        

        generateDropdowns(); // Regenerate dropdown menus

        $("#selected-email").val(email); // Auto-select new email as active collection
    }
    $("#email").val(""); // Clear input field


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
        $("#addImageMessage").text("You must add an email address to save images").removeClass("positive").addClass("negative"); // No email error message
        $("#add-new-email").addClass("error"); // Highlight email input field
    } else if (inCollection(lastImage, selectedCollection) === true) {
        console.log("This image is already in this collection");
        $("#addImageMessage").text("This image is already in this collection").removeClass("positive").addClass("negative"); // Image already added error message
    } else {
        let currentCollection = collections[selectedCollection]; // Get selected collection from collections object

        currentCollection.images.push(lastImage); // Add last generated image to current collection

        $("#addImageMessage").text("Successfully added image!").removeClass("negative").addClass("positive"); // Success message
        addNotif(); // Update notifications

    }

    let collectionsJSON = JSON.stringify(collections); // Convert collections object to JSON string
    localStorage.setItem("collections", collectionsJSON); // Save collections to localStorage object
}

// Check if image is already in a collection
function inCollection(image, collection) {
    let collectionToSearch = collections[collection]; // Select collection
    let url = image.url; // Get URL to search for
    for (let i in collectionToSearch.images) {
        if (collectionToSearch.images[i].url == url) {
            return(true);
        }
    }
    return(false);
}

// Event listener to show selected aspect ratio
$("#image-aspect-ratio__buttons").on("click","button", (event) => {
    $("#image-aspect-ratio__buttons button").removeClass("selected");
    $(event.target).addClass("selected");
});


// Email validation
function validEmail(email) {
    let result = emailRegex.test(email); // Test email against regex
    return(result);
}