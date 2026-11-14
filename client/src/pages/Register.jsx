import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const initialState = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'receiver',
  city: '',
  area: '',
  state: '',
  pincode: '',
};

function Register({ role: roleProp }) {
  const { role: roleParam } = useParams();
  const selectedRole = roleProp || roleParam;
  const [formData, setFormData] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const result = await register({ ...formData, role: selectedRole });
      if (result.user.role === 'donor') navigate('/donor/dashboard');
      else if (result.user.role === 'receiver') navigate('/receiver/dashboard');
      else navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="page-shell">
      <div className="container auth-grid">
        <div className="auth-panel">
          <span className="kicker">{selectedRole ? `Create a ${selectedRole} account` : 'Choose your account'}</span>
          <h1>{selectedRole ? `Join GiveBridge as a ${selectedRole}` : 'How will you use GiveBridge?'}</h1>
          <p>{selectedRole ? (selectedRole === 'donor' ? 'Share useful resources with people nearby.' : 'Find support from verified community donors.') : 'Choose the experience that matches what you want to do.'}</p>
        </div>

        <div className="form-card">
          {!selectedRole ? (
            <div className="role-choice">
              <h2>Create your account</h2>
              <Link className="btn btn-primary" to="/register/donor">I want to donate</Link>
              <Link className="btn btn-light" to="/register/receiver">I need support</Link>
            </div>
          ) : <>
          <h2>{selectedRole === 'donor' ? 'Donor sign up' : 'Receiver sign up'}</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="name">Full Name</label>
                <input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" required />
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
              </div>

              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" required />
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <div className="password-field">
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="Create a password" required />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Hide' : 'Show'}</button>
                </div>
              </div>

              <div className="field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-field">
                  <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required />
                  <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword((visible) => !visible)}>{showConfirmPassword ? 'Hide' : 'Show'}</button>
                </div>
              </div>

              <div className="field">
                <label htmlFor="city">City</label>
                <input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Warangal" />
              </div>

              <div className="field">
                <label htmlFor="area">Area</label>
                <input id="area" name="area" value={formData.area} onChange={handleChange} placeholder="Hanamkonda" />
              </div>

              <div className="field">
                <label htmlFor="state">State</label>
                <input id="state" name="state" value={formData.state} onChange={handleChange} placeholder="Telangana" />
              </div>

              <div className="field">
                <label htmlFor="pincode">Pincode</label>
                <input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="506001" />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Create Account</button>
            </div>
          </form>
          </>}
        </div>
      </div>
    </div>
  );
}

export default Register;
