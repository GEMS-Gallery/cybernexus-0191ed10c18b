import Hash "mo:base/Hash";

import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Int "mo:base/Int";

actor {
    // Types
    type PostId = Nat;
    type CommentId = Nat;

    type Post = {
        id: PostId;
        category: Text;
        title: Text;
        content: Text;
        author: Principal;
        createdAt: Time.Time;
    };

    type Comment = {
        id: CommentId;
        postId: PostId;
        content: Text;
        author: Principal;
        createdAt: Time.Time;
    };

    type Category = {
        name: Text;
        description: Text;
        icon: Text;
    };

    type CategoryInfo = {
        category: Category;
        postCount: Nat;
        recentPost: ?Post;
    };

    // State
    stable var nextPostId : PostId = 0;
    stable var nextCommentId : CommentId = 0;
    
    let categories : [Category] = [
        { name = "Red Team"; description = "Offensive security and penetration testing"; icon = "🔴" },
        { name = "Pen Testing"; description = "Techniques and tools for penetration testing"; icon = "🔍" },
        { name = "Cryptography"; description = "Encryption, decryption, and cryptographic protocols"; icon = "🔐" },
        { name = "Network Security"; description = "Securing networks and network protocols"; icon = "🌐" },
        { name = "Web Security"; description = "Securing web applications and services"; icon = "🕸️" },
        { name = "Malware Analysis"; description = "Analyzing and understanding malicious software"; icon = "🦠" }
    ];
    
    let posts = HashMap.HashMap<PostId, Post>(0, Nat.equal, Hash.hash);
    let comments = HashMap.HashMap<CommentId, Comment>(0, Nat.equal, Hash.hash);

    // Helper functions
    func generatePostId() : PostId {
        nextPostId += 1;
        nextPostId
    };

    func generateCommentId() : CommentId {
        nextCommentId += 1;
        nextCommentId
    };

    func compareTime(a: Time.Time, b: Time.Time) : {#less; #equal; #greater} {
        if (a < b) { #less }
        else if (a > b) { #greater }
        else { #equal }
    };

    // Public functions
    public query func getCategoriesInfo() : async [CategoryInfo] {
        Array.map<Category, CategoryInfo>(categories, func (category) {
            let categoryPosts = Array.filter<Post>(Iter.toArray(posts.vals()), func (post) {
                post.category == category.name
            });
            let postCount = categoryPosts.size();
            let recentPost = if (postCount > 0) {
                ?Array.sort<Post>(categoryPosts, func (a, b) { compareTime(b.createdAt, a.createdAt) })[0]
            } else {
                null
            };
            {
                category = category;
                postCount = postCount;
                recentPost = recentPost;
            }
        })
    };

    public shared(msg) func createPost(category: Text, title: Text, content: Text) : async PostId {
        let postId = generatePostId();
        let post : Post = {
            id = postId;
            category = category;
            title = title;
            content = content;
            author = msg.caller;
            createdAt = Time.now();
        };
        posts.put(postId, post);
        postId
    };

    public query func getPost(postId: PostId) : async ?Post {
        posts.get(postId)
    };

    public query func getPostsByCategory(category: Text) : async [Post] {
        let filteredPosts = Array.filter<Post>(Iter.toArray(posts.vals()), func (post) {
            post.category == category
        });
        filteredPosts
    };

    public shared(msg) func addComment(postId: PostId, content: Text) : async CommentId {
        let commentId = generateCommentId();
        let comment : Comment = {
            id = commentId;
            postId = postId;
            content = content;
            author = msg.caller;
            createdAt = Time.now();
        };
        comments.put(commentId, comment);
        commentId
    };

    public query func getCommentsByPost(postId: PostId) : async [Comment] {
        let filteredComments = Array.filter<Comment>(Iter.toArray(comments.vals()), func (comment) {
            comment.postId == postId
        });
        filteredComments
    };
}