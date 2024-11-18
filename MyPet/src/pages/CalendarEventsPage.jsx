import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import { getDocs, collection, query, where, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from '../firebaseConfig'; 
import { getAuth, onAuthStateChanged } from "firebase/auth"; 
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import breedsData from '../jsons/breeds.json';
import { messaging } from '../firebaseConfig';
import { onMessage } from "firebase/messaging";
import { Modal, Button, Form, Row, Col, Card } from 'react-bootstrap';


const localizer = momentLocalizer(moment);

const CalendarEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [showPetModal, setShowPetModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [showFeedingScheduleModal, setShowFeedingScheduleModal] = useState(false);
  const [feedingSchedule, setFeedingSchedule] = useState({ timesPerDay: 2, feedingTimes: ["08:00", "18:00"] });
  const [showNotificationModal, setShowNotificationModal] = useState(false);  const [selectedPet, setSelectedPet] = useState(null);
  const [pets, setPets] = useState([]);
  const [newEvent, setNewEvent] = useState({
    eventName: '',
    description: '',
    date: '',
    time: ''
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userId, setUserId] = useState(null);
  const [feedingEnabled, setFeedingEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false); // New state for notifications
  const [isTokenFound, setTokenFound] = useState(false);


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

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        
        // Fetch the user's notification preference
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

            // Construct the image path with pet ID as folder name
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
    setShowAddEventModal(true);  // Skip pet modal and go directly to Add Event modal
  };

  const handlePetSelect = (pet) => {
    setSelectedPet(pet);
    setShowPetModal(false);
    setShowAddEventModal(true);
  };
  const [loading, setLoading] = useState(false); // Track the loading state

  const handleEventSubmit = async () => {
    if (loading) return; // Prevent multiple submissions
  
    setLoading(true); // Start loading
  
    // Determine event name based on type
    let eventName;
    if (newEvent.type === 'feeding') {
      eventName = `Feeding - ${selectedPet.name}`;
    } else if (newEvent.type === 'grooming') {
      eventName = `Grooming - ${selectedPet.name}`;
    } else {
      eventName = newEvent.eventName;  // Use provided name for custom events
    }
  
    const event = {
      eventName,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.time,
      userId,
    };
  
    try {
      if (selectedEvent) {
        // Update the existing event
        const eventRef = doc(db, 'calendar', selectedEvent.id);
        await updateDoc(eventRef, event);
  
        // Update local state
        setEvents(events.map(evt => evt.id === selectedEvent.id ? { ...evt, ...event, title: eventName, start: new Date(event.date + ' ' + event.time), end: new Date(event.date + ' ' + event.time) } : evt));
      } else {
        // Add a new event
        const docRef = await addDoc(collection(db, 'calendar'), event);
  
        // Update local state
        setEvents([...events, {
          id: docRef.id,
          title: eventName,
          start: new Date(event.date + ' ' + event.time),
          end: new Date(event.date + ' ' + event.time),
          ...event
        }]);
      }
  
      setShowNotificationModal(true);
      setShowAddEventModal(false);
      setShowEditEventModal(false);
      setNewEvent({ eventName: '', description: '', date: '', time: '' });
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error adding/updating event: ", error);
    } finally {
      setLoading(false); // End loading, enable the button again
    }
  };
  

  const handleEventClick = (event) => {
    // Populate the form with the selected event details
    setNewEvent({
      eventName: event.eventName,
      description: event.description,
      date: moment(event.start).format('YYYY-MM-DD'),
      time: moment(event.start).format('HH:mm')
    });
    const pet = pets.find(pet => pet.id === event.petId);
    setSelectedPet(pet);
    setSelectedEvent(event);
    setShowEditEventModal(true); // Show the modal when event is clicked
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      try {
        const eventRef = doc(db, 'calendar', selectedEvent.id);
        await deleteDoc(eventRef);
  
        // Remove the event from local state
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
      // Update the existing event
      const eventRef = doc(db, 'calendar', selectedEvent.id);
      await updateDoc(eventRef, event);
  
      // Update local state with the edited event
      setEvents(events.map(evt => evt.id === selectedEvent.id ? { ...evt, ...event, title: eventName, start: new Date(date + ' ' + time), end: new Date(date + ' ' + time) } : evt));
  
      // Close the modal
      setShowEditEventModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error updating event: ", error);
    }
  };

  const handleFeedingScheduleSubmit = async () => {
    const startDate = moment().startOf('day');
    const endDate = moment().add(30, 'days');
    const newFeedingEvents = [];
  
    for (let date = startDate; date.isBefore(endDate); date.add(1, 'days')) {
      feedingSchedule.feedingTimes.forEach(time => {
        const formattedDate = date.format('YYYY-MM-DD');
        const formattedTime = time;
  
        const event = {
          date: formattedDate,                  // e.g., "2024-11-02"
          description: 'Feeding time',          // Use a default description or make it customizable
          eventName: 'Feeding',                 // Standardized event name
          petId: 'pets',                // Reference to the pet's ID
          time: formattedTime,                  // e.g., "08:00"
          userId                                // Current user's ID
        };
  
        newFeedingEvents.push(event);
      });
    }
  
    // Save each new feeding event to Firestore
    try {
      for (const event of newFeedingEvents) {
        await addDoc(collection(db, 'calendar'), event);
      }
  
      // Update the calendar events in state
      setEvents([...events, ...newFeedingEvents.map(event => ({
        id: event.petId + '-' + event.date + '-' + event.time,  // Generate a unique ID
        title: event.eventName,
        start: new Date(event.date + ' ' + event.time),
        end: new Date(event.date + ' ' + event.time),
        ...event
      }))]);
  
      setFeedingEnabled(true);
    } catch (error) {
      console.error("Error saving feeding schedule to Firestore: ", error);
    }
  
    setShowFeedingScheduleModal(false);
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
  
// Check if feeding schedule exists and set button state on component load
useEffect(() => {
  const checkFeedingSchedule = async () => {
    if (userId) {
      const q = query(collection(db, 'calendar'), where('userId', '==', userId), where('eventName', '==', 'Feeding'));
      const querySnapshot = await getDocs(q);

      // Disable button if feeding schedule exists, otherwise enable it
      setFeedingEnabled(!querySnapshot.empty);
    }
  };

  checkFeedingSchedule();
}, [userId]); // Dependency array includes userId to check after user loads

// Function to toggle feeding schedule based on feedingEnabled state
const handleToggleFeedingSchedule = () => {
  if (feedingEnabled) {
    handleDisableFeedingSchedule();
  } else {
    setShowFeedingScheduleModal(true);
  }
};
const handleNotificationResponse = async (response) => {
  setNotificationsEnabled(response);
  setShowNotificationModal(false);

  if (userId) {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { notificationsEnabled: response });
      console.log("Notification preference saved.");
    } catch (error) {
      console.error("Error saving notification preference: ", error);
    }
  }
};

useEffect(() => {
  if (notificationsEnabled) {
    const requestPermission = async () => {
      try {
        await Notification.requestPermission();
        const token = await getToken(messaging, { vapidKey: "BJ19fQAYDKXfyQHaIiMq1kcE81FYhdrOw6mp78-3_mfcGGtt4VaRyd7diDrgXQDq0TuthY5ipM2qR-1qxi3oTRY" });
        if (token) {
          console.log("FCM Token:", token);
          setTokenFound(true);
          // Save the FCM token to Firestore or use it for notifications
        }
      } catch (error) {
        console.error("Failed to get FCM token:", error);
      }
    };

    requestPermission();
  }
}, [notificationsEnabled]);
useEffect(() => {
  if (notificationsEnabled) {
    events.forEach(event => {
      const eventTime = new Date(event.start).getTime();
      const now = Date.now();
      const timeUntilEvent = eventTime - now;

      if (timeUntilEvent > 0 && timeUntilEvent <= 1800000) { // 30 minutes
        setTimeout(() => {
          // Send notification
          new Notification("Upcoming Event", {
            body: `Event: ${event.eventName} for ${selectedPet.name}`,
          });
        }, timeUntilEvent);
      }
    });
  }
}, [events, notificationsEnabled]);
useEffect(() => {
  onMessage(messaging, (payload) => {
    console.log("Message received. ", payload);
    new Notification(payload.notification.title, {
      body: payload.notification.body,
    });
  });
}, []);
  return (
    <div className="container-xxl content-wrapper p-4">
      <div className="card shadow-sm p-4">
        <h3 className="card-title text-primary fw-bold mb-4">Pet Calendar</h3>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                views={['day', 'week', 'month']} // Allow the calendar to switch views
                defaultView="day" // Set the default view to day
                style={{ height: 500}}
                onSelectEvent={handleEventClick}
            />
                    <Row className="justify-content-center mb-3">
          <Col xs="auto">
            <Button
              variant="primary"
              onClick={handleShowAddEventModal}
              className="mb-2 mt-3 w-100"
              disabled={loading} // Disable the button when loading
            >
              {loading ? 'Adding Event...' : 'Add Event'}
            </Button>
          </Col>
          <Col xs="auto">
            <Button variant={feedingEnabled ? "danger" : "success"} className="mb-2 mt-3 w-100" onClick={handleToggleFeedingSchedule}>
              {feedingEnabled ? "Disable Feeding Schedule" : "Enable Feeding Time"}
            </Button>
          </Col>
          <Col xs="auto">
            <Button onClick={() => setShowNotificationModal(true)} className="mb-2 mt-3 w-100">
              Toggle Notifications
            </Button>
          </Col>
          </Row>
      </div>

      {/* Notification Modal */}
      <Modal show={showNotificationModal} onHide={() => setShowNotificationModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enable Notifications?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Would you like to enable notifications for upcoming pet events?</p>
          <Button variant="success" onClick={() => handleNotificationResponse(true)} className="w-100 mb-2">Enable</Button>
          <Button variant="danger" onClick={() => handleNotificationResponse(false)} className="w-100">Disable</Button>
        </Modal.Body>
      </Modal>

      {/* Add Event Modal */}
      <Modal show={showAddEventModal} onHide={() => setShowAddEventModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Add Event</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {/* Add your form fields here */}
    <div>
      <input
        type="text"
        className="form-control"
        placeholder="Event Name"
        value={newEvent.eventName}
        onChange={(e) => setNewEvent({ ...newEvent, eventName: e.target.value })}
        disabled={loading} // Disable input while loading
      />
      <input
        type="text"
        className="form-control mt-2"
        placeholder="Description"
        value={newEvent.description}
        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
        disabled={loading} // Disable input while loading
      />
      <input
        type="date"
        className="form-control mt-2"
        value={newEvent.date}
        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
        disabled={loading} // Disable input while loading
      />
      <input
        type="time"
        className="form-control mt-2"
        value={newEvent.time}
        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
        disabled={loading} // Disable input while loading
      />
    </div>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowAddEventModal(false)} disabled={loading}>Close</Button>
    <Button variant="primary" onClick={handleEventSubmit} disabled={loading}> {/* Disable Submit button */}
      {loading ? 'Adding Event...' : 'Submit'}
    </Button>
  </Modal.Footer>
</Modal>

      <Modal show={showEditEventModal} onHide={() => setShowEditEventModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="eventName">
              <Form.Label>Event Name</Form.Label>
              <Form.Control
                type="text"
                value={newEvent.eventName}
                onChange={(e) => setNewEvent({ ...newEvent, eventName: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="eventDescription" className="mt-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="eventDate" className="mt-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="eventTime" className="mt-3">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
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
          <Button variant="primary" onClick={handleEditEventSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CalendarEventsPage;