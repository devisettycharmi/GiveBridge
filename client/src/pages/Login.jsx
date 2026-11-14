import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login(formData);
      if (result.user.role === 'donor') navigate('/donor/dashboard');
      else if (result.user.role === 'receiver') navigate('/receiver/dashboard');
      else navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="page-shell">
      <div className="container auth-grid">
        <div className="auth-panel">
          <span className="kicker">Welcome back</span>
          <h1>Sign in to GiveBridge</h1>
          <p>Access your dashboard, manage donations, and track requests in one place.</p>
        </div>

        <div className="form-card">
          <h2>Login</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="field full">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>

            <div className="field full">
              <label htmlFor="password">Password</label>
              <div className="password-field">
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="Enter your password" required />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Hide' : 'Show'}</button>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Login</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
