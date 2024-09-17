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

const localizer = momentLocalizer(moment);

const CalendarEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [showPetModal, setShowPetModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [pets, setPets] = useState([]);
  const [newEvent, setNewEvent] = useState({
    eventName: '',
    description: '',
    date: '',
    time: ''
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userId, setUserId] = useState(null);

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
    const { eventName, description, date, time } = newEvent;
    const event = {
      eventName,
      description,
      date,
      time,
      petId: selectedPet.id,
      userId
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

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        <h2 className="text-center">Pet Schedule Calendar</h2>
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <div className="calendar-container col-12">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectEvent={handleEventClick}
                style={{ height: '100%' }}
              />
              <Button variant="primary" className="mt-3" onClick={handleShowAddEventModal}>
                Add Event
              </Button>
            </div>
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
                value=""
                onChange={(e) => setNewEvent({ ...newEvent, eventName: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value=""
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="date">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value=""
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="time">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                value=""
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
    </div>
  );
};

export default CalendarEventsPage;
