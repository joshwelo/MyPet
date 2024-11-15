import React, { useState } from "react";
import diseaseData from "../jsons/disease.json";

const DiagnosePage = () => {
  const [activeTab, setActiveTab] = useState("dog"); // Track active tab (dog or cat)
  const [selectedSymptoms, setSelectedSymptoms] = useState([]); // Track selected symptoms
  const [diagnosis, setDiagnosis] = useState([]); // Store diagnosis results
  const [searchTerm, setSearchTerm] = useState(""); // Track search input

  // Function to flatten the nested structure of diseaseData
  const getAllDiseases = () => {
    let allDiseases = [];
    for (const mainCategory of Object.values(diseaseData)) {
      for (const subCategory of Object.values(mainCategory)) {
        allDiseases = allDiseases.concat(subCategory);
      }
    }
    return allDiseases;
  };

  // Handle tab change
  const handleTabChange = (event) => {
    setActiveTab(event.target.value);
    setSelectedSymptoms([]);
    setDiagnosis([]);
    setSearchTerm("");
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Add symptom to the list
// Add symptom to the list
const addSymptom = (symptom) => {
  if (!selectedSymptoms.includes(symptom)) {
    const updatedSymptoms = [...selectedSymptoms, symptom];
    setSelectedSymptoms(updatedSymptoms);
    setSearchTerm(""); // Clear the search bar after adding the symptom

    // Automatically trigger the search after adding a symptom
    setTimeout(() => {
      handleSearch(updatedSymptoms);
    }, 0); // Ensure the state is updated before calling handleSearch
  }
};

  // Remove symptom from the list
  const removeSymptom = (symptom) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
  };

  // Save and show diagnosis results
  const handleSearch = (symptoms = selectedSymptoms) => {
    const allDiseases = getAllDiseases();
    const matchedDiseases = allDiseases
      .filter((disease) => disease.species === activeTab)
      .filter((disease) =>
        symptoms.some((symptom) => disease.symptoms.includes(symptom))
      );
  
    setDiagnosis(matchedDiseases);
  };

  // Render filtered symptoms based on the search term
  const renderFilteredSymptoms = () => {
    if (searchTerm.trim() === "") {
      return null;
    }
    const allDiseases = getAllDiseases();
    const uniqueSymptoms = allDiseases
      .filter((disease) => disease.species === activeTab)
      .flatMap((disease) => disease.symptoms)
      .filter(
        (value, index, self) =>
          self.indexOf(value) === index && value.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return (
      <div className="dropdown-menu show">
        {uniqueSymptoms.map((symptom, index) => {
          const regex = new RegExp(`(${searchTerm})`, "gi");
          const highlightedSymptom = symptom.replace(
            regex,
            (match) => `<span class="highlight">${match}</span>`
          );

          return (
            <button
              key={index}
              className="dropdown-item"
              onClick={() => addSymptom(symptom)}
              dangerouslySetInnerHTML={{ __html: highlightedSymptom }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="content-wrapper">
      <style>
        {`
          .highlight {
            background-color: yellow;
            font-weight: bold;
          }
        `}
      </style>
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="col-xxl">
          <div className="card mb-4">
            <div className="card-header d-flex align-items-center justify-content-between">
              <h3 className="card-title text-primary fw-bold">Diagnose Symptoms</h3>
            </div>

            {/* Navbar with attached search bar, dropdown, and button */}
              <div className="container-fluid">
                <div className="input-group">
                  {/* Search Bar */}
                  <span className="input-group-text" id="search-addon" onClick={handleSearch}>
                    <i className="bx bx-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search symptoms..."
                    aria-label="Search symptoms"
                    aria-describedby="search-addon"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />

                  {/* Dropdown for selecting Dog or Cat */}
                  <select
                    className="form-select"
                    style={{ maxWidth: "120px" }}
                    value={activeTab}
                    onChange={handleTabChange}
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                  </select>
                </div>
              </div>

            {/* Display filtered symptoms */}
            <div className="symptoms-list dropdown">
              {renderFilteredSymptoms()}
            </div>

            {/* Display selected symptoms */}
            <div className="selected-symptoms m-3">
              {selectedSymptoms.map((symptom, index) => (
                <span key={index} className="badge bg-secondary ml-3">
                  {symptom}{" "}
                  <button
                    type="button"
                    className="btn-close btn-close-white "
                    aria-label="Remove"
                    onClick={() => removeSymptom(symptom)}
                  ></button>
                </span>
              ))}
            </div>

            {/* Display diagnosis results */}
            <div className="card-body">
              {diagnosis.length > 0 ? (
                <div className="alert alert-info">
                  <h5>Possible Sickness:</h5>
                  {diagnosis.map((disease, index) => (
                    <div key={index} className="mb-4">
                      <h5>{disease.name}</h5>
                      <p><strong>&nbsp; Description:</strong> {disease.description}</p>
                      <p><strong>&nbsp; Matched Symptoms:</strong> {disease.symptoms.filter(symptom => selectedSymptoms.includes(symptom)).join(', ')}</p>
                      <p><strong>&nbsp; Causes:</strong> {disease.causes.join(', ')}</p>
                      <p><strong>&nbsp; Prevention:</strong> {disease.prevention}</p>

                      <div><strong>Treatment:</strong></div>
                      <ul>
                        {Object.entries(disease.treatment).map(([key, value]) => (
                          <li key={key}><strong>{key}:</strong> {value}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                selectedSymptoms.length > 0 && (
                  <div className="alert alert-info">No matching diseases found.</div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosePage;
