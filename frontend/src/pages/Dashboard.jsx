// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import {
  getXUser,
  getXPosts,
  getTumblrPosts,
  getTumblrFeed,
  getYouTubeUser,
  getYouTubeFeed,
} from '../services/api';

export default function Dashboard() {
  // -------- X / Twitter state --------
  const [xUser, setXUser] = useState(null);
  const [xPosts, setXPosts] = useState([]);
  const [xLoading, setXLoading] = useState(false);
  const [xError, setXError] = useState(null);

  // -------- Tumblr state --------
  const [tumblrBlog, setTumblrBlog] = useState(null);
  const [tumblrPosts, setTumblrPosts] = useState([]);   // your own blog posts
  const [tumblrFeed, setTumblrFeed] = useState([]);     // dashboard feed
  const [tumblrLoading, setTumblrLoading] = useState(true);
  const [tumblrError, setTumblrError] = useState(null);

  // NEW: date filter for Tumblr feed
  const [tumblrDateFrom, setTumblrDateFrom] = useState('');
  const [tumblrDateTo, setTumblrDateTo] = useState('');

  // -------- YouTube state --------
  const [ytUser, setYtUser] = useState(null);
  const [ytFeed, setYtFeed] = useState([]);
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState(null);

  // --- Fetch X/Twitter data ---
  const fetchXData = async () => {
    if (xUser && xPosts.length > 0) return; // optional short-circuit

    setXLoading(true);
    setXError(null);

    try {
      const userRes = await getXUser();
      setXUser(userRes.data.data);

      const postsRes = await getXPosts();
      // /api/x/posts returns { data: [...] } from X, not { posts: [...] }
      setXPosts(postsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching X data:', err);
      setXError('Error fetching X data or not logged in.');
      setXUser(null);
      setXPosts([]);
    } finally {
      setXLoading(false);
    }
  };

  // --- Fetch Tumblr data (posts + feed) ---
  const fetchTumblrData = async () => {
    setTumblrLoading(true);
    setTumblrError(null);

    try {
      const postsRes = await getTumblrPosts();
      setTumblrBlog(postsRes.data.blog);
      setTumblrPosts(postsRes.data.posts || []);

      const feedRes = await getTumblrFeed();
      setTumblrFeed(feedRes.data.posts || []);
    } catch (err) {
      console.error('Error fetching Tumblr data:', err);
      setTumblrBlog(null);
      setTumblrPosts([]);
      setTumblrFeed([]);
      setTumblrError('Error fetching Tumblr posts/feed or not logged in.');
    } finally {
      setTumblrLoading(false);
    }
  };

  // --- Fetch YouTube data ---
  const fetchYouTubeData = async () => {
    setYtLoading(true);
    setYtError(null);

    try {
      const userRes = await getYouTubeUser();
      setYtUser(userRes.data.user);

      const feedRes = await getYouTubeFeed();
      setYtFeed(feedRes.data.feed || feedRes.data || []);
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
    fetchXData();
    fetchTumblrData();
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


  // Helper: apply date filter on Tumblr feed
  const filteredTumblrFeed = tumblrFeed
  // sort newest → oldest (just to be safe)
  .slice()
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  // filter by range
  .filter((post) => {
    if (!post.date) return false;
    const d = new Date(post.date);

    if (tumblrDateFrom && d < new Date(tumblrDateFrom)) return false;

    // include the whole "to" day by adding end-of-day time
    if (tumblrDateTo && d > new Date(tumblrDateTo + 'T23:59:59')) return false;

    return true;
  });




  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      <Navbar
        onLoginWithX={handleLoginWithX}
        onLoginWithTumblr={handleLoginWithTumblr}
        onLoginWithYouTube={handleLoginWithYouTube}
      />

      <div className="p-8 max-w-6xl mx-auto">
        {/* -------- X Section -------- */}
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

        {/* -------- Tumblr Section -------- */}
        <section className="mb-12">
          {tumblrLoading ? (
            <p className="text-center text-lg animate-pulse">Loading Tumblr...</p>
          ) : tumblrError ? (
            <p className="text-center text-red-200">{tumblrError}</p>
          ) : tumblrBlog || tumblrPosts.length > 0 || tumblrFeed.length > 0 ? (
            <>
              {tumblrBlog && (
                <>
                  <h2 className="text-3xl font-bold mb-4 text-center drop-shadow-lg">
                    Tumblr: {tumblrBlog.title || tumblrBlog.name}
                  </h2>
                  <p className="text-center text-sm text-gray-200 mb-6">
                    {tumblrBlog.url}
                  </p>
                </>
              )}

              {/* Your blog posts */}
              <h3 className="text-2xl font-semibold mb-3">Your Tumblr Posts</h3>
              {tumblrPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {tumblrPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white text-gray-900 p-4 rounded-2xl shadow-xl"
                    >
                      <p className="font-semibold mb-2">
                        {post.summary || post.slug || '(Untitled post)'}
                      </p>
                      <small className="text-gray-500">
                        {post.date ? new Date(post.date).toLocaleString() : ''}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-200 mb-8">
                  No Tumblr posts to display.
                </p>
              )}

              {/* Dashboard feed */}
              <h3 className="text-2xl font-semibold mb-3">Your Tumblr Feed</h3>

              {/* Date filter controls */}
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                <div className="flex flex-col items-start">
                  <label className="text-sm mb-1">From date</label>
                  <input
                    type="date"
                    value={tumblrDateFrom}
                    onChange={(e) => setTumblrDateFrom(e.target.value)}
                    className="text-gray-900 rounded px-2 py-1"
                  />
                </div>
                <div className="flex flex-col items-start">
                  <label className="text-sm mb-1">To date</label>
                  <input
                    type="date"
                    value={tumblrDateTo}
                    onChange={(e) => setTumblrDateTo(e.target.value)}
                    className="text-gray-900 rounded px-2 py-1"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTumblrDateFrom('');
                    setTumblrDateTo('');
                  }}
                  className="bg-white text-purple-700 font-semibold px-3 py-1 rounded-full shadow"
                >
                  Clear
                </button>
              </div>

              {filteredTumblrFeed.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTumblrFeed.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white text-gray-900 p-4 rounded-2xl shadow-xl"
                    >
                      <p className="font-semibold mb-1">
                        {post.summary || post.slug || '(Feed item)'}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">
                        Blog: {post.blog_name}
                      </p>
                      <small className="text-gray-500">
                        {post.date ? new Date(post.date).toLocaleString() : ''}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-200">
                  No Tumblr feed items to display for this date range.
                </p>
              )}
            </>
          ) : (
            <p className="text-center text-gray-200">
              Please log in with Tumblr to see posts and feed.
            </p>
          )}
        </section>


        {/* -------- YouTube Section -------- */}
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
                      {video.thumbnail && (
                        <img
                          src={video.thumbnail}
                          alt="thumbnail"
                          className="rounded-lg mb-3"
                        />
                      )}
                      <p className="font-bold mb-2">{video.title}</p>
                      <small className="text-gray-500">
                        {video.publishedAt
                          ? new Date(video.publishedAt).toLocaleString()
                          : ''}
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
