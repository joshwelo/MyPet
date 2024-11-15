import React, { useState, useEffect } from 'react';
import { db, auth } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { Carousel } from "react-bootstrap";
import diagnose from '../assets/pexels.jpg';
import ai from '../assets/ai.png';

const Home = () => {
  const [userId, setUserId] = useState(null);
  const [pets, setPets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        fetchPets(user.uid);
        fetchEvents(user.uid); 
      } else {
        setUserId(null);
        setPets([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchPets = async (userId) => {
    setLoading(true);
    try {
      const q = query(collection(db, "pets"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const petsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPets(petsData);
    } catch (error) {
      console.error("Error fetching pets: ", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async (userId) => {
    setLoading(true);
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

      const sortedEvents = eventList.sort((a, b) => a.start - b.start).slice(0, 5);
      setEvents(sortedEvents);
    } catch (error) {
      console.error("Error fetching events: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePetClick = (petId) => {
    navigate(`/Home/PetProfile/${petId}`);
  };

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="row">
          {/* First Row - My Pets and Is Your Pet Sick */}
          <div className="col-12 col-md-8 mb-4">
            <div className="card">
              <h3 className="card-title text-primary fw-bold mb-0 m-4">My Pets</h3>
              <div className="card-body">
                {pets.length === 0 ? (
                  <div>
                    <p>No pets found. Please add one!</p>
                    <Link to="/Home/ProfilePage" className="btn btn-sm btn-outline-primary">Go to Profile Page</Link>
                  </div>
                ) : (
                  <div className="d-flex justify-content-center">
                    <Carousel className="w-100">
                      {pets.map((pet) => (
                        <Carousel.Item key={pet.id}>
                          <img
                            className="d-block w-100"
                            src={pet.image || "../assets/img/placeholder.png"}
                            alt={pet.name}
                          />
                          <Carousel.Caption>
                            <h5>{pet.name}</h5>
                            <p>{pet.breed} | {pet.species}</p>
                          </Carousel.Caption>
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4 mb-4">
            <div className="card">
              <img className="card-img-top" src={diagnose} alt="Is your pet sick?" />
              <div className="card-body">
                <h5 className="card-title text-primary">Is your pet sick?</h5>
                <p className="card-text">Pet health is important for their well-being. If your pet shows signs of illness, it's time for a checkup.</p>
                <Link to="/Home/DiagnosePage" className="btn btn-outline-primary w-100">Go</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Second Row - Schedule and Check Your Pet's Breed */}
          <div className="col-12 col-md-8 mb-4">
            <div className="card scrollable-card">
              <h5 className="card-header text-primary fw-bold">Upcoming Schedule</h5>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.length === 0 ? (
                      <tr><td colSpan="3">No upcoming events found</td></tr>
                    ) : (
                      events.map((event) => (
                        <tr key={event.id}>
                          <td>{event.start.toLocaleDateString()}</td>
                          <td>{event.start.toLocaleTimeString()}</td>
                          <td>{event.title}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th><Link to="/Home/CalendarEventsPage" className="btn btn-sm btn-outline-primary">View Calendar</Link></th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4 mb-4">
            <div className="card">
              <div className="card-body d-flex flex-column align-items-center justify-content-between">
                <div className="text-center mb-3">
                  <h5 className="text-primary">Check your pet's breed</h5>
                  <p>Knowing your pet's breed can help with care instructions, dietary needs, and grooming requirements.</p>
                </div>
                <div className="d-flex justify-content-center mb-3">
                  <img src={ai} alt="Forum" width="60%" />
                </div>
                <Link to="/Home/AiBreed" className="btn btn-sm btn-outline-primary w-100">Forums</Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Home;
