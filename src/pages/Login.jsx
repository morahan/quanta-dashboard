import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple auth - password is "quanta"
    if (password === 'quanta') {
      localStorage.setItem('quanta_auth', 'true');
      navigate('/');
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🔐 Quanta</h1>
        <p>Enter your password</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
          />
          {error && <span className="error">{error}</span>}
          <button type="submit">Sign In</button>
        </form>
        <p className="hint">Hint: quanta</p>
      </div>
    </div>
  );
}

export default Login;
