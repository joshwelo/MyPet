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
  const [showEventTypeModal, setShowEventTypeModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [pets, setPets] = useState([]);
  const [newEvent, setNewEvent] = useState({
    eventName: '',
    description: 'feeding',
    frequency: '',
    startTime: '',
    endTime: '',
    monthsFromNow: 1,
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userId, setUserId] = useState(null);

  // Mock feeding and grooming data for demo purposes
  const feedingFrequencyData = {
    'Dog': { frequency: '2 times a day' },
    'Cat': { frequency: '3 times a day' }
  };

  const groomingFrequencyData = {
    'Dog': { frequency: 'once a month' },
    'Cat': { frequency: 'every 2 months' }
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
    setShowPetModal(true);
  };

  const handlePetSelect = (pet) => {
    setSelectedPet(pet);
    setShowPetModal(false);
    setShowEventTypeModal(true);
  };

  const handleEventTypeSelect = (eventType) => {
    setNewEvent({ ...newEvent, description: eventType });
    if (eventType === 'feeding') {
      const breed = selectedPet.breed;
      setNewEvent(prev => ({
        ...prev,
        frequency: feedingFrequencyData[breed]?.frequency || 'N/A',
        startTime: '08:00', // Default feeding time
        endTime: '09:00' // Default end time for feeding
      }));
    } else if (eventType === 'grooming') {
      const breed = selectedPet.breed;
      setNewEvent(prev => ({
        ...prev,
        frequency: groomingFrequencyData[breed]?.frequency || 'N/A',
      }));
    }
    setShowEventTypeModal(false);
    setShowAddEventModal(true);
  };

  const handleEventSubmit = async () => {
    const { eventName, description, startTime, monthsFromNow } = newEvent;
    const today = new Date();
    const startDate = new Date(today.setMonth(today.getMonth() + monthsFromNow));
    
    const event = {
      eventName,
      description,
      date: startDate.toISOString().split('T')[0],
      time: startTime,
      petId: selectedPet.id,
      userId
    };

    try {
      if (selectedEvent) {
        const eventRef = doc(db, 'calendar', selectedEvent.id);
        await updateDoc(eventRef, event);

        setEvents(events.map(evt => evt.id === selectedEvent.id ? { ...evt, ...event, title: eventName, start: startDate, end: startDate } : evt));
      } else {
        const docRef = await addDoc(collection(db, 'calendar'), event);

        setEvents([...events, {
          id: docRef.id,
          title: eventName,
          start: startDate,
          end: startDate,
          ...event
        }]);
      }

      setShowAddEventModal(false);
      setNewEvent({ eventName: '', description: 'feeding', frequency: '', startTime: '', monthsFromNow: 1 });
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error adding/updating event: ", error);
    }
  };

  const handleEventClick = (event) => {
    setNewEvent({
      eventName: event.eventName,
      description: event.description,
      date: moment(event.start).format('YYYY-MM-DD'),
      time: moment(event.start).format('HH:mm'),
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
          <Modal.Title>Add New Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formEventName">
              <Form.Label>Event Name</Form.Label>
              <Form.Control
                type="text"
                value={newEvent.eventName}
                onChange={(e) => setNewEvent({ ...newEvent, eventName: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId="formFrequency">
              <Form.Label>Frequency</Form.Label>
              <Form.Control
                type="text"
                value={newEvent.frequency}
                readOnly
              />
            </Form.Group>
            <Form.Group controlId="formStartTime">
              <Form.Label>Start Time</Form.Label>
              <Form.Control
                type="time"
                value={newEvent.startTime}
                onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formMonthsFromNow">
              <Form.Label>Months From Now</Form.Label>
              <Form.Control
                type="number"
                value={newEvent.monthsFromNow}
                onChange={(e) => setNewEvent({ ...newEvent, monthsFromNow: e.target.value })}
                min="1"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddEventModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEventSubmit}>
            Save Event
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Event Type Selection Modal */}
      <Modal show={showEventTypeModal} onHide={() => setShowEventTypeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Event Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button variant="info" onClick={() => handleEventTypeSelect('feeding')}>
            Feeding
          </Button>
          <Button variant="success" onClick={() => handleEventTypeSelect('grooming')}>
            Grooming
          </Button>
          <Button variant="warning" onClick={() => handleEventTypeSelect('custom')}>
            Custom
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CalendarEventsPage;
