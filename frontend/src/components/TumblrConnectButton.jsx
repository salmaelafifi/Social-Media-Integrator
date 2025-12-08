// frontend/src/components/TumblrConnectButton.jsx
import React from 'react';

const API_BASE = 'http://localhost:3000';

export default function TumblrConnectButton() {
  const handleConnectTumblr = () => {
    // Redirect to backend Tumblr auth route
    window.location.href = `${API_BASE}/auth/tumblr/start`;
  };

  return (
    <button onClick={handleConnectTumblr}>
      Connect Tumblr
    </button>
  );
}
