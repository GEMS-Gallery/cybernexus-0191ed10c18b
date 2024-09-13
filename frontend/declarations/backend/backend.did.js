export const idlFactory = ({ IDL }) => {
  const PostId = IDL.Nat;
  const CommentId = IDL.Nat;
  const Time = IDL.Int;
  const Comment = IDL.Record({
    'id' : CommentId,
    'content' : IDL.Text,
    'createdAt' : Time,
    'author' : IDL.Principal,
    'postId' : PostId,
  });
  const Post = IDL.Record({
    'id' : PostId,
    'title' : IDL.Text,
    'content' : IDL.Text,
    'createdAt' : Time,
    'author' : IDL.Principal,
    'category' : IDL.Text,
  });
  return IDL.Service({
    'addComment' : IDL.Func([PostId, IDL.Text], [CommentId], []),
    'createPost' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [PostId], []),
    'getCategories' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'getCommentsByPost' : IDL.Func([PostId], [IDL.Vec(Comment)], ['query']),
    'getPost' : IDL.Func([PostId], [IDL.Opt(Post)], ['query']),
    'getPostsByCategory' : IDL.Func([IDL.Text], [IDL.Vec(Post)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
