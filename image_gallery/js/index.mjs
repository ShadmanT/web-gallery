import { addImage, deleteImage, addComment, getComments, deleteComment } from './api.mjs';

const uploadButton = document.getElementById('upload_toggle_btn');
const uploadForm = document.getElementById('img_upload_form');
const commentForm = document.getElementById('comment_form');  // Comment form
const gallery = document.getElementById('gallery');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const commentsSection = document.getElementById('comments_section');

let currentImageIndex = 0;  // Index of the currently displayed image
let currentCommentPage = 0;  // Track the current comment page
const commentsPerPage = 10;  // Number of comments to display per page

// Load images from localStorage when the page loads
const images = JSON.parse(localStorage.getItem('images')) || [];

// Initial state: form is hidden
let formVisible = false;

// Toggle the form's visibility when the button is clicked
uploadButton.addEventListener('click', () => {
    formVisible = !formVisible;
    uploadForm.style.display = formVisible ? 'block' : 'none';
    uploadButton.textContent = formVisible ? 'Hide Form' : 'Upload Image';
});

// Function to format the date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();  // Format the date as MM/DD/YYYY or based on locale
}

// Function to update the visibility of the navigation buttons
function updateNavButtons() {
    if (images.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'inline-block';
        nextBtn.style.display = 'inline-block';
    }
}

// Display comments for the current image (with pagination)
function displayComments(imageId, page = 0) {
    currentCommentPage = page;  // Update currentCommentPage to the new page
    commentsSection.innerHTML = '';  // Clear previous comments

    let comments = getComments(imageId);  // Get all comments for the current image

    // Reverse the comments to show most recent first
    comments = comments.reverse();
    const totalPages = Math.ceil(comments.length / commentsPerPage);  // Calculate total pages

    // Ensure current page is within bounds
    if (currentCommentPage < 0) currentCommentPage = 0;
    if (currentCommentPage >= totalPages) currentCommentPage = totalPages - 1;

    // Get the 10 comments for the current page
    const startIndex = currentCommentPage * commentsPerPage;
    const endIndex = Math.min(startIndex + commentsPerPage, comments.length);
    const commentsToShow = comments.slice(startIndex, endIndex);

    // Loop through the 10 comments and display them
    commentsToShow.forEach(comment => {
        const commentRow = document.createElement('div');
        commentRow.classList.add('comment-row');

        // Create the comment text container
        const commentText = document.createElement('div');
        commentText.classList.add('comment-text');

        // Author's name
        const authorElement = document.createElement('div');
        authorElement.classList.add('author');
        authorElement.textContent = comment.author;

        // Comment content
        const contentElement = document.createElement('div');
        contentElement.classList.add('content');
        contentElement.textContent = comment.content;

        // Comment date
        const dateElement = document.createElement('div');
        dateElement.classList.add('date');
        dateElement.textContent = formatDate(comment.date);

        const deleteIcon = document.createElement('div');
        deleteIcon.classList.add('delete-comment-icon');
        deleteIcon.addEventListener('click', () => {
            deleteComment(comment.commentId);  // Pass comment's ID to deleteComment function
            displayComments(imageId, currentCommentPage);  // Refresh comments after deleting
        });

        // Append the comment details to the comment text container
        commentText.appendChild(authorElement);
        commentText.appendChild(contentElement);
        commentText.appendChild(dateElement);

        // Append the comment text and delete icon to the row
        commentRow.appendChild(commentText);
        commentRow.appendChild(deleteIcon);  // Delete icon on the far right

        // Add the comment row to the comments section
        commentsSection.appendChild(commentRow);
    });

    // Add navigation buttons for comments
    if (comments.length > commentsPerPage) {
        const prevCommentsBtn = document.createElement('button');
        const nextCommentsBtn = document.createElement('button');
        
        prevCommentsBtn.textContent = 'Previous';
        nextCommentsBtn.textContent = 'Next';

        // Style the buttons to be the same size
        prevCommentsBtn.style.width = '150px';
        nextCommentsBtn.style.width = '150px';

        // Handle navigation buttons
        prevCommentsBtn.disabled = currentCommentPage === 0;
        nextCommentsBtn.disabled = currentCommentPage >= totalPages - 1;

        prevCommentsBtn.addEventListener('click', () => {
            displayComments(imageId, currentCommentPage - 1);  // Show the previous set of comments
        });

        nextCommentsBtn.addEventListener('click', () => {
            displayComments(imageId, currentCommentPage + 1);  // Show the next set of comments
        });

        // Append navigation buttons to the comments section
        commentsSection.appendChild(prevCommentsBtn);
        commentsSection.appendChild(nextCommentsBtn);
    }
}

