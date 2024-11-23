import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button, Modal, Form, Row, Col, Badge, Container } from 'react-bootstrap';
import breedsData from '../jsons/breeds.json';
import vaccineData from '../jsons/vaccines.json'; 
import Select from 'react-select';
import petImage from '../assets/mypetlogo.png'

const PetProfile = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [showVaccineModal, setShowVaccineModal] = useState(false); // For the vaccine suggestion modal
  const [vaccinationSuggestions, setVaccinationSuggestions] = useState({ required: [], recommended: [] });

  const storage = getStorage();

  useEffect(() => {
    fetchPet();
  }, [petId]);

  const fetchPet = async () => {
    const petDoc = await getDoc(doc(db, 'pets', petId));
    if (petDoc.exists()) {
      const petData = petDoc.data();

      const vaccinationHistory = Array.isArray(petData.vaccinationHistory)
        ? petData.vaccinationHistory
        : petData.vaccinationHistory
        ? petData.vaccinationHistory.split(',')
        : [];

      const medicalHistory = Array.isArray(petData.medicalHistory)
        ? petData.medicalHistory
        : petData.medicalHistory
        ? petData.medicalHistory.split(',')
        : [];

      setPet({ ...petData, vaccinationHistory, medicalHistory });
      setEditData({ ...petData, vaccinationHistory, medicalHistory });
      setVaccinationSuggestions(calculateVaccinations(petData.birthday, petData.species));

    }
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const handleCheckboxChange = (field, value) => {
    setEditData((prevState) => {
      const updatedArray = prevState[field]?.includes(value)
        ? prevState[field].filter((item) => item !== value)
        : [...(prevState[field] || []), value];
      return { ...prevState, [field]: updatedArray };
    });
  };

  const handleSaveChanges = async () => {
    let imageUrl = pet.image;

    if (imageFile) {
      const storageRef = ref(storage, `pets/${petId}/${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    const updatedData = {
      ...editData,
      image: imageUrl,
    };

    await updateDoc(doc(db, 'pets', petId), updatedData);
    setShowEditModal(false);
    fetchPet();
  };

  const handleDelete = async () => {
    await deleteDoc(doc(db, 'pets', petId));
    navigate('/Home/ProfilePage');
  };

  const speciesOptions = [
    { value: 'cats', label: 'Cat' },
    { value: 'dogs', label: 'Dog' }
  ];

  const getBreedsBySpecies = (species) => {
    if (!species) return [];
    const breedsList = breedsData[species] || [];
    return breedsList.map(breed => ({
      value: breed.breed,
      label: breed.breed
    }));
  };

  const handleSpeciesChange = (e) => {
    setEditData({ ...editData, species: e.target.value, breed: '' });
  };
  const handleCloseVaccineModal = () => {
    setShowVaccineModal(false);
  };
  const handleBreedChange = (selectedOption) => {
    setEditData({ ...editData, breed: selectedOption ? selectedOption.value : '' });
  };

  const handleVaccinationChange = (selectedOptions) => {
    setEditData({
      ...editData,
      vaccinationHistory: selectedOptions ? selectedOptions.map(option => option.label) : [],
    });
  };
  const calculateVaccinations = (birthday, species) => {
    const age = calculateAge(birthday);
    const vaccines = vaccineData[species] || [];

    const required = [];
    const recommended = [];

    vaccines.forEach(vaccine => {
      if (age >= vaccine.time && vaccine.required) {
        required.push(vaccine);
      } else if (age >= vaccine.time && !vaccine.required) {
        recommended.push(vaccine);
      }
    });

    return { required, recommended };
  };
  const calculateAge = (birthday) => {
    const birthDate = new Date(birthday);
    const ageDiff = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };
  const handleShowVaccineModal = () => {
    setShowVaccineModal(true);
  };
  // Get vaccination options based on species
  const getVaccinationOptions = (species) => {
    return vaccineData[species] ? vaccineData[species].map(vaccine => ({
      label: vaccine.name,
      value: vaccine.name,
    })) : [];
  };

  return pet ? (
    <Container className="py-4">
      <div className="card mb-4">
        <div className="card-header d-flex flex-column flex-md-row align-items-center">
          <Row className="w-100">
            <Col xs={12} md={4} className="d-flex justify-content-center mb-3 mb-md-0">
              <img
    src={pet.image || petImage}  // Use placeholder if no image is available
    alt={pet.name}
                className="w-75 rounded-circle"
                style={{ maxHeight: '200px', objectFit: 'cover' }}
              />
            </Col>
            <Col xs={12} md={8}>
              <h3 className="card-title text-primary fw-bold">{pet.name}</h3>
              <p>{pet.species} | {pet.breed}</p>
              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => setShowEditModal(true)}
                  className="w-100 w-md-auto"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  className="ms-2 w-100 w-md-auto"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete
                </Button>
              </div>
            </Col>
          </Row>
        </div>
        <div className="card-body">
          <Row>
            <Col xs={6} md={4}>
              <h6>Age</h6>
              <button className="btn btn-outline-primary w-100">{calculateAge(pet.birthday)} Years</button>
            </Col>
            <Col xs={6} md={4}>
              <h6>Birthday</h6>
              <button className="btn btn-outline-primary w-100 mb-3">{pet.birthday}</button>
            </Col>
            <Col xs={12} md={4} mt={3}>
              <h6>Vaccination History</h6>
              <div className="d-flex flex-wrap gap-1">
                {pet.vaccinationHistory.map((vaccine, index) => (
                  <Button key={index}  className="m-1 bg-primary">
                    {vaccine} <Button variant="link" size="sm" onClick={() => handleCheckboxChange('vaccinationHistory', vaccine)}>X</Button>
                  </Button>
                ))}
              </div>
            </Col>
          </Row>
          <div className="d-flex gap-2 mt-5">
  <Button
    variant="primary"
    onClick={() => navigate(`/Home/HandlingGuide/${pet.breed}`)}
    className="w-100"
  >
    View Handling Guide
  </Button>
  <Button
    variant="primary"
    onClick={handleShowVaccineModal}
    className="w-100"
  >
    View Vaccination Suggestions
  </Button>
</div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Pet Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Image Upload */}
            <Form.Group className="mb-3">
              <Form.Label>Image File</Form.Label>
              <Form.Control type="file" onChange={handleImageUpload} />
            </Form.Group>

            {/* Name */}
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editData.name || ''}
                onChange={handleEditChange}
                required
              />
            </Form.Group>

            {/* Species */}
            <Form.Group className="mb-3">
              <Form.Label>Species</Form.Label>
              <Form.Select
                name="species"
                value={editData.species || ''}
                onChange={handleSpeciesChange}
                required
              >
                <option value="">Select Species</option>
                {speciesOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Breed */}
            <Form.Group className="mb-3">
              <Form.Label>Breed</Form.Label>
              <Select
                name="breed"
                options={getBreedsBySpecies(editData.species)}
                value={editData.breed ? { label: editData.breed, value: editData.breed } : null}
                onChange={handleBreedChange}
              />
            </Form.Group>

            {/* Vaccination */}
            <Form.Group className="mb-3">
              <Form.Label>Vaccination History</Form.Label>
              <Select
                isMulti
                options={getVaccinationOptions(editData.species)}
                value={editData.vaccinationHistory.map(vaccine => ({
                  label: vaccine,
                  value: vaccine,
                }))}
                onChange={handleVaccinationChange}
              />
            </Form.Group>

            {/* Birthday */}
            <Form.Group className="mb-3">
              <Form.Label>Birthday</Form.Label>
              <Form.Control
                type="date"
                name="birthday"
                value={editData.birthday || ''}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this pet profile?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

           {/* Vaccination Suggestion Modal */}
           <Modal show={showVaccineModal} onHide={handleCloseVaccineModal}>
        <Modal.Header closeButton>
          <Modal.Title>Vaccination Suggestions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Required Vaccines</h5>
          <ul>
            {vaccinationSuggestions.required.length > 0 ? (
              vaccinationSuggestions.required.map((vaccine, index) => (
                <li key={index}>
                  <strong>{vaccine.name}</strong> - {vaccine.description}
                </li>
              ))
            ) : (
              <p>No required vaccines</p>
            )}
          </ul>

          <h5>Recommended Vaccines</h5>
          <ul>
            {vaccinationSuggestions.recommended.length > 0 ? (
              vaccinationSuggestions.recommended.map((vaccine, index) => (
                <li key={index}>
                  <strong>{vaccine.name}</strong> - {vaccine.description}
                </li>
              ))
            ) : (
              <p>No recommended vaccines</p>
            )}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseVaccineModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  ) : (
    <div></div>
  );
};

export default PetProfile;
