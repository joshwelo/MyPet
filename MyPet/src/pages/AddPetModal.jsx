import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import { db, storage } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import petBreedsData from '../jsons/breeds.json';
import petVaccinationData from '../jsons/vaccines.json';
import { Link } from 'react-router-dom';

const AddPetModal = ({ show, handleClose, userId }) => {
  const [petData, setPetData] = useState({
    imageFile: null,
    name: "",
    species: "",
    breed: "",
    birthday: "",
    sex: "",
    vaccinationHistory: [],
    medicalHistory: ""
  });
  const [errors, setErrors] = useState({
    name: false,
    species: false,
    breed: false,
    sex: false,
    birthday: false
  });
  const [saving, setSaving] = useState(false);

  // Filter and map breeds based on selected species
  const getBreedsBySpecies = (species) => {
    if (!species) return [];
    return petBreedsData[species]?.map((breed) => ({
      value: breed.breed,
      label: breed.breed
    })) || [];
  };

  // Filter and map vaccines based on species
  const getVaccinesBySpecies = (species) => {
    if (!species) return [];
    return petVaccinationData[species]?.map((vaccine) => ({
      value: vaccine.name,
      label: vaccine.name
    })) || [];
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imageFile") {
      setPetData({ ...petData, imageFile: files[0] });
    } else {
      setPetData({ ...petData, [name]: value });
    }
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  const handleBreedChange = (selectedOption) => {
    setPetData({ ...petData, breed: selectedOption ? selectedOption.value : "" });
    if (errors.breed) {
      setErrors({ ...errors, breed: false });
    }
  };

  const handleVaccinationChange = (selectedOptions) => {
    setPetData({ ...petData, vaccinationHistory: selectedOptions.map(option => option.value) });
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: false,
      species: false,
      breed: false,
      sex: false,
      birthday: false
    };

    if (!petData.name) {
      newErrors.name = true;
      isValid = false;
    }

    if (!petData.species) {
      newErrors.species = true;
      isValid = false;
    }

    if (!petData.breed) {
      newErrors.breed = true;
      isValid = false;
    }

    if (!petData.sex) {
      newErrors.sex = true;
      isValid = false;
    }

    if (!petData.birthday) {
      newErrors.birthday = true;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const checkDuplicateName = async (name) => {
    const petsCollectionRef = collection(db, 'pets');
    const q = query(petsCollectionRef, where("userId", "==", userId), where("name", "==", name));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Pet Data Before Submission:", petData);
    console.log("User ID:", userId);

    if (!userId) {
      console.error("User ID is not defined");
      return;
    }

    if (!validateForm()) {
      console.log("Form Validation Failed", errors);
      return;
    }

    setSaving(true);

    try {
      const isDuplicate = await checkDuplicateName(petData.name);
      if (isDuplicate) {
        setErrors((prev) => ({ ...prev, name: true }));
        setSaving(false);
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

      const petsCollectionRef = collection(db, 'pets');
      await addDoc(petsCollectionRef, petDataToSave);

      handleClose();
    } catch (error) {
      console.error("Error adding pet: ", error);
    } finally {
      setSaving(false);
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
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={petData.name}
              onChange={handleChange}
              isInvalid={errors.name}
              required
            />
            {errors.name && <Form.Control.Feedback type="invalid">Name is required or already exists</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Species</Form.Label>
            <Form.Select
              name="species"
              value={petData.species}
              onChange={handleChange}
              isInvalid={errors.species}
              required
            >
              <option value="">Select species</option>
              <option value="cats">Cat</option>
              <option value="dogs">Dog</option>
            </Form.Select>
            {errors.species && <Form.Control.Feedback type="invalid">Species is required</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Breed</Form.Label>
            <Select
              options={getBreedsBySpecies(petData.species)}
              onChange={handleBreedChange}
              isClearable
              placeholder="Select breed"
            />
            {errors.breed && <div className="text-danger">Breed is required</div>}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Sex</Form.Label>
            <Form.Select
              name="sex"
              value={petData.sex}
              onChange={handleChange}
              isInvalid={errors.sex}
              required
            >
              <option value="">Select sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Form.Select>
            {errors.sex && <Form.Control.Feedback type="invalid">Sex is required</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Birthday</Form.Label>
            <Form.Control
              type="date"
              name="birthday"
              value={petData.birthday}
              onChange={handleChange}
              isInvalid={errors.birthday}
              required
            />
            {errors.birthday && <Form.Control.Feedback type="invalid">Birthday is required</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Vaccination History</Form.Label>
            <Select
              isMulti
              options={getVaccinesBySpecies(petData.species)}
              onChange={handleVaccinationChange}
              placeholder="Select vaccinations"
            />
          </Form.Group>
          <Link
            to="/Home/AiBreed"
            className="btn btn-secondary mt-3"
            style={{ display: 'block', textAlign: 'center' }}
          >
            Not sure about the breed? Go to AiBreed
          </Link>
          <Button 
            variant="primary" 
            className="mt-3" 
            type="submit" 
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Pet"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddPetModal;