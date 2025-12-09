// frontend/src/components/Navbar.jsx
import React from 'react';
import { FaUserCircle, FaFilter } from 'react-icons/fa';

export default function Navbar({ onLoginWithX, onLoginWithTumblr, onLoginWithYouTube }) {
  return (
    <nav className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-4 flex justify-between items-center shadow-lg">
      <div className="font-extrabold text-xl drop-shadow-lg">Social Media Integrator</div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 bg-white text-indigo-600 font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition transform hover:-translate-y-1 shadow-lg">
          <FaFilter /> Filter
        </button>

        <button
          onClick={onLoginWithX}
          className="bg-white text-blue-500 font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition transform hover:-translate-y-1 shadow-lg"
        >
          Twitter X
        </button>

        <button
          onClick={onLoginWithTumblr}
          className="bg-white text-green-500 font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition transform hover:-translate-y-1 shadow-lg"
        >
          Tumblr
        </button>
          <button
          onClick={onLoginWithYouTube}
          className="bg-white text-red-600 font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition transform hover:-translate-y-1 shadow-lg"
        >
          YouTube
        </button>
      </div>
    </nav>
  );
}
