import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import api from '../services/api';

const categories = ['All categories', 'Food', 'Clothes', 'Books', 'Electronics', 'Furniture', 'Medicines', 'School Supplies', 'Household Items', 'Financial Assistance', 'Other'];
const distanceOptions = [
  { label: 'Any distance', value: '' },
  { label: 'Within 5 km', value: '5' },
  { label: 'Within 10 km', value: '10' },
  { label: 'Within 25 km', value: '25' },
  { label: 'Within 50 km', value: '50' },
];

const hasCoordinates = (donation) => {
  const coordinates = donation.location?.coordinates;
  return Array.isArray(coordinates) && coordinates.length === 2 && (Number(coordinates[0]) !== 0 || Number(coordinates[1]) !== 0);
};

function DonationsMap({ donations, userLocation }) {
  const mappedDonations = donations.filter(hasCoordinates);
  const center = userLocation || (mappedDonations.length
    ? [mappedDonations[0].location.coordinates[1], mappedDonations[0].location.coordinates[0]]
    : [20.5937, 78.9629]);

  return (
    <div className="donations-map">
      {mappedDonations.length === 0 && !userLocation ? (
        <div className="map-empty">
          <strong>No mapped donations yet</strong>
          <span>Donors can add their current location when publishing an item.</span>
        </div>
      ) : (
        <MapContainer center={center} zoom={userLocation ? 12 : 5} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userLocation && (
            <CircleMarker center={userLocation} pathOptions={{ color: '#f4a261', fillColor: '#f4a261', fillOpacity: 0.9 }} radius={9}>
              <Popup>Your current location</Popup>
            </CircleMarker>
          )}
          {mappedDonations.map((donation) => (
            <CircleMarker
              key={donation._id}
              center={[donation.location.coordinates[1], donation.location.coordinates[0]]}
              pathOptions={{ color: '#087f73', fillColor: '#2ec4b6', fillOpacity: 0.9 }}
              radius={8}
            >
              <Popup>
                <strong>{donation.title}</strong>
                <br />
                {donation.city}{donation.area ? `, ${donation.area}` : ''}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}

function RequestDonationModal({ donation, onClose, onSubmit, submitting }) {
  const [requestedQuantity, setRequestedQuantity] = useState('1');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (Number(requestedQuantity) > Number(donation.remainingQuantity || 1)) {
      setError('Requested quantity cannot exceed the available quantity.');
      return;
    }

    try {
      await onSubmit({
        donationId: donation._id,
        requestedQuantity: Number(requestedQuantity),
        reason,
        message,
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not send request.');
    }
  };

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div className="form-card" style={{ width: 'min(560px, calc(100% - 1.5rem))' }}>
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <div>
            <span className="kicker">Request item</span>
            <h2 style={{ margin: '0.5rem 0 0' }}>{donation.title}</h2>
          </div>
          <button type="button" className="btn btn-light" onClick={onClose}>Close</button>
        </div>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="requestedQuantity">Quantity</label>
              <input id="requestedQuantity" type="number" min="1" max={donation.remainingQuantity || 1} value={requestedQuantity} onChange={(event) => setRequestedQuantity(event.target.value)} required />
            </div>

            <div className="field full">
              <label htmlFor="reason">Why do you need this?</label>
              <input id="reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Example: For my family of four" required />
            </div>

            <div className="field full">
              <label htmlFor="message">Message to donor</label>
              <textarea id="message" rows="4" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Optional short note" />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FindDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ city: '', area: '', category: '', distance: '' });
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const loadDonations = async (nextFilters = filters, location = userLocation) => {
    setLoading(true);
    setError('');

    try {
      let response;
      if (nextFilters.distance) {
        if (!location) {
          setError('Allow location access to search by distance.');
          setDonations([]);
          return;
        }
        response = await api.get('/donations/nearby', {
          params: {
            latitude: location[0],
            longitude: location[1],
            maxDistance: Number(nextFilters.distance) * 1000,
          },
        });
      } else {
        response = await api.get('/donations', {
          params: {
            city: nextFilters.city || undefined,
            area: nextFilters.area || undefined,
            category: nextFilters.category || undefined,
          },
        });
      }
      setDonations(response.data.donations || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load donations.');
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations({ city: '', area: '', category: '', distance: '' }, null);
  }, []);

  const handleFilterChange = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Location services are not supported by this browser.');
      return;
    }

    setLocationLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = [coords.latitude, coords.longitude];
        setUserLocation(location);
        setLocationLoading(false);
        const nextFilters = { ...filters, distance: filters.distance || '10' };
        setFilters(nextFilters);
        loadDonations(nextFilters, location);
      },
      () => {
        setLocationLoading(false);
        setError('Location access was not allowed. You can still search by city or area.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const mappedDonationCount = useMemo(() => donations.filter(hasCoordinates).length, [donations]);

  const handleRequestSubmit = async (payload) => {
    setSubmitting(true);

    try {
      await api.post('/requests', payload);
      setStatusMessage('Your request has been sent successfully. The donor can review it from their dashboard.');
      setSelectedDonation(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="container">
        <div className="section-header">
          <h2>Find Donations</h2>
          <p>Browse nearby support and request items that match your needs.</p>
        </div>

        <section className="donation-discovery">
          <div className="discovery-heading">
            <div>
              <span className="kicker">Smart discovery</span>
              <h2>Find support your way</h2>
            </div>
            <button type="button" className="btn btn-light" onClick={handleUseLocation} disabled={locationLoading}>
              {locationLoading ? 'Locating...' : 'Use my location'}
            </button>
          </div>
          <div className="discovery-filters">
            <div className="field">
              <label htmlFor="cityFilter">City</label>
              <input id="cityFilter" name="city" value={filters.city} onChange={handleFilterChange} placeholder="Search by city" />
            </div>
            <div className="field">
              <label htmlFor="areaFilter">Area</label>
              <input id="areaFilter" name="area" value={filters.area} onChange={handleFilterChange} placeholder="Search by locality" />
            </div>
            <div className="field">
              <label htmlFor="categoryFilter">Category</label>
              <select id="categoryFilter" name="category" value={filters.category} onChange={handleFilterChange}>
                {categories.map((category) => <option key={category} value={category === 'All categories' ? '' : category}>{category}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="distanceFilter">Distance</label>
              <select id="distanceFilter" name="distance" value={filters.distance} onChange={handleFilterChange}>
                {distanceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
          </div>
          <div className="discovery-actions">
            <button type="button" className="btn btn-primary" onClick={() => loadDonations()} disabled={loading}>Apply filters</button>
            <button type="button" className="btn btn-light" onClick={() => {
              const cleared = { city: '', area: '', category: '', distance: '' };
              setFilters(cleared);
              loadDonations(cleared, userLocation);
            }}>Clear filters</button>
          </div>
        </section>

        <section className="nearby-panel">
          <div className="nearby-panel-copy">
            <span className="kicker">Nearby donations</span>
            <h2>See help around you</h2>
            <p>{mappedDonationCount ? `${mappedDonationCount} donation${mappedDonationCount === 1 ? '' : 's'} shown on the map.` : 'Map locations appear when donors share their coordinates.'}</p>
            {!userLocation && <button type="button" className="text-button" onClick={handleUseLocation}>Enable distance matching →</button>}
          </div>
          <DonationsMap donations={donations} userLocation={userLocation} />
        </section>

        {statusMessage && <div className="form-card" style={{ marginBottom: '1rem', borderColor: '#16a34a' }}>{statusMessage}</div>}

        {loading && <div className="empty-state dashboard-card"><h3>Loading available donations...</h3><p>Checking the live GiveBridge listings.</p></div>}
        {error && <div className="empty-state dashboard-card"><h3>Donations are temporarily unavailable</h3><p>{error}</p></div>}
        {!loading && !error && donations.length === 0 && <div className="empty-state dashboard-card"><h3>No donations published yet</h3><p>Available donations will appear here once verified donors publish them.</p></div>}
        {!loading && !error && donations.length > 0 && (
          <div className="list-grid">
            {donations.map((donation) => (
              <article className="dashboard-card donation-listing" key={donation._id}>
                <div className="card-header">
                  <div><span className="listing-category">{donation.category}</span><h3>{donation.title}</h3></div>
                  <span className="kicker">{donation.status}</span>
                </div>
                <p>{donation.description}</p>
                <div className="listing-meta">
                  <span><strong>{donation.remainingQuantity}</strong> {donation.unit} available</span>
                  <span>{donation.city}{donation.area ? `, ${donation.area}` : ''}</span>
                </div>
                <div className="form-actions" style={{ marginTop: '1rem' }}>
                  <button type="button" className="btn btn-primary" onClick={() => setSelectedDonation(donation)}>Request donation</button>
                </div>
              </article>
            ))}
          </div>
        )}

        {selectedDonation && (
          <RequestDonationModal
            donation={selectedDonation}
            onClose={() => setSelectedDonation(null)}
            onSubmit={handleRequestSubmit}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}

export default FindDonations;
