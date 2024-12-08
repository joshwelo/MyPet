import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Carousel } from 'react-bootstrap';
import { db, auth } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

// Import local images
import diagnoseImage from '../assets/pexels.jpg';
import aiImage from '../assets/ai.png';

const HomePage = () => {
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

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid className="px-4 py-3">
      {/* Welcome Section */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="h3">
                Welcome to My Pet Dashboard
              </Card.Title>
              <Card.Text>
                Manage your pet's health, track events, and stay connected with our comprehensive pet care platform.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Action Cards */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="h-100 hover-lift">
            <Card.Body>
              <div className="d-flex align-items-center">
                <i className='bx bxs-dog me-3 text-primary' style={{fontSize: '3rem'}}></i>
                <div>
                  <Card.Title>Manage Pets</Card.Title>
                  <Card.Text className="text-muted">
                    View and update your pet's profiles
                  </Card.Text>
                </div>
              </div>
              <Button 
                variant="outline-primary" 
                className="mt-3 w-100"
                onClick={() => navigate('/Home/ProfilePage')}
              >
                View Pets
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 hover-lift">
            <Card.Body>
              <div className="d-flex align-items-center">
                <i className='bx bxs-calendar me-3 text-success' style={{fontSize: '3rem'}}></i>
                <div>
                  <Card.Title>Upcoming Events</Card.Title>
                  <Card.Text className="text-muted">
                    {events.length > 0 
                      ? `Next event: ${events[0].title}` 
                      : 'No upcoming events'}
                  </Card.Text>
                </div>
              </div>
              <Button 
                variant="outline-success" 
                className="mt-3 w-100"
                onClick={() => navigate('/Home/CalendarEventsPage')}
              >
                View Calendar
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 hover-lift">
            <Card.Body>
              <div className="d-flex align-items-center">
                <i className='bx bx-question-mark me-3 text-warning' style={{fontSize: '3rem'}}></i>
                <div>
                  <Card.Title>Health Check</Card.Title>
                  <Card.Text className="text-muted">
                    Disease detection and health insights
                  </Card.Text>
                </div>
              </div>
              <Button 
                variant="outline-warning" 
                className="mt-3 w-100"
                onClick={() => navigate('/Home/DiagnosePage')}
              >
                Check Health
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pets Overview */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>Your Pets</Card.Header>
            <Card.Body>
              {pets.length === 0 ? (
                <div className="text-center">
                  <p>You haven't added any pets yet.</p>
                  <Button 
                    variant="primary"
                    onClick={() => navigate('/Home/ProfilePage')}
                  >
                    Add a Pet
                  </Button>
                </div>
              ) : (
                <Row xs={1} md={3} className="g-4">
                  {pets.map(pet => (
                    <Col key={pet.id}>
                      <Card 
                        className="pet-card hover-lift" 
                        onClick={() => handlePetClick(pet.id)}
                      >
                        <Card.Img 
                          variant="top" 
                          src={pet.image} 
                          className="pet-card-img"
                        />
                        <Card.Body>
                          <Card.Title>{pet.name}</Card.Title>
                          <Card.Text>
                            {pet.breed} | {pet.age} years old
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Feature Showcase Carousel */}
      <Row>
        <Col>
          <Carousel>
            <Carousel.Item>
              <img
                className="d-block w-100"
                src={diagnoseImage}
                alt="Disease Detection"
              />
              <Carousel.Caption>
                <h3>Advanced Disease Detection</h3>
                <p>AI-powered health insights for your pet</p>
                <Button 
                  variant="light"
                  onClick={() => navigate('/Home/DiagnosePage')}
                >
                  Learn More
                </Button>
              </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="d-block w-100"
                src={aiImage}
                alt="AI Breed Scanner"
              />
              <Carousel.Caption>
                <h3>AI Breed Recognition</h3>
                <p>Identify and learn about your pet's breed</p>
                <Button 
                  variant="light"
                  onClick={() => navigate('/Home/AiBreed')}
                >
                  Try Now
                </Button>
              </Carousel.Caption>
            </Carousel.Item>
          </Carousel>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;