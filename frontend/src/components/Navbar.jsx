import React from 'react';
import { FaUserCircle, FaFilter } from 'react-icons/fa';

export default function Navbar({ onLoginWithX, onLoginWithMastodon }) {
  return (
    <nav className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-4 flex justify-between items-center shadow-lg">
      <div className="font-extrabold text-xl drop-shadow-lg">Social Media Integrator</div>

      <div className="flex items-center gap-4">
        {/* Filter button */}
        <button
          className="flex items-center gap-2 bg-white text-indigo-600 font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition transform hover:-translate-y-1 shadow-lg"
        >
          <FaFilter /> Filter
        </button>

        {/* Profile button */}
        <button
          className="flex items-center gap-2 bg-white text-purple-600 font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition transform hover:-translate-y-1 shadow-lg"
        >
          <FaUserCircle /> Profile
        </button>

        {/* Login buttons */}
        <button
          onClick={onLoginWithX}
          className="bg-white text-blue-500 font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition transform hover:-translate-y-1 shadow-lg"
        >
          Login with X
        </button>
        <button
          onClick={onLoginWithMastodon}
          className="bg-white text-green-500 font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition transform hover:-translate-y-1 shadow-lg"
        >
          Login with Mastodon
        </button>
      </div>
    </nav>
  );
}
