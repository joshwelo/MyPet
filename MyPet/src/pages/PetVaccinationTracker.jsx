import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import vaccineData from '../jsons/vaccines.json'; 
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Modal, Button, Form, Alert } from 'react-bootstrap'; // Importing Bootstrap Modal, Form, and Alert

const PetVaccinationTracker = () => {
  const { petId } = useParams();
  const [pet, setPet] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [upcomingVaccinations, setUpcomingVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // State for showing the modal
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [userId, setUserId] = useState('');
  const [showAlert, setShowAlert] = useState(false); // State for showing the alert
  const [alertMessage, setAlertMessage] = useState(''); // State to store the alert message
    
  useEffect(() => {
    const fetchPetData = async () => {
      try {
        // Fetch pet document
        const petDoc = await getDoc(doc(db, 'pets', petId));
        
        if (petDoc.exists()) {
          const petData = petDoc.data();
          setPet(petData);

          // Calculate pet's age in months
          const birthDate = new Date(petData.birthday);
          const currentDate = new Date();
          const petAgeMonths = (currentDate.getFullYear() - birthDate.getFullYear()) * 12 + 
                               (currentDate.getMonth() - birthDate.getMonth());

          // Get vaccination data for the pet's species
          const speciesVaccines = vaccineData[petData.species] || [];

          // Filter relevant vaccinations based on pet's age
          const relevantVaccinations = speciesVaccines.filter(
            vaccine => petAgeMonths >= (vaccine.age || 0)
          );

          // Determine upcoming vaccinations (those not in vaccination history)
          const vaccinationHistory = petData.vaccinationHistory || [];
          const upcoming = relevantVaccinations.filter(
            vaccine => vaccinationHistory.some(
              history => history.toLowerCase() === vaccine.name.toLowerCase()
            )
          );

          setVaccinations(relevantVaccinations);
          setUpcomingVaccinations(upcoming);
        }
      } catch (error) {
        console.error("Error fetching pet data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPetData();
  }, [petId]);

    // Fetch the current user's ID
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setUserId(user.uid);
          } else {
            console.log("User is not authenticated");
          }
        });
    
        return () => unsubscribe();
      }, []);

      const handleVaccinationSchedule = (vaccination) => {
        if (vaccination && vaccination.name) {
          setEventName(`${pet.name} - ${vaccination.name} Vaccination`);
          setEventDescription(vaccination.description);
          setShowModal(true); // Show the modal for scheduling
        } else {
          console.log("Invalid vaccination data", vaccination);
        }
      };
      
    

      const handleScheduleEvent = async (vaccination) => {
        try {
          if (!userId || !pet) {
            console.log("Error: Missing user or pet data");
            return;
          }
      
          setLoading(true); // Start loading
      
          // Create a new event for the calendar
          const event = {
            eventName: eventName || `${pet.name} - ${vaccination.name}`,  // Fallback to default if eventName is empty
            description: eventDescription || vaccination.description || "Vaccination event",
            date: eventDate, // Use the selected event date
            time: eventTime || "09:00", // Use the selected event time
            userId: userId, // Set the authenticated user's ID
            petId: petId,   // Include petId in the event
            notified: false, // Default to false
            tag: "vaccination"
          };
      
          // Add the event to the Firestore calendar collection
          const calendarRef = collection(db, "calendar"); // Reference to 'calendar' collection
          await addDoc(calendarRef, event); // Add the event
      
          setAlertMessage(`Event scheduled for ${vaccination.name}`); // Set the alert message
          setShowAlert(true); // Show the alert
          setTimeout(() => setShowAlert(false), 5000); // Hide alert after 5 seconds
      
        } catch (error) {
          console.error("Error scheduling event:", error);
        } finally {
          setLoading(false); 
          setShowModal(false);
        }
      };
      
      

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!pet) {
    return <div>Pet not found</div>;
  }

  return (
    <div className="container mt-4">
              {/* Bootstrap alert */}
      {showAlert && (
        <Alert variant="success" onClose={() => setShowAlert(false)} dismissible>
          {alertMessage}
        </Alert>
      )}
      <div className="row mb-4 align-items-center">
        <div className="col-auto">
          <img 
            src={pet.image} 
            alt={pet.name} 
            className="rounded-circle border border-primary"
            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
          />
        </div>
        <div className="col">
          <h1 className="mb-1">{pet.name}'s Vaccination Profile</h1>
          <p className="text-muted">{pet.breed} | {pet.species}</p>
        </div>
      </div>

      <div className="row">
        {/* Vaccination Information Section */}
        <div className="col-md-6 mb-4">
          <div className="card h-100"       style={{
        maxHeight: "400px", // Use a string with units
        overflowY: "auto",  // camelCase for "overflow-y"
        paddingRight: "10px", // camelCase for "padding-right"
        scrollbarWidth: "thin" // camelCase for "scrollbar-width"
      }}>
            <div className="card-header d-flex align-items-center">
              <i className="bx bx-injection me-2 text-primary"></i>
              <h5 className="card-title mb-0">Recommended Vaccine</h5>
            </div>
            <div className="card-body">
              <h6 className="card-subtitle mb-3 text-muted">Core Vaccinations</h6>
              {vaccinations
                .filter(v => v.type === "Core")
                .map((vaccination, index) => (
                  <div key={index} className="card mb-2 bg-light">
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="card-title mb-1">{vaccination.name}</h6>
                        <p className="card-text text-muted small">{vaccination.description}</p>
                      </div>
                      <button 
                        onClick={() => handleVaccinationSchedule(vaccination)}
                        className="btn btn-primary btn-sm"
                      >
                        Schedule
                      </button>
                    </div>
                  </div>
                ))}
                <h6 className="card-subtitle mb-3 mt-3 text-muted">Non-Core Vaccinations</h6>
              {vaccinations
                .filter(v => v.type === "Non-Core")
                .map((vaccination, index) => (
                  <div key={index} className="card mb-2 bg-light">
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="card-title mb-1">{vaccination.name}</h6>
                        <p className="card-text text-muted small">{vaccination.description}</p>
                      </div>
                      <button 
                        onClick={() => handleVaccinationSchedule(vaccination)}
                        className="btn btn-primary btn-sm"
                      >
                        Schedule
                      </button>
                    </div>
                  </div>
                ))}
            <h6 className="card-subtitle mb-3 mt-3 text-muted">Combination Vaccinations</h6>
              {vaccinations
                .filter(v => v.type === "Combination")
                .map((vaccination, index) => (
                  <div key={index} className="card mb-2 bg-light">
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="card-title mb-1">{vaccination.name}</h6>
                        <p className="card-text text-muted small">{vaccination.description}</p>
                      </div>
                      <button 
                        onClick={() => handleVaccinationSchedule(vaccination)}
                        className="btn btn-primary btn-sm"
                      >
                        Schedule
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Upcoming Vaccinations Section */}
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header d-flex align-items-center">
              <i className="bx bx-calendar me-2 text-success"></i>
              <h5 className="card-title mb-0">Upcoming Vaccinations</h5>
            </div>
            <div className="card-body">
              {upcomingVaccinations.length === 0 ? (
                <div className="text-center text-muted">
                  <i className="bx bx-info-circle mb-2 text-warning" style={{fontSize: '2rem'}}></i>
                  <p>No upcoming vaccinations at this time</p>
                </div>
              ) : (
                upcomingVaccinations.map((vaccination, index) => (
                  <div key={index} className="card mb-2 bg-light">
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="card-title mb-1">{vaccination.name}</h6>
                        <p className="card-text text-muted small">
                          Recommended every {vaccination.frequency || 'unknown'} months
                        </p>
                      </div>
                      <button 
                        onClick={() => handleVaccinationSchedule(vaccination)}
                        className="btn btn-success btn-sm"
                      >
                        Re-Schedule Now
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vaccination History */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex align-items-center">
              <i className="bx bx-user me-2 text-secondary"></i>
              <h5 className="card-title mb-0">Vaccination History</h5>
            </div>
            <div className="card-body">
              {pet.vaccinationHistory && pet.vaccinationHistory.length > 0 ? (
                pet.vaccinationHistory.map((history, index) => (
                  <div 
                    key={index} 
                    className="d-flex justify-content-between align-items-center bg-light p-3 rounded mb-2"
                  >
                    <span className="fw-medium">{history}</span>
                    <span className="text-muted small">Administered</span>
                  </div>
                ))
              ) : (
                <p className="text-muted text-center">No vaccination history found</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Schedule Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Event Name</Form.Label>
              <Form.Control
                type="text"
                value={eventName}
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Event Date</Form.Label>
              <Form.Control
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
            <Form.Label>Event Time</Form.Label>
            <Form.Control
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}  // This ensures eventTime gets updated
            />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
        </Button>
        <Button 
            variant="primary" 
            onClick={handleScheduleEvent} 
            disabled={loading}  // Disable the button when loading
        >
            {loading ? (
            <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span className="ms-2">Scheduling...</span>
            </>
            ) : (
            "Schedule Event"
            )}
        </Button>
        </Modal.Footer>

      </Modal>
    </div>
  );
};

export default PetVaccinationTracker;