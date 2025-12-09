// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getXUser, getXPosts, getTumblrPosts, getYouTubeUser, getYouTubeFeed, } from '../services/api';

export default function Dashboard() {
  const [xUser, setXUser] = useState(null);
  const [xPosts, setXPosts] = useState([]);
  const [xLoading, setXLoading] = useState(false);
  const [xError, setXError] = useState(null);

  const [tumblrBlog, setTumblrBlog] = useState(null);
  const [tumblrPosts, setTumblrPosts] = useState([]);
  const [tumblrLoading, setTumblrLoading] = useState(true);
  const [tumblrError, setTumblrError] = useState(null);


  const [ytUser, setYtUser] = useState(null);
  const [ytFeed, setYtFeed] = useState([]);
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState(null);

  // --- Fetch X/Twitter data ---
const fetchXData = async () => {
  if (xUser && xPosts.length > 0) return;  // ← OPTIONAL short‑circuit

  setXLoading(true);
  setXError(null);

  try {
    const userRes = await getXUser();
    setXUser(userRes.data.data);

    const postsRes = await getXPosts();
    setXPosts(postsRes.data.posts || []);

  } catch (err) {
    console.error("Error fetching X data:", err);
  } finally {
    setXLoading(false);
  }
};


  // --- Fetch Tumblr data ---
  const fetchTumblrData = async () => {
    setTumblrLoading(true);
    setTumblrError(null);

    try {
      const res = await getTumblrPosts();
      setTumblrBlog(res.data.blog);
      setTumblrPosts(res.data.posts || []);
    } catch (err) {
      console.error('Error fetching Tumblr data:', err);
      setTumblrBlog(null);
      setTumblrPosts([]);
      setTumblrError('Error fetching Tumblr posts or not logged in.');
    } finally {
      setTumblrLoading(false);
    }
  };

   const fetchYouTubeData = async () => {
    setYtLoading(true);
    setYtError(null);

    try {
      const userRes = await getYouTubeUser();
      setYtUser(userRes.data.user);

      const feedRes = await getYouTubeFeed();
      setYtFeed(feedRes.data.feed || []);
    } catch (err) {
      console.error('Error fetching YouTube data:', err);
      setYtUser(null);
      setYtFeed([]);
      setYtError('Error loading YouTube feed or not logged in.');
    } finally {
      setYtLoading(false);
    }
  };

  useEffect(() => {
    fetchTumblrData();
    fetchXData();
    fetchYouTubeData();

  }, []);

  // --- Login handlers for Navbar ---
  const handleLoginWithX = () => {
    window.location.href = 'http://localhost:3000/auth/x/start';
  };

  const handleLoginWithTumblr = () => {
    window.location.href = 'http://localhost:3000/auth/tumblr/start';
  };

  const handleLoginWithYouTube = () => {
    window.location.href = 'http://localhost:3000/auth/youtube/start';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      <Navbar
        onLoginWithX={handleLoginWithX}
        onLoginWithTumblr={handleLoginWithTumblr}
        onLoginWithYouTube={handleLoginWithYouTube}
      />

      <div className="p-8 max-w-6xl mx-auto">
        {/* --- X Section --- */}
        <section className="mb-12">
          {xLoading ? (
            <p className="text-center text-lg animate-pulse">Loading X data...</p>
          ) : xError ? (
            <p className="text-center text-red-200">{xError}</p>
          ) : xUser ? (
            <>
              <h2 className="text-4xl font-extrabold mb-4 text-center drop-shadow-lg">
                Hello, {xUser.username || xUser.name}
              </h2>
              <p className="text-lg text-center drop-shadow-md mb-6">
                Latest posts from X
              </p>

              {xPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {xPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white text-gray-800 p-6 rounded-3xl shadow-2xl transform transition hover:-translate-y-2 hover:shadow-3xl"
                    >
                      <p className="mb-4">{post.text}</p>
                      <small className="text-gray-500">
                        {new Date(post.created_at).toLocaleString()}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-200">No X posts to display.</p>
              )}
            </>
          ) : (
            <p className="text-center text-gray-200">
              Please log in with X to see your posts.
            </p>
          )}
        </section>

        {/* --- Tumblr Section --- */}
        <section>
          {tumblrLoading ? (
            <p className="text-center text-lg animate-pulse">Loading Tumblr posts...</p>
          ) : tumblrError ? (
            <p className="text-center text-red-200">{tumblrError}</p>
          ) : tumblrBlog ? (
            <>
              <h2 className="text-3xl font-bold mb-4 text-center drop-shadow-lg">
                Tumblr: {tumblrBlog.title || tumblrBlog.name}
              </h2>
              <p className="text-center text-sm text-gray-200 mb-6">{tumblrBlog.url}</p>

              {tumblrPosts.length > 0 ? (
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
                </div>
              ) : (
                <p className="text-center text-gray-200">No Tumblr posts to display.</p>
              )}
            </>
          ) : (
            <p className="text-center text-gray-200">
              Please log in with Tumblr to see posts.
            </p>
          )}
        </section>

        {/* ===================== YOUTUBE SECTION ===================== */}
        <section className="mb-16">
          {ytLoading ? (
            <p className="text-center text-lg animate-pulse">Loading YouTube...</p>
          ) : ytError ? (
            <p className="text-center text-red-200">{ytError}</p>
          ) : ytUser ? (
            <>
              <h2 className="text-3xl font-bold mb-4 text-center">
                YouTube: {ytUser.name}
              </h2>
              <p className="text-center text-gray-200 mb-6">
                Channel: {ytUser.channelId}
              </p>

              {ytFeed.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ytFeed.map((video) => (
                    <div
                      key={video.id}
                      className="bg-white text-gray-900 rounded-2xl p-4 shadow-xl"
                    >
                      <img
                        src={video.thumbnail}
                        alt="thumbnail"
                        className="rounded-lg mb-3"
                      />
                      <p className="font-bold mb-2">{video.title}</p>
                      <small className="text-gray-500">
                        {new Date(video.publishedAt).toLocaleString()}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center">No YouTube feed found.</p>
              )}
            </>
          ) : (
            <p className="text-center">Log in with YouTube to view feed.</p>
          )}
        </section>
      </div>
    </div>
  );
}
