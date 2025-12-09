// frontend/src/components/Navbar.jsx
import React from 'react';
import { FaFilter, FaTwitter, FaYoutube, FaTumblr, FaCloud } from 'react-icons/fa';

export default function Navbar({
  onLoginWithX,
  onLoginWithTumblr,
  onLoginWithYouTube,
  onLoginWithBluesky,
  onToggleFilters
}) {
  return (
    <nav className="
      backdrop-blur-lg bg-white/10 
      text-white p-4 
      flex justify-between items-center 
      shadow-xl border-b border-white/20
    ">
      {/* Left side — Logo */}
      <div className="font-extrabold text-2xl drop-shadow-md tracking-wide">
        <span className="text-white">Social</span>
        <span className="text-white">Hub</span>
      </div>

      {/* Right side — Buttons */}
      <div className="flex items-center gap-4">

        {/* Filter Button */}
        <button
          onClick={onToggleFilters}
          className="
            flex items-center gap-2 
            bg-white/20 backdrop-blur-md 
            text-white px-5 py-2 
            rounded-full font-semibold 
            hover:bg-white/30 transition-all 
            hover:-translate-y-1 shadow-md
          "
        >
          <FaFilter /> Filter
        </button>

        {/* Tumblr */}
        <button
          onClick={onLoginWithTumblr}
          className="
            flex items-center gap-2 
            bg-white text-green-600 
            px-4 py-2 rounded-full font-semibold 
            hover:bg-gray-100 transition-all 
            hover:-translate-y-1 shadow-md
          "
        >
          <FaTumblr /> Tumblr
        </button>

        {/* Bluesky */}
        <button
          onClick={onLoginWithBluesky}
          className="
            flex items-center gap-2 
            bg-white text-sky-600 
            px-4 py-2 rounded-full font-semibold 
            hover:bg-gray-100 transition-all 
            hover:-translate-y-1 shadow-md
          "
        >
          <FaCloud /> Bluesky
        </button>

        {/* Twitter/X — Disabled */}
        <button
          disabled
          className="
            relative flex items-center gap-2 
            bg-white text-blue-500 
            px-4 py-2 rounded-full font-semibold 
            opacity-60 cursor-not-allowed 
            shadow-md
          "
        >
          <FaTwitter /> Twitter/X
          <span
            className="
              absolute -top-2 -right-2 
              bg-yellow-300 text-black 
              text-xs font-bold px-2 py-0.5 
              rounded-full shadow-md
            "
          >
            Soon
          </span>
        </button>

        {/* YouTube — Disabled */}
        <button
          disabled
          className="
            relative flex items-center gap-2 
            bg-white text-red-600 
            px-4 py-2 rounded-full font-semibold 
            opacity-60 cursor-not-allowed 
            shadow-md
          "
        >
          <FaYoutube /> YouTube
          <span
            className="
              absolute -top-2 -right-2 
              bg-yellow-300 text-black 
              text-xs font-bold px-2 py-0.5 
              rounded-full shadow-md
            "
          >
            Soon
          </span>
        </button>

      </div>
    </nav>
  );
}
