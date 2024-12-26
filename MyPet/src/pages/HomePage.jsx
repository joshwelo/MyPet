import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import aiImage from '../assets/aibreed.mp4';
import pet from '../assets/running.jpg';


const HomePage = () => {
  const [userId, setUserId] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        fetchPets(user.uid);
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
  <Col  className='px-2 '>
    <Card className="shadow-sm px-3 ">
    <Card className="shadow-sm position-relative text-white mt-3 mb-3">
  <Card.Img
    src={pet}
    alt="Pet image"
    className="img-fluid"
    style={{
      height: "300px",
      maxWidth: "100%",
      objectFit: "cover",
    }}
  />
  <Card.ImgOverlay className="d-flex flex-column justify-content-center text-center">
  <Card.Title style={{ fontSize: "1.8rem", fontWeight: "bold", textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}>
  <h1 style={{ margin: "0", color: "#fff" }}>Welcome to My Pet</h1>
</Card.Title>
<Card.Text style={{ fontSize: "1rem", lineHeight: "1.5", color: "#f8f9fa", textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)" }}>
  Manage your pet's health, track events, and stay connected with our comprehensive pet care platform.
</Card.Text>

  </Card.ImgOverlay>
</Card>

      {/* Features Grid */}
<Row className="g-3 mb-4">
  <Col xs={6} md={4} lg={2}>
    <Link to="/Home/DiagnosePage" className="text-decoration-none">
      <Card className="text-center h-100 hover-lift bg-primary-soft">
        <Card.Body className="d-flex flex-column align-items-center justify-content-center">
        <lottie-player src="https://lottie.host/dc858c9d-e8af-4ebd-bd9a-7cd693d30615/389NKeOKHw.json" background="##FFFFFF" speed="1" style={{ width: "250px", height: "100px" }} loop autoplay direction="1" mode="normal"></lottie-player>
          <Card.Title className="h5">Disease Diagnosis</Card.Title>
          <Card.Text className="text-muted text-center d-none d-md-block">
            Health assessment for your pets
          </Card.Text>
        </Card.Body>
      </Card>
    </Link>
  </Col>

  <Col xs={6} md={4} lg={2}>
    <Link to="/Home/CalendarEventsPage" className="text-decoration-none">
      <Card className="text-center h-100 hover-lift bg-success-soft">
        <Card.Body className="d-flex flex-column align-items-center justify-content-center">
        <lottie-player src="https://lottie.host/c55ba999-6227-4d8d-a72b-486bd2fdd5ec/yR4MZeYJx0.json" background="##FFFFFF" speed="1" style={{ width: "250px", height: "100px" }} loop autoplay direction="1" mode="normal"></lottie-player>
          <Card.Title className="h5">Calendar Events</Card.Title>
          <Card.Text className="text-muted text-center d-none d-md-block">
            Manage and track your pet's important dates
          </Card.Text>
        </Card.Body>
      </Card>
    </Link>
  </Col>

  <Col xs={6} md={4} lg={2}>
    <Link to="/Home/PetJournalPage" className="text-decoration-none">
      <Card className="text-center h-100 hover-lift bg-info-soft">
        <Card.Body className="d-flex flex-column align-items-center justify-content-center">
        <lottie-player src="https://lottie.host/84569736-a2ae-4282-863d-ab3501b93565/IdJZZ3flYM.json"  background="##FFFFFF" speed="1" style={{ width: "250px", height: "100px" }} loop autoplay direction="1" mode="normal"></lottie-player>
          <Card.Title className="h5">Pet Journal</Card.Title>
          <Card.Text className="text-muted text-center d-none d-md-block">
            Track your pet's health and memories
          </Card.Text>
        </Card.Body>
      </Card>
    </Link>
  </Col>

  <Col xs={6} md={4} lg={2}>
    <Link to="/Home/ForumSubTopic" className="text-decoration-none">
      <Card className="text-center h-100 hover-lift bg-warning-soft">
        <Card.Body className="d-flex flex-column align-items-center justify-content-center">
        <lottie-player src="https://lottie.host/92d83079-d2bf-4ee3-8735-06b8fd4495f0/rbsbpNuUu6.json"   background="##FFFFFF" speed="1" style={{ width: "250px", height: "100px" }} loop autoplay direction="1" mode="normal"></lottie-player>
          <Card.Title className="h5">Pet Forum</Card.Title>
          <Card.Text className="text-muted text-center d-none d-md-block">
            Connect with other pet owners
          </Card.Text>
        </Card.Body>
      </Card>
    </Link>
  </Col>
  <Col xs={6} md={4} lg={2}>
    <Link to="/Home/AiBreed" className="text-decoration-none">
      <Card className="text-center h-100 hover-lift bg-danger-soft">
        <Card.Body className="d-flex flex-column align-items-center justify-content-center">
        <video
            autoPlay
            loop
            muted
            playsInline
            className="d-block w-100"
            src={aiImage}
            alt="AI Breed Scanner"
          />
          <Card.Title className="h5">Ai Breed Scanner</Card.Title>
          <Card.Text className="text-muted text-center d-none d-md-block">
            Determine the breed of your pet
          </Card.Text>
        </Card.Body>
      </Card>
    </Link>
  </Col>
  <Col xs={6} md={4} lg={2}>
    <Link to="/Home/EstablishmentsPage" className="text-decoration-none">
      <Card className="text-center h-100 hover-lift bg-danger-soft">
        <Card.Body className="d-flex flex-column align-items-center justify-content-center">
        <lottie-player src="https://lottie.host/d13c7ec9-f9af-4119-8f5c-ad998fd79097/qtD4mvw3lP.json"   background="##FFFFFF" speed="1" style={{ width: "250px", height: "100px" }} loop autoplay direction="1" mode="normal"></lottie-player>
          <Card.Title className="h5">Pet Establishments</Card.Title>
          <Card.Text className="text-muted text-center d-none d-md-block">
            Find nearby pet establishments
          </Card.Text>
        </Card.Body>
      </Card>
    </Link>
  </Col>
</Row>
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
    </Container>
  );
};

export default HomePage;