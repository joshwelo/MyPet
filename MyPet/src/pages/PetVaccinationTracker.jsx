import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, addDoc, updateDoc,deleteField  } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import vaccineData from '../jsons/vaccines.json'; 
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Modal, Button, Form, Alert } from 'react-bootstrap'; // Importing Bootstrap Modal, Form, and Alert

const PetVaccinationTracker = () => {
  const { petId } = useParams();
  const [pet, setPet] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [upcomingVaccinations, setUpcomingVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // State for showing the modal
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [userId, setUserId] = useState('');
  const [showAlert, setShowAlert] = useState(false); // State for showing the alert
  const [alertMessage, setAlertMessage] = useState(''); // State to store the alert message
  const [reschedulingInfo, setReschedulingInfo] = useState({});
  const [currentVaccine, setCurrentVaccine] = useState(null);
  const [showAdministerModal, setShowAdministerModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [administeredDate, setAdministeredDate] = useState('');
  const [vaccineToEdit, setVaccineToEdit] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [reschedulingHistory, setReschedulingHistory] = useState({});

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const petDoc = await getDoc(doc(db, 'pets', petId));
        
        if (petDoc.exists()) {
          const petData = petDoc.data();
          setPet(petData);

          // Initialize rescheduling info from the pet's data
          const initialReschedulingInfo = {};
          if (petData.vaccinationHistory) {
            petData.vaccinationHistory.forEach(vaccine => {
              initialReschedulingInfo[vaccine] = petData.vaccinationReschedules?.[vaccine] || 0;
            });
          }
          setReschedulingInfo(initialReschedulingInfo);
          setReschedulingHistory(petData.vaccinationRescheduleHistory || {});

          // Rest of the existing pet data fetching logic...
          const birthDate = new Date(petData.birthday);
          const currentDate = new Date();
          const petAgeMonths = (currentDate.getFullYear() - birthDate.getFullYear()) * 12 + 
                               (currentDate.getMonth() - birthDate.getMonth());

          const speciesVaccines = vaccineData[petData.species] || [];
          const relevantVaccinations = speciesVaccines.filter(
            vaccine => petAgeMonths >= (vaccine.age || 0)
          );

          const vaccinationHistory = petData.vaccinationHistory || [];
          const upcoming = relevantVaccinations.filter(
            vaccine => vaccinationHistory.some(
              history => history.toLowerCase() === vaccine.name.toLowerCase()
            )
          );

          setVaccinations(relevantVaccinations);
          setUpcomingVaccinations(upcoming);
        }
      } catch (error) {
        console.error("Error fetching pet data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPetData();
  }, [petId]);


    // Fetch the current user's ID
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setUserId(user.uid);
          } else {
            console.log("User is not authenticated");
          }
        });
    
        return () => unsubscribe();
      }, []);

      const handleVaccinationSchedule = (vaccination) => {
        if (vaccination && vaccination.name) {
          setCurrentVaccine(vaccination);
          
          // Find the vaccine details from vaccineData
          const vaccineDetails = vaccineData[pet.species]?.find(
            v => v.name.toLowerCase() === vaccination.name.toLowerCase()
          );
          
          // Get the latest vaccination date (either from reschedule history or administration)
          const latestDate = getLatestVaccinationDate(vaccination.name);
          
          // Calculate the next recommended date
          const nextDate = calculateNextVaccinationDate(
            latestDate,
            vaccineDetails?.recommended_reschedule || 'annual'
          );
          
          // Set event details
          setEventName(`${pet.name} - ${vaccination.name} Vaccination`);
          setEventDate(nextDate);
          setEventTime('09:00'); // Default time
          
          // Get current reschedule count
          const currentRescheduleCount = reschedulingInfo[vaccination.name] || 0;
          
          // Create description with history information
          let historyText = '';
          if (latestDate) {
            historyText = `Last vaccination: ${latestDate}\n`;
            if (currentRescheduleCount > 0) {
              historyText += `Rescheduled ${currentRescheduleCount} time(s)\n`;
            }
          }
          
          setEventDescription(
            `${vaccination.description || ''}\n\n` +
            `Recommended Schedule: ${vaccineDetails?.recommended_reschedule}\n\n` +
            `${historyText}`
          );
          
          setShowModal(true);
        } else {
          console.error("Invalid vaccination data", vaccination);
        }
      };
    
    

      const handleScheduleEvent = async () => {
        try {
          if (!userId || !pet || !currentVaccine) {
            console.log("Error: Missing user, pet, or vaccine data");
            return;
          }
      
          setLoading(true);
      
          // Reset rescheduling info for this vaccine
          const updatedReschedulingInfo = {...reschedulingInfo};
          updatedReschedulingInfo[currentVaccine.name] = 
            (updatedReschedulingInfo[currentVaccine.name] || 0) + 1;
          
          // Clear rescheduling history for this vaccine
          const updatedRescheduleHistory = {...reschedulingHistory};
          if (!updatedRescheduleHistory[currentVaccine.name]) {
            updatedRescheduleHistory[currentVaccine.name] = [];
          }
          updatedRescheduleHistory[currentVaccine.name].push({
            date: eventDate,
            time: eventTime,
            count: updatedReschedulingInfo[currentVaccine.name]
          });
    
      
          // Prepare event data
          const event = {
            eventName: eventName,
            description: eventDescription,
            date: eventDate,
            time: eventTime || "09:00",
            userId: userId,
            petId: petId,
            notified: false,
            tag: "vaccination",
            rescheduleCount: 0 // Reset to 0 since we're clearing history
          };
      
          // Add event to calendar
          const calendarRef = collection(db, "calendar");
          await addDoc(calendarRef, event);
      
          // Add to vaccination history if not already present
          const currentVaccinationHistory = pet.vaccinationHistory || [];
          let updatedHistory = [...currentVaccinationHistory];
          if (!updatedHistory.includes(currentVaccine.name)) {
            updatedHistory.push(currentVaccine.name);
          }
      
          // Update pet document with new vaccination history and cleared rescheduling info
          const petDocRef = doc(db, 'pets', petId);
          await updateDoc(petDocRef, {
            vaccinationHistory: updatedHistory,
            vaccinationReschedules: updatedReschedulingInfo,
            vaccinationRescheduleHistory: updatedRescheduleHistory
          });
      
          // Update local state
          setPet({
            ...pet,
            vaccinationHistory: updatedHistory
          });
          setReschedulingInfo(updatedReschedulingInfo);
          setReschedulingHistory(updatedRescheduleHistory);
      
          setAlertMessage(`Event scheduled for ${currentVaccine.name}`);
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 5000);
      
        } catch (error) {
          console.error("Error scheduling event:", error);
          setAlertMessage("Error scheduling event");
          setShowAlert(true);
        } finally {
          setLoading(false);
          setShowModal(false);
        }
      };

      const renderReschedulingInfo = (history) => {
        const rescheduleCount = reschedulingInfo[history] || 0;
        const rescheduleHistoryList = reschedulingHistory[history] || [];
        
        if (rescheduleCount === 0) {
          return 'Not rescheduled';
        }
    
        return (
          <div>
            <div>Taken {rescheduleCount} time(s)</div>
            <div className="small text-muted">
              {rescheduleHistoryList.map((record, index) => (
                <div key={index}>
                  Take #{record.count}: {record.date} at {record.time}
                </div>
              ))} 
            </div>
          </div>

        );
      };
      const calculateNextVaccinationDate = (lastDate, recommendedReschedule) => {
        if (!lastDate) return '';
    
        const lastVaccinationDate = new Date(lastDate);
        let nextDate = new Date(lastVaccinationDate);
    
        // Parse the recommended reschedule text to determine the interval
        const rescheduleText = recommendedReschedule.toLowerCase();
        
        if (rescheduleText.includes('semi-annual')) {
          nextDate.setMonth(nextDate.getMonth() + 6);
        } else if (rescheduleText.includes('series')) {
          if (rescheduleText.includes('two-dose')) {
            // For two-dose series, add 3-4 weeks
            nextDate.setDate(nextDate.getDate() + 21); // Using 3 weeks as default
          } else if (rescheduleText.includes('6, 10, and 14 weeks')) {
            // For puppy/kitten series, add 4 weeks between doses
            nextDate.setDate(nextDate.getDate() + 28);
          } else {
            // Default series interval
            nextDate.setDate(nextDate.getDate() + 28);
          }
        } else {
          // Default to annual for most vaccines
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        }
    
        // Format the date as YYYY-MM-DD
        return nextDate.toISOString().split('T')[0];
      };
    
      const getLatestVaccinationDate = (vaccineName) => {
        // Get all reschedule history for this vaccine
        const vaccineRescheduleHistory = reschedulingHistory[vaccineName] || [];
        // Get administration date
        const administeredDate = pet.vaccinationDates?.[vaccineName];
    
        // If there's no history at all, return null
        if (!vaccineRescheduleHistory.length && !administeredDate) {
          return null;
        }
    
        // If there's reschedule history, find the latest date
        if (vaccineRescheduleHistory.length > 0) {
          // Sort reschedule history by date (newest first)
          const sortedHistory = [...vaccineRescheduleHistory].sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
            const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
            return dateB - dateA;
          });
    
          // Return the latest rescheduled date
          return sortedHistory[0].date;
        }
    
        // If no reschedule history, return administration date
        return administeredDate;
      };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!pet) {
    return <div>Pet not found</div>;
  }
  const handleAdministerVaccine = async () => {
    try {
      if (!userId || !pet || !selectedVaccine || !administeredDate) {
        setAlertMessage("Please fill in all required fields");
        setShowAlert(true);
        return;
      }

      setLoading(true);

      const petDocRef = doc(db, 'pets', petId);
      const currentVaccinationHistory = pet.vaccinationHistory || [];
      const vaccinationDates = pet.vaccinationDates || {};

      // Update vaccination history and dates
      const updatedHistory = [...currentVaccinationHistory];
      if (!updatedHistory.includes(selectedVaccine.name)) {
        updatedHistory.push(selectedVaccine.name);
      }

      await updateDoc(petDocRef, {
        vaccinationHistory: updatedHistory,
        [`vaccinationDates.${selectedVaccine.name}`]: administeredDate
      });

      // Update local state
      setPet({
        ...pet,
        vaccinationHistory: updatedHistory,
        vaccinationDates: {
          ...vaccinationDates,
          [selectedVaccine.name]: administeredDate
        }
      });

      setAlertMessage(`${selectedVaccine.name} marked as administered`);
      setShowAlert(true);
      setShowAdministerModal(false);
      setSelectedVaccine(null);
      setAdministeredDate('');
    } catch (error) {
      console.error("Error administering vaccine:", error);
      setAlertMessage("Error administering vaccine");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEditVaccination = async () => {
    try {
      if (!vaccineToEdit || !editDate) {
        setAlertMessage("Please select a date");
        setShowAlert(true);
        return;
      }

      setLoading(true);

      const petDocRef = doc(db, 'pets', petId);
      await updateDoc(petDocRef, {
        [`vaccinationDates.${vaccineToEdit.name}`]: editDate
      });

      // Update local state
      setPet({
        ...pet,
        vaccinationDates: {
          ...pet.vaccinationDates,
          [vaccineToEdit.name]: editDate
        }
      });

      setAlertMessage(`Vaccination date updated for ${vaccineToEdit.name}`);
      setShowAlert(true);
      setShowEditModal(false);
      setVaccineToEdit(null);
      setEditDate('');
    } catch (error) {
      console.error("Error updating vaccination date:", error);
      setAlertMessage("Error updating vaccination date");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVaccination = async (vaccineName) => {
    if (window.confirm(`Are you sure you want to remove ${vaccineName} from vaccination history?`)) {
      try {
        setLoading(true);
  
        const petDocRef = doc(db, 'pets', petId);
        const updatedHistory = pet.vaccinationHistory.filter(v => v !== vaccineName);
        const updatedDates = { ...pet.vaccinationDates };
        delete updatedDates[vaccineName];
  
        // Remove from rescheduling info and history
        const updatedReschedulingInfo = { ...reschedulingInfo };
        delete updatedReschedulingInfo[vaccineName];
        
        const updatedRescheduleHistory = { ...reschedulingHistory };
        delete updatedRescheduleHistory[vaccineName];
  
        await updateDoc(petDocRef, {
          vaccinationHistory: updatedHistory,
          [`vaccinationDates.${vaccineName}`]: deleteField(),
          vaccinationReschedules: updatedReschedulingInfo,
          vaccinationRescheduleHistory: updatedRescheduleHistory
        });
  
        // Update local state
        setPet({
          ...pet,
          vaccinationHistory: updatedHistory,
          vaccinationDates: updatedDates
        });
        setReschedulingInfo(updatedReschedulingInfo);
        setReschedulingHistory(updatedRescheduleHistory);
  
        setAlertMessage(`${vaccineName} removed from vaccination history`);
        setShowAlert(true);
      } catch (error) {
        console.error("Error removing vaccination:", error);
        setAlertMessage("Error removing vaccination");
        setShowAlert(true);
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <div className="container mt-4">
              {/* Bootstrap alert */}
      {showAlert && (
        <Alert variant="success" onClose={() => setShowAlert(false)} dismissible>
          {alertMessage}
        </Alert>
      )}
      <div className="row mb-4 align-items-center">
        <div className="col-auto">
          <img 
            src={pet.image} 
            alt={pet.name} 
            className="rounded-circle border border-primary"
            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
          />
        </div>
        <div className="col">
          <h1 className="mb-1">{pet.name}'s Vaccination Profile</h1>
          <p className="text-muted">{pet.breed} | {pet.species}</p>
        </div>
      </div>

      <div className="row">
        {/* Vaccination Information Section */}
        <div className="col-md-6 mb-4">
          <div className="card h-100"       style={{
        maxHeight: "400px", // Use a string with units
        overflowY: "auto",  // camelCase for "overflow-y"
        paddingRight: "10px", // camelCase for "padding-right"
        scrollbarWidth: "thin" // camelCase for "scrollbar-width"
      }}>
            <div className="card-header d-flex align-items-center">
              <i className="bx bx-injection me-2 text-primary"></i>
              <h5 className="card-title mb-0">Recommended Vaccine</h5>
            </div>
            <div className="card-body">
              <h6 className="card-subtitle mb-3 text-muted">Core Vaccinations</h6>
              <p className="card-text text-muted small">Core vaccines for dogs are those that every dog should receive, regardless of their lifestyle, location, or breed. These vaccines protect against diseases that are: prevalent, highly contagious, and potentially severe or fatal.</p>
              {vaccinations
                .filter(v => v.type === "Core")
                .map((vaccination, index) => (
                  <div key={index} className="card mb-2 bg-light">
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="card-title mb-1">{vaccination.name}</h6>
                        <p className="card-text text-muted small">{vaccination.description}</p>
                        <p className="card-text text-muted small">Recommended age to administer: {vaccination.recommended_weeks} weeks</p>
                        <p className="card-text text-muted small">
                      Recommended Re-schedule: Every {vaccination.recommended_reschedule}
                    </p>
                      </div>
                      <button 
                        onClick={() => handleVaccinationSchedule(vaccination)}
                        className="btn btn-primary btn-sm"
                      >
                        Schedule
                      </button>
                    </div>
                  </div>
                ))}
                <h6 className="card-subtitle mb-3 mt-3 text-muted">Non-Core Vaccinations</h6>
                <p className="card-text text-muted small">A non-core vaccine for dogs is a vaccine that's recommended based on a dog's risk of exposure to a disease, rather than being recommended for all dogs. Non-core vaccines are also called lifestyle vaccines.</p>
              {vaccinations
                .filter(v => v.type === "Non-Core")
                .map((vaccination, index) => (
                  <div key={index} className="card mb-2 bg-light">
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="card-title mb-1">{vaccination.name}</h6>
                        <p className="card-text text-muted small">{vaccination.description}</p>
                        <p className="card-text text-muted small">Recommended age to administer: {vaccination.recommended_weeks} weeks</p>
                        <p className="card-text text-muted small">
                      Recommended Re-schedule: Every {vaccination.recommended_reschedule}
                    </p>
                      </div>
                      <button 
                        onClick={() => handleVaccinationSchedule(vaccination)}
                        className="btn btn-primary btn-sm"
                      >
                        Schedule
                      </button>
                    </div>
                  </div>
                ))}
            <h6 className="card-subtitle mb-3 mt-3 text-muted">Combination Vaccinations</h6>
            <p className="card-text text-muted small">A combination vaccine for dogs is a single product that protects against multiple diseases or strains of infectious agents that cause the same disease. This reduces the number of injections required to prevent some diseases. </p>

              {vaccinations
                .filter(v => v.type === "Combination")
                .map((vaccination, index) => (
                  <div key={index} className="card mb-2 bg-light">
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="card-title mb-1">{vaccination.name}</h6>
                        <p className="card-text text-muted small">{vaccination.description}</p>
                        <p className="card-text text-muted small">Recommended age to administer: {vaccination.recommended_weeks} weeks</p>
                        <p className="card-text text-muted small">
                      Recommended Re-schedule: Every {vaccination.recommended_reschedule}
                    </p>
                      </div>
                      <button 
                        onClick={() => handleVaccinationSchedule(vaccination)}
                        className="btn btn-primary btn-sm"
                      >
                        Schedule
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

{/* Upcoming Vaccinations Section */}
<div className="col-md-6 mb-4">
  <div className="card h-100" style={{
    maxHeight: "400px",
    overflowY: "auto",
    paddingRight: "10px",
    scrollbarWidth: "thin"
  }}>
    <div className="card-header d-flex align-items-center">
      <i className="bx bx-calendar me-2 text-success"></i>
      <h5 className="card-title mb-0">Re-Schedule Vaccinations</h5>
    </div>
    <div className="card-body">
      {!pet.vaccinationHistory || pet.vaccinationHistory.length === 0 ? (
        <div className="text-center text-muted">
          <i className="bx bx-info-circle mb-2 text-warning" style={{fontSize: '2rem'}}></i>
          <p>No administered vaccinations found</p>
        </div>
      ) : (
        pet.vaccinationHistory.map((history, index) => {
          // Find the corresponding vaccine in the vaccineData
          const vaccine = vaccineData[pet.species]?.find(
            v => v.name.toLowerCase() === history.toLowerCase()
          );

          return (
            <div key={index} className="card mb-2 bg-light">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-1">{history}</h6>
                  {vaccine && vaccine.frequency && (
                    <p className="card-text text-muted small">
                      Recommended Re-schedule: Every {vaccine.recommended_reschedule}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => handleVaccinationSchedule({
                    name: history,
                    description: vaccine?.description,
                    frequency: vaccine?.frequency
                  })}
                  className="btn btn-success btn-sm"
                >
                  Re-Schedule
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
</div>
      </div>

{/* Vaccination History */}
<div className="row mt-4">
  <div className="col-12">
    <div className="card shadow-sm">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <div className="d-flex align-items-center">
          <i className="bx bxs-virus text-primary me-2" style={{ fontSize: '1.5rem' }}></i>
          <h5 className="card-title mb-0">Vaccination History</h5>
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => setShowAdministerModal(true)}
          className="d-flex align-items-center"
        >
          <i className="bx bx-plus-medical me-1"></i>
          Add Administered Vaccine
        </Button>
      </div>
      <div className="card-body">
        {pet.vaccinationHistory && pet.vaccinationHistory.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="border-0">Vaccine</th>
                  <th scope="col" className="border-0">Status</th>
                  <th scope="col" className="border-0">Last Administered</th>
                  <th scope="col" className="border-0">Scheduled</th>
                  <th scope="col" className="border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pet.vaccinationHistory.map((history, index) => {
                  // Get the latest date from reschedule history
                  const rescheduleHistoryDates = reschedulingHistory[history] || [];
                  const sortedDates = [...rescheduleHistoryDates].sort((a, b) => {
                    const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
                    const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
                    return dateB - dateA;
                  });
                  const latestDate = sortedDates[0];

                  return (
                    <tr key={index}>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <i className="bx bxs-injection text-primary me-2"></i>
                          <span className="fw-medium">{history}</span>
                        </div>
                      </td>
                      <td className="align-middle">
                        <span className="badge bg-success-subtle text-success rounded-pill">
                          <i className="bx bxs-check-circle me-1"></i>
                          Administered
                        </span>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <i className="bx bx-calendar text-muted me-2"></i>
                          {latestDate ? (
                            <span>
                              {latestDate.date} at {latestDate.time}
                            </span>
                          ) : pet.vaccinationDates?.[history] ? (
                            <span>{pet.vaccinationDates[history]}</span>
                          ) : (
                            <span className="text-muted fst-italic">Not recorded</span>
                          )}
                        </div>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <i className="bx bx-history text-muted me-2"></i>
                          {(reschedulingInfo[history] || 0) > 0 ? (
                            <div className="small">
                              <span className="fw-medium">
                                {reschedulingInfo[history]} times scheduled 
                              </span>
                              {reschedulingHistory[history]?.map((record, idx) => (
                                <div key={idx} className="text-muted small">
                                  #{record.count}: {record.date} at {record.time}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted">No reschedules</span>
                          )}
                        </div>
                      </td>
                      <td className="align-middle text-end">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => {
                            setVaccineToEdit({ name: history });
                            setEditDate(pet.vaccinationDates?.[history] || '');
                            setShowEditModal(true);
                          }}
                        >
                          <i className="bx bx-edit-alt me-1"></i>
                          Edit
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleRemoveVaccination(history)}
                        >
                          <i className="bx bx-trash me-1"></i>
                          Remove
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bx bx-injection text-muted mb-3" style={{ fontSize: '3rem' }}></i>
            <p className="text-muted mb-0">No vaccination history found</p>
            <p className="small text-muted">Click "Add Administered Vaccine" to record a vaccination</p>
          </div>
        )}
      </div>
    </div>
  </div>
</div>
      <Modal show={showAdministerModal} onHide={() => setShowAdministerModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Administered Vaccine</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select Vaccine</Form.Label>
              <Form.Select
                value={selectedVaccine?.name || ''}
                onChange={(e) => {
                  const vaccine = vaccineData[pet.species]?.find(v => v.name === e.target.value);
                  setSelectedVaccine(vaccine);
                }}
              >
                <option value="">Select a vaccine...</option>
                {vaccineData[pet.species]?.map((vaccine, index) => (
                  <option key={index} value={vaccine.name}>
                    {vaccine.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Administration Date</Form.Label>
              <Form.Control
                type="date"
                value={administeredDate}
                onChange={(e) => setAdministeredDate(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAdministerModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAdministerVaccine}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Vaccination Date Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Vaccination Date</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Vaccine</Form.Label>
              <Form.Control
                type="text"
                value={vaccineToEdit?.name || ''}
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Administration Date</Form.Label>
              <Form.Control
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditVaccination}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Schedule Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Event Name</Form.Label>
              <Form.Control
                type="text"
                value={eventName}
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Event Date</Form.Label>
              <Form.Control
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
            <Form.Label>Event Time</Form.Label>
            <Form.Control
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}  // This ensures eventTime gets updated
            />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
        </Button>
        <Button 
            variant="primary" 
            onClick={handleScheduleEvent} 
            disabled={loading}  // Disable the button when loading
        >
            {loading ? (
            <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span className="ms-2">Scheduling...</span>
            </>
            ) : (
            "Schedule Event"
            )}
        </Button>
        </Modal.Footer>

      </Modal>
    </div>
  );
};

export default PetVaccinationTracker;