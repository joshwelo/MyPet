import React, { useState, useRef, useEffect } from "react";
import diseaseData from "../jsons/disease.json";
import { Modal, Button } from "react-bootstrap";

const DiagnosePage = () => {
  const [activeTab, setActiveTab] = useState("dog");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [diagnosis, setDiagnosis] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(true);
  const [chat, setChat] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, diagnosis]);

  const getAllDiseases = () => {
    let allDiseases = [];
    for (const mainCategory of Object.values(diseaseData)) {
      for (const subCategory of Object.values(mainCategory)) {
        allDiseases = allDiseases.concat(subCategory);
      }
    }
    return allDiseases;
  };

  const addSymptom = (symptom) => {
    if (!selectedSymptoms.includes(symptom)) {
      const updatedSymptoms = [...selectedSymptoms, symptom];
      setSelectedSymptoms(updatedSymptoms);
      setSearchTerm("");
      setChat((prevChat) => [
        ...prevChat,
        { type: "user", message: `Added symptom: ${symptom}` },
      ]);
      handleSearch(updatedSymptoms);
    }
  };

  const removeSymptom = (symptomToRemove) => {
    const updatedSymptoms = selectedSymptoms.filter(
      (symptom) => symptom !== symptomToRemove
    );
    setSelectedSymptoms(updatedSymptoms);
    setChat((prevChat) => [
      ...prevChat,
      { type: "user", message: `Removed symptom: ${symptomToRemove}` },
    ]);
    handleSearch(updatedSymptoms);
  };

  const handleSearch = (symptoms = selectedSymptoms) => {
    const allDiseases = getAllDiseases();
    const matchedDiseases = allDiseases
      .filter((disease) => disease.species === activeTab)
      .filter((disease) =>
        symptoms.length === 0
          ? false
          : symptoms.some((symptom) => disease.symptoms.includes(symptom))
      );

    setDiagnosis(matchedDiseases);
    setChat((prevChat) => [
      ...prevChat,
      {
        type: "system",
        message:
          matchedDiseases.length > 0
            ? `Found ${matchedDiseases.length} matching disease(s).`
            : symptoms.length > 0
            ? "No matching diseases found."
            : "Please add some symptoms.",
        details: matchedDiseases,
      },
    ]);
  };

  const renderFilteredSymptoms = () => {
    if (searchTerm.trim() === "") return null;
  
    const allDiseases = getAllDiseases();
    const uniqueSymptoms = allDiseases
      .filter((disease) => disease.species === activeTab)
      .flatMap((disease) => disease.symptoms)
      .filter(
        (value, index, self) =>
          self.indexOf(value) === index &&
          value.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !selectedSymptoms.includes(value)
      );
  
    return (
      <div
        style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '10px 10px 0 0',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 10,
        }}
      >
        {uniqueSymptoms.map((symptom, index) => (
          <div
            key={index}
            onClick={() => addSymptom(symptom)}
            style={{
              padding: '10px',
              cursor: 'pointer',
              backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
            }}
          >
            {symptom}
          </div>
        ))}
      </div>
    );
  };
  

  return (
    <div className="container mt-4">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white text-center">
          <h5 className="mb-0">Pet Disease Diagnosis Chat</h5>
          <small>{activeTab === "dog" ? "🐶 Dog" : "🐱 Cat"} Mode</small>
        </div>
        <div className="card-body p-3" style={{ height: "400px", overflowY: "auto" }}>
          {chat.map((entry, index) => (
            <div
              key={index}
              className={`my-2 p-2 rounded ${
                entry.type === "user" ? "bg-success text-white ms-auto" : "bg-light text-dark"
              }`}
              style={{ maxWidth: "70%" }}
            >
              {entry.message}
              {entry.type === "system" &&
                entry.details &&
                entry.details.map((disease, i) => (
<div key={i} className="card my-2 shadow-sm">
  <div className="card-body">
    <h5>{disease.name}</h5>
    <p>{disease.description}</p>
    <strong>Symptoms</strong>
    <ul>
      {disease.symptoms.map((symptom, idx) => (
        <li key={idx}>{symptom}</li>
      ))}
    </ul>
    <strong>Prevention</strong>
    <ul>
      {Array.isArray(disease.prevention) ? (
        disease.prevention.map((prev, idx) => <li key={idx}>{prev}</li>)
      ) : (
        <li>{disease.prevention || "No prevention measures available."}</li>
      )}
    </ul>
    <strong>Treatment</strong>
    <ul>
      {Object.entries(disease.treatment).map(([key, value], idx) => (
        <li key={idx}>
          <strong>{key}:</strong> {value}
        </li>
      ))}
    </ul>
  </div>
</div>

                ))}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="card-footer">
          {selectedSymptoms.length > 0 && (
            <div className="mb-2">
              {selectedSymptoms.map((symptom) => (
                <span key={symptom} className="badge bg-primary me-1">
                  {symptom}{" "}
                  <span
                    className="ms-1 text-white cursor-pointer"
                    style={{ cursor: "pointer" }}
                    onClick={() => removeSymptom(symptom)}
                  >
                    ×
                  </span>
                </span>
              ))}
            </div>
          )}
          <div className="d-flex">
            <div className="flex-grow-1 position-relative">
              <input
                type="text"
                className="form-control"
                placeholder="Enter symptom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addSymptom(searchTerm.trim());
                    setSearchTerm("");
                  }
                }}
              />
              {renderFilteredSymptoms()}
            </div>
            <button
              className="btn btn-primary ms-2"
              onClick={() => setActiveTab((prev) => (prev === "dog" ? "cat" : "dog"))}
            >
              Switch to {activeTab === "dog" ? "Cat" : "Dog"}
            </button>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Welcome to Pet Diagnosis Chat!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Start diagnosing your pet by adding symptoms in the search bar below.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowModal(false)}>
            Got it
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DiagnosePage;
