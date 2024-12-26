import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import { getDocs, collection, query, where, addDoc, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { Alert } from 'react-bootstrap';
const localizer = momentLocalizer(moment);
const EVENT_TYPES = [
  'Feeding', 
  'Grooming', 
  'Vet Visit', 
  'Training', 
  'Medication', 
  'Vaccination', 
  'Other'
];
const CalendarEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [showPetModal, setShowPetModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [showFeedingScheduleModal, setShowFeedingScheduleModal] = useState(false);
  const [feedingSchedule, setFeedingSchedule] = useState({ timesPerDay: 2, feedingTimes: ["08:00", "18:00"] });
  const [selectedPet, setSelectedPet] = useState(null);
  const [pets, setPets] = useState([]);
  const [newEvent, setNewEvent] = useState({
    eventName: '',
    description: '',
    date: '',
    time: '',
    petId: null,
    type: ''
  });
  const [showPetSelectionModal, setShowPetSelectionModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userId, setUserId] = useState(null);
  const [feedingEnabled, setFeedingEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    variant: 'success', // success, danger, info, etc.
  });
  
  const showAlert = (message, variant = 'success') => {
    setAlert({
      show: true,
      message,
      variant
    });
  
    // Hide alert after 3 seconds
    setTimeout(() => setAlert({ ...alert, show: false }), 3000);
  };
  
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

  // Fetch user's notification preference
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setNotificationsEnabled(userDoc.data().notificationsEnabled || false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch pets from Firestore
  useEffect(() => {
    if (userId) {
      const fetchPets = async () => {
        try {
          const q = query(collection(db, 'pets'), where('userId', '==', userId));
          const querySnapshot = await getDocs(q);
          const storage = getStorage();

          const petList = await Promise.all(querySnapshot.docs.map(async (doc) => {
            const petData = doc.data();
            let imageURL = '';

            if (petData.imagePath) {
              const imageRef = ref(storage, `pets/${doc.id}/${petData.imagePath}`);
              try {
                imageURL = await getDownloadURL(imageRef);
              } catch (error) {
                console.error("Error fetching image URL: ", error);
              }
            }

            return { id: doc.id, ...petData, imageURL };
          }));

          setPets(petList);
        } catch (error) {
          console.error("Error fetching pets: ", error);
        }
      };

      fetchPets();
    }
  }, [userId]);

  // Fetch events from Firestore
  useEffect(() => {
    if (userId) {
      const fetchEvents = async () => {
        try {
          const q = query(collection(db, 'calendar'), where('userId', '==', userId));
          const querySnapshot = await getDocs(q);
          const eventList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().eventName,
            start: new Date(doc.data().date + ' ' + doc.data().time),
            end: new Date(doc.data().date + ' ' + doc.data().time),
            ...doc.data()
          }));
          setEvents(eventList);
        } catch (error) {
          console.error("Error fetching events: ", error);
        }
      };

      fetchEvents();
    }
  }, [userId]);

  const handleShowAddEventModal = () => {
    // If no pets exist, show an alert
    if (pets.length === 0) {
      showAlert('Please add a pet first', 'warning');
      return;
    }

    // If only one pet, auto-select it
    if (pets.length === 1) {
      setSelectedPet(pets[0]);
      setShowAddEventModal(true);
    } else {
      // If multiple pets, show pet selection modal
      setShowPetSelectionModal(true);
    }
  };

  const handlePetSelect = (pet) => {
    setSelectedPet(pet);
    setShowPetModal(false);
    setShowAddEventModal(true);
  };

  const handleEventSubmit = async () => {
    if (loading) return;
    setLoading(true);
  
    const event = {
      eventName: newEvent.type ? 
        `${newEvent.type} - ${selectedPet.name}` : 
        newEvent.eventName,
      description: newEvent.type ? 
        `Scheduled ${newEvent.type} for ${selectedPet.name}` : 
        newEvent.description,
      date: newEvent.date,
      time: newEvent.time,
      userId,
      petId: selectedPet.id,
      type: newEvent.type,
      notified: false,
    };
  
    try {
      // Check for duplicate events
      const q = query(
        collection(db, 'calendar'),
        where('userId', '==', userId),
        where('eventName', '==', event.eventName),
        where('date', '==', newEvent.date),
        where('time', '==', newEvent.time)
      );
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        showAlert('Duplicate event already exists!', 'danger');
        setLoading(false);
        return;
      }
  
      let docRef;
  
      if (selectedEvent) {
        // Update existing event
        const eventRef = doc(db, 'calendar', selectedEvent.id);
        await updateDoc(eventRef, event);
        setEvents(events.map(evt =>
          evt.id === selectedEvent.id
            ? { ...evt, ...event, title: event.eventName, start: new Date(event.date + ' ' + event.time), end: new Date(event.date + ' ' + event.time) }
            : evt
        ));
      } else {
        // Add new event
        docRef = await addDoc(collection(db, 'calendar'), event);
        setEvents([
          ...events,
          {
            id: docRef.id,
            title: event.eventName,
            start: new Date(event.date + ' ' + event.time),
            end: new Date(event.date + ' ' + event.time),
            ...event,
          },
        ]);
      }
  
      showAlert('Event added successfully!', 'success');
  
      // Reset modal and state
      setShowAddEventModal(false);
      setNewEvent({ 
        eventName: '', 
        description: '', 
        date: '', 
        time: '', 
        petId: null, 
        type: '' 
      });
      setSelectedEvent(null);
  
      // Auto-refresh the page
      window.location.reload();
    } catch (error) {
      showAlert('Error adding/updating event.', 'danger');
      console.error('Error adding/updating event:', error);
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleEventClick = (event) => {
    setNewEvent({
      eventName: event.eventName,
      description: event.description,
      date: moment(event.start).format('YYYY-MM-DD'),
      time: moment(event.start).format('HH:mm')
    });
    const pet = pets.find(pet => pet.id === event.petId);
    setSelectedPet(pet);
    setSelectedEvent(event);
    setShowEditEventModal(true);
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      try {
        const eventRef = doc(db, 'calendar', selectedEvent.id);
        await deleteDoc(eventRef);

        setEvents(events.filter(evt => evt.id !== selectedEvent.id));
        setShowEditEventModal(false);
        setSelectedEvent(null);
      } catch (error) {
        console.error("Error deleting event: ", error);
      }
    }
  };

  const handleEditEventSubmit = async () => {
    const { eventName, description, date, time } = newEvent;
    const event = {
      eventName,
      description,
      date,
      time,
      petId: selectedPet.id,
      userId,
    };
  
    try {
      const eventRef = doc(db, 'calendar', selectedEvent.id);
      await updateDoc(eventRef, event);
  
      setEvents(events.map(evt => evt.id === selectedEvent.id ? { ...evt, ...event, title: eventName, start: new Date(date + ' ' + time), end: new Date(date + ' ' + time) } : evt));
  
      // Send email notification
      if (notificationsEnabled) {
        const auth = getAuth();
        const userEmail = auth.currentUser?.email; // Retrieve email from Firebase Auth
  
        if (userEmail) {
          const emailDetails = {
            eventName: eventName,
            description: newEvent.description,
            date: newEvent.date,
            time: newEvent.time,
            petName: selectedPet.name,
            email: userEmail, // Use the authenticated user's email
          };
  
          await sendEmailNotification(emailDetails);
        } else {
          console.error('No authenticated user found');
        }
      }
  
      setShowEditEventModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleFeedingScheduleSubmit = async () => {
    if (loading) return; // Prevent re-triggering while processing
  
    setLoading(true); // Disable the button while processing
  
    try {
      const startDate = moment().startOf('day');
      const endDate = moment().add(30, 'days');
      const existingFeedingEvents = new Set();
  
      // Fetch existing feeding events for the user
      const q = query(
        collection(db, 'calendar'),
        where('userId', '==', userId),
        where('eventName', '==', 'Feeding')
      );
      const querySnapshot = await getDocs(q);
  
      querySnapshot.forEach((doc) => {
        const event = doc.data();
        const uniqueKey = `${event.date}-${event.time}`;
        existingFeedingEvents.add(uniqueKey); // Store existing feeding events in a Set
      });
  
      const newFeedingEvents = [];
  
      // Generate feeding events for 30 days
      for (let date = startDate; date.isBefore(endDate); date.add(1, 'days')) {
        feedingSchedule.feedingTimes.forEach((time) => {
          const formattedDate = date.format('YYYY-MM-DD');
          const uniqueKey = `${formattedDate}-${time}`;
  
          // Add only if event is not already in the existing events
          if (!existingFeedingEvents.has(uniqueKey)) {
            const event = {
              date: formattedDate,
              description: 'Feeding time',
              eventName: 'Feeding',
              time: time,
              userId: userId,
            };
            newFeedingEvents.push(event);
          }
        });
      }
  
      // Save new feeding events to Firestore
      for (const event of newFeedingEvents) {
        await addDoc(collection(db, 'calendar'), event);
      }
  
      // Update state with new events
      setEvents([
        ...events,
        ...newFeedingEvents.map((event) => ({
          id: `${event.date}-${event.time}`,
          title: event.eventName,
          start: new Date(event.date + ' ' + event.time),
          end: new Date(event.date + ' ' + event.time),
          ...event,
        })),
      ]);
  
      showAlert('Feeding schedule enabled successfully!', 'success');
      setFeedingEnabled(true); // Enable feeding schedule in the UI
      setShowFeedingScheduleModal(false);
    } catch (error) {
      showAlert('Error saving feeding schedule to Firestore.', 'danger');
      console.error('Error saving feeding schedule:', error);
    } finally {
      setLoading(false); // Re-enable the button after completion
    }
  };
  
  const handleToggleFeedingSchedule = () => {
    if (loading) return; // Prevent multiple clicks
    setLoading(true);
  
    if (feedingEnabled) {
      handleDisableFeedingSchedule().finally(() => {
        setLoading(false); // Reset loading state
      });
    } else {
      setShowFeedingScheduleModal(true);
      setLoading(false); // Reset loading state for modal view
    }
  };
  
  

  const handleDisableFeedingSchedule = async () => {
    const q = query(collection(db, 'calendar'), where('userId', '==', userId), where('eventName', '==', 'Feeding'));
    const querySnapshot = await getDocs(q);

    try {
      for (const doc of querySnapshot.docs) {
        await deleteDoc(doc.ref);
      }

      setEvents(events.filter(event => event.eventName !== 'Feeding'));
      setFeedingEnabled(false);
    } catch (error) {
      console.error("Error deleting feeding schedule from Firestore: ", error);
    }
  };

  const handleFeedingTimesChange = (index, value) => {
    const times = [...feedingSchedule.feedingTimes];
    times[index] = value;
    setFeedingSchedule({ ...feedingSchedule, feedingTimes: times });
  };

  useEffect(() => {
    const checkFeedingSchedule = async () => {
      if (userId) {
        const q = query(collection(db, 'calendar'), where('userId', '==', userId), where('eventName', '==', 'Feeding'));
        const querySnapshot = await getDocs(q);

        setFeedingEnabled(!querySnapshot.empty);
      }
    };

    checkFeedingSchedule();
  }, [userId]);
  
  
  return (
    <div className="container-xxl content-wrapper p-4">
      <div className="card shadow-sm p-4">
        <h3 className="card-title text-primary fw-bold mb-4">Pet Calendar</h3>
              {/* Show Alert */}
      {alert.show && (
        <Alert variant={alert.variant} onClose={() => setAlert({ ...alert, show: false })} dismissible>
          {alert.message}
        </Alert>
      )}
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={['day', 'week', 'month']}
          defaultView="day"
          style={{ height: 500 }}
          onSelectEvent={handleEventClick}
        />
        <Row className="justify-content-center mb-3">
          <Col xs="auto">
            <Button
              variant="primary"
              onClick={handleShowAddEventModal}
              className="mb-2 mt-3 w-100"
              disabled={loading}
            >
              {loading ? 'Adding Event...' : 'Add Event'}
            </Button>
          </Col>
          <Col xs="auto">
          <Button
  variant={feedingEnabled ? 'danger' : 'success'}
  className="mb-2 mt-3 w-100"
  onClick={handleToggleFeedingSchedule}
  disabled={loading}
>
  {loading ? 'Processing...' : feedingEnabled ? 'Disable Feeding Schedule' : 'Enable Feeding Time'}
</Button>

          </Col>
        </Row>
      </div>

      {/* Add Event Modal */}
      <Modal show={showAddEventModal} onHide={() => setShowAddEventModal(false)} centered>
    <Modal.Header closeButton>
      <Modal.Title>Add Event for {selectedPet?.name}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form>
        <Form.Group controlId="eventType" className="mb-3">
          <Form.Label>Event Type</Form.Label>
          <Form.Control
            as="select"
            value={newEvent.type}
            onChange={(e) => {
              const selectedType = e.target.value;
              setNewEvent({ 
                ...newEvent, 
                type: selectedType,
                // If 'Other' is selected, clear the previous eventName
                ...(selectedType !== 'Other' ? { eventName: '' } : {})
              });
            }}
          >
            <option value="">Select Event Type</option>
            {EVENT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Form.Control>
        </Form.Group>

        {newEvent.type === 'Other' && (
          <Form.Group controlId="customEventName" className="mb-3">
            <Form.Label>Custom Event Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter custom event name"
              value={newEvent.eventName}
              onChange={(e) => setNewEvent({ ...newEvent, eventName: e.target.value })}
            />
          </Form.Group>
        )}

        <Form.Group controlId="eventDescription" className="mb-3">
          <Form.Label>Description (Optional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            placeholder="Additional details (optional)"
          />
        </Form.Group>

        <Form.Group controlId="eventDate" className="mb-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            required
          />
        </Form.Group>

        <Form.Group controlId="eventTime" className="mb-3">
          <Form.Label>Time</Form.Label>
          <Form.Control
            type="time"
            value={newEvent.time}
            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
            required
          />
        </Form.Group>
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button 
        variant="secondary" 
        onClick={() => setShowAddEventModal(false)} 
        disabled={loading}
      >
        Close
      </Button>
      <Button
        variant="primary"
        onClick={handleEventSubmit}
        disabled={
          loading || 
          !newEvent.type || 
          (newEvent.type === 'Other' && !newEvent.eventName) || 
          !newEvent.date || 
          !newEvent.time
        }
      >
        {loading ? 'Adding...' : 'Submit'}
      </Button>
    </Modal.Footer>
  </Modal>
     {/* Pet Selection Modal */}
     <Modal show={showPetSelectionModal} onHide={() => setShowPetSelectionModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Select a Pet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row xs={1} md={2} className="g-4">
            {pets.map((pet) => (
              <Col key={pet.id}>
                <div 
                  className="card pet-selection-card cursor-pointer" 
                  onClick={() => handlePetSelect(pet)}
                  style={{ 
                    border: '1px solid #ddd', 
                    borderRadius: '8px', 
                    padding: '10px', 
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {pet.image ? (
                    <img 
                      src={pet.image} 
                      alt={pet.name} 
                      className="card-img-top" 
                      style={{ 
                        width: '100px', 
                        height: '100px', 
                        objectFit: 'cover', 
                        borderRadius: '50%',
                        margin: '0 auto 10px'
                      }} 
                    />
                  ) : (
                    <div 
                      className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" 
                      style={{ 
                        width: '100px', 
                        height: '100px', 
                        margin: '0 auto 10px'
                      }}
                    >
                      {pet.name.charAt(0)}
                    </div>
                  )}
                  <h5 className="card-title">{pet.name}</h5>
                  <p className="card-text text-muted">
                    {pet.breed || 'Pet'} | {pet.age ? `${pet.age} years old` : ''}
                  </p>
                </div>
              </Col>
            ))}
          </Row>
        </Modal.Body>
      </Modal>

      {/* Feeding Schedule Modal */}
      <Modal show={showFeedingScheduleModal} onHide={() => setShowFeedingScheduleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Configure Feeding Schedule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="timesPerDay">
            <Form.Label>Times per Day</Form.Label>
            <Form.Control
              as="select"
              value={feedingSchedule.timesPerDay}
              onChange={(e) => {
                const timesPerDay = parseInt(e.target.value);
                setFeedingSchedule({
                  timesPerDay,
                  feedingTimes: Array(timesPerDay).fill("08:00"),
                });
              }}
            >
              <option value={2}>2 Times</option>
              <option value={3}>3 Times</option>
            </Form.Control>
          </Form.Group>
          {[...Array(feedingSchedule.timesPerDay)].map((_, index) => (
            <Form.Group controlId={`feedingTime-${index}`} key={index}>
              <Form.Label>Feeding Time {index + 1}</Form.Label>
              <Form.Control
                type="time"
                value={feedingSchedule.feedingTimes[index]}
                onChange={(e) => handleFeedingTimesChange(index, e.target.value)}
              />
            </Form.Group>
          ))}
          <Button variant="primary" className="mt-3" onClick={handleFeedingScheduleSubmit}>
            Set Feeding Schedule
          </Button>
        </Modal.Body>
      </Modal>
      {/* Edit Event Modal */}
      <Modal show={showEditEventModal} onHide={() => setShowEditEventModal(false)} centered>
    <Modal.Header closeButton>
      <Modal.Title>Edit Event for {selectedPet?.name}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form>
        <Form.Group controlId="eventType" className="mb-3">
          <Form.Label>Event Type</Form.Label>
          <Form.Control
            as="select"
            value={newEvent.type}
            onChange={(e) => {
              const selectedType = e.target.value;
              setNewEvent({ 
                ...newEvent, 
                type: selectedType,
                ...(selectedType !== 'Other' ? { eventName: '' } : {})
              });
            }}
          >
            <option value="">Select Event Type</option>
            {EVENT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Form.Control>
        </Form.Group>

        {newEvent.type === 'Other' && (
          <Form.Group controlId="customEventName" className="mb-3">
            <Form.Label>Custom Event Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter custom event name"
              value={newEvent.eventName}
              onChange={(e) => setNewEvent({ ...newEvent, eventName: e.target.value })}
            />
          </Form.Group>
        )}

        <Form.Group controlId="eventDescription" className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            placeholder="Additional details (optional)"
          />
        </Form.Group>

        <Form.Group controlId="eventDate" className="mb-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            required
          />
        </Form.Group>

        <Form.Group controlId="eventTime" className="mb-3">
          <Form.Label>Time</Form.Label>
          <Form.Control
            type="time"
            value={newEvent.time}
            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
            required
          />
        </Form.Group>
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setShowEditEventModal(false)}>
        Close
      </Button>
      <Button variant="danger" onClick={handleDeleteEvent}>
        Delete Event
      </Button>
      <Button 
        variant="primary" 
        onClick={handleEditEventSubmit}
        disabled={
          !newEvent.type || 
          (newEvent.type === 'Other' && !newEvent.eventName) || 
          !newEvent.date || 
          !newEvent.time
        }
      >
        Save Changes
      </Button>
    </Modal.Footer>
  </Modal>
      <script>

      </script>
    </div>
  );
};

export default CalendarEventsPage;