import { backend } from 'declarations/backend';

let currentCategory = null;
let currentPost = null;

async function init() {
    const categories = await backend.getCategories();
    const categoriesList = document.getElementById('categories');
    categories.forEach(category => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.innerHTML = `
            <span class="category-icon">${category.icon}</span>
            <div class="category-info">
                <span class="category-name">${category.name}</span>
                <span class="category-description">${category.description}</span>
            </div>
        `;
        a.onclick = () => loadCategory(category.name);
        li.appendChild(a);
        categoriesList.appendChild(li);
    });

    // Load the first category by default
    if (categories.length > 0) {
        loadCategory(categories[0].name);
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