import { useState } from 'react';
import { loginUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(email, password);
      console.log('Login success:', res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen 
      bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 
      animate-gradient-x text-white">

      {/* GLASS CARD */}
      <form 
        onSubmit={handleSubmit} 
        className="backdrop-blur-xl bg-white/20 p-10 rounded-3xl shadow-2xl 
          w-full max-w-sm border border-white/30 animate-fadeIn"
      >
        <h2 className="text-4xl font-extrabold mb-6 text-center drop-shadow-lg">
          Welcome Back 
        </h2>

        {error && (
          <p className="text-red-300 mb-4 text-center bg-red-500/20 p-2 rounded-lg">
            {error}
          </p>
        )}

        {/* EMAIL FIELD */}
        <div className="mb-6 relative group">
          <FaUser className="absolute top-3 left-3 text-white/70" />
          <input
            type="email"
            required
            className="w-full p-3 pl-10 rounded-xl bg-white/20 border border-white/30 
              placeholder-white/60 text-white focus:outline-none 
              focus:ring-2 focus:ring-pink-400 transition"
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        {/* PASSWORD FIELD */}
        <div className="mb-8 relative group">
          <FaLock className="absolute top-3 left-3 text-white/70" />
          <input
            type="password"
            required
            className="w-full p-3 pl-10 rounded-xl bg-white/20 border border-white/30 
              placeholder-white/60 text-white focus:outline-none 
              focus:ring-2 focus:ring-purple-400 transition"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {/* LOGIN BUTTON */}
        <button
          type="submit"
          className="w-full py-3 bg-white text-purple-700 font-bold rounded-xl 
            hover:bg-purple-100 transition transform hover:-translate-y-1 
            hover:shadow-lg active:scale-95"
        >
          Login 
        </button>

        {/* REGISTER LINK */}
        <p className="mt-6 text-center text-white/80">
          Don't have an account?
          <span 
            className="text-white font-semibold hover:underline cursor-pointer ml-1" 
            onClick={() => navigate('/register')}
          >
            Register 
          </span>
        </p>
      </form>

    </div>
  );
}
