import React, { useState } from 'react';
import breedsData from '../jsons/breeds.json';

const AiBreedScanner = () => {
  const [animalType, setAnimalType] = useState('dog'); // Default to 'dog'
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [breedInfo, setBreedInfo] = useState(null); // Store breed info
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleAnimalSelection = (type) => {
    setAnimalType(type);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setResult(null);
      setBreedInfo(null); // Reset breed info when a new image is uploaded
      setShowModal(false);
    }
  };

  const getAccessToken = async () => {
    try {
      const response = await fetch('https://www.nyckel.com/connect/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials&client_id=6nyurma10drboeh4zvtyqpetgcvzmox3&client_secret=yx3ay4z6uhtn3kyosgeu2tlg95eeqaecfodqb75uwn49wqpwe6769305cm0tqkfj',
      });
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error fetching access token:', error);
      return null;
    }
  };

  const handleSend = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        console.error('Access token not obtained.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('data', image);

      const endpoint =
        animalType === 'dog'
          ? 'https://www.nyckel.com/v1/functions/dog-breed-identifier/invoke'
          : 'https://www.nyckel.com/v1/functions/cat-breed-identifier/invoke';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      setResult(data);

      // Check if the breed is in the breedsData and display the information
      if (data && data.labelName) {
        const breedData = findBreedInfo(data.labelName);
        setBreedInfo(breedData);
      }
    } catch (error) {
      console.error('Error invoking the API:', error);
    } finally {
      setLoading(false);
    }
  };

  const findBreedInfo = (breed) => {
    // Check the breed in the corresponding animal type (dog or cat)
    const breedList = breedsData[animalType === 'dog' ? 'dogs' : 'cats'];

    // Find the breed in the list
    return breedList.find((item) => item.breed.toLowerCase() === breed.toLowerCase()) || null;
  };
  return (
    <div className="container-fluid bg-light min-vh-100 d-flex mt-4 justify-content-center">
      <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="card-header bg-primary text-white text-center py-3">
          <h1 className="m-0" style={{color:"white"}}>Breed Identifier</h1>
        </div>
        
        <div className="card-body p-4">
          {/* Animal Type Selector */}
          <div className="d-flex justify-content-center mb-4">
            <div className="btn-group" role="group">
              <button 
                className={`btn ${animalType === 'cat' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleAnimalSelection('cat')}
              >
                <i className='bx bxs-cat'></i> Cat
              </button>
              <button 
                className={`btn ${animalType === 'dog' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleAnimalSelection('dog')}
              >
                <i className='bx bxs-dog' ></i> Dog
              </button>
            </div>
          </div>
          {/* Image Upload */}
          <div className="mb-4">
            <input 
              type="file" 
              className="form-control" 
              accept="image/*" 
              onChange={handleImageChange}
              id="imageUpload"
            />
          </div>

          {/* Image Preview */}
          {image && (
            <div className="text-center mb-4">
              <img 
                src={URL.createObjectURL(image)} 
                alt="Pet" 
                className="img-fluid rounded-3 shadow-sm"
                style={{ maxHeight: '300px', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Scan Button */}
          <div className="text-center">
            <button 
              className="btn btn-success btn-lg" 
              onClick={handleSend}
              disabled={!image || loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Scanning...
                </>
              ) : (
                <>
                  <i className='bx bxs-camera' ></i>
                  Identify Breed
                </>
              )}
            </button>
          </div>

          {/* Results Section */}
          {result && (
            <div className="mt-4 p-3 bg-light rounded-3">
              <h4 className="text-center mb-3">Scan Results</h4>
              <div className="row">
                <div className="col-6">
                  <strong>Breed:</strong> {result.labelName}
                </div>
                <div className="col-6">
                  <strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          )}

          {/* Breed Information */}
          {breedInfo && (
            <div className="mt-4 card bg-white shadow-sm">
              <div className="card-body">
                <h5 className="card-title text-primary mb-3">Breed Details</h5>
                <p><strong>Description:</strong> {breedInfo.description}</p>
                <p><strong>Cluster:</strong> {breedInfo.cluster}</p>
                <p><strong>Health Concerns:</strong> {breedInfo.health_concerns.join(', ')}</p>
                <p><strong>Diet:</strong> {breedInfo.diet.description} ({breedInfo.diet.frequency})</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiBreedScanner;