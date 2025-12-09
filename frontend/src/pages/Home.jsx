import { Link } from 'react-router-dom';
import { FaRocket, FaSmileBeam, FaHashtag } from "react-icons/fa";

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen 
      bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white overflow-hidden">

      {/* Floating emojis */}
      <div className="absolute top-10 left-10 text-5xl opacity-30 animate-bounce">
        🚀
      </div>
      <div className="absolute bottom-10 right-10 text-5xl opacity-30 animate-spin-slow">
        💬
      </div>
      <div className="absolute top-20 right-20 text-5xl opacity-30 animate-float">
        ⭐
      </div>

      {/* Main Title */}
      <h1 className="text-6xl font-extrabold mb-6 drop-shadow-2xl flex items-center gap-4 animate-fadeIn">
        <FaRocket className="text-yellow-300 animate-pulse" />
        Social Media Integrator
      </h1>

      <p className="text-xl mb-10 opacity-90 animate-slideUp">
        All your socials. One magical dashboard. ✨
      </p>

      {/* Login Button */}
      <Link
        to="/login"
        className="px-12 py-4 bg-white text-indigo-600 font-bold rounded-full 
        hover:bg-gray-100 transition transform hover:-translate-y-2 hover:shadow-2xl 
        shadow-lg text-lg animate-bounce"
      >
        Get Started !
      </Link>

      {/* Decorative bottom icons */}
      <div className="absolute bottom-6 flex gap-6 opacity-50">
        <FaSmileBeam size={30} />
        <FaHashtag size={30} />
        <FaRocket size={30} />
      </div>
    </div>
  );
}
