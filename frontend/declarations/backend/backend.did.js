export const idlFactory = ({ IDL }) => {
  const PostId = IDL.Nat;
  const CommentId = IDL.Nat;
  const Time = IDL.Int;
  const Post = IDL.Record({
    'id' : PostId,
    'title' : IDL.Text,
    'content' : IDL.Text,
    'createdAt' : Time,
    'author' : IDL.Principal,
    'category' : IDL.Text,
  });
  const Category = IDL.Record({
    'icon' : IDL.Text,
    'name' : IDL.Text,
    'description' : IDL.Text,
  });
  const CategoryInfo = IDL.Record({
    'postCount' : IDL.Nat,
    'recentPost' : IDL.Opt(Post),
    'category' : Category,
  });
  const Comment = IDL.Record({
    'id' : CommentId,
    'content' : IDL.Text,
    'createdAt' : Time,
    'author' : IDL.Principal,
    'postId' : PostId,
  });
  return IDL.Service({
    'addComment' : IDL.Func([PostId, IDL.Text], [CommentId], []),
    'createPost' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [PostId], []),
    'getCategoriesInfo' : IDL.Func([], [IDL.Vec(CategoryInfo)], ['query']),
    'getCommentsByPost' : IDL.Func([PostId], [IDL.Vec(Comment)], ['query']),
    'getPost' : IDL.Func([PostId], [IDL.Opt(Post)], ['query']),
    'getPostsByCategory' : IDL.Func([IDL.Text], [IDL.Vec(Post)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
