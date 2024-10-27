import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button, Modal, Form } from 'react-bootstrap';
import breedsData from '../jsons/breeds.json';
import Select from 'react-select';

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

      setPet({ ...petData, vaccinationHistory, medicalHistory });
      setEditData({ ...petData, vaccinationHistory, medicalHistory });
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
    { value: 'cat', label: 'Cat' },
    { value: 'dog', label: 'Dog' }
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

  const handleBreedChange = (selectedOption) => {
    setEditData({ ...editData, breed: selectedOption ? selectedOption.value : '' });
  };
  const calculateAge = (birthday) => {
    const birthDate = new Date(birthday);
    const ageDiff = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };
  return pet ? (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="col-xxl">
          <div className="card mb-4">
            <div className="card-header d-flex align-items-center">
              <table>
                <tbody>
                  <tr>
                    <th>
                      <img
                        src={pet.image}
                        alt={pet.name}
                        className="w-px-50 h-auto rounded-circle"
                      />
                    </th>
                    <th>
                      <h3 className="card-title text-primary fw-bold">
                        &nbsp;{pet.name}
                      </h3>
                    </th>
                  </tr>
                </tbody>
              </table>
              <div
                className="position-absolute top-0 end-0"
                style={{ paddingTop: '10px', paddingRight: '10px' }}
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowEditModal(true)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-danger ms-2"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="card-body">
              <div>
                <div className="row mb-3">
                  <div className="col-sm-2 col-form-label">
                    <label className="col-form-label">Age</label>
                  </div>
                  <div className="col-sm-10">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                    >
                      {calculateAge(pet.birthday)}
                    </button>
                  </div>
                </div>
                <div className="row mb-3">
                  <label className="col-sm-2 col-form-label">Birthday</label>
                  <div className="col-sm-2">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                    >
                      {pet.birthday}
                    </button>
                  </div>
                </div>
                <div className="row mb-3">
                  <label className="col-sm-2 col-form-label">Breed</label>
                  <div className="col-sm-10">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                    >
                      {pet.breed}
                    </button>
                  </div>
                </div>
                <div className="row mb-3">
                  <label className="col-sm-2 col-form-label">Vaccine History</label>
                  <div className="col-sm-10">
                    {pet.vaccinationHistory && pet.vaccinationHistory.map((vaccine, index) => (
                      <button
                        key={index}
                        type="button"
                        className="btn btn-outline-primary m-1"
                      >
                        {vaccine}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="row mb-3">
                  <label className="col-sm-2 col-form-label">Medical History</label>
                  <div className="col-sm-10">
                    {pet.medicalHistory && pet.medicalHistory.map((condition, index) => (
                      <button
                        key={index}
                        type="button"
                        className="btn btn-outline-primary m-1"
                      >
                        {condition}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="d-grid gap-2 col-lg-6 mx-auto" style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => navigate(`/Home/HandlingGuide/${pet.breed}`)}
                  >
                    Handling Guide
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Pet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Image Upload */}
            <Form.Group className="mb-3">
              <Form.Label>Image File</Form.Label>
              <Form.Control type="file" name="imageFile" onChange={handleImageUpload} />
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

            {/* Species Dropdown */}
            <Form.Group className="mb-3">
              <Form.Label>Species</Form.Label>
              <Form.Select name="species" value={editData.species || ''} onChange={handleSpeciesChange} required>
                <option value="">Select Species</option>
                {speciesOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Breed Dropdown */}
            <Form.Group className="mb-3">
              <Form.Label>Breed</Form.Label>
              <Select
                options={getBreedsBySpecies(editData.species)}
                onChange={handleBreedChange}
                value={editData.breed ? { value: editData.breed, label: editData.breed } : null}
                isClearable
              />
            </Form.Group>

            {/* Vaccination History */}
            <Form.Group className="mb-3">
              <Form.Label>Vaccination History</Form.Label>
              <Form.Control
                type="text"
                value={editData.vaccinationHistory.join(', ') || ''}
                onChange={(e) => handleCheckboxChange('vaccinationHistory', e.target.value)}
              />
            </Form.Group>

            {/* Medical History */}
            <Form.Group className="mb-3">
              <Form.Label>Medical History</Form.Label>
              <Form.Control
                type="text"
                value={editData.medicalHistory.join(', ') || ''}
                onChange={(e) => handleCheckboxChange('medicalHistory', e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Pet</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this pet profile?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default PetProfile;
