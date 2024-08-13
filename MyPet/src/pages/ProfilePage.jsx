import React, { useState, useEffect } from "react";
import AddPetModal from "./AddPetModal";
import { auth, db } from "../firebaseConfig"; // Adjust the import path as needed
import { collection, query, where, getDocs } from "firebase/firestore";
import { Card, Button } from "react-bootstrap";

const ProfilePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [pets, setPets] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        fetchPets(user.uid);
      } else {
        setUserId(null);
        setPets([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchPets = async (userId) => {
    const q = query(collection(db, "pets"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const petsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setPets(petsData);
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    if (userId) fetchPets(userId); // Refresh pets after closing the modal
  };

  return (
    <>
      <div className="content-wrapper">
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="card px-4">
            <h5 className="card-header">My Pets</h5>
            <div className="row">
              {pets.map((pet) => (
                <div className="col-md-3 mb-3" key={pet.id}>
                  <Card>
                    <Card.Img variant="top" src={pet.image} alt={pet.name} className="w-100" />
                    <Card.Body>
                      <Card.Title>{pet.name}</Card.Title>
                      <Card.Text>
                        <strong>Age:</strong> {pet.birthday ? calculateAge(pet.birthday) : "N/A"}<br />
                        <strong>Breed:</strong> {pet.breed}
                      </Card.Text>
                      <div className="dropdown">
                        <Button variant="secondary" className="btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                          Actions
                        </Button>
                        <ul className="dropdown-menu">
                          <li>
                            <a className="dropdown-item" href="javascript:void(0);">
                              <i className="bx bx-edit-alt me-1"></i> Edit
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="javascript:void(0);">
                              <i className="bx bx-trash me-1"></i> Delete
                            </a>
                          </li>
                        </ul>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
            <div className="d-grid gap-2 col-lg-6 mx-auto" style={{ paddingTop: "10px", paddingBottom: "10px" }}>
              <Button className="btn btn-primary btn-lg" type="button" onClick={handleShowModal}>
                Add Pet
              </Button>
            </div>
          </div>
        </div>
      </div>
      {userId && <AddPetModal show={showModal} handleClose={handleCloseModal} userId={userId} />}
    </>
  );
};

const calculateAge = (birthday) => {
  const birthDate = new Date(birthday);
  const ageDiffMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDiffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export default ProfilePage;
