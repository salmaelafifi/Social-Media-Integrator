// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Loader from "../components/Loader";

import {
  getXUser,
  getXPosts,
  getTumblrPosts,
  getTumblrFeed,
  getYouTubeUser,
  getYouTubeFeed,
  getBlueskyUser,
  getBlueskyFeed
} from '../services/api';

export default function Dashboard() {
  // -------- X / Twitter state --------
  const [xUser, setXUser] = useState(null);
  const [xPosts, setXPosts] = useState([]);
  const [xLoading, setXLoading] = useState(false);
  const [xError, setXError] = useState(null);

  // -------- Tumblr state --------
  const [tumblrBlog, setTumblrBlog] = useState(null);
  const [tumblrPosts, setTumblrPosts] = useState([]);
  const [tumblrFeed, setTumblrFeed] = useState([]);
  const [tumblrLoading, setTumblrLoading] = useState(true);
  const [tumblrError, setTumblrError] = useState(null);

  // -------- YouTube state --------
  const [ytUser, setYtUser] = useState(null);
  const [ytFeed, setYtFeed] = useState([]);
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState(null);

  // -------- Bluesky state --------
  const [bskyUser, setBskyUser] = useState(null);
  const [bskyFeed, setBskyFeed] = useState([]);
  const [bskyLoading, setBskyLoading] = useState(false);
  const [bskyError, setBskyError] = useState(null);

  // -------- Unified Filter State --------
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    tumblr: true,
    youtube: true,
    bluesky: true,
    twitter: true
  });
  const [selectedAuthor, setSelectedAuthor] = useState('');

  // --- Fetch X/Twitter data ---
  const fetchXData = async () => {
    if (xUser && xPosts.length > 0) return;
    setXLoading(true);
    setXError(null);

    try {
      const userRes = await getXUser();
      setXUser(userRes.data.data);

      const postsRes = await getXPosts();
      setXPosts(postsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching X data:', err);
      setXUser(null);
      setXPosts([]);
    } finally {
      setXLoading(false);
    }
  };

  // --- Fetch Tumblr data ---
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
      setTumblrError('Please log in with Tumblr to see your posts and feed.');
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
    } finally {
      setYtLoading(false);
    }
  };

  // --- Fetch Bluesky data ---
  const fetchBlueskyData = async () => {
    setBskyLoading(true);
    setBskyError(null);

    try {
      const userRes = await getBlueskyUser();
      setBskyUser(userRes.data);

      const feedRes = await getBlueskyFeed();
      setBskyFeed(feedRes.data);
    } catch (err) {
      setBskyUser(null);
      setBskyFeed([]);
      setBskyError("Please log in with Bluesky to see your feed.");
    } finally {
      setBskyLoading(false);
    }
  };

  useEffect(() => {
    fetchXData();
    fetchTumblrData();
    fetchYouTubeData();
    fetchBlueskyData();
  }, []);

  // --- Login handlers ---
  const handleLoginWithX = () => {
    window.location.href = 'http://localhost:3000/auth/x/start';
  };

  const handleLoginWithTumblr = () => {
    window.location.href = 'http://localhost:3000/auth/tumblr/start';
  };

  const handleLoginWithYouTube = () => {
    window.location.href = 'http://localhost:3000/auth/youtube/start';
  };

  const handleLoginWithBluesky = () => {
    window.location.href = "http://localhost:3000/auth/bluesky/login";
  };

  // --- Normalize all posts to unified format ---
  const normalizedPosts = [
    // Tumblr posts
    ...tumblrFeed.map(post => ({
      id: `tumblr-${post.id}`,
      platform: 'tumblr',
      text: post.summary || post.slug || '(Feed item)',
      author: post.blog_name,
      date: post.timestamp ? new Date(post.timestamp * 1000) : null,
      thumbnail: null,
      platformColor: 'bg-pink-500',
    })),
    // YouTube posts
    ...ytFeed.map(video => ({
      id: `youtube-${video.id}`,
      platform: 'youtube',
      text: video.title,
      author: ytUser?.name || 'YouTube',
      date: video.publishedAt ? new Date(video.publishedAt) : null,
      thumbnail: video.thumbnail,
      platformColor: 'bg-red-600',
    })),
    
    // Bluesky posts
    ...bskyFeed.map(item => ({
      id: `bluesky-${item.post.uri}`,
      platform: 'bluesky',
      text: item.post?.record?.text || "(No text)",
      author: item.post?.author?.displayName || item.post?.author?.handle || 'Bluesky User',
      date: item.post?.record?.createdAt ? new Date(item.post.record.createdAt) : null,
      thumbnail: null,
      platformColor: 'bg-sky-500',
    })),
    // Twitter/X posts
    ...xPosts.map(post => ({
      id: `twitter-${post.id}`,
      platform: 'twitter',
      text: post.text,
      author: xUser?.username || xUser?.name || 'X User',
      date: post.created_at ? new Date(post.created_at) : null,
      thumbnail: null,
      platformColor: 'bg-gray-800',
    }))
  ];

  // --- Get unique authors ---
  const allAuthors = Array.from(
    new Set(normalizedPosts.map(p => p.author).filter(Boolean))
  ).sort();

  // --- Apply filters ---
  const filteredPosts = normalizedPosts
    .filter(post => {
      // Platform filter
      if (!selectedPlatforms[post.platform]) return false;

      // Date filter
      if (post.date) {
        if (dateFrom && post.date < new Date(dateFrom)) return false;
        if (dateTo && post.date > new Date(dateTo + 'T23:59:59')) return false;
      }

      // Author filter
      if (selectedAuthor && post.author !== selectedAuthor) return false;

      return true;
    })
    .sort((a, b) => {
      // Sort by date, newest first
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date - a.date;
    });

  // --- Toggle platform filter ---
  const togglePlatform = (platform) => {
    setSelectedPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  // --- Clear all filters ---
  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedAuthor('');
    setSelectedPlatforms({
      tumblr: true,
      youtube: true,
      bluesky: true,
      twitter: true
    });
  };

  const isLoading = tumblrLoading || ytLoading || bskyLoading || xLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      <Navbar
        onLoginWithX={handleLoginWithX}
        onLoginWithTumblr={handleLoginWithTumblr}
        onLoginWithYouTube={handleLoginWithYouTube}
        onLoginWithBluesky={handleLoginWithBluesky}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      <div className="p-8 max-w-6xl mx-auto">
        <div className="bg-yellow-300 text-black text-center py-3 rounded-xl font-semibold mb-6 shadow-lg">
          ⚠️ YouTube & Twitter integrations are still under construction. More features coming soon!
        </div>
        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white text-gray-900 rounded-2xl p-6 mb-8 shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">Filter Posts</h3>
            
            {/* Platform Selection */}
            <div className="mb-4">
              <label className="block font-semibold mb-2">Platforms</label>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => togglePlatform('tumblr')}
                  className={`px-4 py-2 rounded-full font-semibold transition ${
                    selectedPlatforms.tumblr
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  Tumblr
                </button>
                <button
                  onClick={() => togglePlatform('bluesky')}
                  className={`px-4 py-2 rounded-full font-semibold transition ${
                    selectedPlatforms.bluesky
                      ? 'bg-sky-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  Bluesky
                </button>
                  {/* YouTube under construction */}
                  <button
                    disabled
                    title="YouTube integration is under construction"
                    className="px-4 py-2 rounded-full font-semibold bg-gray-300 
                              text-gray-500 cursor-not-allowed opacity-60"
                  >
                    YouTube 🚧
                </button>

                {/* Twitter under construction */}
                <button
                  disabled
                  title="Twitter/X integration is under construction"
                  className="px-4 py-2 rounded-full font-semibold bg-gray-300 
                            text-gray-500 cursor-not-allowed opacity-60"
                >
                  Twitter 🚧
                </button>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-semibold mb-2">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 border border-gray-300"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 border border-gray-300"
                />
              </div>
            </div>

            {/* Author Selection */}
            <div className="mb-4">
              <label className="block font-semibold mb-2">Author / Account</label>
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="w-full rounded-lg px-3 py-2 border border-gray-300"
              >
                <option value="">All Authors</option>
                {allAuthors.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Button */}
            <button
              onClick={clearFilters}
              className="bg-purple-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-purple-700 transition"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Unified Feed */}
        <section>
          <h2 className="text-4xl font-extrabold mb-6 text-center drop-shadow-lg">
            Your Social Media Feed
          </h2>

          {isLoading ? (
            <div className="flex justify-center my-12">
                <Loader />
            </div>          
            ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white text-gray-900 rounded-2xl shadow-2xl overflow-hidden transform transition hover:-translate-y-2 hover:shadow-3xl"
                >
                  {/* Platform Badge */}
                  <div className={`${post.platformColor} text-white px-4 py-2 font-bold flex items-center gap-2`}>
                    <span>{post.platformIcon}</span>
                    <span className="uppercase text-sm tracking-wide">
                      {post.platform}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {post.thumbnail && (
                      <img
                        src={post.thumbnail}
                        alt="thumbnail"
                        className="rounded-lg mb-3 w-full"
                      />
                    )}
                    <p className="font-semibold mb-2 line-clamp-3">{post.text}</p>
                    <p className="text-sm text-gray-600 mb-1">
                      By: {post.author}
                    </p>
                    <small className="text-gray-500">
                      {post.date ? post.date.toLocaleString() : 'No date'}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-200 text-lg">
              No posts to display. Try adjusting your filters or log in to more platforms.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}