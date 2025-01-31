// Initialise tracking variables
let lastImage = null;
let imageDimensions = [200,200];
let collections = {};

// Get Image
async function getImage() {
    try {
        let response = await fetch(`https://picsum.photos/${imageDimensions[0]}/${imageDimensions[1]}`);
        if (!response.ok) {
            throw new Error(`${response.status}`);
        }

        let imageUrl = response.url

        // Set image viewport to display image
        $("#image-viewport").css("background",`url(${response.url})`);

        // Track most recently generated image
        lastImage = {
            url : imageUrl,
            dimensions: imageDimensions
        };


    } catch (error) {
        console.log(error.message);
    }
}


// Get image on page load
getImage();

// Set image dimensions
function setImageDimensions(x,y) {
    imageDimensions = [x,y];
    $("#image-viewport").css("width",x).css("height",y);
    getImage();
}

// Create new collection
function createNewCollection(name) {
    collections[name] = {
    };
}

// Add new email
function addNewEmail() {
    let email = $("#email").val();
    if (email) {
        createNewCollection(email);

        // Indicate success
        console.log(`Added email ${email}`);
    } else {
        // Indicate failure
        console.log("Failed to add email");
    }
}


// Save to collection


// Generate tiles from collection
function generateFromCollection(collection) {

}

// Tab focus
function focusTab(tab) {
    if (tab === "images") {
        $(".image-viewer").show()
        $(".collection-viewer").hide();
        $("#image-tab").addClass("current");
        $("#collection-tab").removeClass("current");
    } else {
        $(".image-viewer").hide();
        $(".collection-viewer").show();
        $("#image-tab").removeClass("current");
        $("#collection-tab").addClass("current");
    }
}

// Focus images on load
focusTab("images");