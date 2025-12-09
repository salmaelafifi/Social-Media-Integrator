import { useState } from 'react';
import { registerUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-green-400 via-lime-400 to-emerald-400">

      {/* --- Floating Blobs --- */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-white/20 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute -bottom-20 -right-16 w-80 h-80 bg-green-300/30 rounded-full blur-3xl animate-float"></div>

      {/* --- Registration Form --- */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white/20 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-sm animate-fadeIn border border-white/30"
      >
        <h2 className="text-3xl font-extrabold mb-8 text-center text-white drop-shadow-lg">
          Create an Account
        </h2>

        {error && (
          <p className="text-red-700 bg-red-100/80 py-2 mb-4 text-center rounded-lg">
            {error}
          </p>
        )}

        <div className="mb-4 relative">
          <FaEnvelope className="absolute top-3 left-3 text-white/80" />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 pl-10 rounded-xl bg-white/30 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/70 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-6 relative">
          <FaLock className="absolute top-3 left-3 text-white/80" />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 pl-10 rounded-xl bg-white/30 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/70 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-white/90 text-green-700 font-semibold rounded-xl hover:bg-white transition transform hover:-translate-y-1 shadow-lg"
        >
          Register
        </button>

        <p className="mt-6 text-center text-white/80">
          Already have an account?{' '}
          <span
            className="text-white font-semibold hover:underline cursor-pointer"
            onClick={() => navigate('/login')}
          >
            Login
          </span>
        </p>
      </form>

      {/* --- Animations --- */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
          }
          .animate-float {
            animation: float 5s ease-in-out infinite;
          }
          @keyframes fadeIn {
            from {opacity: 0; transform: translateY(20px);}
            to {opacity: 1; transform: translateY(0);}
          }
          .animate-fadeIn {
            animation: fadeIn 1s ease forwards;
          }
        `}
      </style>
    </div>
  );
}
