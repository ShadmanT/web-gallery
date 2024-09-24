/*  ******* Data types *******
    image objects must have at least the following attributes:
        - (String) imageId 
        - (String) title
        - (String) author
        - (String) url
        - (Date) date

    comment objects must have the following attributes:
        - (String) commentId
        - (String) imageId
        - (String) author
        - (String) content
        - (Date) date

****************************** */

// Initialize counter in localStorage if it doesn't exist
if (!localStorage.getItem('idCounter')) {
    localStorage.setItem('idCounter', '0');
}

// Function to get the next ID from the counter
function getNextId() {
    let counter = parseInt(localStorage.getItem('idCounter'), 10);  // Get the current counter
    counter += 1;  // Increment the counter
    localStorage.setItem('idCounter', counter.toString());  // Update the counter in localStorage
    return counter;
}

// Load data from localStorage
function loadData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

// Save data to localStorage
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/* ********** Images ********** */

// Add an image to the gallery
export function addImage(title, author, url) {
    const images = loadData('images');
    
    const newImage = {
        imageId: getNextId(),  // Use the counter for the image ID
        title: title || 'Untitled',
        author: author || 'Unknown',
        url: url,
        date: new Date()
    };

    images.push(newImage);
    saveData('images', images);  // Save the updated image list to localStorage
    return newImage;
}

// Delete an image from the gallery given its imageId
export function deleteImage(imageId) {
    let images = loadData('images');
    images = images.filter(image => image.imageId !== imageId);  // Remove the image with the given ID
    saveData('images', images);  // Save the updated image list
}

/* ********** Comments ********** */

// Add a comment to an image
export function addComment(imageId, author, content) {
    const comments = loadData('comments');

    const newComment = {
        commentId: getNextId(),
        imageId: imageId,
        author: author || 'Anonymous',
        content: content,
        date: new Date()  // Add the current date
    };

    comments.push(newComment);
    saveData('comments', comments);  // Save the updated comment list to localStorage
}

// Get comments for a specific image
export function getComments(imageId) {
    const comments = loadData('comments');
    return comments.filter(comment => comment.imageId === imageId);  // Return comments for the specific image
}

// Function to delete a comment by its ID
export function deleteComment(commentId) {
    let comments = loadData('comments');
    // Filter out the comment with the matching ID
    comments = comments.filter(comment => comment.commentId !== commentId);
    saveData('comments', comments);  // Save the updated comment list
}

