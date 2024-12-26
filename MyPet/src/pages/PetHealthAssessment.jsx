import React, { useState, useEffect } from "react";
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { auth, db } from "../firebaseConfig";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  serverTimestamp 
} from "firebase/firestore";

const PetHealthAssessment = ({ onClose }) => {
  const [formData, setFormData] = useState({
    petType: '',
    age: '',
    generalHealth: {
      eatingNormally: '',
      weightChange: '',
      unusualBehaviors: []
    },
    specificSymptoms: {
      vomitingDiarrhea: '',
      breathingDifficulty: '',
      painDiscomfort: ''
    },
    physicalChanges: {
      lumpsOrWounds: '',
      coatSkinCondition: ''
    },
    activityLevel: {
      energyChange: '',
      mobility: ''
    }
  });

  const [result, setResult] = useState(null);
  const [userId, setUserId] = useState(null);
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState('');

  const unusualBehaviorOptions = [
    'Lethargy', 
    'Aggression', 
    'Excessive Sleeping', 
    'Anxiety', 
    'Confusion'
  ];

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const [section, field] = name.split('.');

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: checked 
            ? [...(prev[section][field] || []), value]
            : (prev[section][field] || []).filter(item => item !== value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  const evaluatePetHealth = () => {
    let urgencyScore = 0;

    // Similar evaluation logic as before
    if (formData.generalHealth.eatingNormally === 'no') urgencyScore += 2;
    if (formData.generalHealth.weightChange === 'significant') urgencyScore += 3;
    if (formData.generalHealth.unusualBehaviors.length > 1) urgencyScore += 2;

    if (formData.specificSymptoms.vomitingDiarrhea === 'yes') urgencyScore += 4;
    if (formData.specificSymptoms.breathingDifficulty === 'yes') urgencyScore += 5;
    if (formData.specificSymptoms.painDiscomfort === 'yes') urgencyScore += 4;

    if (formData.physicalChanges.lumpsOrWounds === 'yes') urgencyScore += 3;
    if (formData.physicalChanges.coatSkinCondition === 'severe') urgencyScore += 2;

    if (formData.activityLevel.energyChange === 'significant') urgencyScore += 3;
    if (formData.activityLevel.mobility === 'limited') urgencyScore += 4;

    let recommendation = '';
    if (urgencyScore >= 8) {
      recommendation = 'CRITICAL: Immediate Veterinary Care Required';
    } else if (urgencyScore >= 5) {
      recommendation = 'URGENT: Schedule Veterinary Consultation Soon';
    } else if (urgencyScore >= 3) {
      recommendation = 'MODERATE: Monitor Closely and Consider Vet Check';
    } else {
      recommendation = 'LOW RISK: Continue Regular Monitoring';
    }

    return { urgencyScore, recommendation };
  };

  const calculateAgeInMonths = (birthdayString) => {
    const birthday = new Date(birthdayString);
    const today = new Date();
    
    const months = (today.getFullYear() - birthday.getFullYear()) * 12 
      + (today.getMonth() - birthday.getMonth());
    
    return months;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedPetId) {
      alert('Please select a pet');
      return;
    }
  
    const selectedPet = pets.find((pet) => pet.id === selectedPetId);
  
    try {
      // Get today's date in a comparable format
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize time to start of the day
  
      const q = query(
        collection(db, "petHealthSurveys"),
        where("userId", "==", userId),
        where("petId", "==", selectedPetId)
      );
  
      const querySnapshot = await getDocs(q);
  
      // Check if any survey was submitted today
      const existingEntry = querySnapshot.docs.find((doc) => {
        const surveyDate = doc.data().timestamp?.toDate(); // Convert Firestore timestamp
        return (
          surveyDate &&
          surveyDate.getFullYear() === today.getFullYear() &&
          surveyDate.getMonth() === today.getMonth() &&
          surveyDate.getDate() === today.getDate()
        );
      });
  
      if (existingEntry) {
        alert('An evaluation has already been submitted for this pet today.');
        return;
      }
  
      const healthResult = evaluatePetHealth();
      const ageInMonths = calculateAgeInMonths(selectedPet.birthday);
  
      const surveyData = {
        userId: userId,
        petId: selectedPetId,
        petName: selectedPet.name,
        petType: selectedPet.species,
        petAge: ageInMonths,
        formData: formData,
        result: healthResult,
        timestamp: serverTimestamp(),
      };
  
      await addDoc(collection(db, "petHealthSurveys"), surveyData);
      setResult(healthResult);
    } catch (error) {
      console.error("Error submitting survey: ", error);
      alert('Failed to submit survey. Please try again.');
    }
  };

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header as="h3" className="text-center">
          Comprehensive Pet Health Assessment
          <Button 
            variant="outline-secondary" 
            className="float-end"
            onClick={onClose}
          >
            Back to Journal
          </Button>
        </Card.Header>
        <Card.Body>
          {/* Pet Selection */}
          {userId && pets.length > 0 && (
            <Form.Group className="mb-3">
              <Form.Label>Select Pet</Form.Label>
              <Form.Select 
                value={selectedPetId} 
                onChange={(e) => setSelectedPetId(e.target.value)}
                required
              >
                <option value="">Choose a Pet</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} ({pet.species})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

<Form onSubmit={handleSubmit}>
                        {/* General Health Section */}
                        <h5 className="mt-4 mb-3">General Health</h5>
            <Form.Group className="mb-3">
              <Form.Label>Is your pet eating and drinking normally?</Form.Label>
              <Form.Select 
                name="generalHealth.eatingNormally" 
                value={formData.generalHealth.eatingNormally} 
                onChange={handleInputChange} 
                required
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Weight Changes</Form.Label>
              <Form.Select 
                name="generalHealth.weightChange" 
                value={formData.generalHealth.weightChange} 
                onChange={handleInputChange} 
                required
              >
                <option value="none">No Changes</option>
                <option value="minor">Minor Changes</option>
                <option value="significant">Significant Changes</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Unusual Behaviors</Form.Label>
              {unusualBehaviorOptions.map((behavior) => (
                <Form.Check 
                  key={behavior}
                  type="checkbox"
                  label={behavior}
                  name="generalHealth.unusualBehaviors"
                  value={behavior}
                  checked={formData.generalHealth.unusualBehaviors.includes(behavior)}
                  onChange={handleInputChange}
                />
              ))}
            </Form.Group>

            {/* Specific Symptoms Section */}
            <h5 className="mt-4 mb-3">Specific Symptoms</h5>
            <Form.Group className="mb-3">
              <Form.Label>Vomiting or Diarrhea</Form.Label>
              <Form.Select 
                name="specificSymptoms.vomitingDiarrhea" 
                value={formData.specificSymptoms.vomitingDiarrhea} 
                onChange={handleInputChange} 
                required
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Breathing Difficulty</Form.Label>
              <Form.Select 
                name="specificSymptoms.breathingDifficulty" 
                value={formData.specificSymptoms.breathingDifficulty} 
                onChange={handleInputChange} 
                required
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Signs of Pain or Discomfort</Form.Label>
              <Form.Select 
                name="specificSymptoms.painDiscomfort" 
                value={formData.specificSymptoms.painDiscomfort} 
                onChange={handleInputChange} 
                required
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Form.Select>
            </Form.Group>

            {/* Physical Changes Section */}
            <h5 className="mt-4 mb-3">Physical Changes</h5>
            <Form.Group className="mb-3">
              <Form.Label>Lumps, Bumps, or Wounds</Form.Label>
              <Form.Select 
                name="physicalChanges.lumpsOrWounds" 
                value={formData.physicalChanges.lumpsOrWounds} 
                onChange={handleInputChange} 
                required
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Coat and Skin Condition</Form.Label>
              <Form.Select 
                name="physicalChanges.coatSkinCondition" 
                value={formData.physicalChanges.coatSkinCondition} 
                onChange={handleInputChange} 
                required
              >
                <option value="normal">Normal</option>
                <option value="mild">Mild Changes</option>
                <option value="severe">Severe Changes</option>
              </Form.Select>
            </Form.Group>

            {/* Activity Level Section */}
            <h5 className="mt-4 mb-3">Activity Level</h5>
            <Form.Group className="mb-3">
              <Form.Label>Energy Level Changes</Form.Label>
              <Form.Select 
                name="activityLevel.energyChange" 
                value={formData.activityLevel.energyChange} 
                onChange={handleInputChange} 
                required
              >
                <option value="none">No Changes</option>
                <option value="minor">Minor Changes</option>
                <option value="significant">Significant Changes</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mobility</Form.Label>
              <Form.Select 
                name="activityLevel.mobility" 
                value={formData.activityLevel.mobility} 
                onChange={handleInputChange} 
                required
              >
                <option value="normal">Normal</option>
                <option value="limited">Limited</option>
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 mt-3">
              Evaluate Pet Health
            </Button>
          </Form>

          {result && (
            <Alert 
              variant={
                result.recommendation.includes('CRITICAL') ? 'danger' : 
                result.recommendation.includes('URGENT') ? 'warning' : 
                result.recommendation.includes('MODERATE') ? 'info' : 'success'
              } 
              className="mt-3"
            >
              <Alert.Heading>Health Assessment Result</Alert.Heading>
              <p>{result.recommendation}</p>
              <hr />
              <p className="mb-0">
                Urgency Score: {result.urgencyScore}
                <br />
                Please consult with a veterinarian for professional medical advice.
              </p>
            </Alert>
          )}
        </Card.Body>
      </Card>
      <Card className="p-3">
        <Card.Body>
          <Card.Text className="text-justify">
            This evaluation logic assesses a pet's health urgency based on form data, with score weights and thresholds designed to prioritize symptoms and conditions based on their potential severity. For general health, a pet not eating normally adds <strong>2 points</strong>, as it could indicate illness, stress, or gastrointestinal problems. Significant weight changes, which may signal chronic illness or malnutrition, add <strong>3 points</strong>, while multiple unusual behaviors, potentially pointing to systemic or neurological issues, add <strong>2 points</strong>. Specific symptoms like persistent vomiting or diarrhea, which can lead to dehydration and signify serious conditions, add <strong>4 points</strong>. Breathing difficulty, being potentially life-threatening, adds the highest weight of <strong>5 points</strong>, and observed pain or discomfort, indicative of injury or internal problems, adds <strong>4 points</strong>.
          </Card.Text>
          <Card.Text className="text-justify">
            Physical changes such as visible lumps or wounds, which may indicate infection or trauma, add <strong>3 points</strong>, while severe coat or skin conditions, often linked to parasites or allergies, add <strong>2 points</strong>. Activity level issues like significant energy changes, possibly indicating systemic illness, add <strong>3 points</strong>, and limited mobility, which could stem from injury or neurological problems, adds <strong>4 points</strong>.
          </Card.Text>
          <Card.Text className="font-weight-bold">
            The recommendation thresholds are as follows: a score of 8 or more indicates critical symptoms requiring immediate veterinary attention, 5 to 7 points suggests urgent care, 3 to 4 points implies moderate issues needing close monitoring, and less than 3 points denotes low risk where regular observation suffices. The weights (ranging from 2 to 5 points) correlate with the potential severity and urgency of each condition, ensuring critical symptoms like breathing difficulty are prioritized, while the thresholds guide appropriate actions based on the cumulative score.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PetHealthAssessment;