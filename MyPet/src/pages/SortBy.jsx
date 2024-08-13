import React from 'react';

const SortBy = () => {
  return (
    <div>
      <div className="card h-100">
        <div className="card-body">
          <div className="row">
            <div className="col">
              <div className="card-title d-flex align-items-start ">
                <h3 className="card-title text-primary fw-bold">Sort By</h3>
              </div>
              <button className="btn btn-primary mb-1">Newest</button>
              <button className="btn btn-primary mb-1">Relevance</button>
              <button className="btn btn-primary mb-1">Most Likes</button>
              <button className="btn btn-primary mb-1">Most Discussed</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortBy;
