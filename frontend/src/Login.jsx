import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'hemk3672@gmail.com' && password === 'HEMkumar33#') {
      localStorage.setItem('role', 'admin');
      navigate('/admin');
    } else if (email === 'sivaraj@gmail.com' && password === 'Sivaraj33#') {
      localStorage.setItem('role', 'user');
      localStorage.setItem('userId', 'sivaraj_1'); // unique ID for sivaraj
      navigate('/user');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="glass-panel login-container">
      <h1>Trackr</h1>
      <p>Sign in to your account</p>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn">Sign In</button>
      </form>
      {error && (
        <div style={{ color: 'var(--danger)', marginTop: '1rem' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default Login;
