import Char "mo:base/Char";
import Hash "mo:base/Hash";
import Nat32 "mo:base/Nat32";

import Array "mo:base/Array";
import Debug "mo:base/Debug";
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
        createdAt: Text; // Changed to Text
    };

    type Comment = {
        id: CommentId;
        postId: PostId;
        content: Text;
        author: Principal;
        createdAt: Text; // Changed to Text
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

    func compareTime(a: Text, b: Text) : {#less; #equal; #greater} {
        let aInt = textToNat(a);
        let bInt = textToNat(b);
        if (aInt < bInt) { #less }
        else if (aInt > bInt) { #greater }
        else { #equal }
    };

    func textToNat(t : Text) : Nat {
        var n : Nat = 0;
        for (c in t.chars()) {
            assert(c >= '0' and c <= '9');
            n := n * 10 + Nat32.toNat(Char.toNat32(c) - Char.toNat32('0'));
        };
        n
    };

    // Public functions
    public query func getCategoriesInfo() : async [CategoryInfo] {
        Debug.print("Getting categories info");
        Array.map<Category, CategoryInfo>(categories, func (category) {
            let categoryPosts = Array.filter<Post>(Iter.toArray(posts.vals()), func (post) {
                post.category == category.name
            });
            let postCount = categoryPosts.size();
            Debug.print("Category: " # category.name # ", Post count: " # Nat.toText(postCount));
            let recentPost = if (postCount > 0) {
                let sortedPosts = Array.sort<Post>(categoryPosts, func (a, b) { 
                    compareTime(b.createdAt, a.createdAt)
                });
                ?sortedPosts[0]
            } else {
                null
            };
            Debug.print("Recent post: " # debug_show(recentPost));
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
            createdAt = Int.toText(Time.now());
        };
        posts.put(postId, post);
        Debug.print("Created post: " # Nat.toText(postId) # " in category: " # category);
        postId
    };

    public query func getPost(postId: PostId) : async ?Post {
        posts.get(postId)
    };

    public query func getPostsByCategory(category: Text) : async [Post] {
        let filteredPosts = Array.filter<Post>(Iter.toArray(posts.vals()), func (post) {
            post.category == category
        });
        Debug.print("Getting posts for category: " # category # ", Count: " # Nat.toText(filteredPosts.size()));
        filteredPosts
    };

    public shared(msg) func addComment(postId: PostId, content: Text) : async CommentId {
        let commentId = generateCommentId();
        let comment : Comment = {
            id = commentId;
            postId = postId;
            content = content;
            author = msg.caller;
            createdAt = Int.toText(Time.now());
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

    // Test function to create sample posts
    public func createSamplePosts() : async [PostId] {
        let post1 = await createPost("Red Team", "Sample Red Team Post", "This is a sample post for the Red Team category.");
        let post2 = await createPost("Pen Testing", "Sample Pen Testing Post", "This is a sample post for the Pen Testing category.");
        let post3 = await createPost("Cryptography", "Sample Cryptography Post", "This is a sample post for the Cryptography category.");
        Debug.print("Sample posts created with IDs: " # debug_show([post1, post2, post3]));
        [post1, post2, post3]
    };
}