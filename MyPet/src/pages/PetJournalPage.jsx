import React, { useState, useEffect } from "react";
import { Container, Form, Button, Card, Alert, Modal } from 'react-bootstrap';
import { auth, db } from "../firebaseConfig";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  deleteDoc,
  doc, 
  serverTimestamp, 
  orderBy 
} from "firebase/firestore";


const PetHealthSurvey = () => {
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
  const [loading, setLoading] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalEntries, setJournalEntries] = useState([]);

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
  const fetchJournalEntries = async () => {
    if (!userId) return;

    try {
      const q = query(
        collection(db, "petHealthSurveys"), 
        where("userId", "==", userId),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      const entries = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setJournalEntries(entries);
    } catch (error) {
      console.error("Error fetching journal entries: ", error);
    }
  };

  // New function to remove a journal entry
  const removeJournalEntry = async (entryId) => {
    try {
      await deleteDoc(doc(db, "petHealthSurveys", entryId));
      // Remove the entry from local state
      setJournalEntries(prev => prev.filter(entry => entry.id !== entryId));
    } catch (error) {
      console.error("Error removing journal entry: ", error);
      alert('Failed to remove entry. Please try again.');
    }
  };
    // Open journal entries modal and fetch entries
    const openJournalModal = () => {
      fetchJournalEntries();
      setShowJournalModal(true);
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

    // General Health Evaluation
    if (formData.generalHealth.eatingNormally === 'no') urgencyScore += 2;
    if (formData.generalHealth.weightChange === 'significant') urgencyScore += 3;
    if (formData.generalHealth.unusualBehaviors.length > 1) urgencyScore += 2;

    // Specific Symptoms Evaluation
    if (formData.specificSymptoms.vomitingDiarrhea === 'yes') urgencyScore += 4;
    if (formData.specificSymptoms.breathingDifficulty === 'yes') urgencyScore += 5;
    if (formData.specificSymptoms.painDiscomfort === 'yes') urgencyScore += 4;

    // Physical Changes Evaluation
    if (formData.physicalChanges.lumpsOrWounds === 'yes') urgencyScore += 3;
    if (formData.physicalChanges.coatSkinCondition === 'severe') urgencyScore += 2;

    // Activity Level Evaluation
    if (formData.activityLevel.energyChange === 'significant') urgencyScore += 3;
    if (formData.activityLevel.mobility === 'limited') urgencyScore += 4;

    // Determine recommendation
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

    return {
      urgencyScore,
      recommendation
    };
  };
  const calculateAgeInMonths = (birthdayString) => {
    const birthday = new Date(birthdayString);
    const today = new Date();
    
    // Calculate difference in months
    const months = (today.getFullYear() - birthday.getFullYear()) * 12 
      + (today.getMonth() - birthday.getMonth());
    
    return months;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate pet selection
    if (!selectedPetId) {
      alert('Please select a pet');
      return;
    }
  
    // Find the selected pet to get its birthday
    const selectedPet = pets.find(pet => pet.id === selectedPetId);
    
    try {
      // Evaluate pet health
      const healthResult = evaluatePetHealth();
  
      // Calculate age in months
      const ageInMonths = calculateAgeInMonths(selectedPet.birthday);
  
      // Prepare data for Firestore
      const surveyData = {
        userId: userId,
        petId: selectedPetId,
        petName: selectedPet.name,
        petType: selectedPet.species,
        petAge: ageInMonths, // Age in months
        formData: formData,
        result: healthResult,
        timestamp: serverTimestamp()
      };
  
      // Add to Firestore collection
      const docRef = await addDoc(collection(db, "petHealthSurveys"), surveyData);
  
      // Set result state for display
      setResult(healthResult);
  
      console.log("Survey submitted with ID: ", docRef.id);
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
          {userId && (
            <Button 
              variant="outline-info" 
              className="float-end"
              onClick={openJournalModal}
            >
              View Journal Entries
            </Button>
          )}
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

          {/* Rest of the form remains the same as previous implementation */}
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
                    {/* Journal Entries Modal */}
                    <Modal 
            show={showJournalModal} 
            onHide={() => setShowJournalModal(false)}
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Pet Health Journal Entries</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {journalEntries.length === 0 ? (
                <p>No journal entries found.</p>
              ) : (
                journalEntries.map((entry) => (
                  <Card key={entry.id} className="mb-3">
                    <Card.Body>
                      <div className="d-flex justify-content-between">
                        <div>
                          <h5>
                            {entry.petName} {entry.petType} (Age: {entry.petAge} months) - {entry.result.recommendation}
                          </h5>
                          <p>
                            Urgency Score: {entry.result.urgencyScore}
                            <br />
                            Date: {entry.timestamp?.toDate()?.toLocaleString() || 'Unknown'}
                          </p>
                        </div>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => removeJournalEntry(entry.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Modal.Body>
          </Modal>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PetHealthSurvey;