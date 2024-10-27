import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import { db, storage } from '../firebaseConfig';
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import petBreedsData from '../jsons/breeds.json';

const AddPetModal = ({ show, handleClose, userId }) => {
  const [petData, setPetData] = useState({
    imageFile: null,
    name: "",
    species: "",
    breed: "",
    birthday: "",
    vaccinationHistory: "",
    medicalHistory: ""
  });

  // Filter and map breeds based on selected species
  const getBreedsBySpecies = (species) => {
    if (!species) return []; // Return empty if species is not set
    return petBreedsData[species]?.map((breed) => ({
      value: breed.breed,
      label: breed.breed
    })) || [];
  };

  const vaccines = {
    cat: ["Rabies", "FVRCP", "FeLV"],
    dog: ["Rabies", "Distemper", "Parvovirus"]
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imageFile") {
      setPetData({ ...petData, imageFile: files[0] });
    } else {
      setPetData({ ...petData, [name]: value });
    }
  };

  const handleBreedChange = (selectedOption) => {
    setPetData({ ...petData, breed: selectedOption ? selectedOption.value : "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      console.error("User ID is not defined");
      return;
    }

    let imageUrl = "";
    if (petData.imageFile) {
      const imageRef = ref(storage, `pets/${userId}/${petData.imageFile.name}`);
      await uploadBytes(imageRef, petData.imageFile);
      imageUrl = await getDownloadURL(imageRef);
    }

    const petDataToSave = {
      ...petData,
      image: imageUrl,
      userId 
    };

    delete petDataToSave.imageFile;

    try {
      const petsCollectionRef = collection(db, 'pets'); 
      await addDoc(petsCollectionRef, petDataToSave);
      handleClose();
    } catch (error) {
      console.error("Error adding pet: ", error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Pet</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Image File</Form.Label>
            <Form.Control
              type="file"
              name="imageFile"
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={petData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Species</Form.Label>
            <Form.Select
              name="species"
              value={petData.species}
              onChange={handleChange}
              required
              defaultValue=""
            >
              <option value="">Select species</option>
              <option value="cats">Cat</option>
              <option value="dogs">Dog</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Breed</Form.Label>
            <Select
              options={getBreedsBySpecies(petData.species)}
              onChange={handleBreedChange}
              isClearable
              placeholder="Select breed"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Birthday</Form.Label>
            <Form.Control type="date" name="birthday" value={petData.birthday} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Vaccination History</Form.Label>
            <Form.Select name="vaccinationHistory" value={petData.vaccinationHistory} onChange={handleChange}>
              <option value="">Select vaccination</option>
              {(vaccines[petData.species] || []).map((vaccine, index) => (
                <option key={index} value={vaccine}>
                  {vaccine}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Medical History</Form.Label>
            <Form.Control
              as="textarea"
              name="medicalHistory"
              value={petData.medicalHistory}
              onChange={handleChange}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Save Pet
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddPetModal;
