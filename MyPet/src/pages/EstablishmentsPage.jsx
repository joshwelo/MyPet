import React from 'react';
import MapFrame from './MapFrame';
import EstablishmentButtons from './EstablishmentButtons';
import './Establishments.css';

const EstablishmentsPage = () => {
  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <div className="row">
        <div className="col-md-9">
          <div>
            <div className="card">
              <div className="card-body">
                <MapFrame />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <EstablishmentButtons />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstablishmentsPage;
