import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AddPetModal from "./AddPetModal";
import Loading from './Loading';

const ProfilePage = () => {
  const [showModal, setShowModal] = useState(false);
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
    const q = query(collection(db, "pets"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const petsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setPets(petsData);
    setLoading(false);
  };

  const calculateAge = (birthday) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    const months = (today.getMonth() + 12 - birthDate.getMonth()) % 12;
    
    if (age === 0) {
      return `${months} months`;
    }
    return `${age} years ${months} months`;
  };

  return (
    <div className="container-fluid bg-light py-4">
      <div className="container">
        <div className="row mb-4">
          <div className="col">
            <h2 className="display-6 text-primary">
              <i className="bx bx-paw me-2"></i>My Pets
            </h2>
          </div>
          <div className="col-auto">
            <button 
              className="btn btn-primary d-flex align-items-center"
              onClick={() => setShowModal(true)}
            >
              <i className="bx bx-plus-circle me-2"></i>
              Add New Pet
            </button>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="row g-4">
            {pets.map((pet) => (
              <div className="col-12 col-md-6 col-lg-4" key={pet.id}>
                <div className="card h-100 shadow-sm hover-shadow transition-all" 
                     onClick={() => navigate(`/Home/PetProfile/${pet.id}`)}
                     style={{ cursor: 'pointer' }}>
                  <div className="position-relative">
                    <img
                      src={pet.image}
                      className="card-img-top"
                      alt={pet.name}
                      style={{ height: '240px', objectFit: 'cover' }}
                    />
                    <div className="position-absolute top-0 end-0 m-2">
                      <span className="badge bg-primary">
                        <i className={`bx ${pet.sex === 'male' ? 'bx-male' : 'bx-female'} me-1`}></i>
                        {pet.sex}
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <h5 className="card-title mb-3 d-flex justify-content-between align-items-center">
                      <span>{pet.name}</span>
                      <small className="text-muted">
                        <i className="bx bx-calendar me-1"></i>
                        {calculateAge(pet.birthday)}
                      </small>
                    </h5>
                    
                    <div className="pet-details">
                      <p className="mb-2">
                        <i className="bx bx-purchase-tag me-2"></i>
                        <span className="fw-bold">Breed:</span> {pet.breed}
                      </p>
                      {pet.emotionalCharacteristics && (
                        <p className="mb-0">
                          <i className="bx bx-heart me-2"></i>
                          <span className="fw-bold">Characteristics:</span> {pet.emotionalCharacteristics}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="card-footer bg-transparent">
                    <button 
                      className="btn btn-outline-primary w-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/Home/PetProfile/${pet.id}`);
                      }}
                    >
                      <i className="bx bx-show me-2"></i>View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {userId && <AddPetModal show={showModal} handleClose={() => {
        setShowModal(false);
        if (userId) fetchPets(userId);
      }} userId={userId} />}
    </div>
  );
};

export default ProfilePage;