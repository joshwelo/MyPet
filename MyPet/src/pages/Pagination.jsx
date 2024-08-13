import React from 'react';

const Pagination = () => {
  return (
    <div className="col-xl-8 col-lg-8 mb-3">
      <div className="col-xxl">
        <div className="d-flex justify-content-center">
          <nav aria-label="Page navigation">
            <ul className="pagination">
              <li className="page-item first">
                <a className="page-link" href="javascript:void(0);">
                  <i className="tf-icon bx bx-chevrons-left"></i>
                </a>
              </li>
              <li className="page-item prev">
                <a className="page-link" href="javascript:void(0);">
                  <i className="tf-icon bx bx-chevron-left"></i>
                </a>
              </li>
              <li className="page-item active">
                <a className="page-link" href="javascript:void(0);">1</a>
              </li>
              <li className="page-item">
                <a className="page-link" href="javascript:void(0);">2</a>
              </li>
              <li className="page-item">
                <a className="page-link" href="javascript:void(0);">3</a>
              </li>
              <li className="page-item">
                <a className="page-link" href="javascript:void(0);">4</a>
              </li>
              <li className="page-item">
                <a className="page-link" href="javascript:void(0);">5</a>
              </li>
              <li className="page-item next">
                <a className="page-link" href="javascript:void(0);">
                  <i className="tf-icon bx bx-chevron-right"></i>
                </a>
              </li>
              <li className="page-item last">
                <a className="page-link" href="javascript:void(0);">
                  <i className="tf-icon bx bx-chevrons-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
