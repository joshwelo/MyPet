  import React, { useState, useEffect } from 'react';
  import { useParams, useNavigate } from 'react-router-dom';
  import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
  import { db } from '../firebaseConfig';
  import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { Button, Modal, Form, Container, Card } from 'react-bootstrap';
  import breedsData from '../jsons/breeds.json';
  import vaccineData from '../jsons/vaccines.json'; 
  import milestoneData from '../jsons/milestones.json';
  import Select from 'react-select';
  import petImage from '../assets/mypetlogo.png';
import './PetProfile.css'

  const PetProfile = () => {
    const { petId } = useParams();
    const navigate = useNavigate();
    const [pet, setPet] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editData, setEditData] = useState({});
    const [imageFile, setImageFile] = useState(null);

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
    
        const petWithId = { 
          id: petDoc.id, 
          ...petData, 
          vaccinationHistory, 
          medicalHistory 
        };
    
        setPet(petWithId);
        setEditData(petWithId);
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

    const getMilestones = (species, ageInMonths) => {
      const milestones = species === 'dogs' 
        ? milestoneData.dogMilestones 
        : milestoneData.catMilestones || [];
    
      // Sort milestones by months in ascending order
      const sortedMilestones = milestones.sort((a, b) => a.months - b.months);
    
      // Mark milestones as passed if the pet's age is greater than or equal to the milestone age
      return sortedMilestones.map(milestone => ({
        ...milestone,
        passed: ageInMonths >= milestone.months,
      }));
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

    const calculateAgeInMonths = (birthday) => {
      const birthDate = new Date(birthday);
      const today = new Date();
      const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                    (today.getMonth() - birthDate.getMonth());
      return months;
    };

    const calculateHumanYears = (ageInMonths, species) => {
      if (ageInMonths <= 0) return 0; // Invalid or newborn age
      
      const ageInYears = Math.floor(ageInMonths / 12);
    
      if (species === 'cats') {
        // Cat age conversion chart
        if (ageInYears === 1) return 15;
        if (ageInYears === 2) return 24;
        if (ageInYears >= 18) return 88;
        return 24 + (ageInYears - 2) * 4; // Years beyond the second year
      } else if (species === 'dogs') {
        // Dog age conversion (based on medium-sized dog logic)
        if (ageInYears === 1) return 15;
        if (ageInYears === 2) return 24;
        return 24 + (ageInYears - 2) * 5; // Each additional year adds 5 human years
      } else {
        throw new Error('Unsupported species provided.');
      }
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
    const handleVaccineClick = (petId) => {
      navigate(`/Home/PetProfile/${petId}`);
    };
    return pet ? (
      <Container className="py-4">
        <Card className="shadow-sm border-0">
          <Card.Body>
            <div className="d-flex flex-column flex-md-row align-items-center mb-4">
              <div className="text-center mb-3 mb-md-0 me-md-4">
                <img
                  src={pet.image || petImage}
                  alt={pet.name}
                  className="rounded-circle shadow"
                  style={{ 
                    width: '200px', 
                    height: '200px', 
                    objectFit: 'cover' 
                  }}
                />
              </div>
              <div className="text-center text-md-start">
                <h2 className="fw-bold text-primary mb-2">
                  {pet.name}
                </h2>
                <p className="text-muted mb-3">
                  {pet.species} | {pet.breed}
                </p>
                <div className="d-flex justify-content-center justify-content-md-start gap-2">
                  <Button 
                    variant="outline-primary" 
                    onClick={() => setShowEditModal(true)}
                    className="d-flex align-items-center"
                  >
                    <i className='me-2 bx bxs-edit'></i> Edit
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    onClick={() => setShowDeleteModal(true)}
                    className="d-flex align-items-center"
                  >
                    <i className='me-2  bx bxs-trash' ></i> Delete
                  </Button>
                </div>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <h6 className="card-title d-flex align-items-center">
                    <i className='me-2 bx bxs-calendar' ></i> Age Details
                    </h6>
                    <div className="d-flex flex-column">
                      <div className="mb-2">
                        <small className="text-muted">Months Old</small>
                        <div className="h5 mb-0">{calculateAgeInMonths(pet.birthday)} months</div>
                      </div>
                      <div>
                        <small className="text-muted">Human Years</small>
                        <div className="h5 mb-0">
                          {calculateHumanYears(
                            calculateAgeInMonths(pet.birthday), 
                            pet.species
                          )} years old  
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>

              <div className="col-12 col-md-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <h6 className="card-title d-flex align-items-center">
                    <i className='me-2 bx bxs-calendar' ></i> Birthday
                    </h6>
                    <div className="h5">{pet.birthday}</div>
                  </Card.Body>
                </Card>
              </div>

              <div className="col-12 col-md-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <h6 className="card-title d-flex align-items-center">
                    <i className='me-2 bx bxs-injection' ></i> Vaccination History
                    </h6>
                    <div className="d-flex flex-wrap gap-1">
                      {pet.vaccinationHistory.map((vaccine, index) => (
                        <i key={index} className='me-1 mb-1 bx bxs-badge-check' >{vaccine}</i>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>

            <div className="d-flex flex-column flex-md-row gap-2 mt-4">
              <Button
                variant="outline-primary"
                onClick={() => navigate(`/Home/HandlingGuide/${pet.breed}`)}
                className="flex-grow-1 d-flex align-items-center justify-content-center"
              >
                <i className='me-2 bx bxs-box'></i> View Handling Guide
              </Button>
              <Button
                variant="outline-primary"
                onClick={() => navigate(`/Home/PetVaccinationTracker/${pet.id}`)}
                className="flex-grow-1 d-flex align-items-center justify-content-center"
              >
                <i className="me-2 bx bxs-box"></i> Vaccination
              </Button>

            </div>
          </Card.Body>
        </Card>
      {/* Milestones Timeline Section */}
      <div className="timeline">
  {getMilestones(pet.species, calculateAgeInMonths(pet.birthday)).map((milestone, index) => (
    <div 
      key={index} 
      className={`timeline-item ${index % 2 === 0 ? 'timeline-item-left' : 'timeline-item-right'} ${
        milestone.passed ? 'milestone-passed' : ''
      }`}
    >
      <div className="timeline-content">
        <h6 className="timeline-title">
          {milestone.milestone} 
          {milestone.passed && (
            <i className="ms-2 bx bxs-check-circle text-success"></i>
          )}
        </h6>
        <p className="timeline-description text-muted">
          {milestone.description}
        </p>
        <span className="timeline-age text-muted">
          {milestone.months} months
        </span>
      </div>
    </div>
  ))}
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
      </Container>
    ) : (
      <div></div>
    );
  };

  export default PetProfile;
