import React, { useState } from 'react';

const AiBreed = () => {
  const [animalType, setAnimalType] = useState('dog'); // Default to 'dog'
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
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
      setShowModal(false);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
    } catch (error) {
      console.error('Error invoking the API:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-3">
      <div className="card p-4 shadow">
        <h3 className="card-title text-primary fw-bold mb-4">Pet Breed Scanner</h3>

        <div className="d-flex justify-content-center mb-4 flex-wrap">
          <button
            className={`btn ${animalType === 'cat' ? 'btn-primary' : 'btn-outline-primary'} mx-2 my-2`}
            onClick={() => handleAnimalSelection('cat')}
          >
            Cat
          </button>
          <button
            className={`btn ${animalType === 'dog' ? 'btn-primary' : 'btn-outline-primary'} mx-2 my-2`}
            onClick={() => handleAnimalSelection('dog')}
          >
            Dog
          </button>
        </div>

        <div className="text-center mb-4">
          <button className="btn btn-secondary" onClick={handleOpenModal}>Insert Image</button>
        </div>

        {/* Image holder: Display uploaded image */}
        <div className="text-center mb-4">
          {image && (
            <img
              src={typeof image === 'string' ? image : URL.createObjectURL(image)}
              alt="Captured or Uploaded"
              style={{ width: '100%', maxWidth: '400px', height: 'auto', aspectRatio: '1 / 1' }}
            />
          )}
        </div>

        <div className="text-center mb-4">
          <button className="btn btn-success" onClick={handleSend} disabled={!image || loading}>
            {loading ? 'Scanning...' : 'Scan Breed'}
          </button>
        </div>

        {result && (
          <div className="text-center mt-4">
            <h4>Result:</h4>
            <p><strong>Breed:</strong> {result.labelName}</p>
            <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%</p>
          </div>
        )}
      </div>

      {/* Modal for choosing file */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Choose Image Source</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-control mb-3"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiBreed;
