import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simple auth - password is "quanta"
    await new Promise(r => setTimeout(r, 500)); // Brief delay for effect
    
    if (password === 'quanta') {
      localStorage.setItem('quanta_auth', 'true');
      navigate('/');
    } else {
      setError('Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg">
        <div className="login-bg-gradient"></div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <span className="login-logo">⏱</span>
          <h1>QUANTA</h1>
          <p>Metrics Engine</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              disabled={loading}
            />
          </div>
          {error && <span className="error">{error}</span>}
          <button type="submit" disabled={loading}>
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>
        
        <p className="hint">Hint: quanta</p>
      </div>
    </div>
  );
}

export default Login;
