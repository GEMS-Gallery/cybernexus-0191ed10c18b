import { backend } from 'declarations/backend';

let currentCategory = null;
let currentPost = null;

async function init() {
    const categoriesInfo = await backend.getCategoriesInfo();
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
                <span>Last updated: ${info.recentPost ? new Date(Number(info.recentPost.createdAt) / 1000000).toLocaleString() : 'N/A'}</span>
            </div>
            ${info.recentPost ? `
                <div class="recent-post">
                    <strong>Recent post:</strong> ${info.recentPost.title}
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
}

async function loadCategory(category) {
    currentCategory = category;
    currentPost = null;
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `<h2>${category}</h2>`;

    const posts = await backend.getPostsByCategory(category);
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content.substring(0, 100)}...</p>
            <button onclick="loadPost(${post.id})">Read More</button>
        `;
        mainContent.appendChild(postElement);
    });

    const newPostForm = document.createElement('form');
    newPostForm.innerHTML = `
        <h3>Create New Post</h3>
        <input type="text" id="post-title" placeholder="Title" required>
        <textarea id="post-content" placeholder="Content" required></textarea>
        <button type="submit">Submit Post</button>
    `;
    newPostForm.onsubmit = createPost;
    mainContent.appendChild(newPostForm);
}

async function loadPost(postId) {
    currentPost = postId;
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';

    const post = await backend.getPost(postId);
    if (post) {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <h2>${post.title}</h2>
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
    }
}

async function createPost(event) {
    event.preventDefault();
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    await backend.createPost(currentCategory, title, content);
    loadCategory(currentCategory);
}

async function createComment(event) {
    event.preventDefault();
    const content = document.getElementById('comment-content').value;
    await backend.addComment(currentPost, content);
    loadPost(currentPost);
}

window.loadPost = loadPost;
window.onload = init;