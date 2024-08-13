import React from "react";

const CalendarEventsPage = () => {
    return (
        <div className="content-wrapper">
            {/* <!-- Content --> */}
            <div className="container-xxl flex-grow-1 container-p-y">
                <h4 className="fw-bold py-3 mb-3"><span className="text-muted fw-light">Calendar /</span> Events</h4>
                <a className="btn btn-primary mb-3" href="addevent.html">Add event</a>
                <div className="col-lg-12 col-md-4 order-1 card mb-2 pb-1 pt-4">
                    <center><a className="btn btn-primary mb-3" href="addevent.html">June</a></center>
                    <div>
                        <div className="col-xxl">
                            <div className="d-flex justify-content-center">
                                <nav aria-label="Page navigation">
                                    <ul className="pagination">
                                        <li className="page-item prev">
                                            <a className="page-link" href="javascript:void(0);">
                                                <i className="tf-icon bx bx-chevron-left"></i>
                                            </a>
                                        </li>
                                        <li className="page-item active">
                                            <a className="page-link" href="javascript:void(0);">12</a>
                                        </li>
                                        <li className="page-item">
                                            <a className="page-link" href="javascript:void(0);">13</a>
                                        </li>
                                        <li className="page-item">
                                            <a className="page-link" href="javascript:void(0);">14</a>
                                        </li>
                                        <li className="page-item">
                                            <a className="page-link" href="javascript:void(0);">15</a>
                                        </li>
                                        <li className="page-item">
                                            <a className="page-link" href="javascript:void(0);">16</a>
                                        </li>
                                        <li className="page-item next">
                                            <a className="page-link" href="javascript:void(0);">
                                                <i className="tf-icon bx bx-chevron-right"></i>
                                            </a>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-12 col-md-4 order-1">
                        <div className="row">
                            <div className="col-lg-6 col-md-12 col-6 mb-2">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="card-title d-flex align-items-start justify-content-between">
                                            <div className="avatar flex-shrink-0">
                                                <img src="../assets/img/avatars/siamese-cat (1).png" alt="" className="w-px-40 h-auto rounded-circle" />
                                            </div>
                                            <div className="dropdown">
                                                <button
                                                    className="btn p-0"
                                                    type="button"
                                                    id="cardOpt3"
                                                    data-bs-toggle="dropdown"
                                                    aria-haspopup="true"
                                                    aria-expanded="false"
                                                >
                                                    <i className="bx bx-dots-vertical-rounded"></i>
                                                </button>
                                                <div className="dropdown-menu dropdown-menu-end" aria-labelledby="cardOpt3">
                                                    <a className="dropdown-item" href="javascript:void(0);">Edit</a>
                                                    <a className="dropdown-item" href="javascript:void(0);">Delete</a>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="fw-semibold d-block mb-1">June 12</span>
                                        <h3 className="card-title mb-2">Check-up</h3>
                                        <span className="fw-semibold d-block mb-1">9:00 am</span>
                                        <span className="fw-semibold d-block mb-1"><i className="bx bxs-cat" style={{ fontWeight: 'bolder' }}>Milo</i></span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-12 col-6 mb-2">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="card-title d-flex align-items-start justify-content-between">
                                            <div className="avatar flex-shrink-0">
                                                <img src="../assets/img/illustrations/aspin.jpg" alt="" className="w-px-40 h-auto rounded-circle" />
                                            </div>
                                            <div className="dropdown">
                                                <button
                                                    className="btn p-0"
                                                    type="button"
                                                    id="cardOpt3"
                                                    data-bs-toggle="dropdown"
                                                    aria-haspopup="true"
                                                    aria-expanded="false"
                                                >
                                                    <i className="bx bx-dots-vertical-rounded"></i>
                                                </button>
                                                <div className="dropdown-menu dropdown-menu-end" aria-labelledby="cardOpt3">
                                                    <a className="dropdown-item" href="javascript:void(0);">Edit</a>
                                                    <a className="dropdown-item" href="javascript:void(0);">Delete</a>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="fw-semibold d-block mb-1">June 12</span>
                                        <h3 className="card-title mb-2">Vaccination</h3>
                                        <span className="fw-semibold d-block mb-1">10:00 am</span>
                                        <span className="fw-semibold d-block mb-1"><i className="bx bxs-dog" style={{ fontWeight: 'bolder' }}>Bantay</i></span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-12 col-6 mb-2">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="card-title d-flex align-items-start justify-content-between">
                                            <div className="avatar flex-shrink-0">
                                                <img src="../assets/img/illustrations/brit.jpg" alt="" className="w-px-40 h-auto rounded-circle" />
                                            </div>
                                            <div className="dropdown">
                                                <button
                                                    className="btn p-0"
                                                    type="button"
                                                    id="cardOpt3"
                                                    data-bs-toggle="dropdown"
                                                    aria-haspopup="true"
                                                    aria-expanded="false"
                                                >
                                                    <i className="bx bx-dots-vertical-rounded"></i>
                                                </button>
                                                <div className="dropdown-menu dropdown-menu-end" aria-labelledby="cardOpt3">
                                                    <a className="dropdown-item" href="javascript:void(0);">Edit</a>
                                                    <a className="dropdown-item" href="javascript:void(0);">Delete</a>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="fw-semibold d-block mb-1">June 12</span>
                                        <h3 className="card-title mb-2">Birthday</h3>
                                        <span className="fw-semibold d-block mb-1">00:00 am</span>
                                        <span className="fw-semibold d-block mb-1"><i className="bx bxs-cat" style={{ fontWeight: 'bolder' }}>Spots</i></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <!-- / Content --> */}
        </div>
    );
}

export default CalendarEventsPage;
