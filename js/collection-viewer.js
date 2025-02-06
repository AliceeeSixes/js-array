// THe file that contains functions relating to the collection viewer tab




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

    generateFromCollection(collection); // Generate tiles from newly remade collection

});
