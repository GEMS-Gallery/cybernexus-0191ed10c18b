import { backend } from 'declarations/backend';

let currentCategory = null;
let currentPost = null;

function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    // Convert nanoseconds to milliseconds
    const date = new Date(Number(BigInt(timestamp) / BigInt(1000000)));
    return date.toLocaleString();
}

async function init() {
    try {
        // Create sample posts for testing
        const samplePostIds = await backend.createSamplePosts();
        console.log("Sample posts created with IDs:", samplePostIds);

        const categoriesInfo = await backend.getCategoriesInfo();
        console.log("Categories info:", JSON.stringify(categoriesInfo, null, 2));

        const categoriesList = document.getElementById('categories');
        categoriesInfo.forEach(info => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="category-header">
                    <span class="category-icon">${info.category.icon}</span>
                    <span class="category-name">${info.category.name}</span>
                </div>
                <div class="category-description">${info.category.description}</div>
                <div class="category-stats">
                    <span>Posts: ${info.postCount}</span>
                    <span>Last updated: ${info.recentPost ? formatDate(info.recentPost.createdAt) : 'N/A'}</span>
                </div>
                ${info.recentPost ? `
                    <div class="recent-post">
                        <strong>Recent post:</strong> ${info.recentPost.title || 'Untitled'}
                    </div>
                ` : ''}
            `;
            li.onclick = () => loadCategory(info.category.name);
            categoriesList.appendChild(li);
        });

        // Load the first category by default
        if (categoriesInfo.length > 0) {
            loadCategory(categoriesInfo[0].category.name);
        }
    } catch (error) {
        console.error('Error initializing the app:', error);
    }
}

async function loadCategory(category) {
    currentCategory = category;
    currentPost = null;
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `<h2>${category}</h2>`;

    try {
        const posts = await backend.getPostsByCategory(category);
        console.log(`Posts for category ${category}:`, JSON.stringify(posts, null, 2));

        if (posts.length === 0) {
            mainContent.innerHTML += '<p>No posts in this category yet.</p>';
        } else {
            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.className = 'post';
                postElement.innerHTML = `
                    <h3>${post.title || 'Untitled'}</h3>
                    <p>${post.content.substring(0, 100)}...</p>
                    <button onclick="loadPost(${post.id})">Read More</button>
                `;
                mainContent.appendChild(postElement);
            });
        }

        const newPostForm = document.createElement('form');
        newPostForm.innerHTML = `
            <h3>Create New Post</h3>
            <input type="text" id="post-title" placeholder="Title" required>
            <textarea id="post-content" placeholder="Content" required></textarea>
            <button type="submit">Submit Post</button>
        `;
        newPostForm.onsubmit = createPost;
        mainContent.appendChild(newPostForm);
    } catch (error) {
        console.error('Error loading category:', error);
        mainContent.innerHTML += '<p>Error loading posts. Please try again later.</p>';
    }
}

async function loadPost(postId) {
    currentPost = postId;
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';

    try {
        const post = await backend.getPost(postId);
        console.log(`Post ${postId}:`, JSON.stringify(post, null, 2));

        if (post) {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <h2>${post.title || 'Untitled'}</h2>
                <p>${post.content}</p>
            `;
            mainContent.appendChild(postElement);

            const comments = await backend.getCommentsByPost(postId);
            comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                commentElement.textContent = comment.content;
                mainContent.appendChild(commentElement);
            });

            const newCommentForm = document.createElement('form');
            newCommentForm.innerHTML = `
                <h3>Add Comment</h3>
                <textarea id="comment-content" placeholder="Your comment" required></textarea>
                <button type="submit">Submit Comment</button>
            `;
            newCommentForm.onsubmit = createComment;
            mainContent.appendChild(newCommentForm);
        } else {
            mainContent.innerHTML = '<p>Post not found.</p>';
        }
    } catch (error) {
        console.error('Error loading post:', error);
        mainContent.innerHTML = '<p>Error loading post. Please try again later.</p>';
    }
}

async function createPost(event) {
    event.preventDefault();
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    try {
        const postId = await backend.createPost(currentCategory, title, content);
        console.log(`Post created in category ${currentCategory} with ID: ${postId}`);
        loadCategory(currentCategory);
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Error creating post. Please try again.');
    }
}

async function createComment(event) {
    event.preventDefault();
    const content = document.getElementById('comment-content').value;
    try {
        const commentId = await backend.addComment(currentPost, content);
        console.log(`Comment added to post ${currentPost} with ID: ${commentId}`);
        loadPost(currentPost);
    } catch (error) {
        console.error('Error creating comment:', error);
        alert('Error creating comment. Please try again.');
    }
}

window.loadPost = loadPost;
window.onload = init;