import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import { Modal, Button, Form } from 'react-bootstrap';
import { getDocs, collection, query, where, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from '../firebaseConfig'; 
import { getAuth, onAuthStateChanged } from "firebase/auth"; 
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import breedsData from '../jsons/breeds.json';
import { messaging } from '../firebaseConfig';
import { onMessage } from "firebase/messaging";

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
    setShowPetModal(true);
  };

  const handlePetSelect = (pet) => {
    setSelectedPet(pet);
    setShowPetModal(false);
    setShowAddEventModal(true);
  };

  const handleEventSubmit = async () => {
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
        petId: selectedPet.id,
        userId,
    };

    try {
      if (selectedEvent) {
        // Update the existing event
        const eventRef = doc(db, 'calendar', selectedEvent.id);
        await updateDoc(eventRef, event);

        // Update local state
        setEvents(events.map(evt => evt.id === selectedEvent.id ? { ...evt, ...event, title: eventName, start: new Date(date + ' ' + time), end: new Date(date + ' ' + time) } : evt));
      } else {
        // Add a new event
        const docRef = await addDoc(collection(db, 'calendar'), event);
        
        // Update local state
        setEvents([...events, {
          id: docRef.id,
          title: eventName,
          start: new Date(date + ' ' + time),
          end: new Date(date + ' ' + time),
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
    setShowEditEventModal(true);
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
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        <h2 className="text-center">Pet Schedule Calendar</h2>
        <div className="row justify-content-center">
          <div className="col-12 col-md-10">
            <Button variant="primary" onClick={handleShowAddEventModal}>
              Add Event
            </Button>
            <Button variant={feedingEnabled ? "danger" : "success"} className="ms-3" onClick={handleToggleFeedingSchedule}>
              {feedingEnabled ? "Disable Feeding Schedule" : "Enable Feeding Time"}
            </Button>
            <Button onClick={() => setShowNotificationModal(true)} className="ms-3">
              Toggle Notifications
            </Button>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500, margin: "50px" }}
              onSelectEvent={handleEventClick}
            />
          </div>
        </div>
      </div>

      {/* Pet Selection Modal */}
      <Modal show={showPetModal} onHide={() => setShowPetModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Your Pet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul>
            {pets.map(pet => (
              <li key={pet.id} onClick={() => handlePetSelect(pet)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                {pet.imageURL && <img src={pet.imageURL} alt={pet.name} className="pet-image" style={{ borderRadius: '50%', width: '50px', height: '50px', marginRight: '10px' }} />}
                {pet.name}
              </li>
            ))}
          </ul>
        </Modal.Body>
      </Modal>
      
      {/* Notification Modal */}
      <Modal show={showNotificationModal} onHide={() => setShowNotificationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Enable Notifications?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Would you like to enable notifications for upcoming pet events?</p>
          <Button variant="success" onClick={() => handleNotificationResponse(true)}>Enable</Button>
          <Button variant="danger" onClick={() => handleNotificationResponse(false)}>Disable</Button>
        </Modal.Body>
      </Modal>

      {/* Add Event Modal */}
      <Modal show={showAddEventModal} onHide={() => setShowAddEventModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {selectedPet && (
              <div className="pet-display" style={{ textAlign: 'center' }}>
                {selectedPet.imageURL && <img src={selectedPet.imageURL} alt={selectedPet.name} className="pet-image-large" style={{ borderRadius: '50%', width: '100px', height: '100px' }} />}
                <h5>Selected Pet: {selectedPet.name}</h5>
              </div>
            )}
            <Form.Group controlId="eventName">
              <Form.Label>Event Name</Form.Label>
              <Form.Control
                type="text"
                onChange={(e) => setNewEvent({ ...newEvent, eventName: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="date">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="time">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              />
            </Form.Group>
            <Button variant="primary" className="mt-3" onClick={handleEventSubmit}>
              Save Event
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Event Modal */}
      <Modal show={showEditEventModal} onHide={() => setShowEditEventModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {selectedPet && (
              <div className="pet-display" style={{ textAlign: 'center' }}>
                {selectedPet.imageURL && <img src={selectedPet.imageURL} alt={selectedPet.name} className="pet-image-large" style={{ borderRadius: '50%', width: '100px', height: '100px' }} />}
                <h5>Selected Pet: {selectedPet.name}</h5>
              </div>
            )}
            <Form.Group controlId="eventName">
              <Form.Label>Event Name</Form.Label>
              <Form.Control
                type="text"
                value={newEvent.eventName}
                onChange={(e) => setNewEvent({ ...newEvent, eventName: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="date">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="time">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              />
            </Form.Group>
            <Button variant="primary" className="mt-3" onClick={handleEventSubmit}>
              Update Event
            </Button>
            <Button variant="danger" className="mt-3 ml-2" onClick={handleDeleteEvent}>
              Delete Event
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

        {/* Notification Preference Modal */}
        <Modal show={showNotificationModal} onHide={() => setShowNotificationModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Notification Preference</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Would you like to receive notifications for this event?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => handleNotificationResponse(false)}>
              No
            </Button>
            <Button variant="primary" onClick={() => handleNotificationResponse(true)}>
              Yes
            </Button>
          </Modal.Footer>
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
    </div>
  );
};

export default CalendarEventsPage;