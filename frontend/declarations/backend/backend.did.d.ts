import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Category {
  'icon' : string,
  'name' : string,
  'description' : string,
}
export interface CategoryInfo {
  'postCount' : bigint,
  'recentPost' : [] | [Post],
  'category' : Category,
}
export interface Comment {
  'id' : CommentId,
  'content' : string,
  'createdAt' : bigint,
  'author' : Principal,
  'postId' : PostId,
}
export type CommentId = bigint;
export interface Post {
  'id' : PostId,
  'title' : string,
  'content' : string,
  'createdAt' : bigint,
  'author' : Principal,
  'category' : string,
}
export type PostId = bigint;
export interface _SERVICE {
  'addComment' : ActorMethod<[PostId, string], CommentId>,
  'createPost' : ActorMethod<[string, string, string], PostId>,
  'createSamplePosts' : ActorMethod<[], Array<PostId>>,
  'getCategoriesInfo' : ActorMethod<[], Array<CategoryInfo>>,
  'getCommentsByPost' : ActorMethod<[PostId], Array<Comment>>,
  'getPost' : ActorMethod<[PostId], [] | [Post]>,
  'getPostsByCategory' : ActorMethod<[string], Array<Post>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
