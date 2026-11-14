import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const emptyForm = { title: '', category: 'Food', description: '', quantity: '', unit: 'items', condition: 'Good', expiryDate: '', pickupPreference: '', city: '', area: '', state: '', pincode: '', latitude: '', longitude: '' };

function DonorDashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [deletingDonationId, setDeletingDonationId] = useState('');
  const [locationMessage, setLocationMessage] = useState('');

  const loadDonations = async () => {
    try {
      const response = await api.get('/donations/my-donations');
      setDonations(response.data.donations);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your donations.');
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await api.get('/requests/received');
      setRequests(response.data.requests || []);
    } catch (err) {
      setRequestError(err.response?.data?.message || 'Could not load received requests.');
    }
  };

  useEffect(() => {
    loadDonations();
    loadRequests();
  }, []);

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location services are not supported by this browser.');
      return;
    }

    setLocationMessage('Locating...');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((current) => ({ ...current, latitude: String(coords.latitude), longitude: String(coords.longitude) }));
        setLocationMessage('Location added. This donation will appear on the nearby map.');
      },
      () => setLocationMessage('Location access was not allowed. You can publish without map coordinates.')
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await api.post('/donations', form);
      setForm(emptyForm);
      setShowForm(false);
      setLoading(true);
      await loadDonations();
    } catch (err) {
      setError(err.response?.data?.message || 'Donation could not be created.');
    }
  };

  const handleDeleteDonation = async (donation) => {
    const confirmed = window.confirm(`Delete "${donation.title}"? It will no longer be available to receivers.`);
    if (!confirmed) return;

    setError('');
    setDeletingDonationId(donation._id);
    try {
      await api.delete(`/donations/${donation._id}`);
      await loadDonations();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete this donation.');
    } finally {
      setDeletingDonationId('');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await api.put(`/requests/${requestId}/accept`);
      await loadRequests();
      await loadDonations();
    } catch (err) {
      setRequestError(err.response?.data?.message || 'Could not accept this request.');
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await api.put(`/requests/${requestId}/decline`);
      await loadRequests();
    } catch (err) {
      setRequestError(err.response?.data?.message || 'Could not decline this request.');
    }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <section className="dashboard-hero donor-dashboard-hero">
          <div>
            <span className="kicker">Donor workspace</span>
            <h1>Welcome back, {user?.name || 'Donor'}</h1>
            <p>Your generosity starts here. Publish useful resources and keep every handover organized.</p>
            <div className="dashboard-actions">
              <button className="btn btn-primary" type="button" onClick={() => setShowForm((visible) => !visible)}>{showForm ? 'Close Form' : 'Add Donation'}</button>
              <a className="btn btn-light" href="/how-it-works">How It Works</a>
            </div>
          </div>
          <div className="dashboard-hero-aside">
            <span className="status-dot" />
            <strong>Ready to make an impact?</strong>
            <span>Every published item can reach someone nearby.</span>
          </div>
        </section>
        <div className="dashboard-stat-grid">
          <div className="dashboard-stat"><span>Published donations</span><strong>{donations.length}</strong></div>
          <div className="dashboard-stat"><span>Currently available</span><strong>{donations.filter((donation) => donation.status === 'AVAILABLE').length}</strong></div>
          <div className="dashboard-stat"><span>Completed handovers</span><strong>{donations.filter((donation) => donation.status === 'COMPLETED').length}</strong></div>
          <div className="dashboard-stat"><span>Account status</span><strong>{user?.verificationStatus === 'VERIFIED' ? 'Verified' : 'Pending'}</strong></div>
        </div>
        {error && <p className="error-message">{error}</p>}
        {showForm && <form className="form-card donation-form" onSubmit={handleSubmit}>
          <h2>Publish a donation</h2>
          <div className="form-grid">
            <div className="field"><label htmlFor="title">Title</label><input id="title" name="title" value={form.title} onChange={handleChange} required /></div>
            <div className="field"><label htmlFor="category">Category</label><select id="category" name="category" value={form.category} onChange={handleChange}><option>Food</option><option>Clothes</option><option>Books</option><option>Electronics</option><option>Furniture</option><option>Medicines</option><option>School Supplies</option><option>Household Items</option><option>Financial Assistance</option><option>Other</option></select></div>
            <div className="field full"><label htmlFor="description">Description</label><textarea id="description" name="description" value={form.description} onChange={handleChange} required rows="3" /></div>
            <div className="field"><label htmlFor="quantity">Quantity</label><input id="quantity" name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} required /></div>
            <div className="field"><label htmlFor="unit">Unit</label><input id="unit" name="unit" value={form.unit} onChange={handleChange} required /></div>
            <div className="field"><label htmlFor="condition">Condition</label><select id="condition" name="condition" value={form.condition} onChange={handleChange}><option>New</option><option>Good</option><option>Used</option></select></div>
            <div className="field"><label htmlFor="expiryDate">Expiry date (optional)</label><input id="expiryDate" name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} /></div>
            <div className="field"><label htmlFor="city">City</label><input id="city" name="city" value={form.city} onChange={handleChange} required /></div>
            <div className="field"><label htmlFor="area">Area</label><input id="area" name="area" value={form.area} onChange={handleChange} /></div>
            <div className="field"><label htmlFor="state">State</label><input id="state" name="state" value={form.state} onChange={handleChange} /></div>
            <div className="field"><label htmlFor="pincode">Pincode</label><input id="pincode" name="pincode" value={form.pincode} onChange={handleChange} /></div>
            <div className="field full"><label htmlFor="pickupPreference">Pickup preference</label><input id="pickupPreference" name="pickupPreference" value={form.pickupPreference} onChange={handleChange} placeholder="Example: Weekends, local pickup" /></div>
            <div className="field full location-field">
              <button className="btn btn-light" type="button" onClick={handleUseLocation}>Use current location for map</button>
              {locationMessage && <span className="field-hint">{locationMessage}</span>}
            </div>
          </div>
          <div className="form-actions"><button className="btn btn-primary" type="submit">Publish Donation</button></div>
        </form>}
        <div className="content-heading"><div><span className="kicker">Your activity</span><h2>Your donations</h2></div><span className="muted-label">{donations.length} total</span></div>
        {loading ? <p>Loading your donations...</p> : donations.length === 0 ? <div className="empty-state dashboard-card"><h3>You have not added any donations</h3><p>Use Add Donation to publish your first real donation.</p></div> : <div className="list-grid">{donations.map((donation) => <article className="dashboard-card" key={donation._id}><div className="card-header"><h3>{donation.title}</h3><span className="kicker">{donation.status}</span></div><p>{donation.description}</p><p><strong>Available:</strong> {donation.remainingQuantity} {donation.unit}</p><p><strong>Location:</strong> {donation.city}{donation.area ? `, ${donation.area}` : ''}</p>{donation.status !== 'CANCELLED' && donation.status !== 'COMPLETED' && <div className="form-actions"><button type="button" className="btn btn-light" onClick={() => handleDeleteDonation(donation)} disabled={deletingDonationId === donation._id}>{deletingDonationId === donation._id ? 'Deleting...' : 'Delete donation'}</button></div>}</article>)}</div>}

        <div className="content-heading" style={{ marginTop: '2rem' }}>
          <div>
            <span className="kicker">Incoming requests</span>
            <h2>Donation requests</h2>
          </div>
        </div>

        {requestError && <p className="error-message">{requestError}</p>}
        {requests.length === 0 ? (
          <div className="empty-state dashboard-card"><h3>No requests yet</h3><p>When a receiver asks for a donation, it will appear here with contact information and action buttons.</p></div>
        ) : (
          <div className="list-grid">
            {requests.map((request) => {
              const receiver = request.receiverId || {};
              return (
                <article className="dashboard-card" key={request._id}>
                  <div className="card-header">
                    <h3>{request.donationId?.title || 'Donation'}</h3>
                    <span className="kicker">{request.status}</span>
                  </div>

                  <p><strong>Receiver:</strong> {receiver.name || 'Unknown'}</p>
                  <p><strong>Quantity:</strong> {request.requestedQuantity}</p>
                  <p><strong>Reason:</strong> {request.reason}</p>
                  {request.message && <p><strong>Message:</strong> {request.message}</p>}

                  <div className="receiver-contact">
                    <span className="receiver-contact-label">Contact receiver</span>
                    {receiver.phone ? (
                      <a href={`tel:${receiver.phone}`} aria-label={`Call ${receiver.name || 'receiver'} at ${receiver.phone}`}>
                        <span className="receiver-contact-icon" aria-hidden="true">☎</span>
                        <strong>{receiver.phone}</strong>
                      </a>
                    ) : (
                      <span className="receiver-contact-unavailable">Phone number not available</span>
                    )}
                  </div>

                  <div className="form-actions" style={{ marginTop: '0.75rem' }}>
                    {receiver.phone && <a className="btn btn-primary" href={`tel:${receiver.phone}`}>Call receiver</a>}
                    {receiver.email && <a className="btn btn-light" href={`mailto:${receiver.email}`}>Email receiver</a>}
                  </div>

                  {request.status === 'PENDING' && (
                    <div className="form-actions" style={{ marginTop: '0.75rem' }}>
                      <button type="button" className="btn btn-primary" onClick={() => handleAcceptRequest(request._id)}>Accept</button>
                      <button type="button" className="btn btn-light" onClick={() => handleDeclineRequest(request._id)}>Decline</button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default DonorDashboard;
