import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import establishmentData from "../jsons/establishments.json";
import L from "leaflet";
import "./Establishments.css";
import { getDistance } from "geolib";
import { Modal } from "bootstrap";  // Ensure Bootstrap JS is imported

// Import marker images
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
});

const EstablishmentsPage = () => {
  const DEFAULT_LOCATION = [13.9516, 121.0677]; // Default location (can be adjusted)
  const MAX_DISTANCE = 100000; // 10 kilometers in meters

  const [center, setCenter] = useState(DEFAULT_LOCATION);
  const [locationError, setLocationError] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filteredEstablishments, setFilteredEstablishments] = useState([]);
  const [nearbyEstablishments, setNearbyEstablishments] = useState([]);
  const [retry, setRetry] = useState(false);
  const [zoom, setZoom] = useState(12);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Combine all establishments from the JSON file
  const allEstablishments = [
    ...establishmentData.pet_supplies_stores,
    ...establishmentData.grooming_services,
    ...establishmentData.veterinary_clinics,
  ];

  useEffect(() => {
    fetchUserLocation();
  }, [retry]);

  useEffect(() => {
    filterEstablishments();
  }, [center, typeFilter, dayFilter, searchInput]);

  const fetchUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCenter([latitude, longitude]);
          setLocationError(false);
          setZoom(14);
        },
        (error) => {
          console.error("Error fetching location", error);
          setLocationError(true);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  const handleRetry = () => {
    setRetry((prev) => !prev);
  };

  const filterEstablishments = () => {
    let establishmentsToDisplay = allEstablishments;

    // Filter by type if selected
    if (typeFilter && establishmentData[typeFilter]) {
      establishmentsToDisplay = establishmentData[typeFilter];
    }

    // Filter by days open if selected
    if (dayFilter) {
      establishmentsToDisplay = establishmentsToDisplay.filter((establishment) =>
        establishment.days_open.includes(dayFilter)
      );
    }

    // Filter by search input
    if (searchInput.trim()) {
      establishmentsToDisplay = establishmentsToDisplay.filter((establishment) =>
        establishment.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        establishment.address.toLowerCase().includes(searchInput.toLowerCase())
      );
    }

    // Calculate nearby establishments within 10km
    const nearbyEstabs = establishmentsToDisplay.filter((establishment) => {
      const distance = getDistance(
        { latitude: center[0], longitude: center[1] },
        { latitude: establishment.lat, longitude: establishment.lng }
      );
      return distance <= MAX_DISTANCE;
    });

    // Sort nearby establishments by distance
    const sortedNearby = nearbyEstabs.sort((a, b) => {
      const distanceA = getDistance(
        { latitude: center[0], longitude: center[1] },
        { latitude: a.lat, longitude: a.lng }
      );
      const distanceB = getDistance(
        { latitude: center[0], longitude: center[1] },
        { latitude: b.lat, longitude: b.lng }
      );
      return distanceA - distanceB;
    });

    setFilteredEstablishments(sortedNearby);
    setNearbyEstablishments(sortedNearby);
  };

  const handleMapClick = (e) => {
    // Update center when map is clicked
    setCenter([e.latlng.lat, e.latlng.lng]);
    setZoom(14);
    // Close filter modal on mobile after map click
    if (window.innerWidth < 768) {
      setIsFilterModalOpen(false);
    }
  };

  const applyFilters = () => {
    // Close modal after applying filters
    setIsFilterModalOpen(false);
  };

  return (
    <div className="establishments-page vh-100 d-flex flex-column">
      {/* Mobile Header with Filter Modal Toggle */}
      <div className="d-md-none bg-primary text-white p-3 d-flex justify-content-between align-items-center">
        <h3 className="m-0">Pet Establishments</h3>
        <button 
          className="btn btn-light" 
          onClick={() => setIsFilterModalOpen(true)}
        ><i className='bx bxs-location-plus'></i>
          <i className="bi bi-filter"></i>
        </button>
      </div>

      {/* Filter Modal for Mobile */}
      <div 
        className={`modal fade ${isFilterModalOpen ? 'show d-block' : ''}`} 
        tabIndex="-1" 
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Find Establishments</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setIsFilterModalOpen(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="filter-section">
                {/* Establishment Type Filter */}
                <div className="mb-3">
                  <label className="form-label">Establishment Type</label>
                  <select
                    className="form-select"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="pet_supplies_stores">Pet Supplies Store</option>
                    <option value="grooming_services">Grooming Services</option>
                    <option value="veterinary_clinics">Veterinary Clinics</option>
                  </select>
                </div>

                {/* Day Open Filter */}
                <div className="mb-3">
                  <label className="form-label">Day Open</label>
                  <select
                    className="form-select"
                    value={dayFilter}
                    onChange={(e) => setDayFilter(e.target.value)}
                  >
                    <option value="">Any Day</option>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                {/* Search Input */}
                <div className="mb-3">
                  <label className="form-label">Search</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-search"></i></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search name or address"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>
                </div>

                {/* Nearby Establishments */}
                {nearbyEstablishments.length > 0 ? (
                  <div className="nearby-establishments mt-4">
                    <h5 className="mb-3">Nearby Establishments</h5>
                    <div className="list-group scrollable-container">
                      {nearbyEstablishments.slice(0, 5).map((establishment, index) => {
                        const distance = getDistance(
                          { latitude: center[0], longitude: center[1] },
                          { latitude: establishment.lat, longitude: establishment.lng }
                        );
                        return (
                          <button 
                            key={index} 
                            className="list-group-item list-group-item-action"
                            onClick={() => {
                              setCenter([establishment.lat, establishment.lng]);
                              setZoom(16);
                              setIsFilterModalOpen(false);
                            }}
                          >
                            <div className="d-flex w-100 justify-content-between">
                              <h6 className="mb-1">{establishment.name}</h6>
                              <small>{(distance / 1000).toFixed(2)} km</small>
                            </div>
                            <p className="mb-1 text-muted">{establishment.address}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-info mt-3">
                    No establishments found within 10 km
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setIsFilterModalOpen(false)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={applyFilters}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>



      <div className="row g-0 flex-grow-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="col-md-4 bg-light sidebar-container d-none d-md-block">
          <div className="p-3 h-100 overflow-auto">
            {/* Same content as before, but for desktop view */}
            <div className="filter-section">
              <h4 className="mb-4">Find Pet Establishments</h4>
              
              {/* Filters (same as before) */}
              <div className="mb-3">
                <label className="form-label">Establishment Type</label>
                <select
                  className="form-select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="pet_supplies_stores">Pet Supplies Store</option>
                  <option value="grooming_services">Grooming Services</option>
                  <option value="veterinary_clinics">Veterinary Clinics</option>
                </select>
              </div>
              <div className="mb-3">
                  <label className="form-label">Day Open</label>
                  <select
                    className="form-select"
                    value={dayFilter}
                    onChange={(e) => {
                      setDayFilter(e.target.value);
                      // Close sidebar on mobile after selection
                      if (window.innerWidth < 768) {
                        setIsSidebarOpen(false);
                      }
                    }}
                  >
                    <option value="">Any Day</option>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Search</label>
                  <div className="input-group rounded-3 shadow-sm">
                    <span className="input-group-text bg-light border-0 rounded-start" style={{ width: "40px", justifyContent: "center" }}>
                      <i className="bx bx-search" style={{ color: "#5a5a5a", fontSize: "18px" }}></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-0 rounded-end"
                      placeholder="Search name or address"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      style={{ paddingLeft: "0.75rem", fontSize: "1rem" }}
                    />
                  </div>
                </div>

                {nearbyEstablishments.length > 0 ? (
    <div className="nearby-establishments mt-4">
      <h5 className="mb-3">Nearby Establishments</h5>
      <div className="list-group scrollable-container">
        {nearbyEstablishments.slice(0, 10).map((establishment, index) => {
          const distance = getDistance(
            { latitude: center[0], longitude: center[1] },
            { latitude: establishment.lat, longitude: establishment.lng }
          );
          return (
            <button 
              key={index} 
              className="list-group-item list-group-item-action"
              onClick={() => {
                setCenter([establishment.lat, establishment.lng]);
                setZoom(16);
                if (window.innerWidth < 768) {
                  setIsSidebarOpen(false);
                }
              }}
            >
              <div className="d-flex w-100 justify-content-between">
                <h6 className="mb-1">{establishment.name}</h6>
                <small>{(distance / 1000).toFixed(2)} km</small>
              </div>
              <p className="mb-1 text-muted">{establishment.address}</p>
            </button>
          );
        })}
      </div>
    </div>
  ) : (
    <div className="alert alert-info mt-3">
      No establishments found within 10 km
    </div>
  )}
              {/* Rest of the desktop sidebar content remains the same */}
            </div>
          </div>
        </div>

        {/* Map Container (remains unchanged) */}
        <div className="col-md-8 h-100">
          <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={true}
            className="h-100 w-100"
            whenReady={(mapInstance) => {
              mapInstance.target.on('click', handleMapClick);
            }}
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
                  <div className="text-center">
                    <strong>{establishment.name}</strong>
                    <p className="mb-1">{establishment.address}</p>
                    <p className="mb-1">Contact: {establishment.contact}</p>
                    <p>Open: {establishment.time_open} - {establishment.time_close}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default EstablishmentsPage;