import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getXUser, getXPosts, getTumblrPosts } from '../services/api';
import TumblrConnectButton from '../components/TumblrConnectButton';

export default function Dashboard() {
  const [xUser, setXUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tumblrBlog, setTumblrBlog] = useState(null);
  const [tumblrPosts, setTumblrPosts] = useState([]);
  const [tumblrError, setTumblrError] = useState(null);

  const fetchXData = async () => {
    try {
      const userRes = await getXUser();
      setXUser(userRes.data.data);

      const postsRes = await getXPosts();
      setPosts(postsRes.data.data || []);
    } catch (err) {
      setXUser(null);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTumblrData = async () => {
    try {
      const res = await getTumblrPosts();
      setTumblrBlog(res.data.blog);
      setTumblrPosts(res.data.posts || []);
      setTumblrError(null);
    } catch (err) {
      setTumblrBlog(null);
      setTumblrPosts([]);
      setTumblrError('Not connected to Tumblr or error fetching posts');
    }
  };

  useEffect(() => {
    fetchXData();
    fetchTumblrData();
    const interval = setInterval(fetchXData, 5000); // fetch X every 5s
    return () => clearInterval(interval);
  }, []);

  const handleLoginWithX = () => {
    window.location.href = 'http://localhost:3000/auth/x/start';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      <Navbar onLoginWithX={handleLoginWithX} />

      <div className="p-8 max-w-5xl mx-auto">
        {loading ? (
          <p className="text-center text-lg animate-pulse">Loading...</p>
        ) : xUser ? (
          <div>
            {/* X section */}
            <div className="mb-8 text-center">
              <h2 className="text-4xl font-extrabold mb-2 drop-shadow-lg">
                Hello, {xUser.username || xUser.name}
              </h2>
              <p className="text-lg drop-shadow-md">
                Here are your latest posts from X
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white text-gray-800 p-6 rounded-3xl shadow-2xl transform transition hover:-translate-y-2 hover:shadow-3xl"
                  >
                    <p className="mb-4">{post.text}</p>
                    <small className="text-gray-500">
                      {new Date(post.created_at).toLocaleString()}
                    </small>
                  </div>
                ))
              ) : (
                <p className="text-center col-span-full text-gray-200">
                  No posts to display.
                </p>
              )}
            </div>

            {/* Tumblr section */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-3 text-center">
                Tumblr Integration
              </h3>
              <div className="text-center mb-4">
                <TumblrConnectButton />
              </div>

              {tumblrError && (
                <p className="text-center text-red-100 mb-4">
                  {tumblrError}
                </p>
              )}

              {tumblrBlog && (
                <div className="mb-4 text-center">
                  <h4 className="text-xl font-semibold">
                    {tumblrBlog.title || tumblrBlog.name}
                  </h4>
                  <p className="text-sm text-gray-200">{tumblrBlog.url}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tumblrPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white text-gray-900 p-4 rounded-2xl shadow-xl"
                  >
                    <p className="font-semibold mb-2">
                      {post.summary || post.slug || '(Untitled post)'}
                    </p>
                    <small className="text-gray-500">
                      {new Date(post.date).toLocaleString()}
                    </small>
                  </div>
                ))}

                {tumblrPosts.length === 0 && !tumblrError && (
                  <p className="text-center col-span-full text-gray-200">
                    No Tumblr posts to display.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-6 text-xl">
              Please login with X to see your posts.
            </p>

            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-3">Tumblr Integration</h3>
              <p className="mb-4">
                You can still connect Tumblr (requires separate login):
              </p>
              <TumblrConnectButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
