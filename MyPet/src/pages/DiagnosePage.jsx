import React, { useState } from "react";
import diseaseData from "../jsons/disease.json";

const DiagnosePage = () => {
  const [activeTab, setActiveTab] = useState("dog"); // Track active tab (dog or cat)
  const [selectedSymptoms, setSelectedSymptoms] = useState([]); // Track selected symptoms
  const [diagnosis, setDiagnosis] = useState([]); // Store the diagnosis results

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedSymptoms([]); // Clear symptoms when switching tabs
    setDiagnosis([]); // Clear previous diagnosis results
  };

  // Handle symptom selection
  const handleSymptomChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedSymptoms([...selectedSymptoms, value]);
    } else {
      setSelectedSymptoms(selectedSymptoms.filter((symptom) => symptom !== value));
    }
  };

  // Save and show diagnosis results
  const handleSave = () => {
    const matchedDiseases = diseaseData
      .filter((disease) => disease.species === activeTab) // Filter by species
      .filter((disease) => {
        // Check if disease's symptoms match any of the selected symptoms
        return selectedSymptoms.some((symptom) => disease.symptoms.includes(symptom));
      });

    setDiagnosis(matchedDiseases); // Update diagnosis state
  };

  // Render symptoms based on the active tab (cat or dog)
  const renderSymptoms = () => {
    const uniqueSymptoms = diseaseData
      .filter((disease) => disease.species === activeTab) // Filter by species
      .flatMap((disease) => disease.symptoms) // Extract symptoms
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

    return uniqueSymptoms.map((symptom, index) => (
      <div key={index}>
        <input
          type="checkbox"
          id={`symptom-${index}`}
          value={symptom}
          onChange={handleSymptomChange}
          checked={selectedSymptoms.includes(symptom)}
        />
        <label htmlFor={`symptom-${index}`}>{symptom}</label>
      </div>
    ));
  };

  // Render detailed information for each diagnosis
  const renderDiagnosisDetails = (disease) => (
    <div className="diagnosis-details">
      <h5>{disease.name}</h5>
      <p><strong>Description:</strong> {disease.description}</p>
      <p><strong>Causes:</strong></p>
      <ul>
        {disease.causes.map((cause, index) => (
          <li key={index}>{cause}</li>
        ))}
      </ul>
      <p><strong>Symptoms:</strong></p>
      <ul>
        {disease.symptoms.map((symptom, index) => (
          <li key={index}>{symptom}</li>
        ))}
      </ul>
      <p><strong>Treatment:</strong></p>
      {Object.entries(disease.treatment).map(([key, value], index) => (
        <div key={index}>
          <strong>{key}:</strong>
          {Array.isArray(value) ? (
            <ul>
              {value.map((item, subIndex) => (
                <li key={subIndex}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>{value}</p>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="col-xxl">
          <div className="card mb-4">
            <div className="card-header d-flex align-items-center justify-content-between">
              <h3 className="card-title text-primary fw-bold">Symptoms</h3>
              <button
                type="button"
                className="btn btn-outline-primary"
                data-bs-toggle="modal"
                data-bs-target="#speciesModal"
              >
                + Add Symptoms
              </button>

              {/* Modal with Tabs */}
              <div
                className="modal fade"
                id="speciesModal"
                tabIndex="-1"
                aria-hidden="true"
              >
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="speciesModalLabel">Select Symptoms</h5>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      ></button>
                    </div>
                    <div className="modal-body">
                      {/* Tabs for Cat and Dog */}
                      <ul className="nav nav-tabs">
                        <li className="nav-item">
                          <button
                            className={`nav-link ${activeTab === "cat" ? "active" : ""}`}
                            onClick={() => handleTabChange("cat")}
                          >
                            Cat Symptoms
                          </button>
                        </li>
                        <li className="nav-item">
                          <button
                            className={`nav-link ${activeTab === "dog" ? "active" : ""}`}
                            onClick={() => handleTabChange("dog")}
                          >
                            Dog Symptoms
                          </button>
                        </li>
                      </ul>

                      {/* Symptom Checkboxes */}
                      <div className="mt-4">
                        {renderSymptoms()}
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        data-bs-dismiss="modal"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSave}
                        data-bs-dismiss="modal"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body">
              {/* Display diagnosis results */}
              {diagnosis.length > 0 ? (
                <div className="alert alert-info">
                  <h5>Possible Diagnoses:</h5>
                  {diagnosis.map((disease, index) => (
                    <div key={index} className="mb-4">
                      {renderDiagnosisDetails(disease)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">No matching diseases found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosePage;
