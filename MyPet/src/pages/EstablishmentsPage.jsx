import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import establishmentData from '../jsons/establishments.json';
import L from 'leaflet';
import './Establishments.css';
import { getDistance } from 'geolib'; // For calculating distances

// Import marker images
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
});

const EstablishmentsPage = () => {
  const DEFAULT_LOCATION = { latitude: 13.9516, longitude: 121.0677 };

  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [locationError, setLocationError] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  const [filteredEstablishments, setFilteredEstablishments] = useState([]);
  const [nearestEstablishment, setNearestEstablishment] = useState(null);
  const [retry, setRetry] = useState(false);

  // Reverse geocoding to fetch address
  const fetchAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      console.log('Address:', data.display_name || 'Unknown location');
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  // Fetch user location
  const fetchUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          fetchAddress(latitude, longitude);
          setLocationError(false);
        },
        (error) => {
          console.error("Error fetching location", error);
          setLocationError(true);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  useEffect(() => {
    fetchUserLocation();
  }, [retry]);

  // Retry button handler
  const handleRetry = () => {
    setRetry((prev) => !prev);
  };

  // Filter establishments based on type and day
  const filterEstablishments = () => {
    let establishmentsToDisplay = [];

    if (typeFilter && establishmentData[typeFilter]) {
      establishmentsToDisplay = establishmentData[typeFilter].filter((establishment) => {
        return !dayFilter || establishment.days_open.includes(dayFilter);
      });
    } else {
      establishmentsToDisplay = [
        ...establishmentData.pet_supplies_stores,
        ...establishmentData.grooming_services,
        ...establishmentData.veterinary_clinics,
      ].filter((establishment) => {
        return !dayFilter || establishment.days_open.includes(dayFilter);
      });
    }

    // Calculate nearest establishment
    if (establishmentsToDisplay.length > 0) {
      const nearest = establishmentsToDisplay.reduce((prev, curr) => {
        const prevDistance = getDistance(userLocation, { latitude: prev.lat, longitude: prev.lng });
        const currDistance = getDistance(userLocation, { latitude: curr.lat, longitude: curr.lng });
        return prevDistance < currDistance ? prev : curr;
      });
      setNearestEstablishment({ ...nearest, distance: getDistance(userLocation, { latitude: nearest.lat, longitude: nearest.lng }) });
    } else {
      setNearestEstablishment(null);
    }

    setFilteredEstablishments(establishmentsToDisplay);
  };

  return (
    <div className="establishments-page container mt-4">
      {locationError && (
        <div className="alert alert-danger">
          Unable to fetch location. <button className="btn btn-secondary" onClick={handleRetry}>Retry</button>
        </div>
      )}

      <div className="filter-section mb-3">
        <div className="row">
          <div className="col-md-4 mb-2">
            <label className="form-label">Establishment Type:</label>
            <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">Any</option>
              <option value="pet_supplies_stores">Pet Supplies Store</option>
              <option value="grooming_services">Grooming Services</option>
              <option value="veterinary_clinics">Veterinary Clinics</option>
            </select>
          </div>
          <div className="col-md-4 mb-2">
            <label className="form-label">Day Open:</label>
            <select className="form-select" value={dayFilter} onChange={(e) => setDayFilter(e.target.value)}>
              <option value="">Any</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-12">
            <button className="btn btn-primary w-100" onClick={filterEstablishments}>
              Show Establishments
            </button>
          </div>
        </div>
      </div>

      <MapContainer
        center={[userLocation.latitude, userLocation.longitude]}
        zoom={14}
        scrollWheelZoom={true}
        className="map-container mb-4"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {filteredEstablishments.map((establishment, index) => (
          <Marker
            key={index}
            position={[establishment.lat, establishment.lng]}
            icon={defaultIcon}
          >
            <Popup>
              <strong>{establishment.name}</strong><br />
              {establishment.address}<br />
              Contact: {establishment.contact}<br />
              Open: {establishment.time_open} - {establishment.time_close}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {nearestEstablishment && (
        <div className="nearest-establishment mt-4">
          <h4>Nearest Establishment:</h4>
          <p><strong>{nearestEstablishment.name}</strong> ({(nearestEstablishment.distance / 1000).toFixed(2)} km away)</p>
          <p>Address: {nearestEstablishment.address}</p>
          <p>Contact: {nearestEstablishment.contact}</p>
          <p>Open: {nearestEstablishment.time_open} - {nearestEstablishment.time_close}</p>
        </div>
      )}
    </div>
  );
};

export default EstablishmentsPage;
