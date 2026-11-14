import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function ReceiverDashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [requestError, setRequestError] = useState('');

  const loadRequests = async () => {
    try {
      const response = await api.get('/requests/my-requests');
      setRequests(response.data.requests || []);
    } catch (err) {
      setRequestError(err.response?.data?.message || 'Could not load your requests.');
    }
  };

  useEffect(() => {
    api.get('/donations')
      .then((response) => setDonations(response.data.donations))
      .catch((err) => setError(err.response?.data?.message || 'Could not load available donations.'));

    loadRequests();
  }, []);

  const handleCancelRequest = async (requestId) => {
    try {
      await api.put(`/requests/${requestId}/cancel`);
      await loadRequests();
    } catch (err) {
      setRequestError(err.response?.data?.message || 'Could not cancel the request.');
    }
  };

  const handleCompleteRequest = async (requestId) => {
    try {
      await api.put(`/requests/${requestId}/complete`);
      await loadRequests();
    } catch (err) {
      setRequestError(err.response?.data?.message || 'Could not mark the request as completed.');
    }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <section className="dashboard-hero receiver-dashboard-hero">
          <div>
            <span className="kicker">Receiver workspace</span>
            <h1>Welcome back, {user?.name || 'Receiver'}</h1>
            <p>Find useful support near {user?.city || 'your community'} and follow your next step with confidence.</p>
            <div className="dashboard-actions">
              <a className="btn btn-primary" href="/donations">Browse donations</a>
              <a className="btn btn-light" href="/how-it-works">How It Works</a>
            </div>
          </div>
          <div className="dashboard-hero-aside receiver-aside"><strong>Looking for something specific?</strong><span>Browse verified listings and find support close to home.</span></div>
        </section>
        <div className="dashboard-stat-grid">
          <div className="dashboard-stat"><span>Available nearby</span><strong>{donations.length}</strong></div>
          <div className="dashboard-stat"><span>Your city</span><strong>{user?.city || 'Not set'}</strong></div>
          <div className="dashboard-stat"><span>Account status</span><strong>{user?.verificationStatus === 'VERIFIED' ? 'Verified' : 'Pending'}</strong></div>
          <div className="dashboard-stat"><span>Next step</span><strong>Explore</strong></div>
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="content-heading"><div><span className="kicker">Community listings</span><h2>Available donations</h2></div><span className="muted-label">Updated from GiveBridge</span></div>
        {donations.length === 0 && !error ? <div className="empty-state dashboard-card"><h3>No donations are available yet</h3><p>Verified donor listings will appear here after someone publishes a donation.</p></div> : <div className="list-grid">{donations.map((donation) => <article className="dashboard-card donation-listing" key={donation._id}><div className="card-header"><div><span className="listing-category">{donation.category}</span><h3>{donation.title}</h3></div><span className="kicker">{donation.status}</span></div><p>{donation.description}</p><div className="listing-meta"><span><strong>{donation.remainingQuantity}</strong> {donation.unit} available</span><span>{donation.city}{donation.area ? `, ${donation.area}` : ''}</span></div></article>)}</div>}

        <div className="content-heading" style={{ marginTop: '2rem' }}>
          <div>
            <span className="kicker">My activity</span>
            <h2>Your requests</h2>
          </div>
        </div>

        {requestError && <p className="error-message">{requestError}</p>}
        {requests.length === 0 ? (
          <div className="empty-state dashboard-card"><h3>No requests yet</h3><p>Request a donation from the listings above to begin a conversation with a donor.</p></div>
        ) : (
          <div className="list-grid">
            {requests.map((request) => {
              const donor = request.donationId?.donorId || {};
              const canContact = request.status === 'ACCEPTED';

              return (
                <article className="dashboard-card" key={request._id}>
                  <div className="card-header">
                    <h3>{request.donationId?.title || 'Donation'}</h3>
                    <span className="kicker">{request.status}</span>
                  </div>

                  <p><strong>Requested:</strong> {request.requestedQuantity}</p>
                  <p><strong>Reason:</strong> {request.reason}</p>

                  {canContact && (
                    <div className="form-actions" style={{ margin: '0.75rem 0' }}>
                      {donor.phone && <a className="btn btn-primary" href={`tel:${donor.phone}`}>Call donor</a>}
                      {donor.email && <a className="btn btn-light" href={`mailto:${donor.email}`}>Email donor</a>}
                    </div>
                  )}

                  {request.status === 'PENDING' && (
                    <div className="form-actions" style={{ marginTop: '0.75rem' }}>
                      <button type="button" className="btn btn-light" onClick={() => handleCancelRequest(request._id)}>Cancel request</button>
                    </div>
                  )}

                  {request.status === 'ACCEPTED' && (
                    <div className="form-actions" style={{ marginTop: '0.75rem' }}>
                      <button type="button" className="btn btn-primary" onClick={() => handleCompleteRequest(request._id)}>Mark received</button>
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

export default ReceiverDashboard;