// Function to handle displaying images and comments
function displayImage(index) {
    gallery.innerHTML = '';  // Clear the gallery

    if (images.length > 0 && index >= 0 && index < images.length) {
        const { author, title, url, date, imageId } = images[index];  // Destructure the image object

        const imgContainer = document.createElement('div');
        imgContainer.classList.add('image-container');  // Add class for styling

        const deleteIcon = document.createElement('div');
        deleteIcon.classList.add('delete-icon');

        deleteIcon.addEventListener('click', () => {
            deleteImage(imageId);
            deleteCommentsForImage(imageId);  // Delete all comments associated with the image
            images.splice(index, 1);

            if (index >= images.length) {
                currentImageIndex = images.length - 1;
            }

            if (images.length > 0) {
                displayImage(currentImageIndex);
            } else {
                gallery.innerHTML = '<p>No images to display</p>';
                prevBtn.style.display = 'none';  // Hide navigation buttons
                nextBtn.style.display = 'none';
                commentForm.style.display = 'none';  // Hide the comment form
                commentsSection.innerHTML = '';  // Clear comments section
            }

            localStorage.setItem('images', JSON.stringify(images));
        });

        const imgElement = document.createElement('img');
        imgElement.src = url;
        imgElement.alt = `Image titled "${title}" uploaded by ${author || 'Unknown'}`;

        const titleElement = document.createElement('h3');
        titleElement.textContent = title || 'Untitled';

        const authorDateElement = document.createElement('p');
        authorDateElement.textContent = `Uploaded by: ${author || 'Unknown'} on ${formatDate(date)}`;

        imgContainer.appendChild(deleteIcon);
        imgContainer.appendChild(imgElement);
        imgContainer.appendChild(titleElement);
        imgContainer.appendChild(authorDateElement);

        gallery.appendChild(imgContainer);

        // Display comments for the current image (start from page 0)
        displayComments(imageId, 0);

        // Ensure the comment form is visible
        commentForm.style.display = 'block';
        commentForm.onsubmit = (event) => {
            event.preventDefault();
            const commentAuthor = document.getElementById('comment_form_author').value;
            const commentContent = document.getElementById('comment_form_content').value;
            
            if (commentContent && commentAuthor) {
                addComment(imageId, commentAuthor, commentContent);
                displayComments(imageId, 0);  // Refresh comments after adding a new one

                // Clear the comment form
                document.getElementById('comment_form_author').value = '';
                document.getElementById('comment_form_content').value = '';
            } else {
                alert("Please fill out both the name and comment fields.");
            }
        };
    } else {
        // If no images are available, hide the comment form and navigation buttons
        gallery.innerHTML = '<p>No images to display</p>';
        prevBtn.style.display = 'none';  // Hide navigation buttons
        nextBtn.style.display = 'none';
        commentForm.style.display = 'none';  // Hide the comment form
        commentsSection.innerHTML = '';  // Clear comments section
    }

    updateNavButtons();
}

function deleteCommentsForImage(imageId) {
    // Get all comments from localStorage
    let allComments = JSON.parse(localStorage.getItem('comments')) || [];

    // Filter out the comments related to the deleted image
    allComments = allComments.filter(comment => comment.imageId !== imageId);

    // Save the updated comments back to localStorage
    localStorage.setItem('comments', JSON.stringify(allComments));

    // Clear the comments section
    commentsSection.innerHTML = '';
}

// Handle form submission (to add a new image)
uploadForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const author = document.getElementById('author').value;
    const imgTitle = document.getElementById('title_input').value;
    const imgURL = document.getElementById('url_input').value;

    if (imgURL) {
        const newImage = addImage(imgTitle, author, imgURL);
        images.push(newImage);

        localStorage.setItem('images', JSON.stringify(images));
        currentImageIndex = images.length - 1;
        displayImage(currentImageIndex);

        document.getElementById('author').value = '';
        document.getElementById('title_input').value = '';
        document.getElementById('url_input').value = '';
    } else {
        alert("Please provide a valid image URL");
    }
});

// Navigation button handlers
prevBtn.addEventListener('click', () => {
    if (currentImageIndex > 0) {
        currentImageIndex -= 1;
        displayImage(currentImageIndex);
    }
});

nextBtn.addEventListener('click', () => {
    if (currentImageIndex < images.length - 1) {
        currentImageIndex += 1;
        displayImage(currentImageIndex);
    }
});

// Load the first image when the page loads (if any)
if (images.length > 0) {
    displayImage(currentImageIndex);  // Display the first image
    commentForm.style.display = 'block';  // Show the comment form
} else {
    commentForm.style.display = 'none';  // Hide the comment form if no images
    prevBtn.style.display = 'none';  // Hide navigation buttons
    nextBtn.style.display = 'none';
}
