import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white animate-fadeIn">
      <h1 className="text-5xl font-extrabold mb-8 drop-shadow-lg">Social Media Integrator</h1>
      <p className="text-lg mb-12 drop-shadow-md">Connect all your social accounts in one place</p>

      <div className="flex space-x-4 w-full max-w-xs">
        <Link to="/login" className="flex-1 text-center px-8 py-4 bg-white text-indigo-600 font-bold rounded-full hover:bg-gray-100 transition transform hover:-translate-y-1 shadow-lg">
          Login
        </Link>
        <Link to="/register" className="flex-1 text-center px-8 py-4 bg-white text-purple-600 font-bold rounded-full hover:bg-gray-100 transition transform hover:-translate-y-1 shadow-lg">
          Register
        </Link>
      </div>
    </div>
  );
}
