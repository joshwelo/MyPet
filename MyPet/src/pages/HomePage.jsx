import React from 'react';

const Home = () => {

  return (
    <div className="content-wrapper">

    <div className="container-xxl flex-grow-1 container-p-y">
      <div className="row">
        <div className="col-lg-8 mb-4 order-0">
          <div className="card">
            <div className="d-flex align-items-end row">
              <div className="col-sm-7">
                <div className="card-body">
                  <h3 className="card-title text-primary fw-bold">Your is pet not feeling well?</h3>
                  <p className="mb-4">
                    Don't forget to pay attention to the symptoms/feelings your pet is showing. Diagnose now!
                  </p>

                  <th><a href="javascript:;" className="btn btn-sm btn-outline-primary">DIAGNOSE</a></th>
                </div>
              </div>
              <div className="col-sm-5 text-center text-sm-left">
                <div className="card-body pb-0 px-0 px-md-4">
                  <img
                    src="../assets/img/illustrations/health.png"
                    height="140"
                    alt="View Badge User"
                    data-app-dark-img="illustrations/man-with-laptop-dark.png"
                    data-app-light-img="illustrations/man-with-laptop-light.png"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-4 order-1">
          <div className="row">
            <div className="col-lg-6 col-md-12 col-6 mb-4">
              <div className="card">
                <div className="card-body"> 
                  <div className="card-title d-flex align-items-start justify-content-between">
                    <div className="avatar flex-shrink-0">  
                      <img
                        src="../assets/img/icons/unicons/pets.png"
                        alt="chart success"
                        className="rounded"
                      />
                    </div>
                    
                  </div>
                  <span className="text-primary fw-bold">My Pet</span>
                  <span className="fw-semibold d-block mb-1">Guide</span>
                  <a href="javascript:;" className="btn btn-sm btn-outline-primary">PROFILE</a>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-12 col-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <div className="card-title d-flex align-items-start justify-content-between">
                    <div className="avatar flex-shrink-0">
                      <img
                        src="../assets/img/icons/unicons/map.png"
                        alt="Credit Card"
                        className="rounded"
                      />
                    </div>
                  </div>
                  <span className="text-primary fw-bold">Nearby</span>
                  <span className="fw-semibold d-block mb-1">Establishment</span>
                  <a href="javascript:;" className="btn btn-sm btn-outline-primary">Map</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-8 order-2 order-md-3 order-lg-2 mb-4">
          <div className="card">
            <h5 className="card-header text-primary fw-bold">Upcomming Schedule</h5>
            <div className="table-responsive text-nowrap">
              <table className="table">
                <thead>
                  <tr className="text-nowrap">
                    <th>Pet</th>
                    <th>Date</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Milo</td>
                    <td>5/31/2024</td>
                    <td>Check-up</td>
                  </tr>
                  <tr>
                    <td>Bantay</td>
                    <td>6/12/2024</td>
                    <td>Vaccination</td>
                  </tr>
                  <tr>
                    <td>Spots</td>
                    <td>6/20/2024</td>
                    <td>Birthday</td>
                  </tr>
                </tbody>
                <tfoot className="table-border-bottom-0">
                  <tr>
                    <th><a href="javascript:;" className="btn btn-sm btn-outline-primary">Calendar</a></th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-8 col-lg-4 order-3 order-md-2">
          <div className="row">
            <div className="col-12 mb-4">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between flex-sm-row flex-column gap-3">
                    <div className="d-flex flex-sm-column flex-row align-items-start justify-content-between">
                      <div className="card-title">
                        <span className="text-primary fw-bold">Social Forums</span>
                      </div>
                      <div className="mt-sm-auto">
                        <a href="javascript:;" className="btn btn-sm btn-outline-primary">FORUMS</a>
                      </div>
                    </div>
                    <div>
                      <img src="../assets/img/icons/unicons/chat.png" alt="" width="100%"></img>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
      
    </div>

    <div className="content-backdrop fade"></div>
  </div>
  );
};

export default Home;
