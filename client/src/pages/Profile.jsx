import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  name: '',
  phone: '',
  city: '',
  area: '',
  state: '',
  pincode: '',
};

const initialPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function Profile() {
  const { user, token, refreshUser } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token || !user) {
      setLoading(false);
      return;
    }

    setForm({
      name: user.name || '',
      phone: user.phone || '',
      city: user.city || '',
      area: user.area || '',
      state: user.state || '',
      pincode: user.pincode || '',
    });
    setLoading(false);
  }, [user, token]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handlePasswordChange = (event) => {
    setPasswordForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await api.put('/users/profile', form);
      await refreshUser();
      setSuccess('Profile updated successfully.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Profile update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setError('Please fill in all password fields.');
      return;
    }

    setPasswordSaving(true);

    try {
      await api.put('/users/profile/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm(initialPasswordForm);
      setSuccess('Password changed successfully.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Password update failed.');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!user && !loading) {
    return (
      <div className="page-shell">
        <div className="container">
          <div className="empty-state dashboard-card">
            <h3>Please log in to view your profile.</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container">
        <section className="dashboard-hero donor-dashboard-hero">
          <div>
            <span className="kicker">Your account</span>
            <h1>Profile settings</h1>
            <p>Update your personal details and keep your account information current.</p>
          </div>
          <div className="dashboard-hero-aside">
            <strong>{user?.name || 'User profile'}</strong>
            <span>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member'}</span>
          </div>
        </section>

        {(error || success) && (
          <div className={`form-card ${error ? 'error-message' : ''}`} style={{ marginBottom: '1rem', borderColor: error ? '#dc2626' : '#16a34a' }}>
            {error || success}
          </div>
        )}

        {loading ? (
          <div className="empty-state dashboard-card"><h3>Loading profile...</h3></div>
        ) : (
          <div className="form-grid" style={{ gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
            <form className="form-card" onSubmit={handleSaveProfile}>
              <h2>Personal information</h2>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="name">Full Name</label>
                  <input id="name" name="name" value={form.name} onChange={handleChange} required />
                </div>

                <div className="field">
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
                </div>

                <div className="field">
                  <label htmlFor="city">City</label>
                  <input id="city" name="city" value={form.city} onChange={handleChange} />
                </div>

                <div className="field">
                  <label htmlFor="area">Area</label>
                  <input id="area" name="area" value={form.area} onChange={handleChange} />
                </div>

                <div className="field">
                  <label htmlFor="state">State</label>
                  <input id="state" name="state" value={form.state} onChange={handleChange} />
                </div>

                <div className="field">
                  <label htmlFor="pincode">Pincode</label>
                  <input id="pincode" name="pincode" value={form.pincode} onChange={handleChange} />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save profile'}
                </button>
              </div>
            </form>

            <form className="form-card" onSubmit={handlePasswordSubmit}>
              <h2>Change password</h2>

              <div className="field">
                <label htmlFor="currentPassword">Current password</label>
                <div className="password-field">
                  <input id="currentPassword" name="currentPassword" type={showCurrentPassword ? 'text' : 'password'} value={passwordForm.currentPassword} onChange={handlePasswordChange} required />
                  <button type="button" className="password-toggle" onClick={() => setShowCurrentPassword((visible) => !visible)}>{showCurrentPassword ? 'Hide' : 'Show'}</button>
                </div>
              </div>

              <div className="field">
                <label htmlFor="newPassword">New password</label>
                <div className="password-field">
                  <input id="newPassword" name="newPassword" type={showNewPassword ? 'text' : 'password'} value={passwordForm.newPassword} onChange={handlePasswordChange} required />
                  <button type="button" className="password-toggle" onClick={() => setShowNewPassword((visible) => !visible)}>{showNewPassword ? 'Hide' : 'Show'}</button>
                </div>
              </div>

              <div className="field">
                <label htmlFor="confirmPassword">Confirm new password</label>
                <div className="password-field">
                  <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={passwordForm.confirmPassword} onChange={handlePasswordChange} required />
                  <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword((visible) => !visible)}>{showConfirmPassword ? 'Hide' : 'Show'}</button>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-secondary" disabled={passwordSaving}>
                  {passwordSaving ? 'Updating...' : 'Update password'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
