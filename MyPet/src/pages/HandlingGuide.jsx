import React from 'react';
import { useParams } from 'react-router-dom';
import breedsData from '../jsons/breeds.json';
import healthData from '../jsons/health.json';

const HandlingGuide = () => {
  const { breed } = useParams();

  // Search for the breed in both dogs and cats arrays
  const breedData = 
    breedsData.dogs.find(dog => dog.breed.toLowerCase() === breed.toLowerCase()) ||
    breedsData.cats.find(cat => cat.breed.toLowerCase() === breed.toLowerCase());

  // Handle case where breed is not found
  if (!breedData) {
    return <p>No handling guide found for {breed}. Please check the breed name.</p>;
  }

  // Map health concerns from breed data to health.json entries
  const healthDetails = breedData.health_concerns.map(concern => {
    const healthEntry = healthData.find(h => h.health_concern.toLowerCase() === concern.toLowerCase());
    return healthEntry ? (
      <li key={concern}>
        <strong>{concern}:</strong> {healthEntry.description}
        <br />
        <em>Prevention/Minimization:</em> {healthEntry.prevention_minimization}
      </li>
    ) : (
      <li key={concern}>
        <strong>{concern}:</strong> No detailed information available.
      </li>
    );
  });

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
                <p className="text-secondary">{breedData.description}</p> {/* Breed description */}
                
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
                  </ul>
                  <div className="tab-content">
                    {/* Health Concerns Section */}
                    <div className="tab-pane fade show active" id="navs-pills-justified-health" role="tabpanel">
                      <p className="text-muted"><strong>Health Concerns:</strong></p>
                      <ul>{healthDetails}</ul>
                    </div>

                    {/* Diet Section */}
                    <div className="tab-pane fade" id="navs-pills-justified-diet" role="tabpanel">
                      <p className="text-muted"><strong>Diet:</strong> {breedData.diet.description}</p>
                      <p><strong>Frequency:</strong> {breedData.diet.frequency}</p>
                    </div>

                    {/* Grooming Section */}
                    <div className="tab-pane fade" id="navs-pills-justified-groom" role="tabpanel">
                      <p className="text-muted"><strong>Grooming Frequency:</strong> {breedData.grooming.frequency}</p>
                      <p>{breedData.grooming.description}</p>
                    </div>

                    {/* Environment Section */}
                    <div className="tab-pane fade" id="navs-pills-justified-nature" role="tabpanel">
                      <p className="text-muted"><strong>Living Space:</strong> {breedData.environment.living_space}</p>
                      <p><strong>Exercise Needs:</strong> {breedData.environment.exercise_needs}</p>
                      <p>{breedData.environment.description}</p>
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
