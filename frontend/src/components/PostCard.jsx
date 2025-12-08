export default function PostCard({ post }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="mb-2">{post.text}</p>
      {post.created_at && <p className="text-gray-500 text-sm">{new Date(post.created_at).toLocaleString()}</p>}
    </div>
  );
}
