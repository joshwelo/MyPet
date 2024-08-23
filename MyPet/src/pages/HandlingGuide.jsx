import React from 'react';
import { useParams } from 'react-router-dom';
import breedsData from '../jsons/breeds.json'; // Adjust the path to your JSON file

const HandlingGuide = () => {
  const { breed } = useParams();

  // Find the breed data from the JSON file
  const breedData = breedsData.dogs.find(dog => dog.breed.toLowerCase() === breed.toLowerCase());

  // Handle case where breed is not found
  if (!breedData) {
    return <p>No handling guide found for {breed}. Please check the breed name.</p>;
  }

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="col-xxl">
          <div className="card mb-4">
            <div className="card-header d-flex align-items-center">
              <h3 className="card-title text-primary fw-bold">Handling Guide</h3>
            </div>
            <div className="card-body">
              <div className="col-xl-12">
                <h3 className="text-muted">{breedData.breed}</h3>
                <div className="nav-align-top mb-4">
                  <ul className="nav nav-pills mb-3 nav-fill" role="tablist">
                    <li className="nav-item">
                      <button
                        type="button"
                        className="nav-link active"
                        role="tab"
                        data-bs-toggle="tab"
                        data-bs-target="#navs-pills-justified-health"
                        aria-controls="navs-pills-justified-health"
                        aria-selected="true"
                      >
                        <i className="bx bxs-heart"></i> Health Concerns
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className="nav-link"
                        role="tab"
                        data-bs-toggle="tab"
                        data-bs-target="#navs-pills-justified-diet"
                        aria-controls="navs-pills-justified-diet"
                        aria-selected="false"
                      >
                        <i className="bx bxs-baguette"></i> Diet
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className="nav-link"
                        role="tab"
                        data-bs-toggle="tab"
                        data-bs-target="#navs-pills-justified-groom"
                        aria-controls="navs-pills-justified-groom"
                        aria-selected="false"
                      >
                        <i className="bx bx-cut"></i> Grooming
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className="nav-link"
                        role="tab"
                        data-bs-toggle="tab"
                        data-bs-target="#navs-pills-justified-nature"
                        aria-controls="navs-pills-justified-nature"
                        aria-selected="false"
                      >
                        <i className="bx bxs-leaf"></i> Environment
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className="nav-link"
                        role="tab"
                        data-bs-toggle="tab"
                        data-bs-target="#navs-pills-justified-train"
                        aria-controls="navs-pills-justified-train"
                        aria-selected="false"
                      >
                        <i className="bx bx-dumbbell"></i> Training
                      </button>
                    </li>
                  </ul>
                  <div className="tab-content">
                    <div className="tab-pane fade show active" id="navs-pills-justified-health" role="tabpanel">
                      <ul>
                        {breedData.health_concerns.map((concern, index) => (
                          <li key={index}>{concern}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="tab-pane fade" id="navs-pills-justified-diet" role="tabpanel">
                      <p>{breedData.diet.description}</p>
                      <p><strong>Notes:</strong> {breedData.diet.notes}</p>
                    </div>
                    <div className="tab-pane fade" id="navs-pills-justified-groom" role="tabpanel">
                      <p><strong>Frequency:</strong> {breedData.grooming.frequency}</p>
                      <p>{breedData.grooming.requirements}</p>
                    </div>
                    <div className="tab-pane fade" id="navs-pills-justified-nature" role="tabpanel">
                      <p><strong>Living Space:</strong> {breedData.environment.living_space}</p>
                      <p><strong>Exercise Needs:</strong> {breedData.environment.exercise_needs}</p>
                    </div>
                    <div className="tab-pane fade" id="navs-pills-justified-train" role="tabpanel">
                      <p>Training information coming soon.</p> {/* Update with actual data when available */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandlingGuide;
